import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatRelative(dateStr: string): string {
  const d = new Date(dateStr + 'Z');
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    Vietnam: '🇻🇳',
    Australia: '🇦🇺',
    Japan: '🇯🇵',
    Singapore: '🇸🇬',
    Taiwan: '🇹🇼',
    'Hong Kong': '🇭🇰',
    Malaysia: '🇲🇾',
    Thailand: '🇹🇭',
    'South Korea': '🇰🇷',
    Philippines: '🇵🇭',
    Indonesia: '🇮🇩',
    'United States': '🇺🇸',
    'United Kingdom': '🇬🇧',
    China: '🇨🇳',
    France: '🇫🇷',
    Germany: '🇩🇪',
  };
  return flags[country] || '🌍';
}

export function getRoleBadge(role: string): { label: string; color: string } {
  switch (role) {
    case 'admin':
      return { label: 'Admin', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    case 'moderator':
      return { label: 'Mod', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    default:
      return { label: 'User', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' };
  }
}
