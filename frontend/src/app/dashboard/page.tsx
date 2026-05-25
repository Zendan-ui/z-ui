'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatBytes, formatUptime, formatDate, getStatusColor, cn } from '@/lib/utils';
import { Activity, Users as UsersIcon, Server, BarChart, Cpu } from '@/components/ui/Icons';
import api from '@/lib/api';
import type { DashboardData, User } from '@/types';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, []);

  async function load() {
    try { const r = await api.dashboard(); setData(r.data); setError(''); }
    catch (e: any) { setError(e.response?.data?.error || 'Failed to load'); }
    finally { setLoading(false); }
  }

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-[60vh]"><div className="spinner" /></div></DashboardLayout>;
  if (error || !data) return <DashboardLayout><div className="empty"><p className="cerr">{error || 'No data'}</p><button onClick={load} className="btn-secondary mt-4 text-sm">Retry</button></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold c0">Dashboard</h1>
        <p className="text-xs mt-1 c2 flex items-center gap-2">System overview <span className="flex items-center gap-1"><span className="live-dot" /><span className="text-[9px] font-bold uppercase cok">Live</span></span></p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { t: 'Total Users', v: data.users.total.toLocaleString(), s: `${data.users.active} active`, I: UsersIcon },
          { t: 'Active', v: data.users.active.toLocaleString(), s: `${data.users.total > 0 ? Math.round((data.users.active / data.users.total) * 100) : 0}%`, I: Activity },
          { t: 'Servers', v: data.servers, s: `${data.inbounds} inbounds`, I: Server },
          { t: 'Traffic', v: formatBytes(data.traffic.total), s: `↑${formatBytes(data.traffic.up)} ↓${formatBytes(data.traffic.down)}`, I: BarChart },
        ].map((c, i) => (
          <div key={i} className="stat-card animate-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-medium c2">{c.t}</p>
                <p className="text-2xl font-extrabold c0 mt-1">{c.v}</p>
                <p className="text-[11px] c2 mt-1">{c.s}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-g"><c.I size={18} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-card p-5 animate-in" style={{ animationDelay: '200ms' }}>
          <h3 className="text-sm font-bold c0 mb-4 flex items-center gap-2"><UsersIcon size={16} className="ca" /> Recent Users</h3>
          {data.recent_users?.length ? (
            <table className="w-full">
              <thead><tr className="bb"><th className="tbl-head">User</th><th className="tbl-head">Status</th><th className="tbl-head">Traffic</th><th className="tbl-head">Expires</th></tr></thead>
              <tbody>
                {data.recent_users.map((u: User) => (
                  <tr key={u.id} className="table-row">
                    <td className="py-2.5 px-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-[10px] font-bold text-white">{u.username[0].toUpperCase()}</div><div><p className="text-xs font-semibold c0">{u.username}</p><p className="text-[10px] c3">{u.email || `#${u.id}`}</p></div></div></td>
                    <td className="py-2.5 px-3"><span className={cn('badge', getStatusColor(u.status))}>{u.status}</span></td>
                    <td className="py-2.5 px-3 text-xs c1">{formatBytes(u.traffic_used)}</td>
                    <td className="py-2.5 px-3 text-xs c2">{formatDate(u.expires_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="empty">No users yet</p>}
        </div>

        <div className="glass-card p-5 animate-in" style={{ animationDelay: '300ms' }}>
          <h3 className="text-sm font-bold c0 mb-4 flex items-center gap-2"><Cpu size={16} className="ca" /> System</h3>
          {[
            ['Uptime', formatUptime(data.system.uptime)],
            ['Memory', formatBytes(data.system.memory_alloc)],
            ['Goroutines', String(data.system.goroutines)],
            ['Go', data.system.go_version],
            ['OS', `${data.system.os}/${data.system.arch}`],
            ['CPUs', String(data.system.cpus)],
            ['Version', `v${data.version}`],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between py-2 bb last:border-0">
              <span className="text-xs c2">{l}</span>
              <span className="text-xs font-semibold c0">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
