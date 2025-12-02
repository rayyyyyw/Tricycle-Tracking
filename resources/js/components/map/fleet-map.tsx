'use client';

import { useEffect, useRef, useState } from 'react';

interface FleetMapProps {
  activeTricycles?: number;
  view?: 'standard' | 'satellite';
}

export default function FleetMap({ activeTricycles = 8, view = 'standard' }: FleetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    // Dynamically import Leaflet to avoid SSR issues
    const initializeMap = async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      // Fix leaflet icon URLs
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Create map instance
      const map = L.map(mapRef.current!).setView([9.5931, 122.4697], 14);
      leafletRef.current = map;

      // Add tile layer based on view
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

      // Define tricycle icon styles
      const createTricycleIcon = (status: 'active' | 'maintenance' | 'offline') => {
        let color = '#10b981'; // green for active
        if (status === 'maintenance') color = '#f59e0b'; // yellow for maintenance
        if (status === 'offline') color = '#6b7280'; // gray for offline

        return L.divIcon({
          html: `
            <div style="position: relative;">
              <div style="
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background-color: ${color};
                border: 2px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              ">
                <svg style="width: 12px; height: 12px; color: white;" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4v1a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H21a1 1 0 001-1V5a1 1 0 00-1-1H3z"/>
                </svg>
              </div>
              <div style="
                position: absolute;
                top: -2px;
                right: -2px;
                width: 8px;
                height: 8px;
                background-color: ${color === '#10b981' ? '#34d399' : color === '#f59e0b' ? '#fbbf24' : '#9ca3af'};
                border-radius: 50%;
              }" class="animate-pulse"></div>
            </div>
          `,
          className: 'custom-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
      };

      // Mock tricycle locations around Hinobaan
      const tricycleLocations = [
        { lat: 9.5931, lng: 122.4697, status: 'active' as const, driver: 'Juan Dela Cruz' },
        { lat: 9.6010, lng: 122.4615, status: 'active' as const, driver: 'Maria Santos' },
        { lat: 9.5850, lng: 122.4760, status: 'active' as const, driver: 'Pedro Reyes' },
        { lat: 9.5900, lng: 122.4620, status: 'maintenance' as const, driver: 'Ana Lopez' },
        { lat: 9.5950, lng: 122.4800, status: 'active' as const, driver: 'Carlos Gomez' },
        { lat: 9.5880, lng: 122.4720, status: 'active' as const, driver: 'Luis Torres' },
        { lat: 9.5970, lng: 122.4650, status: 'offline' as const, driver: 'Miguel Cruz' },
        { lat: 9.5910, lng: 122.4830, status: 'active' as const, driver: 'Sofia Reyes' },
      ];

      // Add tricycle markers
      tricycleLocations.forEach((location) => {
        const marker = L.marker([location.lat, location.lng], {
          icon: createTricycleIcon(location.status)
        }).addTo(map);
        
        marker.bindPopup(`
          <div style="padding: 8px; min-width: 180px;">
            <strong style="font-weight: 600; display: block; margin-bottom: 4px;">${location.driver}</strong>
            <div style="font-size: 14px; color: #4b5563;">
              Status: <span style="color: ${location.status === 'active' ? '#10b981' : location.status === 'maintenance' ? '#f59e0b' : '#6b7280'}; font-weight: 500;">${location.status}</span>
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
              Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}
            </div>
          </div>
        `);
      });

      // Add Hinobaan marker
      L.marker([9.5931, 122.4697]).addTo(map)
        .bindPopup(`
          <div style="padding: 8px; min-width: 180px;">
            <strong style="font-weight: 600; display: block; margin-bottom: 4px;">Hinobaan, Negros Occidental</strong>
            <div style="font-size: 14px; color: #4b5563;">Municipality Center</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Population: ~58,000</div>
          </div>
        `);

      // Add service area circle
      L.circle([9.5931, 122.4697], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        radius: 2000, // 2km radius
      }).addTo(map);

      // Fit bounds to show all markers
      const bounds = L.latLngBounds(tricycleLocations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds.pad(0.1));

      setIsMapReady(true);
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, [view]);

  // Update tile layer when view changes
  useEffect(() => {
    if (!leafletRef.current || !tileLayerRef.current || typeof window === 'undefined') return;

    const updateTileLayer = async () => {
      const L = await import('leaflet');
      
      if (tileLayerRef.current) {
        leafletRef.current.removeLayer(tileLayerRef.current);
      }

      const tileUrl = view === 'satellite' 
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const attribution = view === 'satellite'
        ? 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

      tileLayerRef.current = L.tileLayer(tileUrl, {
        attribution,
        maxZoom: 19,
      }).addTo(leafletRef.current);
    };

    if (isMapReady) {
      updateTileLayer();
    }
  }, [view, isMapReady]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapRef}
        className="w-full h-full rounded-lg bg-gray-100 dark:bg-gray-900"
      />
      
      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium">Active ({activeTricycles})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs font-medium">Maintenance (1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-xs font-medium">Offline (1)</span>
          </div>
        </div>
      </div>
    </div>
  );
}