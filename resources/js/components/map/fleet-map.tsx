'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';

export interface FleetMapHandle {
  centerMap: () => void;
}

// Hinobaan, Negros Occidental coordinates and bounds
const HINOBAAN_CENTER = {
  lat: 9.5925,
  lng: 122.4706
};

const HINOBAAN_BOUNDS: [[number, number], [number, number]] = [
  [9.52, 122.42],
  [9.67, 122.53]
];

interface FleetMapProps {
  view?: 'standard' | 'satellite';
  className?: string;
  activeTricycles?: number;
  onlineDrivers?: unknown[];
  activeBookings?: unknown[];
}

let leafletModule: typeof import('leaflet') | null = null;

const FleetMapComponent = forwardRef<FleetMapHandle, FleetMapProps>(function FleetMap({
  view = 'standard',
  className,
}, ref) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const centerMap = useCallback(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.fitBounds(HINOBAAN_BOUNDS, { padding: [40, 40] });
  }, []);

  useImperativeHandle(ref, () => ({
    centerMap,
  }), [centerMap]);

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

        const map = L.map(mapRef.current!).setView([HINOBAAN_CENTER.lat, HINOBAAN_CENTER.lng], 13);
        mapInstanceRef.current = map;
        map.fitBounds(HINOBAAN_BOUNDS, { padding: [20, 20] });

        const tileUrl = view === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        const attribution = view === 'satellite'
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
    if (!mapInstanceRef.current || !tileLayerRef.current || !isMapReady || !leafletModule) return;

    const L = leafletModule;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const tileUrl = view === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const attribution = view === 'satellite'
      ? 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
  }, [view, isMapReady]);

  return (
    <div className={cn("absolute inset-0 w-full h-full", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        className="absolute inset-0 w-full h-full rounded-lg bg-muted z-0"
      />
    </div>
  );
});

export default FleetMapComponent;
