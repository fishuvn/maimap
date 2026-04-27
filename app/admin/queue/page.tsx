'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, EyeOff, Trash2, Loader2, MessageSquare, FileText } from 'lucide-react';
import { formatRelative } from '@/lib/utils';

interface QueueItem { id: number; title?: string; body: string; username: string; location_name: string; post_title?: string; created_at: string; }

export default function QueuePage() {
  const [posts, setPosts] = useState<QueueItem[]>([]);
  const [comments, setComments] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'posts' | 'comments'>('posts');
  const [acting, setActing] = useState<number | null>(null);

  const load = async () => {
    const res = await fetch('/api/admin/queue');
    const data = await res.json();
    setPosts(data.pendingPosts || []); setComments(data.pendingComments || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const act = async (id: number, action: string, type: 'posts' | 'comments') => {
    setActing(id);
    if (action === 'delete') {
      await fetch(`/api/admin/${type === 'posts' ? 'posts' : 'comments'}/${id}`, { method: 'DELETE' });
    } else {
      await fetch(`/api/admin/${type === 'posts' ? 'posts' : 'comments'}/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    }
    if (type === 'posts') setPosts((p) => p.filter((x) => x.id !== id));
    else setComments((c) => c.filter((x) => x.id !== id));
    setActing(null);
  };

  const items = tab === 'posts' ? posts : comments;

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-white mb-1">Content Queue</h1><p className="text-sm text-zinc-500">Review and moderate pending submissions</p></div>
      <div className="flex gap-2 mb-6">
        {(['posts', 'comments'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${tab === t ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-zinc-500 hover:text-zinc-300 glass'}`}>
            {t === 'posts' ? <FileText className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}{t === 'posts' ? 'Posts' : 'Comments'}
            <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{t === 'posts' ? posts.length : comments.length}</span>
          </button>
        ))}
      </div>
      {loading ? <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div> : items.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center"><CheckCircle className="w-8 h-8 mx-auto mb-2 text-zinc-700" /><p className="text-sm text-zinc-600">Queue is empty</p></div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="glass rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {item.title && <p className="text-sm font-semibold text-white mb-1">{item.title}</p>}
                  <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">{item.body}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-600">
                    <span>by <span className="text-zinc-400">{item.username}</span></span>
                    <span>at <span className="text-zinc-400">{item.location_name}</span></span>
                    {item.post_title && <span>on <span className="text-zinc-400">{item.post_title}</span></span>}
                    <span>{formatRelative(item.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => act(item.id, 'approve', tab)} disabled={acting === item.id} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 disabled:opacity-40">
                    {acting === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Approve
                  </button>
                  <button onClick={() => act(item.id, 'hide', tab)} disabled={acting === item.id} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 disabled:opacity-40">
                    <EyeOff className="w-3 h-3" /> Hide
                  </button>
                  <button onClick={() => act(item.id, 'delete', tab)} disabled={acting === item.id} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 disabled:opacity-40">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
