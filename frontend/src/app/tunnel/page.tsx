'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Plus, Trash, Edit, Power, RefreshCw, Zap, Globe, Tunnel as TunnelIcon } from '@/components/ui/Icons';
import api from '@/lib/api';

interface TunnelEntry { id: number; uuid: string; tag: string; protocol: string; settings: string; is_active: boolean; created_at: string; }

type TunnelType = 'direct' | 'reverse' | 'relay' | 'warp';
const typeConfig: Record<TunnelType, { label: string; color: string; desc: string }> = {
  direct:  { label: 'Direct', color: 'var(--accent-1)', desc: 'Forward to remote server' },
  reverse: { label: 'Reverse', color: 'var(--accent-2)', desc: 'Remote sends traffic here' },
  relay:   { label: 'Relay', color: 'var(--accent-3)', desc: 'Relay between endpoints' },
  warp:    { label: 'WARP', color: 'var(--success)', desc: 'Cloudflare WARP IP masking' },
};

export default function TunnelPage() {
  const [tunnels, setTunnels] = useState<TunnelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [type, setType] = useState<TunnelType>('direct');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getTunnels();
      setTunnels(res.data.tunnels || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggle(id: number) { try { await api.toggleTunnel(id); load(); } catch {} }
  async function del(id: number) { if (!confirm('Delete tunnel?')) return; try { await api.deleteTunnel(id); load(); } catch {} }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api.createTunnel({
        name: form.get('name'),
        type: type,
        source: form.get('source'),
        destination: form.get('destination'),
        port: Number(form.get('port')),
        dest_port: Number(form.get('dest_port')),
        protocol: form.get('protocol'),
        remark: form.get('remark'),
        settings: type === 'warp' ? JSON.stringify({
          endpoint: form.get('warp_endpoint'),
          mtu: Number(form.get('warp_mtu')),
          private_key: form.get('warp_key'),
        }) : '{}',
      });
      setShowCreate(false);
      load();
    } catch {}
  }

  const active = tunnels.filter(t => t.is_active).length;

  function detectType(t: TunnelEntry): TunnelType {
    if (t.protocol === 'wireguard' || t.tag.includes('warp')) return 'warp';
    if (t.tag.includes('reverse')) return 'reverse';
    if (t.tag.includes('relay')) return 'relay';
    return 'direct';
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-2">
          <TunnelIcon size={20} color="var(--accent-1)" />
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-0)' }}>Tunnels</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{active}/{tunnels.length} active</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary !text-sm">
          <span className="flex items-center gap-1.5"><Plus size={14} /> Create Tunnel</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent-1)' }} /></div>
      ) : tunnels.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <TunnelIcon size={40} color="var(--text-3)" className="mx-auto mb-3" />
          <p className="text-sm mb-2" style={{ color: 'var(--text-3)' }}>No tunnels configured</p>
          <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>Create Direct, Reverse, Relay or WARP tunnels for Panel-to-Panel connectivity.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {tunnels.map(tunnel => {
            const tt = detectType(tunnel);
            const tc = typeConfig[tt];
            return (
              <div key={tunnel.id} className="glass-card p-4 flex items-center gap-4" style={{ opacity: tunnel.is_active ? 1 : 0.4 }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${tc.color}10`, border: `1px solid ${tc.color}25` }}>
                  {tt === 'warp' ? <Zap size={16} color={tc.color} /> : <TunnelIcon size={16} color={tc.color} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-0)' }}>{tunnel.tag.replace('tunnel-', '')}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: `${tc.color}15`, color: tc.color }}>{tc.label}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold" style={{
                      background: tunnel.is_active ? 'rgba(34,197,94,.1)' : 'rgba(255,255,255,.03)',
                      color: tunnel.is_active ? 'var(--success)' : 'var(--text-3)',
                    }}>{tunnel.is_active ? 'active' : 'off'}</span>
                  </div>
                  <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{tunnel.protocol} · created {new Date(tunnel.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-0.5">
                  <button onClick={() => toggle(tunnel.id)} className="p-1.5 rounded-lg hover:opacity-60"><Power size={13} color={tunnel.is_active ? 'var(--success)' : 'var(--text-3)'} /></button>
                  <button onClick={() => del(tunnel.id)} className="p-1.5 rounded-lg hover:opacity-60"><Trash size={13} color="var(--danger)" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="glass-card p-4 mt-5">
        <div className="flex items-start gap-2">
          <Globe size={14} color="var(--accent-1)" className="mt-0.5 flex-shrink-0" />
          <div className="grid md:grid-cols-4 gap-3 text-[10px]" style={{ color: 'var(--text-2)' }}>
            <div><span className="font-bold" style={{ color: 'var(--accent-1)' }}>Direct:</span> Forward local ports → remote (Panel→Panel)</div>
            <div><span className="font-bold" style={{ color: 'var(--accent-2)' }}>Reverse:</span> Remote → this panel</div>
            <div><span className="font-bold" style={{ color: 'var(--accent-3)' }}>Relay:</span> Middleman between endpoints</div>
            <div><span className="font-bold" style={{ color: 'var(--success)' }}>WARP:</span> Cloudflare clean IP (IPv4/IPv6)</div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <form onSubmit={handleCreate} className="glass-card w-full max-w-xl p-6 mx-4 animate-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-0)' }}><TunnelIcon size={16} color="var(--accent-1)" /> Create Tunnel</h2>
              <button type="button" onClick={() => setShowCreate(false)} style={{ color: 'var(--text-3)' }}>×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] mb-2 block font-medium" style={{ color: 'var(--text-2)' }}>Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(typeConfig) as [TunnelType, any][]).map(([k, v]) => (
                    <button key={k} type="button" onClick={() => setType(k)}
                      className="p-2 rounded-xl text-center transition-all"
                      style={{ background: type === k ? `${v.color}12` : 'var(--bg-glass)', border: `1.5px solid ${type === k ? v.color : 'var(--border)'}` }}>
                      <div className="text-[11px] font-bold" style={{ color: type === k ? v.color : 'var(--text-3)' }}>{v.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="text-[11px] mb-1 block" style={{ color: 'var(--text-2)' }}>Name *</label>
                <input name="name" required className="input-field !text-sm" placeholder="e.g. IR to DE" /></div>
              {type === 'warp' ? (
                <div className="p-3 rounded-xl space-y-3" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2"><Zap size={14} color="var(--success)" /><span className="text-xs font-bold" style={{ color: 'var(--success)' }}>WARP Config</span></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] mb-1 block" style={{ color: 'var(--text-3)' }}>Endpoint</label><input name="warp_endpoint" className="input-field !text-xs" defaultValue="engage.cloudflareclient.com:2408" /></div>
                    <div><label className="text-[10px] mb-1 block" style={{ color: 'var(--text-3)' }}>MTU</label><input name="warp_mtu" type="number" className="input-field !text-xs" defaultValue={1420} /></div>
                  </div>
                  <div><label className="text-[10px] mb-1 block" style={{ color: 'var(--text-3)' }}>Private Key</label><input name="warp_key" className="input-field !text-xs" placeholder="auto-generate" /></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[11px] mb-1 block" style={{ color: 'var(--text-2)' }}>Source</label><input name="source" className="input-field !text-sm" defaultValue="0.0.0.0" /></div>
                    <div><label className="text-[11px] mb-1 block" style={{ color: 'var(--text-2)' }}>Port</label><input name="port" type="number" className="input-field !text-sm" placeholder="443" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[11px] mb-1 block" style={{ color: 'var(--text-2)' }}>Destination</label><input name="destination" className="input-field !text-sm" placeholder="Remote IP" /></div>
                    <div><label className="text-[11px] mb-1 block" style={{ color: 'var(--text-2)' }}>Dest Port</label><input name="dest_port" type="number" className="input-field !text-sm" placeholder="443" /></div>
                  </div>
                  <div><label className="text-[11px] mb-1 block" style={{ color: 'var(--text-2)' }}>Protocol</label>
                    <select name="protocol" className="input-field !text-sm"><option value="tcp">TCP</option><option value="udp">UDP</option><option value="tcp+udp">TCP+UDP</option></select></div>
                </>
              )}
              <div><label className="text-[11px] mb-1 block" style={{ color: 'var(--text-2)' }}>Remark</label>
                <input name="remark" className="input-field !text-sm" placeholder="Description" /></div>
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
