'use client';
import { useEffect, useState } from 'react';
import { Search, Loader2, Shield, Ban, UserCheck, ChevronDown } from 'lucide-react';
import { formatDate, getRoleBadge } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';

interface User { id: number; username: string; email: string; role: string; is_banned: number; created_at: string; post_count: number; comment_count: number; }

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [acting, setActing] = useState<number | null>(null);
  const [openRole, setOpenRole] = useState<number | null>(null);

  const fetchUsers = async () => {
    const res = await fetch(`/api/admin/users?search=${search}`);
    const data = await res.json();
    setUsers(data.users || []); setLoading(false);
  };
  useEffect(() => { fetchUsers(); }, [search]);

  const actUser = async (id: number, action: string, role?: string) => {
    setActing(id);
    await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, role }) });
    await fetchUsers(); setActing(null); setOpenRole(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-white mb-1">Users</h1><p className="text-sm text-zinc-500">Manage community members and roles.</p></div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40" />
        </div>
      </div>
      {loading ? <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div> : (
        <div className="glass rounded-xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-xs text-zinc-500 uppercase tracking-wider">
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Posts</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Joined</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const badge = getRoleBadge(u.role);
                const isSelf = me?.username === u.username;
                return (
                  <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{u.username[0].toUpperCase()}</div>
                        <div>
                          <p className="text-sm font-medium text-white flex items-center gap-1.5">
                            {u.username}
                            {isSelf && <span className="text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 px-1.5 py-0.5 rounded-full">You</span>}
                          </p>
                          {u.is_banned === 1 && <span className="text-xs text-red-400">Banned</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-zinc-500">{u.email}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border ${badge.color}`}>{badge.label}</span></td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-zinc-500">{u.post_count}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-zinc-600">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <div className="flex justify-end">
                          <span className="text-xs text-zinc-600 italic">— your account —</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-end">
                          <div className="relative">
                            <button onClick={() => setOpenRole(openRole === u.id ? null : u.id)} className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-zinc-400">
                              <Shield className="w-3 h-3" /> Role <ChevronDown className="w-3 h-3" />
                            </button>
                            {openRole === u.id && (
                              <div className="absolute right-0 top-full mt-1 glass-strong rounded-lg shadow-xl z-50 py-1 min-w-[110px]">
                                {['user', 'moderator', 'admin'].map((r) => (
                                  <button key={r} onClick={() => actUser(u.id, 'setRole', r)} className={`w-full text-left px-3 py-1.5 text-xs capitalize hover:bg-white/5 ${u.role === r ? 'text-violet-400' : 'text-zinc-400'}`}>{r}</button>
                                ))}
                              </div>
                            )}
                          </div>
                          {u.is_banned ? (
                            <button onClick={() => actUser(u.id, 'unban')} disabled={acting === u.id} className="flex items-center gap-1 px-2.5 py-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 disabled:opacity-40">
                              {acting === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />} Unban
                            </button>
                          ) : (
                            <button onClick={() => actUser(u.id, 'ban')} disabled={acting === u.id} className="flex items-center gap-1 px-2.5 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 disabled:opacity-40">
                              {acting === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />} Ban
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {openRole && <div className="fixed inset-0 z-10" onClick={() => setOpenRole(null)} />}
    </div>
  );
}
