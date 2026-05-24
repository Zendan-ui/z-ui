'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const botCommands = [
  { cmd: '/start', desc: 'Welcome message', icon: '🚀' },
  { cmd: '/menu', desc: 'Main menu', icon: '📋' },
  { cmd: '/users', desc: 'List users', icon: '👥' },
  { cmd: '/create <user> <gb> <days>', desc: 'Create user', icon: '➕' },
  { cmd: '/stats', desc: 'System stats', icon: '📊' },
  { cmd: '/servers', desc: 'Server list', icon: '🖥️' },
  { cmd: '/sub <user>', desc: 'Get sub link', icon: '🔗' },
  { cmd: '/suspend <user>', desc: 'Suspend user', icon: '⛔' },
  { cmd: '/activate <user>', desc: 'Activate user', icon: '✅' },
  { cmd: '/resettraffic <user>', desc: 'Reset traffic', icon: '🔄' },
  { cmd: '/renew <user> <days>', desc: 'Renew sub', icon: '📅' },
  { cmd: '/search <query>', desc: 'Search users', icon: '🔍' },
  { cmd: '/lang <en|fa|ru>', desc: 'Change lang', icon: '🌐' },
  { cmd: '/about', desc: 'About Z-UI', icon: 'ℹ️' },
];

export default function TelegramPage() {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-0)' }}>Telegram Bot</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>
            Manage Z-UI through Telegram · <a href="https://t.me/Zendan_Ui" target="_blank" style={{ color: 'var(--accent-1)' }}>@Zendan_Ui</a>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Config */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>🤖 Bot Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <div><p className="text-xs font-medium" style={{ color: 'var(--text-0)' }}>Enable Bot</p><p className="text-[10px]" style={{ color: 'var(--text-3)' }}>Activate Telegram bot integration</p></div>
                <button className="w-12 h-6 rounded-full relative" style={{ background: 'var(--accent-g)' }}><div className="w-5 h-5 rounded-full bg-white shadow absolute top-0.5" style={{ transform: 'translateX(24px)' }} /></button>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-2)' }}>Bot Token (from @BotFather)</label>
                <input className="input-field !text-sm" type="password" placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-2)' }}>Admin Telegram IDs (comma-separated)</label>
                <input className="input-field !text-sm" placeholder="123456789, 987654321" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl text-xs cursor-pointer" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                  <input type="checkbox" defaultChecked className="accent-[var(--accent-1)]" /> Expiration Alerts
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl text-xs cursor-pointer" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                  <input type="checkbox" defaultChecked className="accent-[var(--accent-1)]" /> Traffic Alerts
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl text-xs cursor-pointer" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                  <input type="checkbox" defaultChecked className="accent-[var(--accent-1)]" /> Server Down Alerts
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl text-xs cursor-pointer" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                  <input type="checkbox" className="accent-[var(--accent-1)]" /> New User Notifications
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button className="btn-secondary !text-sm flex-1">🔄 Test Connection</button>
                <button className="btn-primary !text-sm flex-1">💾 Save</button>
              </div>
            </div>
          </div>

          {/* Notification templates */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-0)' }}>📝 Message Templates</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-2)' }}>Welcome Message</label>
                <textarea className="input-field !text-xs h-16 resize-none font-mono" defaultValue={"🚀 Welcome to Z-UI!\n\nYour subscription:\n🔗 {sub_link}\n📊 Traffic: {traffic_limit}\n⏰ Expires: {expire_date}"} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-2)' }}>Expiration Warning</label>
                <textarea className="input-field !text-xs h-12 resize-none font-mono" defaultValue={"⚠️ {username} expires in {days} days!"} />
              </div>
            </div>
          </div>
        </div>

        {/* Commands reference */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-0)' }}>📖 Bot Commands</h3>
          <div className="space-y-1">
            {botCommands.map(c => (
              <div key={c.cmd} className="flex items-start gap-2 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-sm">{c.icon}</span>
                <div>
                  <code className="text-[11px] font-bold" style={{ color: 'var(--accent-1)' }}>{c.cmd}</code>
                  <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl text-[10px] text-center" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>
            Languages: 🇬🇧 EN · 🇮🇷 FA · 🇷🇺 RU
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
