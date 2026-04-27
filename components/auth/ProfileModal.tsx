'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { X, Loader2, User, Mail, Lock, FileText, Check, AlertCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProfileModal({ open, onClose }: Props) {
  const { user, refresh } = useAuth();
  const [tab, setTab] = useState<'info' | 'password'>('info');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user && open) {
      setUsername(user.username);
      setEmail(user.email);
      setBio('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
      setTab('info');
    }
  }, [user, open]);

  if (!open || !user) return null;

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, bio }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess('Profile updated!');
      await refresh();
      setTimeout(() => { setSuccess(''); onClose(); }, 1200);
    } catch { setError('Something went wrong'); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess('Password changed!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => setSuccess(''), 2000);
    } catch { setError('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md glass-strong rounded-2xl shadow-2xl pointer-events-auto animate-fade-in">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white">
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user.username}</p>
                <p className="text-xs text-zinc-500">{user.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-5 pt-4">
            {(['info', 'password'] as const).map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${tab === t ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>
                {t === 'info' ? 'Profile Info' : 'Change Password'}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="px-5 py-4 pb-5">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400 mb-4">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-xs text-green-400 mb-4">
                <Check className="w-3.5 h-3.5 flex-shrink-0" /> {success}
              </div>
            )}

            {tab === 'info' ? (
              <form onSubmit={handleSaveInfo} className="space-y-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5"><User className="w-3 h-3" /> Username</label>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5"><Mail className="w-3 h-3" /> Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5"><FileText className="w-3 h-3" /> Bio <span className="text-zinc-600">(optional)</span></label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} placeholder="Tell the community about yourself..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-all resize-none" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 mt-1">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Changes
                </button>
              </form>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5"><Lock className="w-3 h-3" /> Current Password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5"><Lock className="w-3 h-3" /> New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Min. 6 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5"><Lock className="w-3 h-3" /> Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                    className={`w-full bg-white/5 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-all ${confirmPassword && confirmPassword !== newPassword ? 'border-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:border-violet-500/50'}`} />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
                  )}
                </div>
                <button type="submit" disabled={loading || (!!confirmPassword && confirmPassword !== newPassword)}
                  className="w-full py-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 mt-1">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Change Password
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
