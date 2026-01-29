'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { cn } from '@/lib/utils';

// Type definitions for Leaflet
interface LatLng {
  lat: number;
  lng: number;
}

interface MapEvent extends L.LeafletEvent {
  latlng: LatLng;
}

interface NominatimResponse {
  display_name?: string;
}

interface Driver {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  barangay?: string;
}

interface ActiveBooking {
  id: number;
  booking_id: string;
  passenger_name: string;
  driver_name: string;
  pickup: {
    lat: number;
    lng: number;
    address: string;
    barangay: string;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
    barangay: string;
  };
  status: string;
}

interface FleetMapProps {
  activeTricycles?: number;
  view?: 'standard' | 'satellite';
  className?: string;
  onMarkerAdd?: (count: number) => void;
  onlineDrivers?: Driver[];
  activeBookings?: ActiveBooking[];
}

// Hinobaan, Negros Occidental coordinates and bounds
const HINOBAAN_CENTER = {
  lat: 9.5925,
  lng: 122.4706
};

// Hinobaan municipality bounds (approximate)
const HINOBAAN_BOUNDS: [[number, number], [number, number]] = [
  [9.52, 122.42],  // Southwest corner
  [9.67, 122.53]   // Northeast corner
];

let leafletModule: typeof import('leaflet') | null = null;

export default function FleetMap({ 
  view = 'standard',
  className,
  onMarkerAdd,
  onlineDrivers = [],
  activeBookings = []
}: FleetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const routingControlRef = useRef<L.Control | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const customMarkersRef = useRef<L.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Add user location marker to map
  const addUserMarker = useCallback((location: { lat: number; lng: number }) => {
    if (!mapInstanceRef.current || !leafletModule) return;
    
    const L = leafletModule;

    if (userMarkerRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
    }

    const userMarker = L.marker([location.lat, location.lng], {
      icon: L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(mapInstanceRef.current);
    
    userMarker.bindPopup(`
      <div style="padding: 8px; min-width: 180px;">
        <strong style="font-weight: 600; display: block; margin-bottom: 4px;">📍 Your Current Location</strong>
        <div style="font-size: 14px; color: #4b5563;">
          Hinoba-an, Negros Occidental
        </div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
          Coordinates: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}
        </div>
      </div>
    `);

    userMarkerRef.current = userMarker;
  }, []);

  // Get user's current location with fallback to Hinoba-an
  const getUserLocation = useCallback(() => {
    if (!mapInstanceRef.current || !leafletModule) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([location.lat, location.lng], 15);
            addUserMarker(location);
          }
        },
        () => {
          if (mapInstanceRef.current) {
            // Stay with bounds view instead of centering
            addUserMarker(HINOBAAN_CENTER);
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 3000,
          maximumAge: 60000
        }
      );
    } else {
      if (mapInstanceRef.current) {
        addUserMarker(HINOBAAN_CENTER);
      }
    }
  }, [addUserMarker]);

  // Add custom marker to map
  const addCustomMarker = useCallback((lat: number, lng: number, name: string = 'Custom Marker') => {
    if (!mapInstanceRef.current || !leafletModule) return null;
    
    const L = leafletModule;

    const marker = L.marker([lat, lng], {
      icon: L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(mapInstanceRef.current);
    
    marker.bindPopup(`
      <div style="padding: 8px; min-width: 180px;">
        <strong style="font-weight: 600; display: block; margin-bottom: 4px;">📌 ${name}</strong>
        <div style="font-size: 14px; color: #4b5563;">
          Click "Calculate Route" to get directions
        </div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
          Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}
        </div>
      </div>
    `);

    customMarkersRef.current.push(marker);
    onMarkerAdd?.(customMarkersRef.current.length);

    return marker;
  }, [onMarkerAdd]);

  // Handle map click to add marker
  const setupMapClickHandler = useCallback(() => {
    if (!mapInstanceRef.current || !leafletModule) return;

    mapInstanceRef.current.on('click', (e: MapEvent) => {
      const clickedLocation = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      };
      
      // Get location name from Nominatim
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickedLocation.lat}&lon=${clickedLocation.lng}&zoom=18&addressdetails=1`)
        .then(response => response.json())
        .then((data: NominatimResponse) => {
          const locationName = data.display_name 
            ? data.display_name.split(',').slice(0, 3).join(',') 
            : `Location (${clickedLocation.lat.toFixed(4)}, ${clickedLocation.lng.toFixed(4)})`;
          
          addCustomMarker(clickedLocation.lat, clickedLocation.lng, locationName);
        })
        .catch(() => {
          const locationName = `Location (${clickedLocation.lat.toFixed(4)}, ${clickedLocation.lng.toFixed(4)})`;
          addCustomMarker(clickedLocation.lat, clickedLocation.lng, locationName);
        });
    });
  }, [addCustomMarker]);

  // Initialize tricycle markers and bookings
  const initializeTricycleMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !leafletModule) return;
    
    const L = leafletModule;

    const createTricycleIcon = (status: string) => {
      let color = '#10b981'; // online
      if (status === 'maintenance') color = '#f59e0b';
      if (status === 'offline') color = '#6b7280';

      return L.divIcon({
        html: `
          <div style="position: relative;">
            <div style="
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background-color: ${color};
              border: 3px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 12px rgba(0,0,0,0.4);
              animation: pulse 2s ease-in-out infinite;
            ">
              <svg style="width: 14px; height: 14px; color: white;" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4v1a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H21a1 1 0 001-1V5a1 1 0 00-1-1H3z"/>
              </svg>
            </div>
          </div>
        `,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
    };

    // Draw barangay boundaries for Hinobaan's 13 barangays
    const barangayLocations = [
      { name: 'Poblacion', lat: 9.5925, lng: 122.4706 },
      { name: 'Nabulao', lat: 9.6050, lng: 122.4580 },
      { name: 'Culipapa', lat: 9.5800, lng: 122.4820 },
      { name: 'Mansalanao', lat: 9.6200, lng: 122.4900 },
      { name: 'Mahalang', lat: 9.5650, lng: 122.4550 },
      { name: 'Bacuyangan', lat: 9.6100, lng: 122.5000 },
      { name: 'Cabadiangan', lat: 9.5700, lng: 122.4450 },
      { name: 'Cartagena', lat: 9.5500, lng: 122.4650 },
      { name: 'Gintubhan', lat: 9.5400, lng: 122.4900 },
      { name: 'Hilaitan', lat: 9.5950, lng: 122.4400 },
      { name: 'Libacao', lat: 9.5300, lng: 122.4750 },
      { name: 'Talaban', lat: 9.6300, lng: 122.4700 },
      { name: 'Travesia', lat: 9.6150, lng: 122.4650 },
    ];

    // Add barangay markers/circles
    barangayLocations.forEach((barangay) => {
      L.circle([barangay.lat, barangay.lng], {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.05,
        radius: 800,
        weight: 1,
        dashArray: '5, 5',
      }).addTo(mapInstanceRef.current!)
        .bindTooltip(barangay.name, {
          permanent: false,
          direction: 'center',
          className: 'barangay-label'
        });
    });

    // Add real online drivers from backend
    onlineDrivers.forEach((driver) => {
      const marker = L.marker([driver.lat, driver.lng], {
        icon: createTricycleIcon(driver.status)
      }).addTo(mapInstanceRef.current!);
      
      marker.bindPopup(`
        <div style="padding: 12px; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background-color: #10b981;
            "></div>
            <strong style="font-weight: 600; font-size: 15px;">${driver.name}</strong>
          </div>
          <div style="font-size: 13px; color: #4b5563; margin-bottom: 4px;">
            🚗 ${driver.vehicle_type || 'Tricycle'} - ${driver.vehicle_plate || 'N/A'}
          </div>
          <div style="font-size: 13px; color: #4b5563; margin-bottom: 4px;">
            📍 ${driver.barangay || 'Hinobaan'}
          </div>
          <div style="font-size: 12px; color: #10b981; font-weight: 500; margin-top: 6px;">
            ✓ Online & Available
          </div>
        </div>
      `);
    });

    // Add active booking routes
    activeBookings.forEach((booking) => {
      // Draw route line
      L.polyline(
        [[booking.pickup.lat, booking.pickup.lng], [booking.destination.lat, booking.destination.lng]],
        {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.7,
          dashArray: '10, 10',
        }
      ).addTo(mapInstanceRef.current!)
        .bindPopup(`
          <div style="padding: 10px; min-width: 200px;">
            <strong style="font-size: 14px;">${booking.booking_id}</strong>
            <div style="margin-top: 6px; font-size: 13px;">
              <div style="color: #10b981; font-weight: 500;">🚗 ${booking.driver_name}</div>
              <div style="color: #6b7280; margin-top: 4px;">👤 ${booking.passenger_name}</div>
              <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e5e7eb;">
                <div style="font-size: 12px; color: #6b7280;">From: ${booking.pickup.barangay}</div>
                <div style="font-size: 12px; color: #6b7280;">To: ${booking.destination.barangay}</div>
              </div>
            </div>
          </div>
        `);

      // Pickup marker
      L.circleMarker([booking.pickup.lat, booking.pickup.lng], {
        radius: 6,
        fillColor: '#10b981',
        color: 'white',
        weight: 2,
        fillOpacity: 1,
      }).addTo(mapInstanceRef.current!);

      // Destination marker
      L.circleMarker([booking.destination.lat, booking.destination.lng], {
        radius: 6,
        fillColor: '#ef4444',
        color: 'white',
        weight: 2,
        fillOpacity: 1,
      }).addTo(mapInstanceRef.current!);
    });

    // Add Hinobaan municipality boundary
    L.rectangle(HINOBAAN_BOUNDS, {
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.03,
      weight: 2,
      dashArray: '10, 10',
    }).addTo(mapInstanceRef.current!);
  }, [onlineDrivers, activeBookings]);

  // Initialize map
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

        // Fix for Leaflet icon URLs
        delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });

        const map = L.map(mapRef.current!).setView([HINOBAAN_CENTER.lat, HINOBAAN_CENTER.lng], 13);
        mapInstanceRef.current = map;
        
        // Fit bounds to show entire Hinobaan area
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

        L.control.scale().addTo(map);
        initializeTricycleMarkers();
        setupMapClickHandler();
        getUserLocation();

        if (mounted) {
          setIsMapReady(true);
          setIsLoading(false);
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
      customMarkersRef.current = [];
      userMarkerRef.current = null;
      routingControlRef.current = null;
      tileLayerRef.current = null;
    };
  }, [getUserLocation, initializeTricycleMarkers, setupMapClickHandler, view]);

  // Update tile layer when view changes
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
    <div className={cn("relative w-full h-full", className)}>
      {/* Loading overlay */}
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
        className="w-full h-full rounded-lg bg-muted"
      />
      
      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border z-20">
        <div className="text-xs font-bold text-foreground mb-2">Hinobaan Fleet Map</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full shadow"></div>
            <span className="text-xs font-medium text-foreground">Online Drivers ({onlineDrivers.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full shadow"></div>
            <span className="text-xs font-medium text-foreground">Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500 rounded"></div>
            <span className="text-xs font-medium text-foreground">Active Routes ({activeBookings.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium text-foreground">Pickup</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs font-medium text-foreground">Destination</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 border border-green-500 border-dashed"></div>
            <span className="text-xs font-medium text-foreground">Barangay Areas</span>
          </div>
        </div>
      </div>
    </div>
  );
}