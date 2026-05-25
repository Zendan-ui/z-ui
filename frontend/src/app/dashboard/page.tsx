'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatBytes, formatUptime, formatDate, getStatusColor, cn } from '@/lib/utils';
import { Activity, Users as UsersIcon, Server, BarChart, Cpu, Globe, Zap } from '@/components/ui/Icons';
import { useLangStore } from '@/store/language';
import api from '@/lib/api';
import type { DashboardData, User } from '@/types';

function ProgressRing({ value, size = 60, stroke = 5, color }: { value: number; size?: number; stroke?: number; color: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLangStore();

  useEffect(() => {
    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, []);

  async function load() {
    try { const r = await api.dashboard(); setData(r.data); setError(''); }
    catch (e: any) { setError(e.response?.data?.error || t('dashboard.failedToLoad')); }
    finally { setLoading(false); }
  }

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-[60vh]"><div className="spinner" /></div></DashboardLayout>;
  if (error || !data) return <DashboardLayout><div className="empty"><p className="cerr">{error}</p><button onClick={load} className="btn-secondary mt-4 text-sm">{t('common.retry')}</button></div></DashboardLayout>;

  const cpu = data.system.cpu_usage || 0;
  const mem = data.system.mem_percent || 0;
  const disk = data.system.disk_percent || 0;

  return (
    <DashboardLayout>
      <div className="mb-5">
        <h1 className="text-xl font-extrabold c0">{t('dashboard.title')}</h1>
        <p className="text-xs mt-1 c2 flex items-center gap-2">
          {data.system.hostname || t('dashboard.systemOverview')}
          <span className="flex items-center gap-1"><span className="live-dot" /><span className="text-[9px] font-bold uppercase cok">{t('dashboard.live')}</span></span>
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 mb-5">
        {[
          { title: t('dashboard.totalUsers'), val: data.users.total, sub: `${data.users.active} ${t('common.active').toLowerCase()}`, I: UsersIcon, color: 'var(--accent-1)' },
          { title: t('dashboard.onlineNow'), val: data.users.online || 0, sub: `${data.users.total > 0 ? Math.round(((data.users.online||0) / data.users.total) * 100) : 0}%`, I: Activity, color: 'var(--success)' },
          { title: t('dashboard.totalServers'), val: data.servers, sub: `${data.inbounds} ${t('common.inbounds').toLowerCase()}`, I: Server, color: 'var(--accent-2)' },
          { title: t('dashboard.totalTraffic'), val: formatBytes(data.traffic.total), sub: `↑${formatBytes(data.traffic.up)} ↓${formatBytes(data.traffic.down)}`, I: BarChart, color: 'var(--warning)' },
          { title: t('dashboard.uptime'), val: formatUptime(data.system.uptime), sub: data.system.go_version, I: Zap, color: 'var(--accent-3)' },
        ].map((c, i) => (
          <div key={i} className="stat-card animate-in" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold c3">{c.title}</p>
                <p className="text-xl font-extrabold c0 mt-1">{c.val}</p>
                <p className="text-[10px] c2 mt-0.5">{c.sub}</p>
              </div>
              <c.I size={18} color={c.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Hardware monitors + Users */}
      <div className="grid lg:grid-cols-4 gap-4 mb-5">
        {/* CPU */}
        <div className="glass-card p-4 text-center animate-in" style={{ animationDelay: '200ms' }}>
          <div className="relative inline-flex items-center justify-center">
            <ProgressRing value={cpu} size={80} stroke={6} color={cpu > 80 ? 'var(--danger)' : cpu > 50 ? 'var(--warning)' : 'var(--accent-1)'} />
            <span className="absolute text-lg font-extrabold c0">{cpu.toFixed(0)}%</span>
          </div>
          <p className="text-xs font-bold c0 mt-2">CPU</p>
          <p className="text-[10px] c3">{data.system.cpus} cores</p>
          {data.system.load_avg && <p className="text-[9px] c3 mt-1">Load: {data.system.load_avg.map(l => l.toFixed(1)).join(' / ')}</p>}
        </div>

        {/* Memory */}
        <div className="glass-card p-4 text-center animate-in" style={{ animationDelay: '250ms' }}>
          <div className="relative inline-flex items-center justify-center">
            <ProgressRing value={mem} size={80} stroke={6} color={mem > 80 ? 'var(--danger)' : mem > 60 ? 'var(--warning)' : 'var(--accent-2)'} />
            <span className="absolute text-lg font-extrabold c0">{mem.toFixed(0)}%</span>
          </div>
          <p className="text-xs font-bold c0 mt-2">{t('dashboard.memory')}</p>
          <p className="text-[10px] c3">{formatBytes(data.system.mem_used || 0)} / {formatBytes(data.system.mem_total || 0)}</p>
        </div>

        {/* Disk */}
        <div className="glass-card p-4 text-center animate-in" style={{ animationDelay: '300ms' }}>
          <div className="relative inline-flex items-center justify-center">
            <ProgressRing value={disk} size={80} stroke={6} color={disk > 90 ? 'var(--danger)' : disk > 70 ? 'var(--warning)' : 'var(--success)'} />
            <span className="absolute text-lg font-extrabold c0">{disk > 0 ? disk.toFixed(0) + '%' : 'N/A'}</span>
          </div>
          <p className="text-xs font-bold c0 mt-2">Disk</p>
          <p className="text-[10px] c3">{data.system.os}/{data.system.arch}</p>
        </div>

        {/* Quick info */}
        <div className="glass-card p-4 animate-in" style={{ animationDelay: '350ms' }}>
          <p className="text-xs font-bold c0 mb-2"><Cpu size={13} className="inline ca" /> {t('dashboard.systemInfo')}</p>
          {[
            [t('dashboard.goroutines'), String(data.system.goroutines)],
            ['Go', data.system.go_version],
            ['Alloc', formatBytes(data.system.memory_alloc)],
            [t('common.version'), `v${data.version}`],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between py-1.5 bb last:border-0">
              <span className="text-[10px] c3">{l}</span><span className="text-[10px] font-semibold c0">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent users */}
      <div className="glass-card p-5 animate-in" style={{ animationDelay: '400ms' }}>
        <h3 className="text-sm font-bold c0 mb-3 flex items-center gap-2"><UsersIcon size={15} className="ca" /> {t('dashboard.recentUsers')}</h3>
        {data.recent_users?.length ? (
          <table className="w-full">
            <thead><tr className="bb">
              <th className="tbl-head">{t('users.username')}</th>
              <th className="tbl-head">{t('common.status')}</th>
              <th className="tbl-head">{t('users.traffic')}</th>
              <th className="tbl-head">{t('users.expiresAt')}</th>
            </tr></thead>
            <tbody>
              {data.recent_users.map((u: User) => (
                <tr key={u.id} className="table-row">
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-[10px] font-bold text-white">{u.username[0].toUpperCase()}</div>
                      <div><p className="text-xs font-semibold c0">{u.username}</p><p className="text-[9px] c3">{u.email || `#${u.id}`}</p></div>
                    </div>
                  </td>
                  <td className="py-2 px-3"><span className={cn('badge', getStatusColor(u.status))}>{u.status}</span></td>
                  <td className="py-2 px-3 text-xs c1">{formatBytes(u.traffic_used)} {u.traffic_limit > 0 ? `/ ${formatBytes(u.traffic_limit)}` : ''}</td>
                  <td className="py-2 px-3 text-xs c2">{formatDate(u.expires_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="empty">{t('dashboard.noUsersYet')}</p>}
      </div>
    </DashboardLayout>
  );
}
