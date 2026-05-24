'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useThemeStore, applyTheme, ThemeMode } from '@/store/theme';

type SettingsTab = 'general' | 'security' | 'telegram' | 'subscription' | 'backup' | 'appearance';

const tabs: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'general', label: 'General', icon: '⚙️' },
  { id: 'security', label: 'Security', icon: '🔐' },
  { id: 'telegram', label: 'Telegram Bot', icon: '🤖' },
  { id: 'subscription', label: 'Subscriptions', icon: '📦' },
  { id: 'backup', label: 'Backup', icon: '💾' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
];

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 gap-4"
      style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex-1">
        <p className="font-medium text-sm" style={{ color: 'var(--text-0)' }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{description}</p>}
      </div>
      <div className="w-full md:w-auto">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-12 h-6 rounded-full transition-all duration-300 relative"
      style={{ background: checked ? 'var(--accent-g)' : 'var(--bg-glass)', border: checked ? 'none' : '1px solid var(--border)' }}
    >
      <div
        className="w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform duration-300"
        style={{ transform: checked ? 'translateX(24px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

const themeOptions: { id: ThemeMode; label: string; desc: string; bg: string }[] = [
  { id: 'dark', label: 'Dark', desc: 'Soft dark background', bg: 'linear-gradient(135deg, #10101e, #1a1a32)' },
  { id: 'darker', label: 'Darker', desc: 'Deep dark, minimal light', bg: 'linear-gradient(135deg, #040408, #101022)' },
  { id: 'amoled', label: 'AMOLED Black', desc: 'Pure black, zero light bleed', bg: 'linear-gradient(135deg, #000000, #0a0a10)' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { mode, setTheme } = useThemeStore();

  const handleTheme = (t: ThemeMode) => {
    setTheme(t);
    applyTheme(t);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-0)' }}>Settings</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>Configure Z-UI platform settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Tabs */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="glass-card p-1.5 space-y-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(0,180,255,0.06), rgba(124,58,237,0.04))' : 'transparent',
                  color: activeTab === tab.id ? 'var(--accent-1)' : 'var(--text-2)',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          {/* Links */}
          <div className="glass-card p-3 mt-3 space-y-2 text-xs">
            <a href="https://github.com/Zendan-ui/z-ui" target="_blank" className="flex items-center gap-2 hover:opacity-80" style={{ color: 'var(--text-2)' }}>
              🔗 GitHub
            </a>
            <a href="https://t.me/Zendan_Ui" target="_blank" className="flex items-center gap-2 hover:opacity-80" style={{ color: 'var(--text-2)' }}>
              📱 @Zendan_Ui
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 glass-card p-5">
          {activeTab === 'general' && (
            <div>
              <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>General Settings</h2>
              <SettingRow label="Panel Port" description="Port for the web panel">
                <input type="number" defaultValue={8443} className="input-field w-32 !text-sm" />
              </SettingRow>
              <SettingRow label="Panel Base Path" description="Base URL path for the panel">
                <input type="text" defaultValue="/" className="input-field w-48 !text-sm" />
              </SettingRow>
              <SettingRow label="Default Language">
                <select className="input-field w-40 !text-sm">
                  <option value="en">🇬🇧 English</option>
                  <option value="fa">🇮🇷 Persian</option>
                  <option value="ru">🇷🇺 Russian</option>
                </select>
              </SettingRow>
              <SettingRow label="Xray API Port"><input type="number" defaultValue={10085} className="input-field w-32 !text-sm" /></SettingRow>
              <SettingRow label="Traffic Sync Interval" description="Seconds between traffic syncs"><input type="number" defaultValue={30} className="input-field w-32 !text-sm" /></SettingRow>
              <SettingRow label="Debug Mode"><Toggle checked={false} onChange={() => {}} /></SettingRow>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>Security Settings</h2>
              <SettingRow label="Two-Factor Authentication"><Toggle checked={false} onChange={() => {}} /></SettingRow>
              <SettingRow label="JWT Token Expiry (hours)"><input type="number" defaultValue={24} className="input-field w-32 !text-sm" /></SettingRow>
              <SettingRow label="Max Login Attempts"><input type="number" defaultValue={5} className="input-field w-32 !text-sm" /></SettingRow>
              <SettingRow label="Lockout Duration (minutes)"><input type="number" defaultValue={15} className="input-field w-32 !text-sm" /></SettingRow>
              <SettingRow label="Encrypt Subscription Links"><Toggle checked={true} onChange={() => {}} /></SettingRow>
            </div>
          )}

          {activeTab === 'telegram' && (
            <div>
              <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>Telegram Bot Settings</h2>
              <SettingRow label="Enable Telegram Bot"><Toggle checked={false} onChange={() => {}} /></SettingRow>
              <SettingRow label="Bot Token" description="From @BotFather">
                <input type="password" placeholder="Enter bot token" className="input-field w-80 !text-sm" />
              </SettingRow>
              <SettingRow label="Admin Telegram ID">
                <input type="number" placeholder="Your numeric TG ID" className="input-field w-48 !text-sm" />
              </SettingRow>
              <SettingRow label="Expiration Alerts"><Toggle checked={true} onChange={() => {}} /></SettingRow>
              <SettingRow label="Traffic Alerts"><Toggle checked={true} onChange={() => {}} /></SettingRow>
              <SettingRow label="Server Status Alerts"><Toggle checked={true} onChange={() => {}} /></SettingRow>
              <div className="p-3 mt-4 rounded-xl text-xs" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                📱 Telegram Support: <a href="https://t.me/Zendan_Ui" target="_blank" style={{ color: 'var(--accent-1)' }}>@Zendan_Ui</a>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div>
              <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>Subscription Settings</h2>
              <SettingRow label="Default Format">
                <select className="input-field w-48 !text-sm">
                  <option value="auto">Auto Detect</option>
                  <option value="v2ray">V2Ray/Xray</option>
                  <option value="clash">Clash Meta</option>
                  <option value="singbox">Sing-box</option>
                  <option value="json">JSON</option>
                </select>
              </SettingRow>
              <SettingRow label="Update Interval (hours)"><input type="number" defaultValue={1} className="input-field w-32 !text-sm" /></SettingRow>
              <SettingRow label="Short Link Length"><input type="number" defaultValue={8} className="input-field w-32 !text-sm" /></SettingRow>
              <SettingRow label="Auto-Renew Default"><Toggle checked={false} onChange={() => {}} /></SettingRow>
            </div>
          )}

          {activeTab === 'backup' && (
            <div>
              <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>Backup & Restore</h2>
              <div className="grid md:grid-cols-3 gap-3 mb-5">
                {[
                  { icon: '📦', title: 'Full Backup', desc: 'DB + Configs + Settings' },
                  { icon: '🗄️', title: 'Database Only', desc: 'Users, Proxies, Servers' },
                  { icon: '📋', title: 'Configs Only', desc: 'Inbounds, Routing' },
                ].map((b) => (
                  <button key={b.title} className="glass-card p-4 text-center hover:scale-[1.02] transition-transform cursor-pointer">
                    <span className="text-2xl block mb-1">{b.icon}</span>
                    <span className="font-medium text-xs">{b.title}</span>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>{b.desc}</p>
                  </button>
                ))}
              </div>
              <SettingRow label="Auto Backup">
                <div className="flex items-center gap-3">
                  <Toggle checked={true} onChange={() => {}} />
                  <input type="number" defaultValue={24} className="input-field w-20 !text-sm" />
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>hours</span>
                </div>
              </SettingRow>
              <SettingRow label="Retention (days)"><input type="number" defaultValue={30} className="input-field w-32 !text-sm" /></SettingRow>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>Appearance</h2>

              {/* Theme selector */}
              <div className="mb-6">
                <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-1)' }}>Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTheme(t.id)}
                      className="p-4 rounded-xl text-center transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: t.bg,
                        border: mode === t.id ? '2px solid var(--accent-1)' : '1px solid var(--border)',
                        boxShadow: mode === t.id ? '0 0 20px rgba(0,180,255,0.1)' : 'none',
                      }}
                    >
                      <div className="font-bold text-sm mb-0.5" style={{ color: mode === t.id ? 'var(--accent-1)' : 'var(--text-0)' }}>
                        {t.label}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>{t.desc}</div>
                      {mode === t.id && (
                        <div className="mt-2 text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent-1)' }}>
                          ✓ Active
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <SettingRow label="Animations" description="Enable UI animations"><Toggle checked={true} onChange={() => {}} /></SettingRow>
              <SettingRow label="Compact Mode" description="Reduce spacing"><Toggle checked={false} onChange={() => {}} /></SettingRow>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
            <button className="btn-secondary text-sm">Reset Defaults</button>
            <button className="btn-primary text-sm">💾 Save Settings</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
