'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useLangStore } from '@/store/language';
import { applyTheme } from '@/store/theme';
import api from '@/lib/api';
import type { Locale } from '@/i18n/locales';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { lang, setLang, t } = useLangStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { applyTheme('blue'); }, []);

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg-0)' }}>
      <div className="absolute inset-0">
        <div className="absolute rounded-full blur-[120px] opacity-[.07]" style={{ width: 500, height: 500, background: 'var(--accent-1)', top: '15%', left: '25%', animation: 'float-bg 20s infinite' }} />
        <div className="absolute rounded-full blur-[120px] opacity-[.07]" style={{ width: 500, height: 500, background: 'var(--accent-2)', bottom: '15%', right: '25%', animation: 'float-bg 20s infinite' }} />
      </div>

      <div className="relative w-full max-w-md px-4 animate-in">
        {/* Language selector on top */}
        <div className="flex justify-center gap-2 mb-6">
          {(['en', 'fa', 'ru'] as Locale[]).map(l => (
            <button key={l} onClick={() => setLang(l)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: lang === l ? 'var(--accent-1)' : 'var(--bg-glass)',
                color: lang === l ? '#fff' : 'var(--text-2)',
                border: '1px solid var(--border)',
              }}>
              {l === 'en' ? '🇬🇧 English' : l === 'fa' ? '🇮🇷 فارسی' : '🇷🇺 Русский'}
            </button>
          ))}
        </div>

        {/* Logo */}
        <div className="text-center mb-6">
          <svg viewBox="0 0 400 400" className="w-16 h-16 mx-auto mb-3">
            <defs><linearGradient id="lG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="var(--accent-1)"/><stop offset="100%" stopColor="var(--accent-2)"/></linearGradient><filter id="gl"><feGaussianBlur in="SourceGraphic" stdDeviation="3" /></filter></defs>
            <circle cx="200" cy="200" r="185" fill="var(--bg-0)" stroke="url(#lG)" strokeWidth="5"/>
            <g filter="url(#gl)"><path d="M120 130L280 130L120 270L280 270" fill="none" stroke="url(#lG)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/></g>
          </svg>
          <h1 className="text-2xl font-extrabold neon-text">Z-UI</h1>
          <p className="text-xs mt-1 c2">{t('login.subtitle')}</p>
        </div>

        {/* Form */}
        <div className="glass-card p-7">
          <h2 className="text-base font-semibold c0 text-center mb-5">{t('login.title')}</h2>
          {error && <div className="mb-4 p-2.5 rounded-xl bg-err text-xs cerr text-center b">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="text-xs c2 mb-1.5 block">{t('login.username')}</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="input-field" placeholder="admin" required /></div>
            <div><label className="text-xs c2 mb-1.5 block">{t('login.password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="••••••" required /></div>
            {requires2FA && (
              <div className="animate-in"><label className="text-xs c2 mb-1.5 block">{t('login.twoFactor')}</label>
                <input type="text" value={totpCode} onChange={e => setTotpCode(e.target.value)} className="input-field text-center tracking-[.5em]" placeholder="000000" maxLength={6} autoFocus /></div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
              {loading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : t('login.signIn')}
            </button>
          </form>
        </div>
        <p className="text-center text-[9px] c3 mt-4">Z-UI v1.0.0 · <a href="https://github.com/Zendan-ui/z-ui" className="ca">GitHub</a> · <a href="https://t.me/Zendan_Ui" className="ca">@Zendan_Ui</a></p>
      </div>
    </div>
  );
}
