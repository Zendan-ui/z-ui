'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatBytes, formatUptime } from '@/lib/utils';

const mockNodes = [
  { id: 1, name: 'US-East-1', host: '45.33.32.156', status: 'connected', latency: 12, xray: '1.8.24', users: 245, upload: 450 * 1e9, download: 1200 * 1e9, uptime: 2592000, cpu: 45, mem: 62, cert_expires: '2027-01-15' },
  { id: 2, name: 'DE-Frankfurt', host: '185.220.101.34', status: 'connected', latency: 35, xray: '1.8.24', users: 312, upload: 320 * 1e9, download: 980 * 1e9, uptime: 1728000, cpu: 32, mem: 48, cert_expires: '2027-03-20' },
  { id: 3, name: 'NL-Amsterdam', host: '95.179.241.87', status: 'connected', latency: 28, xray: '1.8.24', users: 189, upload: 280 * 1e9, download: 850 * 1e9, uptime: 864000, cpu: 78, mem: 85, cert_expires: '2026-12-01' },
  { id: 4, name: 'FI-Helsinki', host: '185.112.83.42', status: 'disconnected', latency: 0, xray: '1.8.23', users: 0, upload: 0, download: 0, uptime: 0, cpu: 0, mem: 0, cert_expires: '2026-11-15' },
  { id: 5, name: 'UK-London', host: '51.89.42.156', status: 'connected', latency: 18, xray: '1.8.24', users: 456, upload: 600 * 1e9, download: 1800 * 1e9, uptime: 3456000, cpu: 55, mem: 71, cert_expires: '2027-06-10' },
];

function AddNodeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-card w-full max-w-lg p-6 mx-4 animate-in">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold" style={{ color: 'var(--text-0)' }}>🌐 Add Node</h2>
          <button onClick={onClose} style={{ color: 'var(--text-3)' }} className="text-lg">×</button>
        </div>
        <div className="space-y-4">
          <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-2)' }}>Node Name *</label><input className="input-field !text-sm" placeholder="e.g. US-West-1" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-2)' }}>Host/IP *</label><input className="input-field !text-sm" placeholder="1.2.3.4" /></div>
            <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-2)' }}>API Port</label><input type="number" className="input-field !text-sm" defaultValue={62050} /></div>
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-2)' }}>Connection Certificate</label>
            <textarea className="input-field !text-sm h-24 resize-none" placeholder="Paste node certificate here..." />
          </div>
          <div className="p-3 rounded-xl text-xs" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>
            💡 Install Z-UI Node on the remote server first, then paste its certificate here.
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1 !text-sm">Cancel</button>
            <button className="btn-primary flex-1 !text-sm">✓ Add Node</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NodesPage() {
  const [showAdd, setShowAdd] = useState(false);
  const connected = mockNodes.filter(n => n.status === 'connected').length;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-0)' }}>Node Management</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>{connected}/{mockNodes.length} connected · {mockNodes.reduce((s, n) => s + n.users, 0)} users</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary !text-sm">🌐 Add Node</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockNodes.map(node => (
          <div key={node.id} className={`glass-card p-5 relative overflow-hidden ${node.status === 'disconnected' ? 'opacity-50' : ''}`}>
            {/* Status glow */}
            <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full" style={{ background: node.status === 'connected' ? 'rgba(34,197,94,.06)' : 'rgba(239,68,68,.06)' }} />

            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-0)' }}>{node.name}</h3>
                <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>{node.host}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: node.status === 'connected' ? 'var(--success)' : 'var(--danger)', animation: node.status === 'connected' ? 'pulse 2s infinite' : 'none' }} />
                <span className="text-[10px] font-semibold" style={{ color: node.status === 'connected' ? 'var(--success)' : 'var(--danger)' }}>
                  {node.status}
                </span>
              </div>
            </div>

            {node.status === 'connected' ? (
              <>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-1.5 rounded-lg" style={{ background: 'var(--bg-glass)' }}>
                    <p className="text-xs font-bold" style={{ color: 'var(--accent-1)' }}>{node.users}</p>
                    <p className="text-[8px]" style={{ color: 'var(--text-3)' }}>USERS</p>
                  </div>
                  <div className="text-center p-1.5 rounded-lg" style={{ background: 'var(--bg-glass)' }}>
                    <p className="text-xs font-bold" style={{ color: 'var(--success)' }}>{node.latency}ms</p>
                    <p className="text-[8px]" style={{ color: 'var(--text-3)' }}>PING</p>
                  </div>
                  <div className="text-center p-1.5 rounded-lg" style={{ background: 'var(--bg-glass)' }}>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-0)' }}>{formatUptime(node.uptime)}</p>
                    <p className="text-[8px]" style={{ color: 'var(--text-3)' }}>UPTIME</p>
                  </div>
                </div>

                {/* CPU/RAM bars */}
                <div className="space-y-1.5 mb-3">
                  <div><div className="flex justify-between text-[10px]" style={{ color: 'var(--text-3)' }}><span>CPU</span><span>{node.cpu}%</span></div><div className="progress-bar"><div className="progress-fill" style={{ width: `${node.cpu}%`, background: node.cpu > 80 ? 'var(--danger)' : 'var(--accent-1)' }} /></div></div>
                  <div><div className="flex justify-between text-[10px]" style={{ color: 'var(--text-3)' }}><span>RAM</span><span>{node.mem}%</span></div><div className="progress-bar"><div className="progress-fill" style={{ width: `${node.mem}%`, background: node.mem > 80 ? 'var(--danger)' : 'var(--accent-2)' }} /></div></div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-3)' }}>
                  <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-glass)' }}>↑ {formatBytes(node.upload)}</span>
                  <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-glass)' }}>↓ {formatBytes(node.download)}</span>
                  <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-glass)' }}>Xray {node.xray}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs mb-2" style={{ color: 'var(--text-3)' }}>Node is offline</p>
                <button className="btn-secondary !text-xs !px-4 !py-1.5">🔄 Reconnect</button>
              </div>
            )}

            <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <button className="btn-ghost !text-xs flex-1">⚙️ Config</button>
              <button className="btn-ghost !text-xs flex-1">📊 Stats</button>
              <button className="btn-ghost !text-xs" style={{ color: 'var(--danger)' }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && <AddNodeModal onClose={() => setShowAdd(false)} />}
    </DashboardLayout>
  );
}
