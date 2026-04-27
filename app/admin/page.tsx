'use client';
import { useEffect, useState } from 'react';
import { Users, MapPin, CheckCircle, MessageSquare, Flag, Loader2 } from 'lucide-react';

interface Stats { totalUsers: number; totalLocations: number; verifiedLocations: number; pendingPosts: number; pendingComments: number; openReports: number; }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch('/api/admin/stats').then((r) => r.json()).then((d) => { setStats(d.stats); setLoading(false); }); }, []);

  const cards = [
    { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { key: 'totalLocations', label: 'Locations', icon: MapPin, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { key: 'verifiedLocations', label: 'Verified', icon: CheckCircle, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { key: 'pendingPosts', label: 'Pending Posts', icon: MessageSquare, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { key: 'pendingComments', label: 'Pending Comments', icon: MessageSquare, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { key: 'openReports', label: 'Open Reports', icon: Flag, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1><p className="text-sm text-zinc-500">Overview of community activity</p></div>
      {loading ? <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div> : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {cards.map(({ key, label, icon: Icon, color, bg }) => (
            <div key={key} className="glass rounded-xl p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div>
              <div><p className="text-2xl font-bold text-white">{(stats as any)?.[key] ?? 0}</p><p className="text-xs text-zinc-500">{label}</p></div>
            </div>
          ))}
        </div>
      )}
      <div className="glass rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: '/admin/queue', label: 'Review Content Queue', desc: 'Approve or hide pending posts & comments', color: 'from-violet-500/10 to-violet-600/10 border-violet-500/20' },
            { href: '/admin/reports', label: 'Handle Reports', desc: 'Resolve or dismiss open community reports', color: 'from-red-500/10 to-red-600/10 border-red-500/20' },
            { href: '/admin/locations', label: 'Verify Locations', desc: 'Review and verify community locations', color: 'from-pink-500/10 to-pink-600/10 border-pink-500/20' },
          ].map((a) => (
            <a key={a.href} href={a.href} className={`block rounded-xl p-4 bg-gradient-to-br border ${a.color} hover:opacity-80 transition-opacity`}>
              <p className="text-sm font-medium text-white mb-1">{a.label}</p><p className="text-xs text-zinc-500">{a.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
