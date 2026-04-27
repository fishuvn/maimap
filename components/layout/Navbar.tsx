'use client';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { useState } from 'react';
import { getRoleBadge } from '@/lib/utils';
import AuthModal from '@/components/auth/AuthModal';
import { MapPin, Shield, LogOut, Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const badge = user ? getRoleBadge(user.role) : null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text hidden sm:block">MaiMap</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all">Map</Link>
            <Link href="/?view=list" className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all">Browse</Link>
            {user && (user.role === 'moderator' || user.role === 'admin') && (
              <Link href="/admin" className="px-3 py-1.5 rounded-lg text-sm text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 transition-all flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Admin
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            {loading ? <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" /> : user ? (
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-zinc-300 hidden sm:block">{user.username}</span>
                  {badge && <span className={`hidden sm:inline text-xs px-1.5 py-0.5 rounded-full border ${badge.color}`}>{badge.label}</span>}
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 glass-strong rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-white/5">
                      <p className="text-sm font-medium text-white">{user.username}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                    {(user.role === 'moderator' || user.role === 'admin') && (
                      <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-violet-400 hover:bg-violet-500/10 transition-colors">
                        <Shield className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={() => { logout(); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => { setAuthMode('login'); setAuthOpen(true); }} className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">Sign In</button>
                <button onClick={() => { setAuthMode('register'); setAuthOpen(true); }} className="px-3 py-1.5 text-sm bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium">Register</button>
              </div>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/5">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden glass-strong border-t border-white/5 px-4 py-3 space-y-1 animate-fade-in">
            <Link href="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-white/5">Map View</Link>
            <Link href="/?view=list" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-white/5">Browse Locations</Link>
            {user && (user.role === 'moderator' || user.role === 'admin') && (
              <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-violet-400 hover:bg-violet-500/10">Admin Panel</Link>
            )}
          </div>
        )}
      </nav>
      {dropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />}
      <AuthModal open={authOpen} mode={authMode} onClose={() => setAuthOpen(false)} onSwitchMode={(m) => setAuthMode(m)} />
    </>
  );
}
