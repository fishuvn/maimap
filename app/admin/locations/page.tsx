'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Search, Loader2, Edit3, Check, X, MapPin, Monitor, Plus, Trash2, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { getCountryFlag } from '@/lib/utils';
import PinPickerModal from '@/components/map/PinPickerModal';

interface Location { id: string; name: string; address: string; lat: number; lng: number; country: string; is_verified: number; }
interface Cabinet { id: number; number: number; payment_type: string; cost: number; status: string; avg_rating: number | null; rating_count: number; }

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [acting, setActing] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Location>>({});
  const [pinPicker, setPinPicker] = useState<Location | null>(null);
  const [expandedCabs, setExpandedCabs] = useState<string | null>(null);
  const [cabinets, setCabinets] = useState<Record<string, Cabinet[]>>({});
  const [loadingCabs, setLoadingCabs] = useState<string | null>(null);
  const [newCab, setNewCab] = useState<{ number: string; token_cost: string; payment_type: string; status: string }>({ number: '', token_cost: '7', payment_type: 'card', status: 'unknown' });
  const [addingCab, setAddingCab] = useState(false);

  useEffect(() => {
    fetch('/api/locations').then((r) => r.json()).then((d) => { setLocations(d.locations || []); setLoading(false); });
  }, []);

  const verify = async (id: string, action: 'verify' | 'unverify') => {
    setActing(id);
    await fetch(`/api/locations/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    setLocations((l) => l.map((x) => x.id === id ? { ...x, is_verified: action === 'verify' ? 1 : 0 } : x));
    setActing(null);
  };

  const saveEdit = async (id: string) => {
    setActing(id);
    await fetch(`/api/locations/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editData) });
    setLocations((l) => l.map((x) => x.id === id ? { ...x, ...editData } : x));
    setEditing(null); setActing(null);
  };

  const handlePinSaved = (id: string, lat: number, lng: number) => {
    setLocations((l) => l.map((x) => x.id === id ? { ...x, lat, lng } : x));
  };

  const toggleCabinets = async (locId: string) => {
    if (expandedCabs === locId) { setExpandedCabs(null); return; }
    setExpandedCabs(locId);
    if (cabinets[locId]) return;
    setLoadingCabs(locId);
    const res = await fetch(`/api/locations/${locId}/cabinets`);
    const data = await res.json();
    setCabinets(prev => ({ ...prev, [locId]: data.cabinets || [] }));
    setLoadingCabs(null);
  };

  const addCabinet = async (locId: string) => {
    if (!newCab.number) return;
    setAddingCab(true);
    const res = await fetch(`/api/locations/${locId}/cabinets`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: parseInt(newCab.number), payment_type: newCab.payment_type, cost: parseInt(newCab.token_cost), status: newCab.status }),
    });
    const data = await res.json();
    if (res.ok) {
      setCabinets(prev => ({ ...prev, [locId]: [...(prev[locId] || []), data.cabinet].sort((a, b) => a.number - b.number) }));
      setNewCab({ number: '', token_cost: '7', payment_type: 'card', status: 'unknown' });
    }
    setAddingCab(false);
  };

  const deleteCabinet = async (locId: string, cabId: number) => {
    await fetch(`/api/cabinets/${cabId}`, { method: 'DELETE' });
    setCabinets(prev => ({ ...prev, [locId]: prev[locId].filter(c => c.id !== cabId) }));
  };

  const filtered = locations.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.address.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Locations</h1>
          <p className="text-sm text-zinc-500">Manage and verify arcade locations ({locations.length} total)</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((loc) => (
            <div key={loc.id} className="glass rounded-xl p-4">
              {editing === loc.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input defaultValue={loc.name} onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                      className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500" placeholder="Name" />
                    <input defaultValue={loc.address} onChange={(e) => setEditData((d) => ({ ...d, address: e.target.value }))}
                      className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500" placeholder="Address" />
                    <input defaultValue={loc.lat} type="number" step="any" onChange={(e) => setEditData((d) => ({ ...d, lat: parseFloat(e.target.value) }))}
                      className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500" placeholder="Lat" />
                    <input defaultValue={loc.lng} type="number" step="any" onChange={(e) => setEditData((d) => ({ ...d, lng: parseFloat(e.target.value) }))}
                      className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500" placeholder="Lng" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setEditing(null); setEditData({}); }} className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                      <X className="w-3 h-3" /> Cancel
                    </button>
                    <button onClick={() => saveEdit(loc.id)} disabled={acting === loc.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-lg hover:bg-violet-500/30">
                      {acting === loc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-lg flex-shrink-0">{getCountryFlag(loc.country)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">{loc.name}</p>
                      {loc.is_verified === 1 && <CheckCircle className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-zinc-400 truncate">{loc.address}</p>
                    <p className="text-xs text-zinc-600 mt-0.5 font-mono">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Edit text */}
                    <button onClick={() => { setEditing(loc.id); setEditData({ name: loc.name, address: loc.address, lat: loc.lat, lng: loc.lng, country: loc.country }); }}
                      className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-colors" title="Edit details">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {/* Repin button */}
                    <button onClick={() => setPinPicker(loc)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs bg-pink-500/15 text-pink-400 border border-pink-500/30 rounded-lg hover:bg-pink-500/25 transition-colors" title="Reposition map pin">
                      <MapPin className="w-3 h-3" /> Repin
                    </button>
                    {/* Cabinets toggle */}
                    <button onClick={() => toggleCabinets(loc.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs bg-zinc-700/50 text-zinc-300 border border-white/10 rounded-lg hover:bg-zinc-700 transition-colors">
                      <Monitor className="w-3 h-3" /> Cabs
                      {expandedCabs === loc.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {/* Verify / Unverify */}
                    {loc.is_verified ? (
                      <button onClick={() => verify(loc.id, 'unverify')} disabled={acting === loc.id}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-lg hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 disabled:opacity-40 transition-colors">
                        <XCircle className="w-3 h-3" /> Unverify
                      </button>
                    ) : (
                      <button onClick={() => verify(loc.id, 'verify')} disabled={acting === loc.id}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 disabled:opacity-40 transition-colors">
                        {acting === loc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Verify
                      </button>
                    )}
                  </div>
                </div>
              )}
              {/* Cabinet panel */}
              {expandedCabs === loc.id && (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-2 animate-fade-in">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><Monitor className="w-3 h-3" /> Cabinets</p>
                  {loadingCabs === loc.id ? (
                    <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-violet-400" /></div>
                  ) : (
                    <>
                      {(cabinets[loc.id] || []).length === 0 && <p className="text-xs text-zinc-600 text-center py-2">No cabinets yet</p>}
                      {(cabinets[loc.id] || []).map(cab => {
                        const sc = cab.status === 'working' ? 'text-green-400' : cab.status === 'broken' ? 'text-red-400' : 'text-zinc-500';
                        return (
                          <div key={cab.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                            <Monitor className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                            <span className="text-xs text-zinc-300 font-medium">Cab #{cab.number}</span>
                            <span className={`text-xs capitalize ${sc}`}>{cab.status}</span>
                            <span className="text-xs text-zinc-500">
                              {cab.payment_type === 'coins' ? '🪙' : cab.payment_type === 'both' ? '🪙+💳' : '💳'} {cab.cost}
                            </span>
                            <div className="flex-1" />
                            <button onClick={() => deleteCabinet(loc.id, cab.id)} className="p-1 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                      {/* Add new cabinet */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <input type="number" placeholder="Cab #" value={newCab.number} onChange={e => setNewCab(p => ({ ...p, number: e.target.value }))} min={1}
                          className="w-16 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-violet-500" />
                        <select value={newCab.payment_type} onChange={e => setNewCab(p => ({ ...p, payment_type: e.target.value }))}
                          className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-violet-500">
                          <option value="card">💳 Card</option>
                          <option value="coins">🪙 Coins</option>
                          <option value="both">🪙+💳 Both</option>
                        </select>
                        <input type="number" placeholder="Cost" value={newCab.token_cost} onChange={e => setNewCab(p => ({ ...p, token_cost: e.target.value }))} min={1}
                          className="w-16 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-violet-500" />
                        <select value={newCab.status} onChange={e => setNewCab(p => ({ ...p, status: e.target.value }))}
                          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-violet-500">
                          <option value="unknown">Unknown</option>
                          <option value="working">Working</option>
                          <option value="broken">Broken</option>
                        </select>
                        <button onClick={() => addCabinet(loc.id)} disabled={addingCab || !newCab.number}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-lg hover:bg-violet-500/30 disabled:opacity-50">
                          {addingCab ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Add
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

          ))}
        </div>
      )}

      {/* Pin Picker Modal */}
      {pinPicker && (
        <PinPickerModal
          open={true}
          locationId={pinPicker.id}
          locationName={pinPicker.name}
          initialLat={pinPicker.lat}
          initialLng={pinPicker.lng}
          onClose={() => setPinPicker(null)}
          onSaved={handlePinSaved}
        />
      )}
    </div>
  );
}
