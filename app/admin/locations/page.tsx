'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Search, Loader2, Edit3, Check, X } from 'lucide-react';
import { getCountryFlag } from '@/lib/utils';

interface Location { id: string; name: string; address: string; lat: number; lng: number; country: string; is_verified: number; }

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [acting, setActing] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Location>>({});

  useEffect(() => { fetch('/api/locations').then((r) => r.json()).then((d) => { setLocations(d.locations || []); setLoading(false); }); }, []);

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

  const filtered = locations.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.address.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-white mb-1">Locations</h1><p className="text-sm text-zinc-500">Manage and verify arcade locations ({locations.length} total)</p></div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40" />
        </div>
      </div>
      {loading ? <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div> : (
        <div className="space-y-2">
          {filtered.map((loc) => (
            <div key={loc.id} className="glass rounded-xl p-4">
              {editing === loc.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input defaultValue={loc.name} onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))} className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500/40" placeholder="Name" />
                    <input defaultValue={loc.address} onChange={(e) => setEditData((d) => ({ ...d, address: e.target.value }))} className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500/40" placeholder="Address" />
                    <input defaultValue={loc.lat} type="number" step="any" onChange={(e) => setEditData((d) => ({ ...d, lat: parseFloat(e.target.value) }))} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500/40" placeholder="Lat" />
                    <input defaultValue={loc.lng} type="number" step="any" onChange={(e) => setEditData((d) => ({ ...d, lng: parseFloat(e.target.value) }))} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500/40" placeholder="Lng" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setEditing(null); setEditData({}); }} className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
                    <button onClick={() => saveEdit(loc.id)} disabled={acting === loc.id} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-lg hover:bg-violet-500/30">
                      {acting === loc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getCountryFlag(loc.country)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><p className="text-sm font-medium text-white truncate">{loc.name}</p>{loc.is_verified === 1 && <CheckCircle className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />}</div>
                    <p className="text-xs text-zinc-500 truncate">{loc.address}</p>
                    <p className="text-xs text-zinc-700 mt-0.5">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => { setEditing(loc.id); setEditData({ name: loc.name, address: loc.address, lat: loc.lat, lng: loc.lng, country: loc.country }); }} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/5"><Edit3 className="w-3.5 h-3.5" /></button>
                    {loc.is_verified ? (
                      <button onClick={() => verify(loc.id, 'unverify')} disabled={acting === loc.id} className="flex items-center gap-1 px-2.5 py-1 text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-lg hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 disabled:opacity-40">
                        <XCircle className="w-3 h-3" /> Unverify
                      </button>
                    ) : (
                      <button onClick={() => verify(loc.id, 'verify')} disabled={acting === loc.id} className="flex items-center gap-1 px-2.5 py-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 disabled:opacity-40">
                        {acting === loc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Verify
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
