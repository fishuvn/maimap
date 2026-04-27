'use client';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { X, Loader2, Eye, EyeOff, MapPin } from 'lucide-react';

interface Props {
  open: boolean; mode: 'login' | 'register';
  onClose: () => void; onSwitchMode: (mode: 'login' | 'register') => void;
}

export default function AuthModal({ open, mode, onClose, onSwitchMode }: Props) {
  const { login, register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;
  const reset = () => { setUsername(''); setEmail(''); setPassword(''); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      if (mode === 'login') await login(username, password);
      else await register(username, email, password);
      onClose(); reset();
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const inputClass = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all';
  const labelClass = 'block text-xs font-semibold text-zinc-300 mb-1.5 tracking-wide';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm shadow-2xl animate-fade-in" style={{ background: 'rgba(18,18,28,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.25rem' }}>
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-zinc-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-white/5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {mode === 'login' ? 'Welcome back' : 'Join MaiMap'}
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create a community account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelClass}>Username</label>
            <input id="auth-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="yourname" required autoFocus className={inputClass} />
          </div>
          {mode === 'register' && (
            <div>
              <label className={labelClass}>Email</label>
              <input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required className={inputClass} />
            </div>
          )}
          <div>
            <label className={labelClass}>Password</label>
            <div className="relative">
              <input id="auth-password" type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                className={`${inputClass} pr-10`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-xs text-red-400 font-medium">
              {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-lg font-semibold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 pb-5 text-center">
          <p className="text-xs text-zinc-500">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { onSwitchMode(mode === 'login' ? 'register' : 'login'); reset(); }}
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
