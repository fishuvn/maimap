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

// Maps country full name OR 2-letter code → ISO 2-letter code for flagcdn.com
export function getCountryCode(country: string): string {
  const map: Record<string, string> = {
    // Full names
    Vietnam: 'vn', Australia: 'au', Japan: 'jp', Singapore: 'sg',
    Taiwan: 'tw', 'Hong Kong': 'hk', Malaysia: 'my', Thailand: 'th',
    'South Korea': 'kr', Philippines: 'ph', Indonesia: 'id',
    'United States': 'us', 'United Kingdom': 'gb',
    China: 'cn', France: 'fr', Germany: 'de', Canada: 'ca',
    'New Zealand': 'nz', India: 'in', Brazil: 'br',
    // Already 2-letter codes
    VN: 'vn', AU: 'au', JP: 'jp', SG: 'sg', TW: 'tw',
    HK: 'hk', MY: 'my', TH: 'th', KR: 'kr', PH: 'ph',
    ID: 'id', US: 'us', GB: 'gb', UK: 'gb', CN: 'cn',
    FR: 'fr', DE: 'de', CA: 'ca', NZ: 'nz', IN: 'in', BR: 'br',
  };
  return map[country] || '';
}

export function getFlagUrl(country: string, size: '20x15' | '40x30' = '20x15'): string {
  const code = getCountryCode(country);
  if (!code) return '';
  return `https://flagcdn.com/${size}/${code}.png`;
}

export function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    Vietnam: '🇻🇳', VN: '🇻🇳',
    Australia: '🇦🇺', AU: '🇦🇺',
    Japan: '🇯🇵', JP: '🇯🇵',
    Singapore: '🇸🇬', SG: '🇸🇬',
    Taiwan: '🇹🇼', TW: '🇹🇼',
    'Hong Kong': '🇭🇰', HK: '🇭🇰',
    Malaysia: '🇲🇾', MY: '🇲🇾',
    Thailand: '🇹🇭', TH: '🇹🇭',
    'South Korea': '🇰🇷', KR: '🇰🇷',
    Philippines: '🇵🇭', PH: '🇵🇭',
    Indonesia: '🇮🇩', ID: '🇮🇩',
    'United States': '🇺🇸', US: '🇺🇸',
    'United Kingdom': '🇬🇧', GB: '🇬🇧', UK: '🇬🇧',
    China: '🇨🇳', CN: '🇨🇳',
    France: '🇫🇷', FR: '🇫🇷',
    Germany: '🇩🇪', DE: '🇩🇪',
    Canada: '🇨🇦', CA: '🇨🇦',
    'New Zealand': '🇳🇿', NZ: '🇳🇿',
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
