'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { GitBranch, Plus, Trash, Power, Edit } from '@/components/ui/Icons';
import api from '@/lib/api';

interface Rule { id: number; uuid: string; name: string; priority: number; type: string; condition: string; action: string; is_active: boolean; }

const actionColors: Record<string, string> = { direct: 'var(--success)', block: 'var(--danger)', proxy: 'var(--accent-1)', outbound: 'var(--accent-2)' };

export default function RoutingPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Routing rules come from system settings or a dedicated endpoint
      const res = await api.getSettings();
      // Parse routing rules from settings if available
      const raw = res.data?.routing_rules;
      if (raw) setRules(JSON.parse(raw));
      else setRules([]);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-2">
          <GitBranch size={20} color="var(--accent-1)" />
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-0)' }}>Routing Rules</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>GeoIP, GeoSite, Protocol routing</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary !text-sm">Update Geo Files</button>
          <button className="btn-primary !text-sm"><span className="flex items-center gap-1.5"><Plus size={14} /> Add Rule</span></button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent-1)' }} /></div>
      ) : rules.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <GitBranch size={40} color="var(--text-3)" className="mx-auto mb-3" />
          <p className="text-sm mb-2" style={{ color: 'var(--text-3)' }}>No routing rules configured</p>
          <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>Routing rules are managed via Xray configuration. Add rules to control traffic flow.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['#', 'Rule', 'Type', 'Condition', 'Action', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule.id} className="table-row" style={{ opacity: rule.is_active ? 1 : 0.4 }}>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-3)' }}>#{rule.priority}</td>
                  <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-0)' }}>{rule.name}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{rule.type}</td>
                  <td className="px-4 py-3"><code className="text-[11px] px-2 py-0.5 rounded" style={{ background: 'var(--bg-glass)', color: 'var(--accent-1)' }}>{rule.condition}</code></td>
                  <td className="px-4 py-3"><span className="badge" style={{ background: `${actionColors[rule.action] || 'var(--text-3)'}15`, color: actionColors[rule.action] || 'var(--text-3)' }}>{rule.action}</span></td>
                  <td className="px-4 py-3"><span className="badge" style={{ background: rule.is_active ? 'rgba(34,197,94,.1)' : 'rgba(255,255,255,.03)', color: rule.is_active ? 'var(--success)' : 'var(--text-3)' }}>{rule.is_active ? 'on' : 'off'}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-0.5"><button className="p-1 hover:opacity-60"><Power size={12} /></button><button className="p-1 hover:opacity-60" style={{ color: 'var(--danger)' }}><Trash size={12} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
