'use client';
import { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

interface Location { id: string; name: string; address: string; lat: number; lng: number; country: string; is_verified: number; }
interface Props { locations: Location[]; onSelect: (loc: Location) => void; selected: string | null; }

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

// Dark map style
const DARK_STYLE_ID = MAP_ID;

function Markers({ locations, onSelect, selected }: Props) {
  const map = useMap();

  // Fly to selected location
  useEffect(() => {
    if (!map || !selected) return;
    const loc = locations.find((l) => l.id === selected);
    if (loc) map.panTo({ lat: loc.lat, lng: loc.lng });
  }, [selected, map, locations]);

  return (
    <>
      {locations.map((loc) => {
        if (!loc.lat && !loc.lng) return null;
        const isSelected = selected === loc.id;
        return (
          <AdvancedMarker
            key={loc.id}
            position={{ lat: loc.lat, lng: loc.lng }}
            onClick={() => onSelect(loc)}
            zIndex={isSelected ? 100 : 1}
            title={loc.name}
          >
            <Pin
              background={isSelected ? '#f472b6' : loc.is_verified ? '#a78bfa' : '#ec4899'}
              borderColor={isSelected ? '#ffffff' : 'rgba(255,255,255,0.4)'}
              glyphColor="#ffffff"
              scale={isSelected ? 1.4 : 1.0}
            />
          </AdvancedMarker>
        );
      })}
    </>
  );
}

export default function MapView({ locations, onSelect, selected }: Props) {
  const [mapError, setMapError] = useState<string | null>(null);

  if (!API_KEY) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-sm">
        <p>Set <code className="text-violet-400">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in <code>.env.local</code></p>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 text-sm gap-2">
        <p className="text-zinc-400">Map unavailable</p>
        <p className="text-xs text-zinc-600 max-w-xs text-center">{mapError}</p>
        <p className="text-xs text-violet-400">Add <code>localhost</code> to your Google Cloud Console API key restrictions.</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} onError={() => setMapError('API key is not authorized for this domain.')}>
      <Map
        mapId={DARK_STYLE_ID}
        defaultCenter={{ lat: 10.8, lng: 106.7 }}
        defaultZoom={5}
        gestureHandling="greedy"
        disableDefaultUI={false}
        style={{ width: '100%', height: '100%' }}
        colorScheme="DARK"
      >
        <Markers locations={locations} onSelect={onSelect} selected={selected} />
      </Map>
    </APIProvider>
  );
}
