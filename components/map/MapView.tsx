'use client';
import { useEffect, useRef } from 'react';

interface Location { id: string; name: string; address: string; lat: number; lng: number; country: string; is_verified: number; }
interface Props { locations: Location[]; onSelect: (location: Location) => void; selected: string | null; }

export default function MapView({ locations, onSelect, selected }: Props) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || mapRef.current) return;
    import('leaflet').then((L) => {
      if (!mapContainerRef.current || mapRef.current) return;
      const map = L.map(mapContainerRef.current, { center: [10.8, 106.7], zoom: 5, zoomControl: false });
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      locations.forEach((loc) => {
        if (loc.lat === 0 && loc.lng === 0) return;
        const color = loc.is_verified ? '#a78bfa' : '#f472b6';
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:28px;height:28px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid rgba(255,255,255,0.3);box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer;display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);font-size:12px;">🎵</div></div>`,
          iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -30],
        });
        const marker = L.marker([loc.lat, loc.lng], { icon })
          .bindPopup(`<div style="min-width:180px;padding:4px 0;"><div style="font-weight:600;font-size:13px;color:#f4f4f5;margin-bottom:4px;">${loc.name}</div><div style="font-size:11px;color:#a1a1aa;margin-bottom:6px;">${loc.address}</div>${loc.is_verified ? '<span style="font-size:10px;background:rgba(167,139,250,0.2);color:#a78bfa;padding:2px 6px;border-radius:99px;border:1px solid rgba(167,139,250,0.3);">✓ Verified</span>' : ''}</div>`)
          .addTo(map);
        marker.on('click', () => onSelect(loc));
        markersRef.current.push({ id: loc.id, marker });
      });
    });
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!selected || !mapRef.current) return;
    const found = markersRef.current.find((m) => m.id === selected);
    if (found) { mapRef.current.flyTo(found.marker.getLatLng(), 15, { animate: true, duration: 1.2 }); found.marker.openPopup(); }
  }, [selected]);

  return <div ref={mapContainerRef} className="w-full h-full" id="maimap-leaflet" />;
}
