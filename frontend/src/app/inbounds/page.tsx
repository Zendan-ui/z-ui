'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';
import type { Protocol, Transport, Security } from '@/types';

const protocols: { id: Protocol; label: string; color: string }[] = [
  { id: 'vless', label: 'VLESS', color: '#00b4ff' },
  { id: 'vmess', label: 'VMess', color: '#7c3aed' },
  { id: 'trojan', label: 'Trojan', color: '#ef4444' },
  { id: 'shadowsocks', label: 'Shadowsocks', color: '#22c55e' },
  { id: 'hysteria2', label: 'Hysteria2', color: '#f59e0b' },
  { id: 'tuic', label: 'TUIC', color: '#06b6d4' },
  { id: 'wireguard', label: 'WireGuard', color: '#84cc16' },
  { id: 'socks', label: 'SOCKS5', color: '#94a3b8' },
  { id: 'ssh', label: 'SSH', color: '#f97316' },
];
const transports: Transport[] = ['tcp','ws','grpc','quic','kcp','xhttp','httpupgrade','splithttp'];
const securities: Security[] = ['none','tls','reality'];

const mockInbounds = [
  { id: 1, tag: 'vless-ws-tls', protocol: 'vless' as Protocol, port: 443, transport: 'ws' as Transport, security: 'tls' as Security, clients: 245, active: true, remark: 'Main VLESS', server: 'US-East' },
  { id: 2, tag: 'vmess-grpc', protocol: 'vmess' as Protocol, port: 2053, transport: 'grpc' as Transport, security: 'tls' as Security, clients: 189, active: true, remark: 'VMess gRPC', server: 'DE-Frankfurt' },
  { id: 3, tag: 'vless-reality', protocol: 'vless' as Protocol, port: 443, transport: 'tcp' as Transport, security: 'reality' as Security, clients: 312, active: true, remark: 'Reality XTLS', server: 'NL-Amsterdam' },
  { id: 4, tag: 'trojan-ws', protocol: 'trojan' as Protocol, port: 2087, transport: 'ws' as Transport, security: 'tls' as Security, clients: 98, active: true, remark: 'Trojan WS', server: 'UK-London' },
  { id: 5, tag: 'hysteria2-main', protocol: 'hysteria2' as Protocol, port: 8443, transport: 'quic' as Transport, security: 'tls' as Security, clients: 67, active: false, remark: 'Hy2 QUIC', server: 'US-East' },
  { id: 6, tag: 'ss-2022', protocol: 'shadowsocks' as Protocol, port: 8388, transport: 'tcp' as Transport, security: 'none' as Security, clients: 45, active: true, remark: 'SS 2022', server: 'TR-Istanbul' },
  { id: 7, tag: 'tuic-v5', protocol: 'tuic' as Protocol, port: 8444, transport: 'quic' as Transport, security: 'tls' as Security, clients: 34, active: true, remark: 'TUIC v5', server: 'DE-Frankfurt' },
];

function CreateInboundModal({ onClose }: { onClose: () => void }) {
  const [proto, setProto] = useState<Protocol>('vless');
  const [trans, setTrans] = useState<Transport>('ws');
  const [sec, setSec] = useState<Security>('tls');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-card w-full max-w-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto animate-in">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold" style={{ color: 'var(--text-0)' }}>📡 Create Inbound</h2>
          <button onClick={onClose} style={{ color: 'var(--text-3)' }} className="text-lg hover:opacity-80">×</button>
        </div>

        <div className="space-y-5">
          {/* Protocol */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-2)' }}>Protocol</label>
            <div className="flex flex-wrap gap-2">
              {protocols.map(p => (
                <button key={p.id} onClick={() => setProto(p.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: proto === p.id ? `${p.color}18` : 'var(--bg-glass)',
                    border: `1px solid ${proto === p.id ? p.color + '50' : 'var(--border)'}`,
                    color: proto === p.id ? p.color : 'var(--text-2)',
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-2)' }}>Tag *</label>
              <input className="input-field !text-sm" placeholder={`${proto}-${trans}-${sec}`} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-2)' }}>Port *</label>
              <input type="number" className="input-field !text-sm" placeholder="443" />
            </div>
          </div>

          {/* Transport */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-2)' }}>Transport</label>
            <div className="flex flex-wrap gap-2">
              {transports.map(t => (
                <button key={t} onClick={() => setTrans(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: trans === t ? 'var(--accent-1)18' : 'var(--bg-glass)',
                    border: `1px solid ${trans === t ? 'var(--accent-1)' : 'var(--border)'}`,
                    color: trans === t ? 'var(--accent-1)' : 'var(--text-2)',
                  }}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Security */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-2)' }}>Security</label>
            <div className="flex gap-2">
              {securities.map(s => (
                <button key={s} onClick={() => setSec(s)}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: sec === s ? 'var(--accent-2)18' : 'var(--bg-glass)',
                    border: `1px solid ${sec === s ? 'var(--accent-2)' : 'var(--border)'}`,
                    color: sec === s ? 'var(--accent-2)' : 'var(--text-2)',
                  }}>
                  {s === 'none' ? 'None' : s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Transport-specific settings */}
          {trans === 'ws' && (
            <div className="grid grid-cols-2 gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
              <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-3)' }}>WS Path</label><input className="input-field !text-sm" placeholder="/ws" /></div>
              <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-3)' }}>Host Header</label><input className="input-field !text-sm" placeholder="example.com" /></div>
            </div>
          )}
          {trans === 'grpc' && (
            <div className="p-3 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-3)' }}>Service Name</label><input className="input-field !text-sm" placeholder="grpc-service" />
            </div>
          )}
          {sec === 'reality' && (
            <div className="grid grid-cols-2 gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
              <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-3)' }}>Dest (SNI)</label><input className="input-field !text-sm" placeholder="www.google.com:443" /></div>
              <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-3)' }}>Short IDs</label><input className="input-field !text-sm" placeholder="auto" /></div>
              <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-3)' }}>Private Key</label><input className="input-field !text-sm" placeholder="auto-generate" /></div>
              <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-3)' }}>Fingerprint</label>
                <select className="input-field !text-sm"><option>chrome</option><option>firefox</option><option>safari</option><option>random</option></select>
              </div>
            </div>
          )}
          {sec === 'tls' && (
            <div className="grid grid-cols-2 gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
              <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-3)' }}>SNI</label><input className="input-field !text-sm" placeholder="example.com" /></div>
              <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-3)' }}>ALPN</label><input className="input-field !text-sm" placeholder="h2,http/1.1" /></div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-2)' }}>Server</label>
              <select className="input-field !text-sm"><option>US-East</option><option>DE-Frankfurt</option><option>NL-Amsterdam</option><option>UK-London</option></select>
            </div>
            <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-2)' }}>Remark</label><input className="input-field !text-sm" placeholder="Inbound description" /></div>
          </div>

          {/* Sniffing */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" defaultChecked className="accent-[var(--accent-1)]" /> Enable Sniffing</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" defaultChecked className="accent-[var(--accent-1)]" /> HTTP</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" defaultChecked className="accent-[var(--accent-1)]" /> TLS</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" defaultChecked className="accent-[var(--accent-1)]" /> QUIC</label>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose} className="btn-secondary flex-1 !text-sm">Cancel</button>
          <button className="btn-primary flex-1 !text-sm">✓ Create Inbound</button>
        </div>
      </div>
    </div>
  );
}

export default function InboundsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [filterProto, setFilterProto] = useState<string>('all');

  const filtered = filterProto === 'all' ? mockInbounds : mockInbounds.filter(i => i.protocol === filterProto);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-0)' }}>Inbound Management</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>
            {mockInbounds.length} inbounds · {mockInbounds.reduce((s, i) => s + i.clients, 0)} total clients
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary !text-sm">➕ Create Inbound</button>
      </div>

      {/* Protocol filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => setFilterProto('all')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: filterProto === 'all' ? 'var(--accent-g)' : 'var(--bg-glass)', color: filterProto === 'all' ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)' }}>
          All ({mockInbounds.length})
        </button>
        {protocols.filter(p => mockInbounds.some(i => i.protocol === p.id)).map(p => {
          const count = mockInbounds.filter(i => i.protocol === p.id).length;
          return (
            <button key={p.id} onClick={() => setFilterProto(p.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filterProto === p.id ? `${p.color}18` : 'var(--bg-glass)',
                border: `1px solid ${filterProto === p.id ? p.color : 'var(--border)'}`,
                color: filterProto === p.id ? p.color : 'var(--text-2)',
              }}>
              {p.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Inbound cards */}
      <div className="grid gap-3">
        {filtered.map(inb => {
          const pInfo = protocols.find(p => p.id === inb.protocol);
          return (
            <div key={inb.id} className="glass-card p-4 flex items-center gap-4" style={{ opacity: inb.active ? 1 : 0.5 }}>
              {/* Protocol badge */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold"
                style={{ background: `${pInfo?.color}15`, color: pInfo?.color, border: `1px solid ${pInfo?.color}30` }}>
                {inb.protocol.slice(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-0)' }}>{inb.tag}</span>
                  <span className="badge" style={{ background: inb.active ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)', color: inb.active ? 'var(--success)' : 'var(--danger)' }}>
                    {inb.active ? '● active' : '● off'}
                  </span>
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                  {inb.remark} · {inb.server}
                </p>
              </div>

              {/* Tags */}
              <div className="hidden md:flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                  :{inb.port}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                  {inb.transport}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: inb.security === 'reality' ? 'var(--accent-2)' : 'var(--text-2)' }}>
                  {inb.security}
                </span>
              </div>

              {/* Clients */}
              <div className="text-center hidden md:block">
                <p className="text-sm font-bold" style={{ color: 'var(--accent-1)' }}>{inb.clients}</p>
                <p className="text-[9px]" style={{ color: 'var(--text-3)' }}>clients</p>
              </div>

              {/* Actions */}
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg transition-colors hover:opacity-70" title="Edit">✏️</button>
                <button className="p-1.5 rounded-lg transition-colors hover:opacity-70" title="Toggle">⏻</button>
                <button className="p-1.5 rounded-lg transition-colors hover:opacity-70" style={{ color: 'var(--danger)' }} title="Delete">🗑️</button>
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && <CreateInboundModal onClose={() => setShowCreate(false)} />}
    </DashboardLayout>
  );
}
