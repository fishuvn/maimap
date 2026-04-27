'use client';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <X className="w-4 h-4 text-zinc-400" />
        </button>
        <div className="mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center mb-3">
            <span className="text-lg">🎵</span>
          </div>
          <h2 className="text-xl font-bold text-white">{mode === 'login' ? 'Welcome back' : 'Join MaiMap'}</h2>
          <p className="text-sm text-zinc-500 mt-1">{mode === 'login' ? 'Sign in to your account' : 'Create a community account'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Username</label>
            <input id="auth-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="yourname" required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-all" />
          </div>
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
              <input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-all" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
            <div className="relative">
              <input id="auth-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-lg font-medium text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-xs text-zinc-500 mt-4">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { onSwitchMode(mode === 'login' ? 'register' : 'login'); reset(); }} className="text-violet-400 hover:text-violet-300 font-medium">
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
