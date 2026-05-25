'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatDate, copyToClipboard, cn } from '@/lib/utils';
import { Package, Link, Copy, RefreshCw, Trash } from '@/components/ui/Icons';
import QRCodeComp from '@/components/ui/QRCode';
import api from '@/lib/api';
import type { Subscription } from '@/types';

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Subscription | null>(null);
  const [copied, setCopied] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getSubscriptions();
      setSubs(res.data.subscriptions || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function regenerate(id: number) {
    try { await api.regenerateSubscription(id); load(); } catch {}
  }

  async function del(id: number) {
    if (!confirm('Delete?')) return;
    try { await api.deleteSubscription(id); load(); setSelected(null); } catch {}
  }

  function getSubUrl(token: string) { return `${typeof window !== 'undefined' ? window.location.origin : ''}/sub/${token}`; }

  async function handleCopy(text: string, label: string) {
    await copyToClipboard(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <DashboardLayout>
      <div className="flex items-center gap-2 mb-5">
        <Package size={20} color="var(--accent-1)" />
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-0)' }}>Subscriptions</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{subs.length} subscriptions</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent-1)' }} /></div>
      ) : subs.length === 0 ? (
        <div className="glass-card p-16 text-center"><Package size={40} color="var(--text-3)" className="mx-auto mb-3" /><p className="text-sm" style={{ color: 'var(--text-3)' }}>No subscriptions. Create a user first.</p></div>
      ) : (
        <div className="grid gap-3">
          {subs.map(sub => (
            <div key={sub.id} className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:scale-[1.005] transition-transform" onClick={() => setSelected(sub)}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'var(--accent-g)' }}>
                {(sub.user?.username || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: 'var(--text-0)' }}>{sub.user?.username || `User #${sub.user_id}`}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{sub.name} · {sub.format} · {sub.hit_count} hits</p>
              </div>
              <span className="badge" style={{ background: sub.is_active ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)', color: sub.is_active ? 'var(--success)' : 'var(--danger)' }}>
                {sub.is_active ? 'active' : 'inactive'}
              </span>
              <span className="text-xs hidden md:inline" style={{ color: 'var(--text-3)' }}>{formatDate(sub.last_access)}</span>
              <Link size={14} color="var(--accent-1)" />
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card w-full max-w-2xl p-6 mx-4 animate-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-0)' }}>
                <Package size={16} color="var(--accent-1)" /> {selected.user?.username || 'Subscription'}
              </h2>
              <button onClick={() => setSelected(null)} style={{ color: 'var(--text-3)' }}>×</button>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="flex flex-col items-center">
                <QRCodeComp data={getSubUrl(selected.token)} size={180} />
                <p className="text-[10px] mt-2" style={{ color: 'var(--text-3)' }}>Scan with proxy client</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] mb-1 block" style={{ color: 'var(--text-3)' }}>Subscription Link</label>
                  <div className="flex gap-2">
                    <input readOnly value={getSubUrl(selected.token)} className="input-field !text-[10px] flex-1 font-mono" />
                    <button onClick={() => handleCopy(getSubUrl(selected.token), 'sub')} className="btn-secondary !text-xs !px-3 whitespace-nowrap">
                      {copied === 'sub' ? <span style={{ color: 'var(--success)' }}>Copied!</span> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] mb-1 block" style={{ color: 'var(--text-3)' }}>Short Link</label>
                  <div className="flex gap-2">
                    <input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/sub/s/${selected.short_link}`} className="input-field !text-[10px] flex-1 font-mono" />
                    <button onClick={() => handleCopy(`${window.location.origin}/sub/s/${selected.short_link}`, 'short')} className="btn-secondary !text-xs !px-3">
                      {copied === 'short' ? <span style={{ color: 'var(--success)' }}>Copied!</span> : <><Copy size={12} /></>}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg" style={{ background: 'var(--bg-glass)' }}><span style={{ color: 'var(--text-3)' }}>Hits:</span> {selected.hit_count}</div>
                  <div className="p-2 rounded-lg" style={{ background: 'var(--bg-glass)' }}><span style={{ color: 'var(--text-3)' }}>Last:</span> {formatDate(selected.last_access)}</div>
                </div>
              </div>
            </div>

            {/* Format links */}
            <div className="mt-5">
              <p className="text-[10px] font-medium mb-2" style={{ color: 'var(--text-2)' }}>Client-specific links</p>
              {['auto', 'clash', 'singbox', 'v2ray', 'json'].map(fmt => (
                <div key={fmt} className="flex items-center gap-2 p-2 rounded-lg mb-1" style={{ background: 'var(--bg-glass)' }}>
                  <span className="text-[10px] font-semibold w-16" style={{ color: 'var(--text-2)' }}>{fmt}</span>
                  <code className="flex-1 text-[9px] truncate" style={{ color: 'var(--text-3)' }}>{getSubUrl(selected.token)}?format={fmt}</code>
                  <button onClick={() => handleCopy(`${getSubUrl(selected.token)}?format=${fmt}`, fmt)} className="text-[10px]" style={{ color: 'var(--accent-1)' }}>
                    {copied === fmt ? '✓' : 'copy'}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <button onClick={() => regenerate(selected.id)} className="btn-secondary flex-1 !text-sm"><RefreshCw size={13} /> Regenerate</button>
              <button onClick={() => del(selected.id)} className="btn-secondary !text-sm" style={{ color: 'var(--danger)' }}><Trash size={13} /></button>
              <button onClick={() => setSelected(null)} className="btn-primary flex-1 !text-sm">Done</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
