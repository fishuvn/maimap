'use client';
import Link from 'next/link';
import { CheckCircle, MessageSquare, ExternalLink } from 'lucide-react';
import { getCountryFlag } from '@/lib/utils';

interface Location { id: string; name: string; address: string; lat: number; lng: number; country: string; is_verified: number; post_count?: number; }
interface Props { location: Location; onClick?: () => void; selected?: boolean; }

export default function LocationCard({ location, onClick, selected }: Props) {
  return (
    <div onClick={onClick} className={`group relative p-3 rounded-xl border cursor-pointer transition-all duration-200 ${selected ? 'bg-violet-500/10 border-violet-500/40' : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm ${location.is_verified ? 'bg-violet-500/20' : 'bg-pink-500/20'}`}>
          {getCountryFlag(location.country)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-sm font-medium text-white truncate leading-tight">{location.name}</p>
            {location.is_verified === 1 && <CheckCircle className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />}
          </div>
          <p className="text-xs text-zinc-500 truncate">{location.address}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-zinc-600">{location.country}</span>
            {(location.post_count ?? 0) > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-zinc-600"><MessageSquare className="w-3 h-3" />{location.post_count}</span>
            )}
          </div>
        </div>
        <Link href={`/locations/${location.id}`} onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10">
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
        </Link>
      </div>
    </div>
  );
}
