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

  useEffect(() => {
    applyTheme('amoled');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login({
        username,
        password,
        totp_code: totpCode || undefined,
      });

      if (response.data.requires_2fa) {
        setRequires2FA(true);
        setLoading(false);
        return;
      }

      login(response.data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#000' }}>
      {/* Background effects */}
      <div className="absolute inset-0">
        <div
          className="absolute rounded-full blur-[120px] opacity-[0.06]"
          style={{ width: 500, height: 500, background: 'var(--accent-1)', top: '15%', left: '25%', animation: 'float-bg 20s ease-in-out infinite' }}
        />
        <div
          className="absolute rounded-full blur-[120px] opacity-[0.06]"
          style={{ width: 500, height: 500, background: 'var(--accent-2)', bottom: '15%', right: '25%', animation: 'float-bg 20s ease-in-out infinite 5s' }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--accent-1) 0.5px, transparent 0.5px), linear-gradient(90deg, var(--accent-1) 0.5px, transparent 0.5px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative w-full max-w-md px-4 animate-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <svg viewBox="0 0 400 400" className="w-20 h-20 mx-auto">
              <defs>
                <linearGradient id="loginG" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'var(--accent-1)' }} />
                  <stop offset="50%" style={{ stopColor: 'var(--accent-2)' }} />
                  <stop offset="100%" style={{ stopColor: 'var(--accent-3)' }} />
                </linearGradient>
                <filter id="lGlow">
                  <feGaussianBlur stdDeviation="10" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <circle cx="200" cy="200" r="185" fill="#000" stroke="url(#loginG)" strokeWidth="4" />
              <g filter="url(#lGlow)">
                <path d="M 120 130 L 280 130 L 120 270 L 280 270" fill="none" stroke="url(#loginG)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              <circle cx="120" cy="130" r="7" fill="var(--accent-1)" />
              <circle cx="280" cy="270" r="7" fill="var(--accent-3)" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold neon-text tracking-tight">Z-UI</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>The Future of Proxy Management</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-lg font-semibold text-center mb-6" style={{ color: 'var(--text-0)' }}>
            Sign In
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs mb-2" style={{ color: 'var(--text-2)' }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-xs mb-2" style={{ color: 'var(--text-2)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter password"
                required
              />
            </div>

            {requires2FA && (
              <div className="animate-in">
                <label className="block text-xs mb-2" style={{ color: 'var(--text-2)' }}>2FA Code</label>
                <input
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="input-field text-center tracking-[0.5em]"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-center flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>🔐 Sign In</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] mt-6" style={{ color: 'var(--text-3)' }}>
          Z-UI v1.0.0 — <a href="https://github.com/Zendan-ui/z-ui" style={{ color: 'var(--accent-1)' }}>GitHub</a> · <a href="https://t.me/Zendan_Ui" style={{ color: 'var(--accent-1)' }}>Telegram</a>
        </p>
      </div>
    </div>
  );
}
