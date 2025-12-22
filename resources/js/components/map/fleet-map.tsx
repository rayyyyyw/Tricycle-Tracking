'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { cn } from '@/lib/utils';

interface FleetMapProps {
  activeTricycles?: number;
  view?: 'standard' | 'satellite';
  className?: string;
  onMarkerAdd?: (count: number) => void;
  onRouteCalculated?: (distance: string, duration: string) => void;
}

interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
}

// Default Hinoba-an coordinates (Negros Occidental)
const HINOBAAN_COORDS = {
  lat: 9.5925,
  lng: 122.4706
};

let leafletModule: any = null;
let routingModule: any = null;

export default function FleetMap({ 
  activeTricycles = 8, 
  view = 'standard',
  className,
  onMarkerAdd,
  onRouteCalculated
}: FleetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const routingControlRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const customMarkersRef = useRef<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<RoutePoint | null>(null);
  const [routeDistance, setRouteDistance] = useState<string>('');
  const [routeDuration, setRouteDuration] = useState<string>('');
  const [customMarkersCount, setCustomMarkersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user's current location with fallback to Hinoba-an
  const getUserLocation = () => {
    if (!mapInstanceRef.current || !leafletModule) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([location.lat, location.lng], 14);
            addUserMarker(location);
          }
        },
        (error) => {
          setUserLocation(HINOBAAN_COORDS);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([HINOBAAN_COORDS.lat, HINOBAAN_COORDS.lng], 14);
            addUserMarker(HINOBAAN_COORDS);
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 3000,
          maximumAge: 60000
        }
      );
    } else {
      setUserLocation(HINOBAAN_COORDS);
      if (mapInstanceRef.current) {
        addUserMarker(HINOBAAN_COORDS);
      }
    }
  };

  // Add user location marker to map
  const addUserMarker = (location: { lat: number; lng: number }) => {
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
  };

  // Add custom marker to map
  const addCustomMarker = (lat: number, lng: number, name: string = 'Custom Marker') => {
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
    setCustomMarkersCount(customMarkersRef.current.length);
    onMarkerAdd?.(customMarkersRef.current.length);

    return marker;
  };

  // Calculate route between two points using OSRM
  const calculateRoute = (from: RoutePoint, to: RoutePoint) => {
    if (!mapInstanceRef.current || !leafletModule || !routingModule) return;

    if (routingControlRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    const L = leafletModule;
    
    try {
      routingControlRef.current = routingModule.control({
        waypoints: [
          L.latLng(from.lat, from.lng),
          L.latLng(to.lat, to.lng)
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        lineOptions: {
          styles: [
            {
              color: '#3b82f6',
              weight: 6,
              opacity: 0.8
            }
          ],
          extendToWaypoints: false,
          missingRouteTolerance: 0
        },
        createMarker: function(i: number, waypoint: any, n: number) {
          return false;
        },
        router: new routingModule.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving'
        })
      }).addTo(mapInstanceRef.current);

      routingControlRef.current.on('routesfound', function(e: any) {
        const routes = e.routes;
        const summary = routes[0].summary;
        
        const distanceInKm = (summary.totalDistance / 1000).toFixed(2);
        const durationInMinutes = Math.round(summary.totalTime / 60);
        
        setRouteDistance(`${distanceInKm} km`);
        setRouteDuration(`${durationInMinutes} min`);
        onRouteCalculated?.(`${distanceInKm} km`, `${durationInMinutes} min`);
      });
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  // Handle map click to add marker
  const setupMapClickHandler = () => {
    if (!mapInstanceRef.current || !leafletModule) return;
    
    const L = leafletModule;

    mapInstanceRef.current.on('click', function(e: any) {
      const clickedLocation = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      };
      
      // Get location name from Nominatim
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickedLocation.lat}&lon=${clickedLocation.lng}&zoom=18&addressdetails=1`)
        .then(response => response.json())
        .then(data => {
          const locationName = data.display_name 
            ? data.display_name.split(',').slice(0, 3).join(',') 
            : `Location (${clickedLocation.lat.toFixed(4)}, ${clickedLocation.lng.toFixed(4)})`;
          
          addCustomMarker(clickedLocation.lat, clickedLocation.lng, locationName);
          
          const newDestination: RoutePoint = {
            lat: clickedLocation.lat,
            lng: clickedLocation.lng,
            name: locationName
          };
          
          setDestination(newDestination);
        })
        .catch(error => {
          const locationName = `Location (${clickedLocation.lat.toFixed(4)}, ${clickedLocation.lng.toFixed(4)})`;
          
          addCustomMarker(clickedLocation.lat, clickedLocation.lng, locationName);
          
          const newDestination: RoutePoint = {
            lat: clickedLocation.lat,
            lng: clickedLocation.lng,
            name: locationName
          };
          
          setDestination(newDestination);
        });
    });
  };

  // Initialize tricycle markers
  const initializeTricycleMarkers = () => {
    if (!mapInstanceRef.current || !leafletModule) return;
    
    const L = leafletModule;

    const createTricycleIcon = (status: 'active' | 'maintenance' | 'offline') => {
      let color = '#10b981';
      if (status === 'maintenance') color = '#f59e0b';
      if (status === 'offline') color = '#6b7280';

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
            }"></div>
          </div>
        `,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
    };

    const tricycleLocations = [
      { lat: 9.5925, lng: 122.4706, status: 'active' as const, driver: 'Juan Dela Cruz' },
      { lat: 9.5935, lng: 122.4715, status: 'active' as const, driver: 'Maria Santos' },
      { lat: 9.5915, lng: 122.4695, status: 'active' as const, driver: 'Pedro Reyes' },
      { lat: 9.5940, lng: 122.4680, status: 'maintenance' as const, driver: 'Ana Lopez' },
      { lat: 9.5905, lng: 122.4720, status: 'active' as const, driver: 'Carlos Gomez' },
      { lat: 9.5930, lng: 122.4670, status: 'active' as const, driver: 'Luis Torres' },
      { lat: 9.5950, lng: 122.4730, status: 'offline' as const, driver: 'Miguel Cruz' },
      { lat: 9.5895, lng: 122.4745, status: 'active' as const, driver: 'Sofia Reyes' },
    ];

    tricycleLocations.forEach((location) => {
      const marker = L.marker([location.lat, location.lng], {
        icon: createTricycleIcon(location.status)
      }).addTo(mapInstanceRef.current);
      
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

    L.circle([HINOBAAN_COORDS.lat, HINOBAAN_COORDS.lng], {
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.1,
      radius: 1500,
    }).addTo(mapInstanceRef.current);
  };

  // Initialize map
  useEffect(() => {
    let mounted = true;

    const initializeMap = async () => {
      if (!mapRef.current || !mounted) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        if (!leafletModule) {
          leafletModule = await import('leaflet');
        }
        
        if (!routingModule) {
          routingModule = await import('leaflet-routing-machine');
        }
        
        const L = leafletModule;

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });

        const map = L.map(mapRef.current!).setView([HINOBAAN_COORDS.lat, HINOBAAN_COORDS.lng], 14);
        mapInstanceRef.current = map;

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
      } catch (error) {
        console.error('Error initializing map:', error);
        if (mounted) {
          setError('Failed to load map. Please refresh the page.');
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
  }, []);

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

  // Calculate route from user location to destination
  const handleCalculateRoute = () => {
    if (userLocation && destination) {
      calculateRoute(
        { lat: userLocation.lat, lng: userLocation.lng, name: 'Your Location' },
        destination
      );
    }
  };

  // Clear all custom markers
  const handleClearAllMarkers = () => {
    customMarkersRef.current.forEach(marker => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    customMarkersRef.current = [];
    setCustomMarkersCount(0);
    onMarkerAdd?.(0);
    setDestination(null);
  };

  // Clear route
  const handleClearRoute = () => {
    if (routingControlRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
      setRouteDistance('');
      setRouteDuration('');
    }
  };

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
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium text-foreground">Active Tricycle ({activeTricycles})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs font-medium text-foreground">Maintenance (1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-xs font-medium text-foreground">Offline (1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
            </div>
            <span className="text-xs font-medium text-foreground">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
            </div>
            <span className="text-xs font-medium text-foreground">Custom Marker ({customMarkersCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500"></div>
            <span className="text-xs font-medium text-foreground">Route Path</span>
          </div>
        </div>
      </div>
    </div>
  );
}