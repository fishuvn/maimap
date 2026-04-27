'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, Flag, AlertTriangle } from 'lucide-react';
import { formatRelative } from '@/lib/utils';

interface Report { id: number; reporter_username: string; target_type: string; target_id: number; reason: string; status: string; created_at: string; resolved_by_username?: string; }
const statusColor: Record<string, string> = { open: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', resolved: 'bg-green-500/20 text-green-400 border-green-500/30', dismissed: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' };

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const [acting, setActing] = useState<number | null>(null);
  useEffect(() => { fetch('/api/admin/reports').then((r) => r.json()).then((d) => { setReports(d.reports || []); setLoading(false); }); }, []);
  const act = async (id: number, action: 'resolve' | 'dismiss') => {
    setActing(id);
    await fetch(`/api/admin/reports/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    setReports((r) => r.map((x) => x.id === id ? { ...x, status: action === 'resolve' ? 'resolved' : 'dismissed' } : x));
    setActing(null);
  };
  const filtered = reports.filter((r) => filter === 'all' || r.status === filter);
  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-white mb-1">Reports</h1><p className="text-sm text-zinc-500">Review community-submitted content reports</p></div>
      <div className="flex gap-2 mb-6">
        {['open', 'resolved', 'dismissed', 'all'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${filter === f ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'glass text-zinc-500 hover:text-zinc-300'}`}>
            {f}{f !== 'all' && <span className="ml-1.5 opacity-60">({reports.filter((r) => r.status === f).length})</span>}
          </button>
        ))}
      </div>
      {loading ? <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div> : filtered.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center"><Flag className="w-8 h-8 mx-auto mb-2 text-zinc-700" /><p className="text-sm text-zinc-600">No {filter} reports</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => (
            <div key={report.id} className="glass rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-white capitalize">{report.target_type} Report</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[report.status]}`}>{report.status}</span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-2">"{report.reason}"</p>
                  <div className="flex items-center gap-3 text-xs text-zinc-600">
                    <span>by <span className="text-zinc-400">{report.reporter_username}</span></span>
                    <span>{formatRelative(report.created_at)}</span>
                    {report.resolved_by_username && <span>Resolved by <span className="text-zinc-400">{report.resolved_by_username}</span></span>}
                  </div>
                </div>
                {report.status === 'open' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => act(report.id, 'resolve')} disabled={acting === report.id} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 disabled:opacity-40">
                      {acting === report.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Resolve
                    </button>
                    <button onClick={() => act(report.id, 'dismiss')} disabled={acting === report.id} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-zinc-500/20 text-zinc-400 border border-zinc-500/30 rounded-lg hover:bg-zinc-500/30 disabled:opacity-40">
                      <XCircle className="w-3 h-3" /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
