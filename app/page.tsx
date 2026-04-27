'use client';
import { Suspense } from 'react';
import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import LocationCard from '@/components/location/LocationCard';
import { Search, CheckCircle, Globe2, Loader2, Map as MapIcon, List } from 'lucide-react';
import { getCountryFlag } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-[#0f0f1a]"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>
});

interface Location { id: string; name: string; address: string; lat: number; lng: number; country: string; is_verified: number; post_count?: number; }

function HomeContent() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get('view') || 'map';

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (country) params.set('country', country);
    if (verifiedOnly) params.set('verified', 'true');
    const res = await fetch('/api/locations?' + params.toString());
    const data = await res.json();
    setLocations(data.locations || []);
    setCountries(data.countries || []);
    setLoading(false);
  }, [search, country, verifiedOnly]);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  return (
    <div className="h-screen flex flex-col pt-16">
      {/* Filter Bar */}
      <div className="flex-shrink-0 glass border-b border-white/5 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type="text" placeholder="Search locations..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40 transition-all" />
          </div>
          <select value={country} onChange={(e) => setCountry(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-violet-500/40 cursor-pointer">
            <option value="">All Countries</option>
            {countries.map((c) => <option key={c} value={c}>{getCountryFlag(c)} {c}</option>)}
          </select>
          <button onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-all ${verifiedOnly ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-300'}`}>
            <CheckCircle className="w-4 h-4" /> Verified
          </button>
          <span className="text-xs text-zinc-600 ml-1">{loading ? '...' : `${locations.length} locations`}</span>
          <div className="ml-auto flex items-center bg-white/5 rounded-lg p-1 gap-1">
            <button onClick={() => router.push('/')} className={`p-1.5 rounded-md transition-all ${view === 'map' ? 'bg-violet-500/30 text-violet-300' : 'text-zinc-500 hover:text-zinc-300'}`}><MapIcon className="w-4 h-4" /></button>
            <button onClick={() => router.push('/?view=list')} className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-violet-500/30 text-violet-300' : 'text-zinc-500 hover:text-zinc-300'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {view === 'map' ? (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 flex-shrink-0 flex flex-col border-r border-white/5 overflow-hidden hidden lg:flex">
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/3 animate-pulse" />) :
                locations.length === 0 ? <div className="text-center py-12 text-zinc-600 text-sm">No locations found</div> :
                locations.map((loc) => <LocationCard key={loc.id} location={loc} selected={selected === loc.id} onClick={() => setSelected(loc.id === selected ? null : loc.id)} />)
              }
            </div>
            <div className="p-3 border-t border-white/5">
              <div className="flex items-center gap-3 text-xs text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-violet-400 inline-block" />Verified</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block" />Community</span>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            <MapView locations={locations} onSelect={(loc) => setSelected(loc.id)} selected={selected} />
            <div className="lg:hidden absolute bottom-4 left-4 right-4 overflow-x-auto flex gap-2 pb-1">
              {!loading && locations.slice(0, 10).map((loc) => (
                <div key={loc.id} onClick={() => setSelected(loc.id)} className="flex-shrink-0 glass-strong rounded-xl p-3 w-56 cursor-pointer">
                  <p className="text-xs font-medium text-white truncate">{loc.name}</p>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">{loc.country}</p>
                  <Link href={`/locations/${loc.id}`} className="text-xs text-violet-400 mt-1 block">View details →</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-white/3 animate-pulse" />)}
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-24 text-zinc-600">
                <Globe2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-lg font-medium text-zinc-500 mb-1">No locations found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              countries.filter((c) => !country || c === country).map((c) => {
                const locs = locations.filter((l) => l.country === c);
                if (locs.length === 0) return null;
                return (
                  <div key={c} className="mb-8">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
                      <span>{getCountryFlag(c)}</span>{c}<span className="text-zinc-700">({locs.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {locs.map((loc) => <LocationCard key={loc.id} location={loc} />)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
