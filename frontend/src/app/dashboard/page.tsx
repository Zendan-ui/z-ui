'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatBytes, formatUptime, formatDate, getStatusColor, cn } from '@/lib/utils';
import { Activity, Users as UsersIcon, Server, BarChart, TrendingUp, Cpu, Zap, Globe } from '@/components/ui/Icons';
import api from '@/lib/api';
import type { DashboardData, User } from '@/types';

function StatCard({ title, value, subValue, icon: Icon, gradient }: {
  title: string; value: string | number; subValue?: string; icon: React.FC<any>; gradient: string;
}) {
  return (
    <div className="stat-card animate-in">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[11px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-2)' }}>{title}</p>
          <p className="text-2xl font-extrabold mt-1" style={{ color: 'var(--text-0)' }}>{value}</p>
          {subValue && <p className="text-[11px] mt-1" style={{ color: 'var(--text-2)' }}>{subValue}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', gradient)}>
          <Icon size={18} color="var(--text-0)" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function loadDashboard() {
    try {
      const res = await api.dashboard();
      setData(res.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent-1)' }} />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-sm" style={{ color: 'var(--danger)' }}>{error || 'No data'}</p>
          <button onClick={loadDashboard} className="btn-secondary !text-sm">Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-0)' }}>Dashboard</h1>
        <p className="text-xs mt-1 flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
          System overview
          <span className="flex items-center gap-1"><span className="live-dot" /><span className="text-[9px] font-bold uppercase" style={{ color: 'var(--success)' }}>Live</span></span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Users" value={data.users.total.toLocaleString()} subValue={`${data.users.active} active`} icon={UsersIcon} gradient="bg-blue-500/10" />
        <StatCard title="Active Users" value={data.users.active.toLocaleString()} subValue={`${data.users.total > 0 ? Math.round((data.users.active / data.users.total) * 100) : 0}% of total`} icon={Activity} gradient="bg-green-500/10" />
        <StatCard title="Servers" value={data.servers} subValue={`${data.inbounds} inbounds`} icon={Server} gradient="bg-purple-500/10" />
        <StatCard title="Total Traffic" value={formatBytes(data.traffic.total)} subValue={`↑${formatBytes(data.traffic.up)} ↓${formatBytes(data.traffic.down)}`} icon={BarChart} gradient="bg-orange-500/10" />
      </div>

      {/* System info + Recent users */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent users */}
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-0)' }}>
            <UsersIcon size={16} color="var(--accent-1)" /> Recent Users
          </h3>
          {data.recent_users && data.recent_users.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left pb-2 text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-3)' }}>User</th>
                  <th className="text-left pb-2 text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-3)' }}>Status</th>
                  <th className="text-left pb-2 text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-3)' }}>Traffic</th>
                  <th className="text-left pb-2 text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-3)' }}>Expires</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_users.map((user: User) => (
                  <tr key={user.id} className="table-row">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'var(--accent-g)' }}>
                          {user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: 'var(--text-0)' }}>{user.username}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{user.email || `ID: ${user.id}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span className={cn('badge', getStatusColor(user.status))}>{user.status}</span>
                    </td>
                    <td className="py-2.5">
                      <span className="text-xs" style={{ color: 'var(--text-1)' }}>{formatBytes(user.traffic_used)}</span>
                    </td>
                    <td className="py-2.5">
                      <span className="text-xs" style={{ color: 'var(--text-2)' }}>{formatDate(user.expires_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-8 text-xs" style={{ color: 'var(--text-3)' }}>No users yet</p>
          )}
        </div>

        {/* System Info */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-0)' }}>
            <Cpu size={16} color="var(--accent-1)" /> System
          </h3>
          <div className="space-y-0">
            {[
              ['Uptime', formatUptime(data.system.uptime)],
              ['Memory', formatBytes(data.system.memory_alloc)],
              ['Goroutines', String(data.system.goroutines)],
              ['Go', data.system.go_version],
              ['Platform', `${data.system.os}/${data.system.arch}`],
              ['CPUs', String(data.system.cpus)],
              ['Version', `v${data.version}`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--text-2)' }}>{label}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-0)' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
