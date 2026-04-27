'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { LayoutDashboard, Flag, MapPin, Users, Settings, Shield, ChevronRight } from 'lucide-react';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/queue', icon: Shield, label: 'Content Queue' },
  { href: '/admin/reports', icon: Flag, label: 'Reports' },
  { href: '/admin/locations', icon: MapPin, label: 'Locations' },
  { href: '/admin/users', icon: Users, label: 'Users', adminOnly: true },
  { href: '/admin/settings', icon: Settings, label: 'Settings', adminOnly: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  return (
    <div className="min-h-screen pt-16 flex bg-[#0a0a0f]">
      <aside className="w-56 flex-shrink-0 border-r border-white/5 flex flex-col glass sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-violet-400" /><span className="text-sm font-semibold text-white">Admin Panel</span></div>
          {user && <p className="text-xs text-zinc-600 mt-1 capitalize">{user.role} access</p>}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            if (item.adminOnly && user?.role !== 'admin') return null;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${active ? 'bg-violet-500/20 text-violet-300 border border-violet-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}>
                <item.icon className="w-4 h-4" />{item.label}{active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5"><Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">← Back to site</Link></div>
      </aside>
      <div className="flex-1 overflow-auto"><div className="max-w-5xl mx-auto px-6 py-6">{children}</div></div>
    </div>
  );
}
