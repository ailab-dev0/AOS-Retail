'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1a5d3a] mb-4">
            <span className="text-white text-xl font-bold">AOS</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Welcome back</h1>
          <p className="text-sm text-[#6b7280] mt-1">Sign in to AOS Retail Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#eaeaea] p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@campus-ai.in"
                  required
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#eaeaea] rounded-xl text-sm text-[#1a1a1a] placeholder:text-[#d1d5db] focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/20 focus:border-[#1a5d3a]/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#eaeaea] rounded-xl text-sm text-[#1a1a1a] placeholder:text-[#d1d5db] focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/20 focus:border-[#1a5d3a]/30 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1a5d3a] hover:bg-[#144d30] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#f5f5f5]">
            <p className="text-[11px] text-[#9ca3af] text-center">
              Demo: admin@campus-ai.in / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
