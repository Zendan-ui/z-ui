'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { applyTheme } from '@/store/theme';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { applyTheme('amoled'); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const r = await api.login({ username, password, totp_code: totpCode || undefined });
      if (r.data.requires_2fa) { setRequires2FA(true); setLoading(false); return; }
      login(r.data);
      router.push('/dashboard');
    } catch (e: any) { setError(e.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#000' }}>
      <div className="absolute inset-0">
        <div className="absolute rounded-full blur-[120px] opacity-[.05]" style={{ width: 500, height: 500, background: 'var(--accent-1)', top: '15%', left: '25%', animation: 'float-bg 20s infinite' }} />
        <div className="absolute rounded-full blur-[120px] opacity-[.05]" style={{ width: 500, height: 500, background: 'var(--accent-2)', bottom: '15%', right: '25%', animation: 'float-bg 20s infinite 5s' }} />
      </div>

      <div className="relative w-full max-w-md px-4 animate-in">
        <div className="text-center mb-8">
          <svg viewBox="0 0 400 400" className="w-20 h-20 mx-auto mb-4">
            <defs><linearGradient id="lG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="var(--accent-1)"/><stop offset="100%" stopColor="var(--accent-2)"/></linearGradient><filter id="gl"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
            <circle cx="200" cy="200" r="185" fill="#000" stroke="url(#lG)" strokeWidth="4"/>
            <g filter="url(#gl)"><path d="M120 130L280 130L120 270L280 270" fill="none" stroke="url(#lG)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/></g>
          </svg>
          <h1 className="text-3xl font-extrabold neon-text tracking-tight">Z-UI</h1>
          <p className="text-sm mt-1 c2">The Future of Proxy Management</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-lg font-semibold c0 text-center mb-6">Sign In</h2>
          {error && <div className="mb-4 p-3 rounded-xl bg-err text-sm cerr text-center b">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="text-xs c2 mb-2 block">Username</label><input type="text" value={username} onChange={e=>setUsername(e.target.value)} className="input-field" placeholder="admin" required /></div>
            <div><label className="text-xs c2 mb-2 block">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input-field" placeholder="••••••" required /></div>
            {requires2FA && <div className="animate-in"><label className="text-xs c2 mb-2 block">2FA Code</label><input type="text" value={totpCode} onChange={e=>setTotpCode(e.target.value)} className="input-field text-center tracking-[.5em]" placeholder="000000" maxLength={6} autoFocus /></div>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <div className="spinner" style={{width:18,height:18}}/> : '🔐 Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-[10px] c3 mt-6">Z-UI v1.0.0 · <a href="https://github.com/Zendan-ui/z-ui" className="ca">GitHub</a> · <a href="https://t.me/Zendan_Ui" className="ca">@Zendan_Ui</a></p>
      </div>
    </div>
  );
}
