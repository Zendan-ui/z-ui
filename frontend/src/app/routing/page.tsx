'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const mockRules = [
  { id: 1, name: 'Block Iran Ads', type: 'geosite', condition: 'category-ads-ir', action: 'block', active: true, priority: 1 },
  { id: 2, name: 'Direct Iran Sites', type: 'geosite', condition: 'ir', action: 'direct', active: true, priority: 2 },
  { id: 3, name: 'Direct Iran IPs', type: 'geoip', condition: 'ir', action: 'direct', active: true, priority: 3 },
  { id: 4, name: 'Block BitTorrent', type: 'protocol', condition: 'bittorrent', action: 'block', active: true, priority: 4 },
  { id: 5, name: 'Block Quic', type: 'protocol', condition: 'quic', action: 'block', active: false, priority: 5 },
  { id: 6, name: 'Direct Private IPs', type: 'ip', condition: 'geoip:private', action: 'direct', active: true, priority: 6 },
  { id: 7, name: 'Russia Direct', type: 'geosite', condition: 'ru', action: 'direct', active: false, priority: 7 },
  { id: 8, name: 'China Block', type: 'geosite', condition: 'cn', action: 'block', active: false, priority: 8 },
];

const actionColors: Record<string, string> = { direct: 'var(--success)', block: 'var(--danger)', proxy: 'var(--accent-1)', outbound: 'var(--accent-2)' };
const typeIcons: Record<string, string> = { geosite: '🌐', geoip: '📍', ip: '🔢', protocol: '📡', domain: '🏷️' };

function RuleModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-card w-full max-w-lg p-6 mx-4 animate-in">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold" style={{ color: 'var(--text-0)' }}>🔀 Add Routing Rule</h2>
          <button onClick={onClose} style={{ color: 'var(--text-3)' }} className="text-lg">×</button>
        </div>
        <div className="space-y-4">
          <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-2)' }}>Rule Name</label><input className="input-field !text-sm" placeholder="e.g. Block Ads" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-2)' }}>Type</label>
              <select className="input-field !text-sm"><option>GeoSite</option><option>GeoIP</option><option>IP Range</option><option>Domain</option><option>Protocol</option></select>
            </div>
            <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-2)' }}>Action</label>
              <select className="input-field !text-sm"><option>Direct</option><option>Block</option><option>Proxy</option><option>Outbound</option></select>
            </div>
          </div>
          <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-2)' }}>Condition</label><input className="input-field !text-sm" placeholder="e.g. ir, cn, category-ads" /></div>
          <div><label className="text-xs mb-1 block" style={{ color: 'var(--text-2)' }}>Priority</label><input type="number" className="input-field !text-sm w-24" defaultValue={1} /></div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1 !text-sm">Cancel</button>
            <button className="btn-primary flex-1 !text-sm">✓ Add Rule</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoutingPage() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-0)' }}>Routing Rules</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>
            GeoIP, GeoSite, Protocol & Smart routing · {mockRules.filter(r => r.active).length} active rules
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary !text-sm">📥 Update Geo Files</button>
          <button onClick={() => setShowAdd(true)} className="btn-primary !text-sm">➕ Add Rule</button>
        </div>
      </div>

      {/* Rules list */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Priority</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Rule</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Type</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Condition</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Action</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {mockRules.map(rule => (
              <tr key={rule.id} className="table-row" style={{ opacity: rule.active ? 1 : 0.45 }}>
                <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-3)' }}>#{rule.priority}</td>
                <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-0)' }}>{rule.name}</td>
                <td className="px-4 py-3">
                  <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-2)' }}>
                    {typeIcons[rule.type] || '📄'} {rule.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <code className="text-[11px] px-2 py-0.5 rounded" style={{ background: 'var(--bg-glass)', color: 'var(--accent-1)' }}>{rule.condition}</code>
                </td>
                <td className="px-4 py-3">
                  <span className="badge" style={{ background: `${actionColors[rule.action]}15`, color: actionColors[rule.action] }}>
                    {rule.action}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="badge" style={{
                    background: rule.active ? 'rgba(34,197,94,.1)' : 'rgba(255,255,255,.03)',
                    color: rule.active ? 'var(--success)' : 'var(--text-3)',
                  }}>{rule.active ? '● on' : '● off'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1 rounded hover:opacity-70 text-xs">⏻</button>
                    <button className="p-1 rounded hover:opacity-70 text-xs">✏️</button>
                    <button className="p-1 rounded hover:opacity-70 text-xs" style={{ color: 'var(--danger)' }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <RuleModal onClose={() => setShowAdd(false)} />}
    </DashboardLayout>
  );
}
