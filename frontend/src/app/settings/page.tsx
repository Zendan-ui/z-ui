'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useThemeStore, applyTheme, themeList, ThemeMode } from '@/store/theme';
import { useLangStore } from '@/store/language';
import { Settings as SettingsIcon } from '@/components/ui/Icons';
import type { Locale } from '@/i18n/locales';

type Tab = 'general' | 'security' | 'telegram' | 'subscription' | 'appearance';

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className="w-11 h-6 rounded-full relative transition-all"
      style={{ background: on ? 'var(--accent-g)' : 'var(--bg-glass)', border: on ? 'none' : '1px solid var(--border)' }}>
      <div className="w-4.5 h-4.5 rounded-full bg-white shadow absolute top-[3px] transition-transform"
        style={{ transform: on ? 'translateX(22px)' : 'translateX(3px)', width: 18, height: 18 }} />
    </button>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-3 bb gap-3">
      <div><p className="text-xs font-medium c0">{label}</p>{desc && <p className="text-[10px] c3">{desc}</p>}</div>
      <div>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('appearance');
  const { mode, setTheme } = useThemeStore();
  const { lang, setLang, t } = useLangStore();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: t('settings.general') },
    { id: 'security', label: t('settings.securitySettings') },
    { id: 'telegram', label: t('settings.telegramBot') },
    { id: 'subscription', label: t('settings.subscriptionSettings') },
    { id: 'appearance', label: t('settings.appearance') },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center gap-2 mb-5">
        <SettingsIcon size={20} className="ca" />
        <h1 className="text-xl font-extrabold c0">{t('settings.title')}</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Tabs */}
        <div className="lg:w-48 flex-shrink-0 glass-card p-1.5 space-y-0.5 h-fit">
          {tabs.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: tab === tb.id ? 'linear-gradient(135deg,rgba(0,180,255,.06),rgba(124,58,237,.04))' : 'transparent',
                color: tab === tb.id ? 'var(--accent-1)' : 'var(--text-2)',
              }}>{tb.label}</button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 glass-card p-5">
          {tab === 'appearance' && (
            <div>
              <h2 className="text-sm font-bold c0 mb-4">{t('settings.appearance')}</h2>

              {/* Language */}
              <Row label={t('common.language')}>
                <div className="flex gap-2">
                  {([
                    { id: 'en', flag: '🇬🇧', name: 'English' },
                    { id: 'fa', flag: '🇮🇷', name: 'فارسی' },
                    { id: 'ru', flag: '🇷🇺', name: 'Русский' },
                  ] as { id: Locale; flag: string; name: string }[]).map(l => (
                    <button key={l.id} onClick={() => setLang(l.id)}
                      className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: lang === l.id ? 'var(--accent-1)15' : 'var(--bg-glass)',
                        border: `1.5px solid ${lang === l.id ? 'var(--accent-1)' : 'var(--border)'}`,
                        color: lang === l.id ? 'var(--accent-1)' : 'var(--text-2)',
                      }}>{l.flag} {l.name}</button>
                  ))}
                </div>
              </Row>

              {/* Themes */}
              <div className="mt-4">
                <p className="text-xs font-medium c0 mb-3">{t('settings.chooseTheme')}</p>
                <div className="grid grid-cols-5 gap-2">
                  {themeList.map(tm => (
                    <button key={tm.id} onClick={() => setTheme(tm.id)}
                      className="p-3 rounded-xl text-center transition-all hover:scale-[1.02]"
                      style={{
                        background: 'var(--bg-glass)',
                        border: mode === tm.id ? '2px solid var(--accent-1)' : '1px solid var(--border)',
                        boxShadow: mode === tm.id ? '0 0 15px rgba(0,180,255,.1)' : 'none',
                      }}>
                      <div className="text-[11px] font-bold mb-0.5" style={{ color: mode === tm.id ? 'var(--accent-1)' : 'var(--text-1)' }}>
                        {lang === 'fa' ? tm.labelFa : lang === 'ru' ? tm.labelRu : tm.label}
                      </div>
                      {mode === tm.id && <div className="text-[8px] font-bold ca">✓</div>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'general' && (
            <div>
              <h2 className="text-sm font-bold c0 mb-4">{t('settings.general')}</h2>
              <Row label={t('settings.panelPort')}><input type="number" defaultValue={8443} className="input-field w-28 !text-sm" /></Row>
              <Row label={t('settings.xrayApiPort')}><input type="number" defaultValue={10085} className="input-field w-28 !text-sm" /></Row>
              <Row label={t('settings.debugMode')}><Toggle on={false} onChange={() => {}} /></Row>
            </div>
          )}

          {tab === 'security' && (
            <div>
              <h2 className="text-sm font-bold c0 mb-4">{t('settings.securitySettings')}</h2>
              <Row label={t('settings.twoFactor')}><Toggle on={false} onChange={() => {}} /></Row>
              <Row label={t('settings.jwtExpiry')}><input type="number" defaultValue={24} className="input-field w-28 !text-sm" /></Row>
              <Row label={t('settings.maxAttempts')}><input type="number" defaultValue={5} className="input-field w-28 !text-sm" /></Row>
              <Row label={t('settings.encryptSubs')}><Toggle on={true} onChange={() => {}} /></Row>
            </div>
          )}

          {tab === 'telegram' && (
            <div>
              <h2 className="text-sm font-bold c0 mb-4">{t('settings.telegramBot')}</h2>
              <Row label={t('telegram.enableBot')}><Toggle on={false} onChange={() => {}} /></Row>
              <Row label={t('telegram.botToken')}><input type="password" className="input-field w-64 !text-sm" placeholder="123456:ABC..." /></Row>
              <Row label={t('telegram.adminIds')}><input className="input-field w-48 !text-sm" placeholder="123456789" /></Row>
              <Row label={t('telegram.expirationAlerts')}><Toggle on={true} onChange={() => {}} /></Row>
              <Row label={t('telegram.trafficAlerts')}><Toggle on={true} onChange={() => {}} /></Row>
              <p className="text-[10px] c3 mt-3">Telegram: <a href="https://t.me/Zendan_Ui" className="ca">@Zendan_Ui</a></p>
            </div>
          )}

          {tab === 'subscription' && (
            <div>
              <h2 className="text-sm font-bold c0 mb-4">{t('settings.subscriptionSettings')}</h2>
              <Row label={t('settings.defaultFormat')}>
                <select className="input-field w-40 !text-sm"><option>Auto</option><option>V2Ray</option><option>Clash</option><option>Sing-box</option><option>JSON</option></select>
              </Row>
              <Row label={t('settings.updateInterval')}><input type="number" defaultValue={1} className="input-field w-28 !text-sm" /></Row>
              <Row label={t('settings.shortLinkLength')}><input type="number" defaultValue={8} className="input-field w-28 !text-sm" /></Row>
              <Row label={t('settings.autoRenewDefault')}><Toggle on={false} onChange={() => {}} /></Row>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-5 pt-4 bt">
            <button className="btn-secondary text-sm">{t('settings.resetDefaults')}</button>
            <button className="btn-primary text-sm">{t('settings.saveSettings')}</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
