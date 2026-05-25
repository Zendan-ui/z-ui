'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatBytes, formatUptime, cn } from '@/lib/utils';
import { Server as ServerIcon, Plus, Trash, Edit, RefreshCw } from '@/components/ui/Icons';
import api from '@/lib/api';
import type { Server } from '@/types';

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadServers(); }, []);

  async function loadServers() {
    setLoading(true);
    try {
      const res = await api.getServers();
      setServers(res.data.servers || []);
    } catch {} finally { setLoading(false); }
  }

  async function deleteServer(id: number) {
    if (!confirm('Delete this server?')) return;
    try { await api.deleteServer(id); loadServers(); } catch {}
  }

  const online = servers.filter(s => s.status === 'online').length;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="flex items-center gap-2">
            <ServerIcon size={20} color="var(--accent-1)" />
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-0)' }}>Servers</h1>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>{online}/{servers.length} online</p>
        </div>
        <button className="btn-primary !text-sm"><span className="flex items-center gap-1.5"><Plus size={14} /> Add Server</span></button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent-1)' }} />
        </div>
      ) : servers.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <ServerIcon size={40} color="var(--text-3)" className="mx-auto mb-3" />
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>No servers configured yet</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {servers.map(srv => (
            <div key={srv.id} className={cn('glass-card p-5 relative overflow-hidden', srv.status !== 'online' && 'opacity-50')}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-0)' }}>{srv.name}</h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{srv.host} · {srv.location}</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full" style={{
                  background: srv.status === 'online' ? 'var(--success)' : 'var(--danger)',
                  animation: srv.status === 'online' ? 'pulse 2s infinite' : 'none',
                }} />
              </div>

              {srv.status === 'online' ? (
                <>
                  <div className="space-y-1.5 mb-3">
                    <div><div className="flex justify-between text-[10px]" style={{ color: 'var(--text-3)' }}><span>CPU</span><span>{srv.cpu}%</span></div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${srv.cpu}%`, background: srv.cpu > 80 ? 'var(--danger)' : 'var(--accent-1)' }} /></div></div>
                    <div><div className="flex justify-between text-[10px]" style={{ color: 'var(--text-3)' }}><span>RAM</span><span>{srv.memory}%</span></div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${srv.memory}%`, background: srv.memory > 80 ? 'var(--danger)' : 'var(--accent-2)' }} /></div></div>
                  </div>
                  <div className="flex gap-1.5 text-[9px]" style={{ color: 'var(--text-3)' }}>
                    <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-glass)' }}>↑{formatBytes(srv.network_in)}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-glass)' }}>↓{formatBytes(srv.network_out)}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-glass)' }}>{formatUptime(srv.uptime)}</span>
                  </div>
                </>
              ) : (
                <p className="text-center py-6 text-xs" style={{ color: 'var(--text-3)' }}>Offline</p>
              )}

              <div className="flex gap-1.5 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <button className="btn-ghost !text-xs flex-1"><Edit size={12} /> Edit</button>
                <button onClick={() => deleteServer(srv.id)} className="btn-ghost !text-xs" style={{ color: 'var(--danger)' }}><Trash size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
