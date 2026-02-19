'use client';

import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

export interface FleetMapHandle {
    centerMap: () => void;
}

// Hinobaan, Negros Occidental coordinates and bounds
const HINOBAAN_CENTER = {
    lat: 9.5925,
    lng: 122.4706,
};

const HINOBAAN_BOUNDS: [[number, number], [number, number]] = [
    [9.52, 122.42],
    [9.67, 122.53],
];

export interface MapUserLocation {
    id: number;
    name: string;
    role: string;
    lat: number;
    lng: number;
    vehicle_plate?: string | null;
    barangay?: string | null;
}

interface FleetMapProps {
    view?: 'standard' | 'satellite';
    className?: string;
    activeTricycles?: number;
    onlineDrivers?: Array<{ id: number; name: string; lat: number; lng: number; status?: string; vehicle_plate?: string; barangay?: string }>;
    activeBookings?: Array<{
        id: number;
        pickup: { lat: number; lng: number; address?: string; barangay?: string };
        destination: { lat: number; lng: number; address?: string; barangay?: string };
        passenger_name?: string;
        driver_name?: string;
        status?: string;
    }>;
    /** Logged-in users with known location (drivers + passengers) for real-time map */
    onlineUsersWithLocation?: MapUserLocation[];
}

let leafletModule: typeof import('leaflet') | null = null;

const FleetMapComponent = forwardRef<FleetMapHandle, FleetMapProps>(
    function FleetMap(
        {
            view = 'standard',
            className,
            onlineDrivers = [],
            activeBookings = [],
            onlineUsersWithLocation,
        },
        ref,
    ) {
        const mapRef = useRef<HTMLDivElement>(null);
        const mapInstanceRef = useRef<L.Map | null>(null);
        const tileLayerRef = useRef<L.TileLayer | null>(null);
        const markersLayerRef = useRef<L.LayerGroup | null>(null);
        const [isMapReady, setIsMapReady] = useState(false);
        const [isLoading, setIsLoading] = useState(true);

        const centerMap = useCallback(() => {
            if (!mapInstanceRef.current) return;
            mapInstanceRef.current.fitBounds(HINOBAAN_BOUNDS, {
                padding: [40, 40],
            });
        }, []);

        useImperativeHandle(
            ref,
            () => ({
                centerMap,
            }),
            [centerMap],
        );

        useEffect(() => {
            let mounted = true;

            const initializeMap = async () => {
                if (!mapRef.current || !mounted) return;

                setIsLoading(true);

                try {
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.remove();
                        mapInstanceRef.current = null;
                    }

                    if (!leafletModule) {
                        leafletModule = await import('leaflet');
                    }

                    const L = leafletModule;

                    const map = L.map(mapRef.current!).setView(
                        [HINOBAAN_CENTER.lat, HINOBAAN_CENTER.lng],
                        13,
                    );
                    mapInstanceRef.current = map;
                    map.fitBounds(HINOBAAN_BOUNDS, { padding: [20, 20] });

                    const tileUrl =
                        view === 'satellite'
                            ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

                    const attribution =
                        view === 'satellite'
                            ? 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

                    tileLayerRef.current = L.tileLayer(tileUrl, {
                        attribution,
                        maxZoom: 19,
                    }).addTo(map);

                    if (mounted) {
                        setIsMapReady(true);
                        setIsLoading(false);
                        setTimeout(() => map.invalidateSize(), 100);
                    }
                } catch (err) {
                    console.error('Error initializing map:', err);
                    if (mounted) {
                        setIsLoading(false);
                    }
                }
            };

            initializeMap();

            return () => {
                mounted = false;
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.remove();
                    mapInstanceRef.current = null;
                }
                tileLayerRef.current = null;
            };
        }, [view]);

        useEffect(() => {
            if (
                !mapInstanceRef.current ||
                !tileLayerRef.current ||
                !isMapReady ||
                !leafletModule
            )
                return;

            const L = leafletModule;

            mapInstanceRef.current.removeLayer(tileLayerRef.current);

            const tileUrl =
                view === 'satellite'
                    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

            const attribution =
                view === 'satellite'
                    ? 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

            tileLayerRef.current = L.tileLayer(tileUrl, {
                attribution,
                maxZoom: 19,
            }).addTo(mapInstanceRef.current);
        }, [view, isMapReady]);

        useEffect(() => {
            if (
                !mapInstanceRef.current ||
                !isMapReady ||
                !leafletModule
            )
                return;

            const L = leafletModule;

            const usersToShow =
                onlineUsersWithLocation && onlineUsersWithLocation.length > 0
                    ? onlineUsersWithLocation
                    : onlineDrivers.map((d) => ({
                          id: d.id,
                          name: d.name,
                          role: 'driver',
                          lat: d.lat,
                          lng: d.lng,
                          vehicle_plate: d.vehicle_plate,
                          barangay: d.barangay,
                      }));

            // Fix default icon if not already set (Leaflet 1.x)
            if (!(L.Icon.Default.prototype as unknown as { _getIconUrl?: boolean })._getIconUrl) {
                delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                });
            }

            if (markersLayerRef.current) {
                mapInstanceRef.current.removeLayer(markersLayerRef.current);
                markersLayerRef.current = null;
            }

            const layer = L.layerGroup().addTo(mapInstanceRef.current);
            markersLayerRef.current = layer;

            // User/driver markers (current location of logged-in users)
            usersToShow.forEach((user) => {
                const lat = Number(user.lat);
                const lng = Number(user.lng);
                if (Number.isFinite(lat) && Number.isFinite(lng)) {
                    const label = user.role === 'driver'
                        ? `<strong>${user.name}</strong> (Driver)${user.vehicle_plate ? `<br>Plate: ${user.vehicle_plate}` : ''}${user.barangay ? `<br>${user.barangay}` : ''}`
                        : `<strong>${user.name}</strong> (Passenger)`;
                    const marker = L.marker([lat, lng])
                        .bindPopup(label, { className: 'fleet-map-popup' })
                        .addTo(layer);
                    marker.getPopup()?.setContent(label);
                }
            });

            // Active booking pickup/destination markers
            activeBookings.forEach((booking) => {
                const pickup = booking.pickup;
                const dest = booking.destination;
                if (pickup && Number.isFinite(pickup.lat) && Number.isFinite(pickup.lng)) {
                    const popup = `<strong>Pickup</strong>${booking.passenger_name ? `<br>${booking.passenger_name}` : ''}${pickup.barangay ? `<br>${pickup.barangay}` : ''}`;
                    L.marker([Number(pickup.lat), Number(pickup.lng)], {
                        icon: L.divIcon({
                            className: 'booking-marker booking-marker-pickup',
                            html: '<div style="background:#22c55e;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>',
                            iconSize: [14, 14],
                            iconAnchor: [7, 7],
                        }),
                    })
                        .bindPopup(popup, { className: 'fleet-map-popup' })
                        .addTo(layer);
                }
                if (dest && Number.isFinite(dest.lat) && Number.isFinite(dest.lng)) {
                    const popup = `<strong>Destination</strong>${booking.passenger_name ? `<br>${booking.passenger_name}` : ''}${dest.barangay ? `<br>${dest.barangay}` : ''}`;
                    L.marker([Number(dest.lat), Number(dest.lng)], {
                        icon: L.divIcon({
                            className: 'booking-marker booking-marker-destination',
                            html: '<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>',
                            iconSize: [14, 14],
                            iconAnchor: [7, 7],
                        }),
                    })
                        .bindPopup(popup, { className: 'fleet-map-popup' })
                        .addTo(layer);
                }
            });

            return () => {
                if (markersLayerRef.current && mapInstanceRef.current) {
                    mapInstanceRef.current.removeLayer(markersLayerRef.current);
                    markersLayerRef.current = null;
                }
            };
        }, [isMapReady, onlineDrivers, activeBookings, onlineUsersWithLocation]);

        return (
            <div className={cn('absolute inset-0 h-full w-full', className)}>
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <div className="text-center">
                            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                            <p className="text-sm text-muted-foreground">
                                Loading map...
                            </p>
                        </div>
                    </div>
                )}

                <div
                    ref={mapRef}
                    className="absolute inset-0 z-0 h-full w-full rounded-lg bg-muted"
                />
            </div>
        );
    },
);

export default FleetMapComponent;
