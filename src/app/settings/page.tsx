'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Bell, Globe, Moon, Shield, CheckCircle, ChevronRight, User, Lock, Palette, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [toggles, setToggles] = useState({
    newEntry: true,
    approved: true,
    digest: false,
    darkMode: false,
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwShow, setPwShow] = useState({ current: false, next: false, confirm: false });
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const toggle = (key: keyof typeof toggles) => setToggles(t => ({ ...t, [key]: !t[key] }));

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwStatus(null);
    if (pwForm.next !== pwForm.confirm) {
      setPwStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    if (pwForm.next.length < 6) {
      setPwStatus({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch('/api/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwStatus({ type: 'error', message: data.error ?? 'Failed to update password' });
      } else {
        setPwStatus({ type: 'success', message: 'Password updated successfully' });
        setPwForm({ current: '', next: '', confirm: '' });
        setTimeout(() => { setShowPasswordForm(false); setPwStatus(null); }, 2000);
      }
    } catch {
      setPwStatus({ type: 'error', message: 'Something went wrong' });
    } finally {
      setPwLoading(false);
    }
  }

  const navItems = [
    { label: 'Profile', href: '#profile', icon: User },
    { label: 'Notifications', href: '#notifications', icon: Bell },
    { label: 'Security', href: '#security', icon: Lock },
    { label: 'Display', href: '#display', icon: Palette },
  ];

  const userName = session?.user?.name ?? 'Loading…';
  const userEmail = session?.user?.email ?? '';
  const userRole = (session?.user as { role?: string })?.role ?? 'reviewer';

  return (
    <div className="space-y-3 max-w-[1440px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#1a1a1a]">Settings</h1>
        <p className="text-xs text-[#6b7280] mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Quick nav */}
      <div className="flex items-center gap-2 flex-wrap">
        {navItems.map(item => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-white border border-[#eaeaea] text-[#6b7280] hover:border-[#1a5d3a]/30 hover:text-[#1a5d3a] transition-colors"
          >
            <item.icon size={12} />
            {item.label}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-3">
          {/* Profile Card */}
          <div id="profile" className="bg-white rounded-xl border border-[#eaeaea] p-4">
            <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">Profile</h2>
            <div className="flex items-center gap-3 pb-3 border-b border-[#f5f5f5]">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center text-white text-sm font-bold">
                {userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-[#1a1a1a]">{userName}</div>
                <div className="text-xs text-[#6b7280] capitalize">{userRole}</div>
                <div className="text-[11px] text-[#9ca3af] mt-0.5">{userEmail}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3">
              {([
                ['Full Name', userName],
                ['Email', userEmail],
                ['Role', userRole],
                ['Vertical', 'CPA / CMA']
              ] as [string, string][]).map(([l, v]) => (
                <div key={l}>
                  <label className="text-[10px] text-[#9ca3af] uppercase tracking-wide font-semibold">{l}</label>
                  <div className="mt-1 border border-[#eaeaea] rounded-xl px-3 py-2 text-sm text-[#1a1a1a] bg-[#f5f5f5] capitalize">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div id="notifications" className="bg-white rounded-xl border border-[#eaeaea] p-4">
            <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">Notifications</h2>
            <div className="space-y-2">
              {([
                { key: 'newEntry' as const, title: 'New entry submitted', desc: 'Get notified when faculty submit entries', icon: Mail },
                { key: 'approved' as const, title: 'Entry approved', desc: 'Get notified when your entries are approved', icon: CheckCircle },
                { key: 'digest' as const, title: 'Daily digest', desc: 'Receive a daily summary email', icon: Bell },
              ] as const).map(({ key, title, desc, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-[#f5f5f5] last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] flex items-center justify-center text-[#6b7280]">
                      <Icon size={14} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#1a1a1a]">{title}</div>
                      <div className="text-[11px] text-[#9ca3af]">{desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(key)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${toggles[key] ? 'bg-[#1a5d3a]' : 'bg-[#e5e5e5]'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${toggles[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Display */}
          <div id="display" className="bg-white rounded-xl border border-[#eaeaea] p-4">
            <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">Display & Preferences</h2>
            <div className="grid grid-cols-2 gap-3">
              {([
                { label: 'Timezone', value: 'IST (UTC+5:30)', icon: Globe },
                { label: 'Date Format', value: 'DD MMM YYYY', icon: Shield },
                { label: 'Language', value: 'English (India)', icon: Mail },
                { label: 'Theme', value: toggles.darkMode ? 'Dark' : 'Light', icon: Moon },
              ] as const).map(({ label, value, icon: Icon }) => (
                <div key={label}>
                  <label className="text-[10px] text-[#9ca3af] uppercase tracking-wide font-semibold">{label}</label>
                  <div className="mt-1 border border-[#eaeaea] rounded-xl px-3 py-2 text-sm text-[#1a1a1a] bg-[#f5f5f5] flex items-center gap-2">
                    <Icon size={13} className="text-[#9ca3af]" />
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-[#eaeaea] p-4">
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Quick Links</h3>
            <div className="space-y-1">
              {([
                { label: 'Dashboard', href: '/', desc: 'Overview' },
                { label: 'Entries', href: '/entries', desc: 'Manage entries' },
                { label: 'Approvals', href: '/approvals', desc: 'Review queue' },
                { label: 'Reports', href: '/reports', desc: 'Analytics' },
              ]).map(link => (
                <Link key={link.label} href={link.href} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-[#f5f5f5] transition-colors group">
                  <div>
                    <div className="text-sm font-medium text-[#1a1a1a] group-hover:text-[#1a5d3a] transition-colors">{link.label}</div>
                    <div className="text-[11px] text-[#9ca3af]">{link.desc}</div>
                  </div>
                  <ChevronRight size={14} className="text-[#d1d5db] group-hover:text-[#1a5d3a] transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          <div id="security" className="bg-[#1a5d3a] rounded-xl p-4 text-white">
            <h3 className="text-sm font-semibold mb-1">Security</h3>
            <p className="text-[11px] text-white/70 mb-3">Your account is secure. Last login: Today</p>
            <button
              onClick={() => { setShowPasswordForm(v => !v); setPwStatus(null); }}
              className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold transition-colors"
            >
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </button>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="mt-3 space-y-2">
                {pwStatus && (
                  <div className={`px-3 py-2 rounded-lg text-xs font-medium ${pwStatus.type === 'success' ? 'bg-emerald-500/20 text-emerald-100' : 'bg-red-500/20 text-red-100'}`}>
                    {pwStatus.message}
                  </div>
                )}
                {([
                  { key: 'current' as const, label: 'Current Password' },
                  { key: 'next' as const, label: 'New Password' },
                  { key: 'confirm' as const, label: 'Confirm Password' },
                ]).map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wide mb-1">{label}</label>
                    <div className="relative">
                      <input
                        type={pwShow[key] ? 'text' : 'password'}
                        value={pwForm[key]}
                        onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                        required
                        className="w-full px-3 pr-8 py-2 text-xs bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/40"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setPwShow(s => ({ ...s, [key]: !s[key] }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                      >
                        {pwShow[key] ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full py-2 bg-white text-[#1a5d3a] font-semibold text-xs rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 mt-1"
                >
                  {pwLoading ? <><Loader2 size={12} className="animate-spin" /> Updating…</> : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
