'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { MapPin, CheckCircle, ArrowLeft, Plus, MessageSquare, Flag, ChevronDown, ChevronUp, Send, Loader2, AlertTriangle, Monitor, Star, Zap } from 'lucide-react';
import { formatRelative, getCountryFlag, getRoleBadge } from '@/lib/utils';
import { CountryFlag } from '@/components/location/LocationCard';
import Link from 'next/link';

interface Location { id: string; name: string; address: string; lat: number; lng: number; country: string; is_verified: number; verified_by_username?: string; cabinet_count?: number; }
interface Post { id: number; title: string; body: string; username: string; role: string; created_at: string; comment_count: number; }
interface Comment { id: number; body: string; username: string; role: string; created_at: string; replies: Comment[]; }
interface Cabinet { id: number; location_id: string; number: number; payment_type: string; cost: number; status: string; status_note: string | null; avg_rating: number | null; rating_count: number; }

function StarRating({ cabinetId, initialRating, ratingCount, myScore, onRated, disabled }: {
  cabinetId: number; initialRating: number | null; ratingCount: number; myScore: number | null;
  onRated: (avg: number, count: number, my: number) => void; disabled: boolean;
}) {
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const active = hover || myScore || 0;

  const rate = async (score: number) => {
    if (disabled || loading) return;
    setLoading(true);
    const res = await fetch(`/api/cabinets/${cabinetId}/rate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score }),
    });
    const data = await res.json();
    if (res.ok) onRated(data.avg_rating, data.rating_count, data.my_score);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} disabled={disabled || loading}
          onMouseEnter={() => !disabled && setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => rate(s)}
          className={`transition-colors ${disabled ? 'cursor-default' : 'cursor-pointer'}`}>
          <Star className={`w-3.5 h-3.5 transition-colors ${s <= active ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} />
        </button>
      ))}
      {initialRating ? (
        <span className="text-xs text-zinc-400 ml-1">{initialRating.toFixed(1)} <span className="text-zinc-600">({ratingCount})</span></span>
      ) : (
        <span className="text-xs text-zinc-600 ml-1">No reviews</span>
      )}
    </div>
  );
}

function CabinetCard({ cabinet, user, onUpdate }: { cabinet: Cabinet; user: any; onUpdate: (id: number, avg: number, count: number, my: number) => void; }) {
  const [myScore, setMyScore] = useState<number | null>(null);
  const [avg, setAvg] = useState<number | null>(cabinet.avg_rating);
  const [count, setCount] = useState(cabinet.rating_count);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/cabinets/${cabinet.id}/rate`).then(r => r.json()).then(d => setMyScore(d.my_score));
  }, [cabinet.id, user]);

  const statusColor = cabinet.status === 'working' ? 'bg-green-500/15 text-green-400 border-green-500/30'
    : cabinet.status === 'broken' ? 'bg-red-500/15 text-red-400 border-red-500/30'
    : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';

  const paymentLabel = cabinet.payment_type === 'coins' ? '🪙 Coins'
    : cabinet.payment_type === 'both' ? '🪙+💳 Coins & Card'
    : '💳 IC Card';

  const paymentColor = cabinet.payment_type === 'coins' ? 'text-yellow-500'
    : cabinet.payment_type === 'both' ? 'text-blue-400'
    : 'text-purple-400';

  const costUnit = cabinet.payment_type === 'coins' ? 'coins'
    : cabinet.payment_type === 'both' ? 'coins/credits'
    : 'credits';

  const handleRated = (newAvg: number, newCount: number, newMy: number) => {
    setAvg(newAvg); setCount(newCount); setMyScore(newMy);
    onUpdate(cabinet.id, newAvg, newCount, newMy);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
      <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
        <Monitor className="w-4 h-4 text-zinc-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-zinc-100">Cab #{cabinet.number}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full border capitalize font-medium ${statusColor}`}>
            {cabinet.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${paymentColor}`}>{paymentLabel}</span>
          <span className="text-xs text-zinc-600">· {cabinet.cost} {costUnit}</span>
          <StarRating
            cabinetId={cabinet.id}
            initialRating={avg}
            ratingCount={count}
            myScore={myScore}
            onRated={handleRated}
            disabled={!user || !!user.is_banned}
          />
        </div>
        {cabinet.status_note && cabinet.status !== 'working' && (
          <div className="mt-2 flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-400">{cabinet.status_note}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LocationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState<Location | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [showPostForm, setShowPostForm] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [reportTarget, setReportTarget] = useState<{ type: string; id: number } | null>(null);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/locations/${id}`).then(r => r.json()),
      fetch(`/api/locations/${id}/cabinets`).then(r => r.json()),
    ]).then(([locData, cabData]) => {
      setLocation(locData.location);
      setPosts(locData.posts || []);
      setCabinets(cabData.cabinets || []);
      setLoading(false);
    });
  }, [id]);

  const loadComments = async (postId: number) => {
    if (comments[postId]) { setExpandedPost(expandedPost === postId ? null : postId); return; }
    const res = await fetch(`/api/posts/${postId}/comments`);
    const data = await res.json();
    setComments((prev) => ({ ...prev, [postId]: data.comments || [] }));
    setExpandedPost(postId);
  };

  const submitPost = async () => {
    if (!postTitle.trim() || !postBody.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/locations/${id}/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: postTitle, body: postBody }) });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      setPostTitle(''); setPostBody(''); setShowPostForm(false);
      if (data.pending) { setToast('Post submitted! Awaiting moderator approval.'); setTimeout(() => setToast(''), 3000); }
      else setPosts((prev) => [data.post, ...prev]);
    }
  };

  const submitReport = async () => {
    if (!reportTarget || !reportReason.trim()) return;
    setSubmitting(true);
    await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target_type: reportTarget.type, target_id: reportTarget.id, reason: reportReason }) });
    setSubmitting(false); setReportTarget(null); setReportReason('');
    setToast('Report submitted. Thank you!'); setTimeout(() => setToast(''), 3000);
  };

  const handleCabinetUpdate = (cabId: number, avg: number, count: number, _my: number) => {
    setCabinets(prev => prev.map(c => c.id === cabId ? { ...c, avg_rating: avg, rating_count: count } : c));
  };

  if (loading) return <div className="min-h-screen pt-16 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-400" /></div>;
  if (!location) return <div className="min-h-screen pt-16 flex items-center justify-center text-zinc-500">Location not found</div>;

  return (
    <div className="min-h-screen pt-16 bg-[#0a0a0f]">
      {toast && <div className="fixed top-20 right-4 z-50 glass-strong border border-violet-500/30 rounded-xl px-4 py-3 text-sm text-violet-300 animate-fade-in">{toast}</div>}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to map
        </button>

        {/* Location header */}
        <div className="glass rounded-2xl p-6 mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-2xl" />
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/80 flex items-center justify-center overflow-hidden border border-white/10">
              <CountryFlag country={location.country} size="lg" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl font-bold text-white">{location.name}</h1>
                {location.is_verified === 1 && <span className="flex items-center gap-1 text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full px-2 py-0.5"><CheckCircle className="w-3 h-3" /> Verified</span>}
                {cabinets.length > 0 && (
                  <span className="flex items-center gap-1 text-xs bg-zinc-800 text-zinc-400 border border-white/8 rounded-full px-2 py-0.5">
                    <Monitor className="w-3 h-3" /> {cabinets.length} cabinet{cabinets.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-start gap-1 text-sm text-zinc-400 mb-2"><MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-zinc-600" />{location.address}</div>
              <div className="flex items-center gap-3 text-xs text-zinc-600">
                <span>{location.country}</span>
                {location.is_verified === 1 && location.verified_by_username && <span>Verified by {location.verified_by_username}</span>}
                {location.lat !== 0 && <a href={`https://www.google.com/maps?q=${location.lat},${location.lng}`} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Open in Google Maps ↗</a>}
              </div>
            </div>
          </div>
        </div>

        {/* Cabinets — always shown */}
        <div className="glass rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Monitor className="w-4 h-4" /> Cabinets
            {cabinets.length > 0 && !user && <span className="text-xs text-zinc-600 font-normal normal-case ml-1">— log in to rate</span>}
          </h2>
          {cabinets.length === 0 ? (
            <div className="flex items-center gap-2.5 py-2 px-3 rounded-xl border border-dashed border-white/10 text-zinc-600">
              <Monitor className="w-4 h-4 flex-shrink-0" />
              <p className="text-xs italic">Cabinet info coming soon — check back later!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cabinets.map(cab => (
                <CabinetCard key={cab.id} cabinet={cab} user={user} onUpdate={handleCabinetUpdate} />
              ))}
            </div>
          )}
        </div>

        {/* Community posts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-zinc-500" />Community Posts
              <span className="text-xs text-zinc-600 font-normal">({posts.length})</span>
            </h2>
            {user && !user.is_banned && (
              <button onClick={() => setShowPostForm(!showPostForm)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-lg hover:opacity-90">
                <Plus className="w-3.5 h-3.5" /> New Post
              </button>
            )}
          </div>
          {showPostForm && (
            <div className="glass rounded-xl p-4 space-y-3 animate-fade-in">
              <input type="text" placeholder="Post title..." value={postTitle} onChange={(e) => setPostTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              <textarea placeholder="Share information about this location..." value={postBody} onChange={(e) => setPostBody(e.target.value)} rows={4}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowPostForm(false)} className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-300">Cancel</button>
                <button onClick={submitPost} disabled={submitting} className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-500 disabled:opacity-50">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Submit
                </button>
              </div>
            </div>
          )}
          {posts.length === 0 ? (
            <div className="text-center py-12 glass rounded-xl"><MessageSquare className="w-8 h-8 mx-auto mb-2 text-zinc-700" /><p className="text-sm text-zinc-600">No posts yet. Be the first to share!</p></div>
          ) : posts.map((post) => (
            <div key={post.id} className="glass rounded-xl overflow-hidden animate-fade-in">
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">{post.username[0].toUpperCase()}</div>
                    <span className="text-sm font-medium text-white">{post.username}</span>
                    {post.role !== 'user' && <span className={`text-xs px-1.5 py-0.5 rounded-full border ${getRoleBadge(post.role).color}`}>{getRoleBadge(post.role).label}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600">{formatRelative(post.created_at)}</span>
                    {user && <button onClick={() => setReportTarget({ type: 'post', id: post.id })} className="p-1 rounded hover:bg-white/5 text-zinc-600 hover:text-red-400"><Flag className="w-3.5 h-3.5" /></button>}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{post.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{post.body}</p>
              </div>
              <div className="border-t border-white/5 px-4 py-2">
                <button onClick={() => loadComments(post.id)} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300">
                  <MessageSquare className="w-3.5 h-3.5" />{post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}
                  {expandedPost === post.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
              {expandedPost === post.id && (
                <div className="border-t border-white/5 bg-white/[0.01] p-4 space-y-3 animate-fade-in">
                  {(comments[post.id] || []).length === 0 ? <p className="text-xs text-zinc-600 text-center py-2">No comments yet</p> :
                    (comments[post.id] || []).map((comment) => (
                      <CommentItem key={comment.id} comment={comment} postId={post.id} locationId={id} user={user} onReport={(cid) => setReportTarget({ type: 'comment', id: cid })} />
                    ))}
                  {/* Show comment form for EVERYONE — guests just need a name */}
                  <CommentForm postId={post.id} locationId={id} onSubmit={() => { const c = { ...comments }; delete c[post.id]; setComments(c); loadComments(post.id); }} user={user} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReportTarget(null)} />
          <div className="relative rounded-2xl p-6 w-full max-w-sm animate-fade-in" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-red-400" /><h3 className="text-base font-semibold text-white">Report Content</h3></div>
            <textarea placeholder="Reason for reporting..." value={reportReason} onChange={(e) => setReportReason(e.target.value)} rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 resize-none mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setReportTarget(null); setReportReason(''); }} className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-300">Cancel</button>
              <button onClick={submitReport} disabled={submitting} className="px-4 py-1.5 text-sm bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30">Submit Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, postId, locationId, user, onReport }: { comment: Comment & { display_name?: string }; postId: number; locationId: string; user: any; onReport: (id: number) => void; }) {
  const [showReply, setShowReply] = useState(false);
  const badge = getRoleBadge(comment.role);
  const name = comment.display_name || comment.username || 'Guest';
  const isGuest = !comment.user_id;
  return (
    <div className="flex gap-2.5">
      <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isGuest ? 'bg-zinc-700 text-zinc-400' : 'bg-gradient-to-br from-zinc-600 to-zinc-800 text-zinc-300'}`}>
        {name[0].toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs font-medium text-zinc-300">{name}</span>
          {isGuest && <span className="text-xs text-zinc-600 italic">Guest</span>}
          {!isGuest && comment.role !== 'user' && <span className={`text-xs px-1 py-0.5 rounded-full border ${badge.color}`} style={{ fontSize: '9px' }}>{badge.label}</span>}
          <span className="text-xs text-zinc-700">{formatRelative(comment.created_at)}</span>
          {user && <button onClick={() => onReport(comment.id)} className="ml-auto text-zinc-700 hover:text-red-400"><Flag className="w-3 h-3" /></button>}
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">{comment.body}</p>
        {/* Anyone can reply, even guests */}
        <button onClick={() => setShowReply(!showReply)} className="text-xs text-zinc-600 hover:text-zinc-400 mt-1">Reply</button>
        {showReply && <CommentForm postId={postId} locationId={locationId} parentId={comment.id} onSubmit={() => setShowReply(false)} small user={user} />}
        {comment.replies?.map((r: any) => (
          <div key={r.id} className="mt-2 ml-2 pl-2 border-l border-white/5"><CommentItem comment={r} postId={postId} locationId={locationId} user={user} onReport={onReport} /></div>
        ))}
      </div>
    </div>
  );
}

function CommentForm({ postId, locationId, parentId, onSubmit, small, user }: { postId: number; locationId: string; parentId?: number; onSubmit: () => void; small?: boolean; user?: any; }) {
  const [body, setBody] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!body.trim()) return;
    setLoading(true);
    await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, parent_id: parentId, location_id: locationId, guest_name: guestName || undefined }),
    });
    setLoading(false); setBody(''); onSubmit();
  };
  return (
    <div className={`space-y-1.5 ${small ? 'mt-1' : 'mt-3'}`}>
      {!user && (
        <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Your name (optional)"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
      )}
      <div className="flex gap-2">
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={parentId ? 'Write a reply...' : 'Add a comment...'} rows={small ? 1 : 2}
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
        <button onClick={submit} disabled={loading || !body.trim()} className="self-end p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 disabled:opacity-40">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
