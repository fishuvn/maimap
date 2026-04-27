'use client';
import { useEffect, useState } from 'react';
import { Save, Loader2, Settings } from 'lucide-react';

interface SiteSettings { site_name: string; site_description: string; allow_registration: string; require_post_approval: string; require_comment_approval: string; prohibited_keywords: string; primary_categories: string; }

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { fetch('/api/admin/settings').then((r) => r.json()).then((d) => { setSettings(d.settings); setLoading(false); }); }, []);
  const save = async () => {
    if (!settings) return; setSaving(true);
    await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings }) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  const update = (key: keyof SiteSettings, value: string) => setSettings((s) => s ? { ...s, [key]: value } : s);

  if (loading) return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white mb-1">Settings</h1><p className="text-sm text-zinc-500">Site-wide configuration</p></div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
      {settings && (
        <div className="space-y-4">
          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Settings className="w-4 h-4" /> General</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Site Name</label>
                <input value={settings.site_name} onChange={(e) => update('site_name', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Site Description</label>
                <textarea value={settings.site_description} onChange={(e) => update('site_description', e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/40 resize-none" />
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Moderation</h2>
            <div className="space-y-4">
              {([
                { key: 'allow_registration', label: 'Allow New Registrations', desc: 'Users can create new accounts' },
                { key: 'require_post_approval', label: 'Posts Require Approval', desc: 'New posts go to moderation queue' },
                { key: 'require_comment_approval', label: 'Comments Require Approval', desc: 'New comments go to moderation queue' },
              ] as const).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div><p className="text-sm text-white">{label}</p><p className="text-xs text-zinc-500">{desc}</p></div>
                  <button type="button" onClick={() => update(key, settings[key] === 'true' ? 'false' : 'true')} className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors overflow-hidden ${settings[key] === 'true' ? 'bg-violet-600' : 'bg-zinc-700'}`}>
                    <span className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings[key] === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Content Filters</h2>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Prohibited Keywords (comma-separated)</label>
              <textarea value={settings.prohibited_keywords} onChange={(e) => update('prohibited_keywords', e.target.value)} rows={3} placeholder="spam, badword, ..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40 resize-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
