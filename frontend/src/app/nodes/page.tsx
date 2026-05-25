'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatBytes, formatUptime } from '@/lib/utils';
import { Globe, Plus, Trash, Edit, RefreshCw } from '@/components/ui/Icons';
import api from '@/lib/api';
import type { Server } from '@/types';

export default function NodesPage() {
  const [nodes, setNodes] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getServers();
      setNodes((res.data.servers || []).filter((s: Server) => s.type === 'node'));
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function del(id: number) { if (!confirm('Remove node?')) return; try { await api.deleteServer(id); load(); } catch {} }

  const connected = nodes.filter(n => n.status === 'online').length;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-2">
          <Globe size={20} color="var(--accent-1)" />
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-0)' }}>Nodes</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{connected}/{nodes.length} connected</p>
          </div>
        </div>
        <button className="btn-primary !text-sm"><span className="flex items-center gap-1.5"><Plus size={14} /> Add Node</span></button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent-1)' }} /></div>
      ) : nodes.length === 0 ? (
        <div className="glass-card p-16 text-center"><Globe size={40} color="var(--text-3)" className="mx-auto mb-3" /><p className="text-sm" style={{ color: 'var(--text-3)' }}>No remote nodes configured</p></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {nodes.map(node => (
            <div key={node.id} className={`glass-card p-5 ${node.status !== 'online' ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-0)' }}>{node.name}</h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{node.host} · {node.location}</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: node.status === 'online' ? 'var(--success)' : 'var(--danger)', animation: node.status === 'online' ? 'pulse 2s infinite' : 'none' }} />
              </div>
              {node.status === 'online' ? (
                <>
                  <div className="space-y-1.5 mb-3">
                    <div><div className="flex justify-between text-[10px]" style={{ color: 'var(--text-3)' }}><span>CPU</span><span>{node.cpu}%</span></div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${node.cpu}%`, background: node.cpu > 80 ? 'var(--danger)' : 'var(--accent-1)' }} /></div></div>
                    <div><div className="flex justify-between text-[10px]" style={{ color: 'var(--text-3)' }}><span>RAM</span><span>{node.memory}%</span></div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${node.memory}%`, background: 'var(--accent-2)' }} /></div></div>
                  </div>
                  <div className="flex gap-1.5 text-[9px]" style={{ color: 'var(--text-3)' }}>
                    <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-glass)' }}>↑{formatBytes(node.network_in)}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-glass)' }}>↓{formatBytes(node.network_out)}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-glass)' }}>{formatUptime(node.uptime)}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-6"><p className="text-xs" style={{ color: 'var(--text-3)' }}>Offline</p>
                  <button className="btn-secondary !text-xs mt-2"><RefreshCw size={12} /> Reconnect</button></div>
              )}
              <div className="flex gap-1.5 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <button className="btn-ghost !text-xs flex-1"><Edit size={12} /> Config</button>
                <button onClick={() => del(node.id)} className="btn-ghost !text-xs" style={{ color: 'var(--danger)' }}><Trash size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
