'use client';
import Link from 'next/link';
import { CheckCircle, MessageSquare, ExternalLink } from 'lucide-react';
import { getFlagUrl, getCountryFlag } from '@/lib/utils';

interface Location { id: string; name: string; address: string; lat: number; lng: number; country: string; is_verified: number; post_count?: number; }
interface Props { location: Location; onClick?: () => void; selected?: boolean; }

function CountryFlag({ country, size = 'sm' }: { country: string; size?: 'sm' | 'lg' }) {
  const url = getFlagUrl(country, size === 'lg' ? '40x30' : '20x15');
  const emoji = getCountryFlag(country);
  const dim = size === 'lg' ? { w: 40, h: 30 } : { w: 20, h: 15 };
  if (!url) return <span className="text-base">{emoji}</span>;
  return (
    <img
      src={url}
      alt={country}
      width={dim.w}
      height={dim.h}
      className={`rounded-sm object-cover ${size === 'lg' ? 'w-10 h-7' : 'w-5 h-3.5'}`}
      style={{ imageRendering: 'auto' }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}

export { CountryFlag };

export default function LocationCard({ location, onClick, selected }: Props) {
  return (
    <div onClick={onClick} className={`group relative p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${selected ? 'bg-violet-500/15 border-violet-500/50' : 'bg-white/[0.03] border-white/8 hover:bg-white/[0.07] hover:border-white/15'}`}>
      <div className="flex items-start gap-3">
        {/* Country flag badge */}
        <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden ${location.is_verified ? 'bg-violet-500/20' : 'bg-zinc-800'}`}>
          <CountryFlag country={location.country} size="lg" />
        </div>
        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-sm font-semibold text-zinc-100 truncate leading-tight">{location.name}</p>
            {location.is_verified === 1 && <CheckCircle className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />}
          </div>
          {/* Address */}
          <p className="text-xs text-zinc-400 truncate leading-snug">{location.address}</p>
          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-1">
              <CountryFlag country={location.country} size="sm" />
              <span className="text-xs text-zinc-500 font-medium">{location.country}</span>
            </div>
            {(location.post_count ?? 0) > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-zinc-500">
                <MessageSquare className="w-3 h-3" />{location.post_count}
              </span>
            )}
          </div>
        </div>
        {/* External link */}
        <Link href={`/locations/${location.id}`} onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0">
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
        </Link>
      </div>
    </div>
  );
}
