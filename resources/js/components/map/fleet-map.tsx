'use client';

import { cn } from '@/lib/utils';
import { HINOBAAN_GEOFENCE } from '@/lib/hinobaanGeofence';
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

export interface GeofenceViolation {
    bookingId: number;
    type: 'driver_outside' | 'destination_outside';
    driverName?: string;
    passengerName?: string;
    lat: number;
    lng: number;
    barangay?: string;
}

export interface MapUserLocation {
    id: number;
    name: string;
    role: string;
    lat: number;
    lng: number;
    vehicle_plate?: string | null;
    barangay?: string | null;
    avatar_url?: string | null;
}

interface FleetMapProps {
    view?: 'standard' | 'satellite';
    className?: string;
    activeTricycles?: number;
    onlineDrivers?: Array<{
        id: number;
        name: string;
        lat: number;
        lng: number;
        status?: string;
        vehicle_plate?: string;
        barangay?: string;
    }>;
    activeBookings?: Array<{
        id: number;
        pickup: {
            lat: number;
            lng: number;
            address?: string;
            barangay?: string;
        };
        destination: {
            lat: number;
            lng: number;
            address?: string;
            barangay?: string;
        };
        passenger_name?: string;
        driver_name?: string;
        status?: string;
    }>;
    /** When set, draw route line (pickup → destination) only for this booking */
    selectedBookingId?: number | null;
    /** Logged-in users with known location (drivers + passengers) for real-time map */
    onlineUsersWithLocation?: MapUserLocation[];
    /** Geofence violations to highlight on the map */
    geofenceViolations?: GeofenceViolation[];
}

let leafletModule: typeof import('leaflet') | null = null;

const FleetMapComponent = forwardRef<FleetMapHandle, FleetMapProps>(
    function FleetMap(
        {
            view = 'standard',
            className,
            onlineDrivers = [],
            activeBookings = [],
            selectedBookingId = null,
            onlineUsersWithLocation,
            geofenceViolations = [],
        },
        ref,
    ) {
        const mapRef = useRef<HTMLDivElement>(null);
        const mapInstanceRef = useRef<L.Map | null>(null);
        const tileLayerRef = useRef<L.TileLayer | null>(null);
        const markersLayerRef = useRef<L.LayerGroup | null>(null);
        const routeLayerRef = useRef<L.Polyline | null>(null);
        const routeUpdateIdRef = useRef(0);
        const geofenceLayerRef = useRef<L.Polygon | null>(null);
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

        // ── Geofence boundary polygon ────────────────────────────────
        useEffect(() => {
            const map = mapInstanceRef.current;
            if (!map || !isMapReady || !leafletModule) return;
            const L = leafletModule;

            if (geofenceLayerRef.current) {
                map.removeLayer(geofenceLayerRef.current);
                geofenceLayerRef.current = null;
            }

            const hasViolations = geofenceViolations.length > 0;

            geofenceLayerRef.current = L.polygon(HINOBAAN_GEOFENCE, {
                color: hasViolations ? '#ef4444' : '#f97316',
                weight: hasViolations ? 2.5 : 2,
                dashArray: '10, 6',
                fillColor: hasViolations ? '#ef4444' : '#f97316',
                fillOpacity: hasViolations ? 0.06 : 0.03,
                interactive: false,
            }).addTo(map);

            return () => {
                if (geofenceLayerRef.current && mapInstanceRef.current) {
                    mapInstanceRef.current.removeLayer(
                        geofenceLayerRef.current,
                    );
                    geofenceLayerRef.current = null;
                }
            };
        }, [isMapReady, geofenceViolations]);

        useEffect(() => {
            if (!mapInstanceRef.current || !isMapReady || !leafletModule)
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

            if (markersLayerRef.current) {
                mapInstanceRef.current.removeLayer(markersLayerRef.current);
                markersLayerRef.current = null;
            }

            const layer = L.layerGroup().addTo(mapInstanceRef.current);
            markersLayerRef.current = layer;

            const escapeHtml = (s: string) => {
                const div =
                    typeof document !== 'undefined'
                        ? document.createElement('div')
                        : null;
                if (div) {
                    div.textContent = s;
                    return div.innerHTML;
                }
                return s
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');
            };

            // User/driver markers: custom icon (no external image) + improved popup
            usersToShow.forEach((user) => {
                const lat = Number(user.lat);
                const lng = Number(user.lng);
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

                const initial = (user.name || '?').charAt(0).toUpperCase();
                const isDriver = user.role === 'driver';
                const avatarUrl = (
                    user as MapUserLocation & { avatar_url?: string | null }
                ).avatar_url;
                const markerColor = isDriver ? '#6366f1' : '#10b981';

                const iconHtml = `<div style="
                  width:36px;height:36px;border-radius:50%;
                  background:${markerColor};color:#fff;
                  border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);
                  display:flex;align-items:center;justify-content:center;
                  font-weight:700;font-size:14px;font-family:system-ui,sans-serif;
                ">${escapeHtml(initial)}</div>`;

                const popupContent = `<div class="fleet-map-user-popup" style="min-width:160px;padding:0;margin:-1px;">
                  <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;">
                    <div style="width:40px;height:40px;border-radius:50%;background:#e5e7eb;overflow:hidden;flex-shrink:0;">
                      ${
                          avatarUrl
                              ? `<img src="${escapeHtml(avatarUrl)}" alt="" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><span style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#6b7280;">${escapeHtml(initial)}</span>`
                              : `<span style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#6b7280;">${escapeHtml(initial)}</span>`
                      }
                    </div>
                    <div style="flex:1;min-width:0;">
                      <div style="font-weight:600;font-size:14px;color:#111;margin-bottom:2px;">${escapeHtml(user.name)}</div>
                      <span style="display:inline-block;font-size:11px;padding:2px 6px;border-radius:4px;background:${isDriver ? '#e0e7ff' : '#d1fae5'};color:${isDriver ? '#4338ca' : '#047857'};">${isDriver ? 'Driver' : 'Passenger'}</span>
                      ${user.vehicle_plate ? `<div style="font-size:12px;color:#6b7280;margin-top:4px;">Plate: ${escapeHtml(user.vehicle_plate)}</div>` : ''}
                      ${user.barangay ? `<div style="font-size:11px;color:#9ca3af;margin-top:2px;">${escapeHtml(user.barangay)}</div>` : ''}
                    </div>
                  </div>
                </div>`;

                L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'fleet-map-user-marker',
                        html: iconHtml,
                        iconSize: [36, 36],
                        iconAnchor: [18, 18],
                    }),
                })
                    .bindPopup(popupContent, {
                        className:
                            'fleet-map-popup fleet-map-user-popup-wrapper',
                    })
                    .addTo(layer);
            });

            // Active booking pickup/destination markers
            activeBookings.forEach((booking) => {
                const pickup = booking.pickup;
                const dest = booking.destination;
                if (
                    pickup &&
                    Number.isFinite(pickup.lat) &&
                    Number.isFinite(pickup.lng)
                ) {
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
                if (
                    dest &&
                    Number.isFinite(dest.lat) &&
                    Number.isFinite(dest.lng)
                ) {
                    const popup = `<strong>Destination</strong>${booking.passenger_name ? `<br>${booking.passenger_name}` : ''}${dest.barangay ? `<br>${dest.barangay}` : ''}`;
                    L.marker([Number(dest.lat), Number(dest.lng)], {
                        icon: L.divIcon({
                            className:
                                'booking-marker booking-marker-destination',
                            html: '<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>',
                            iconSize: [14, 14],
                            iconAnchor: [7, 7],
                        }),
                    })
                        .bindPopup(popup, { className: 'fleet-map-popup' })
                        .addTo(layer);
                }
            });

            // Geofence violation warning markers
            geofenceViolations.forEach((v) => {
                const lat = Number(v.lat);
                const lng = Number(v.lng);
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

                const label =
                    v.type === 'driver_outside'
                        ? `Driver: ${v.driverName || 'Unknown'}`
                        : `Destination: ${v.passengerName || 'Ride'} #${v.bookingId}`;

                L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'geofence-violation-marker',
                        html: `<div style="
                          position:relative;width:38px;height:38px;
                        "><div style="
                            position:absolute;inset:0;border-radius:50%;
                            border:3px solid #ef4444;opacity:0.5;
                          "></div><div style="
                            position:absolute;inset:5px;border-radius:50%;
                            background:#ef4444;color:#fff;
                            display:flex;align-items:center;justify-content:center;
                            font-weight:700;font-size:14px;font-family:system-ui,sans-serif;
                            box-shadow:0 2px 8px rgba(239,68,68,0.5);
                          ">!</div></div>`,
                        iconSize: [38, 38],
                        iconAnchor: [19, 19],
                    }),
                    zIndexOffset: 1000,
                })
                    .bindPopup(
                        `<div style="min-width:160px;padding:8px;">
                          <div style="font-weight:700;color:#dc2626;font-size:13px;margin-bottom:4px;">&#9888; Geofence Violation</div>
                          <div style="font-size:12px;color:#333;">${label}</div>
                          <div style="font-size:11px;color:#888;margin-top:4px;">Outside Hinobaan municipal boundary</div>
                        </div>`,
                        { className: 'fleet-map-popup' },
                    )
                    .addTo(layer);
            });

            return () => {
                if (markersLayerRef.current && mapInstanceRef.current) {
                    mapInstanceRef.current.removeLayer(markersLayerRef.current);
                    markersLayerRef.current = null;
                }
            };
        }, [
            isMapReady,
            onlineDrivers,
            activeBookings,
            onlineUsersWithLocation,
            geofenceViolations,
        ]);

        // Draw route line only for selected booking (when admin clicks "Show route")
        useEffect(() => {
            const map = mapInstanceRef.current;
            if (!map || !isMapReady || !leafletModule) return;

            const L = leafletModule;

            // Remove previous route so no trail (single route: pickup → destination for selected booking)
            if (routeLayerRef.current) {
                map.removeLayer(routeLayerRef.current);
                routeLayerRef.current = null;
            }

            if (!selectedBookingId || !activeBookings?.length) return;

            const booking = activeBookings.find(
                (b) => b.id === selectedBookingId,
            );
            if (!booking?.pickup?.lat || !booking?.destination?.lat) return;

            const pickup = booking.pickup;
            const dest = booking.destination;
            const thisUpdateId = ++routeUpdateIdRef.current;

            fetch(
                `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`,
            )
                .then((res) => res.json())
                .then((data) => {
                    if (thisUpdateId !== routeUpdateIdRef.current) return;
                    if (!mapInstanceRef.current) return;
                    if (
                        data.code === 'Ok' &&
                        data.routes?.[0]?.geometry?.coordinates
                    ) {
                        const coords = data.routes[0].geometry.coordinates.map(
                            (c: [number, number]) =>
                                [c[1], c[0]] as [number, number],
                        );
                        const line = L.polyline(coords, {
                            color: '#22c55e',
                            weight: 4,
                            opacity: 0.9,
                            smoothFactor: 1.5,
                        }).addTo(mapInstanceRef.current);
                        routeLayerRef.current = line;
                    } else {
                        const line = L.polyline(
                            [
                                [pickup.lat, pickup.lng],
                                [dest.lat, dest.lng],
                            ],
                            {
                                color: '#22c55e',
                                weight: 4,
                                opacity: 0.9,
                                smoothFactor: 1,
                            },
                        ).addTo(mapInstanceRef.current);
                        routeLayerRef.current = line;
                    }
                })
                .catch(() => {
                    if (thisUpdateId !== routeUpdateIdRef.current) return;
                    if (!mapInstanceRef.current) return;
                    const line = L.polyline(
                        [
                            [pickup.lat, pickup.lng],
                            [dest.lat, dest.lng],
                        ],
                        {
                            color: '#22c55e',
                            weight: 4,
                            opacity: 0.9,
                            smoothFactor: 1,
                        },
                    ).addTo(mapInstanceRef.current);
                    routeLayerRef.current = line;
                });

            return () => {
                if (routeLayerRef.current && mapInstanceRef.current) {
                    mapInstanceRef.current.removeLayer(routeLayerRef.current);
                    routeLayerRef.current = null;
                }
            };
        }, [isMapReady, selectedBookingId, activeBookings]);

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
