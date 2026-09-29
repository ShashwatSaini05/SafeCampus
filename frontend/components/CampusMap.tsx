'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to recenter map when position changes
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

interface CampusMapProps {
  location?: string;
  className?: string;
}

// Red pulsing icon for incident markers
const IncidentIcon = L.divIcon({
  className: 'incident-marker',
  html: `<div style="
    width: 18px; height: 18px; 
    background: #ef4444; 
    border: 3px solid #fff; 
    border-radius: 50%; 
    box-shadow: 0 0 0 3px rgba(239,68,68,0.3), 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -12],
});

export default function CampusMap({ location, className = '' }: CampusMapProps) {
  // Default center: India center (will update with geolocation)
  const [center, setCenter] = useState<[number, number]>([28.6139, 77.2090]);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [locationLabel, setLocationLabel] = useState('Campus Area');
  const [isLocating, setIsLocating] = useState(true);
  const mapRef = useRef<L.Map | null>(null);

  // Try to get user's real location
  useEffect(() => {
    if (!navigator.geolocation) {
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCenter(coords);
        setUserPos(coords);
        setLocationLabel(location || 'Your Location');
        setIsLocating(false);
      },
      () => {
        // Geolocation denied/failed — use default
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [location]);

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`} style={{ minHeight: '280px' }}>
      {/* Loading overlay */}
      {isLocating && (
        <div className="absolute inset-0 z-[1000] bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-slate-500">Locating you...</span>
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', minHeight: '280px', borderRadius: '0.75rem' }}
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        {/* Labels overlay on satellite */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution=""
        />

        <RecenterMap lat={center[0]} lng={center[1]} />

        {/* User location marker */}
        {userPos && (
          <Marker position={userPos} icon={IncidentIcon}>
            <Popup>
              <div style={{ textAlign: 'center', padding: '4px' }}>
                <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                  📍 {locationLabel}
                </strong>
                <br />
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {userPos[0].toFixed(4)}, {userPos[1].toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Default marker when no user location */}
        {!userPos && !isLocating && (
          <Marker position={center}>
            <Popup>
              <div style={{ textAlign: 'center', padding: '4px' }}>
                <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                  🏫 Campus Area
                </strong>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Location badge overlay */}
      <div className="absolute top-3 left-3 z-[1000]">
        <div className="bg-white/95 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-lg border border-slate-200/60 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700">
            {userPos ? 'Live Location' : 'Default View'}
          </span>
        </div>
      </div>
    </div>
  );
}
