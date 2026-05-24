import { useEffect, useRef, useState } from 'react';
import type L from 'leaflet';

interface AddressMapProps {
  latitude: number;
  longitude: number;
  className?: string;
  height?: string;
}

export function AddressMap({ latitude, longitude, className = '', height = '200px' }: AddressMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const latRef = useRef(latitude);
  const lngRef = useRef(longitude);

  useEffect(() => {
    latRef.current = latitude;
    lngRef.current = longitude;
  }, [latitude, longitude]);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([L]) => {
      if (cancelled) return;

      if (!mapRef.current) return;

      const markerIcon = L.divIcon({
        className: '',
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="#ea580c" stroke="white" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="3" fill="white" stroke="none"/></svg>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const map = L.map(mapRef.current, {
        center: [latRef.current, lngRef.current],
        zoom: 16,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const marker = L.marker([latRef.current, lngRef.current], { icon: markerIcon }).addTo(map);
      mapInstanceRef.current = map;
      markerRef.current = marker;
      setLoaded(true);
    }).catch(() => {
      if (!cancelled) setError(true);
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([latitude, longitude]);
    mapInstanceRef.current.setView([latitude, longitude], 16);
  }, [latitude, longitude]);

  if (error) {
    return (
      <div
        className={`rounded-xl overflow-hidden border border-border-default bg-surface-elevated flex items-center justify-center text-text-tertiary text-sm ${className}`}
        style={{ height }}
      >
        Mapa indisponivel
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`rounded-xl overflow-hidden border border-border-default ${className}`}
      style={{ height, opacity: loaded ? 1 : 0.5, transition: 'opacity 200ms' }}
    />
  );
}