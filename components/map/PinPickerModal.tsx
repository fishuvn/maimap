'use client';
import { useState, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { X, MapPin, Loader2, Check } from 'lucide-react';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

interface Props {
  open: boolean;
  locationId: string;
  locationName: string;
  initialLat: number;
  initialLng: number;
  onClose: () => void;
  onSaved: (id: string, lat: number, lng: number) => void;
}

export default function PinPickerModal({ open, locationId, locationName, initialLat, initialLng, onClose, onSaved }: Props) {
  const [pinPos, setPinPos] = useState({ lat: initialLat, lng: initialLng });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleMapClick = useCallback((e: any) => {
    const lat = e.detail?.latLng?.lat;
    const lng = e.detail?.latLng?.lng;
    if (lat !== undefined && lng !== undefined) setPinPos({ lat, lng });
  }, []);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/locations/${locationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: pinPos.lat, lng: pinPos.lng }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed to save'); return; }
      onSaved(locationId, pinPos.lat, pinPos.lng);
      onClose();
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-2xl rounded-2xl shadow-2xl pointer-events-auto flex flex-col overflow-hidden" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '80vh' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Reposition Pin</p>
                <p className="text-xs text-zinc-500 truncate max-w-xs">{locationName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Instruction */}
          <div className="px-5 py-2.5 bg-violet-500/10 border-b border-violet-500/20 flex-shrink-0">
            <p className="text-xs text-violet-300">📍 Click anywhere on the map to move the pin to that location</p>
          </div>

          {/* Map */}
          <div className="flex-1 min-h-0" style={{ height: '400px' }}>
            {API_KEY ? (
              <APIProvider apiKey={API_KEY}>
                <Map
                  mapId={MAP_ID}
                  defaultCenter={{ lat: initialLat || 10.8, lng: initialLng || 106.7 }}
                  defaultZoom={14}
                  gestureHandling="greedy"
                  colorScheme="DARK"
                  style={{ width: '100%', height: '100%' }}
                  onClick={handleMapClick}
                >
                  <AdvancedMarker position={pinPos}>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 border-2 border-white shadow-lg flex items-center justify-center animate-bounce">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div className="w-0 h-0" style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #a78bfa' }} />
                    </div>
                  </AdvancedMarker>
                </Map>
              </APIProvider>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-sm p-4 text-center">
                Set <code className="text-violet-400 mx-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in .env.local
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/8 flex items-center justify-between gap-3 flex-shrink-0">
            <div className="text-xs text-zinc-500 font-mono">
              <span className="text-zinc-400">Lat:</span> {pinPos.lat.toFixed(6)}
              <span className="text-zinc-400 ml-3">Lng:</span> {pinPos.lng.toFixed(6)}
            </div>
            <div className="flex items-center gap-2">
              {error && <span className="text-xs text-red-400">{error}</span>}
              <button onClick={onClose} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium">
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Save Pin
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
