'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Radio, Plus, Edit, Trash, Power } from '@/components/ui/Icons';
import api from '@/lib/api';
import type { Inbound, Protocol, Transport, Security } from '@/types';

const protocols: { id: Protocol; label: string; color: string }[] = [
  { id: 'vless', label: 'VLESS', color: '#00b4ff' },
  { id: 'vmess', label: 'VMess', color: '#7c3aed' },
  { id: 'trojan', label: 'Trojan', color: '#ef4444' },
  { id: 'shadowsocks', label: 'SS', color: '#22c55e' },
  { id: 'hysteria2', label: 'Hy2', color: '#f59e0b' },
  { id: 'tuic', label: 'TUIC', color: '#06b6d4' },
  { id: 'wireguard', label: 'WG', color: '#84cc16' },
  { id: 'socks', label: 'SOCKS', color: '#94a3b8' },
];
const transports: Transport[] = ['tcp','ws','grpc','quic','kcp','xhttp','httpupgrade','splithttp'];
const securities: Security[] = ['none','tls','reality'];

export default function InboundsPage() {
  const [inbounds, setInbounds] = useState<Inbound[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProto, setFilterProto] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [proto, setProto] = useState<Protocol>('vless');
  const [trans, setTrans] = useState<Transport>('ws');
  const [sec, setSec] = useState<Security>('tls');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterProto) params.protocol = filterProto;
      const res = await api.getInbounds(params);
      setInbounds(res.data.inbounds || []);
    } catch {} finally { setLoading(false); }
  }, [filterProto]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api.createInbound({
        tag: form.get('tag'),
        protocol: proto,
        port: Number(form.get('port')),
        transport: trans,
        security: sec,
        remark: form.get('remark'),
        server_id: Number(form.get('server_id')) || 0,
      });
      setShowCreate(false);
      load();
    } catch {}
  }

  async function toggle(id: number) { try { await api.toggleInbound(id); load(); } catch {} }
  async function del(id: number) { if (!confirm('Delete?')) return; try { await api.deleteInbound(id); load(); } catch {} }

  const filtered = filterProto ? inbounds.filter(i => i.protocol === filterProto) : inbounds;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-2">
          <Radio size={20} color="var(--accent-1)" />
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-0)' }}>Inbounds</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{inbounds.length} configured</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary !text-sm">
          <span className="flex items-center gap-1.5"><Plus size={14} /> Create</span>
        </button>
      </div>

      {/* Protocol filter */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <button onClick={() => setFilterProto('')}
          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
          style={{ background: !filterProto ? 'var(--accent-g)' : 'var(--bg-glass)', color: !filterProto ? '#fff' : 'var(--text-3)', border: '1px solid var(--border)' }}>
          All
        </button>
        {protocols.map(p => (
          <button key={p.id} onClick={() => setFilterProto(p.id)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
            style={{ background: filterProto === p.id ? `${p.color}18` : 'var(--bg-glass)', border: `1px solid ${filterProto === p.id ? p.color : 'var(--border)'}`, color: filterProto === p.id ? p.color : 'var(--text-3)' }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent-1)' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Radio size={40} color="var(--text-3)" className="mx-auto mb-3" />
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>No inbounds</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(inb => {
            const pi = protocols.find(p => p.id === inb.protocol);
            return (
              <div key={inb.id} className="glass-card p-4 flex items-center gap-4" style={{ opacity: inb.is_active ? 1 : 0.4 }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold"
                  style={{ background: `${pi?.color || '#888'}15`, color: pi?.color || '#888', border: `1px solid ${pi?.color || '#888'}30` }}>
                  {(inb.protocol || '?').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-0)' }}>{inb.tag}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{inb.remark}</p>
                </div>
                <span className="hidden md:inline px-2 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg-glass)', color: 'var(--text-2)' }}>:{inb.port}</span>
                <span className="hidden md:inline px-2 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg-glass)', color: 'var(--text-2)' }}>{inb.transport}</span>
                <span className="hidden md:inline px-2 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg-glass)', color: inb.security === 'reality' ? 'var(--accent-2)' : 'var(--text-2)' }}>{inb.security}</span>
                <div className="flex gap-0.5">
                  <button onClick={() => toggle(inb.id)} className="p-1.5 rounded-lg hover:opacity-60"><Power size={13} color={inb.is_active ? 'var(--success)' : 'var(--text-3)'} /></button>
                  <button onClick={() => del(inb.id)} className="p-1.5 rounded-lg hover:opacity-60"><Trash size={13} color="var(--danger)" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <form onSubmit={handleCreate} className="glass-card w-full max-w-xl p-6 mx-4 animate-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-0)' }}>Create Inbound</h2>
              <button type="button" onClick={() => setShowCreate(false)} style={{ color: 'var(--text-3)' }}>×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] mb-2 block font-medium" style={{ color: 'var(--text-2)' }}>Protocol</label>
                <div className="flex flex-wrap gap-1.5">
                  {protocols.map(p => (
                    <button key={p.id} type="button" onClick={() => setProto(p.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: proto === p.id ? `${p.color}18` : 'var(--bg-glass)', border: `1px solid ${proto === p.id ? p.color : 'var(--border)'}`, color: proto === p.id ? p.color : 'var(--text-3)' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[11px] mb-1 block" style={{ color: 'var(--text-2)' }}>Tag *</label>
                  <input name="tag" required className="input-field !text-sm" placeholder={`${proto}-${trans}`} /></div>
                <div><label className="text-[11px] mb-1 block" style={{ color: 'var(--text-2)' }}>Port *</label>
                  <input name="port" type="number" required className="input-field !text-sm" placeholder="443" /></div>
              </div>
              <div>
                <label className="text-[11px] mb-2 block font-medium" style={{ color: 'var(--text-2)' }}>Transport</label>
                <div className="flex flex-wrap gap-1.5">
                  {transports.map(t => (
                    <button key={t} type="button" onClick={() => setTrans(t)}
                      className="px-3 py-1 rounded-lg text-[11px] font-medium transition-all"
                      style={{ background: trans === t ? 'var(--accent-1)15' : 'var(--bg-glass)', border: `1px solid ${trans === t ? 'var(--accent-1)' : 'var(--border)'}`, color: trans === t ? 'var(--accent-1)' : 'var(--text-3)' }}>
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] mb-2 block font-medium" style={{ color: 'var(--text-2)' }}>Security</label>
                <div className="flex gap-1.5">
                  {securities.map(s => (
                    <button key={s} type="button" onClick={() => setSec(s)}
                      className="px-4 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                      style={{ background: sec === s ? 'var(--accent-2)15' : 'var(--bg-glass)', border: `1px solid ${sec === s ? 'var(--accent-2)' : 'var(--border)'}`, color: sec === s ? 'var(--accent-2)' : 'var(--text-3)' }}>
                      {s === 'none' ? 'None' : s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="text-[11px] mb-1 block" style={{ color: 'var(--text-2)' }}>Remark</label>
                <input name="remark" className="input-field !text-sm" placeholder="Description" /></div>
              <input name="server_id" type="hidden" value="0" />
            </div>
            <div className="flex gap-3 mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1 !text-sm">Cancel</button>
              <button type="submit" className="btn-primary flex-1 !text-sm">Create</button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
