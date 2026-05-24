'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatBytes, formatUptime, formatDate, getStatusColor, cn } from '@/lib/utils';
import type { DashboardData, User } from '@/types';

// Mock data for demo
const mockDashboard: DashboardData = {
  users: { total: 1247, active: 982 },
  servers: 8,
  inbounds: 24,
  traffic: { up: 1024 * 1024 * 1024 * 450, down: 1024 * 1024 * 1024 * 1200, total: 1024 * 1024 * 1024 * 1650 },
  system: { uptime: 864000, goroutines: 142, memory_alloc: 128 * 1024 * 1024, memory_sys: 256 * 1024 * 1024, go_version: 'go1.22', os: 'linux', arch: 'amd64', cpus: 8 },
  recent_users: [
    { id: 1, uuid: '1', username: 'john_doe', email: 'john@example.com', status: 'active', traffic_used: 5368709120, traffic_limit: 107374182400, expires_at: '2026-07-15T00:00:00Z', created_at: '2026-05-20T10:00:00Z' } as User,
    { id: 2, uuid: '2', username: 'jane_smith', email: 'jane@example.com', status: 'active', traffic_used: 32212254720, traffic_limit: 53687091200, expires_at: '2026-06-01T00:00:00Z', created_at: '2026-05-19T14:00:00Z' } as User,
    { id: 3, uuid: '3', username: 'alex_pro', email: '', status: 'limited', traffic_used: 107374182400, traffic_limit: 107374182400, expires_at: '2026-08-01T00:00:00Z', created_at: '2026-05-18T08:00:00Z' } as User,
  ],
  version: '1.0.0',
};

const trafficData = [
  { time: '00:00', up: 120, down: 340 },
  { time: '04:00', up: 80, down: 200 },
  { time: '08:00', up: 200, down: 500 },
  { time: '12:00', up: 350, down: 800 },
  { time: '16:00', up: 280, down: 650 },
  { time: '20:00', up: 400, down: 900 },
  { time: '24:00', up: 180, down: 420 },
];

function StatCard({ title, value, subValue, icon, gradient }: {
  title: string;
  value: string | number;
  subValue?: string;
  icon: string;
  gradient: string;
}) {
  return (
    <div className="stat-card animate-in">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subValue && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subValue}</p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br', gradient)}>
          {icon}
        </div>
      </div>
      {/* Decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-50" style={{
        backgroundImage: `linear-gradient(to right, ${gradient.includes('blue') ? '#00d4ff' : gradient.includes('purple') ? '#7b2ff7' : gradient.includes('green') ? '#00ff88' : '#ffd700'}, transparent)`,
      }} />
    </div>
  );
}

function MiniTrafficChart() {
  const maxDown = Math.max(...trafficData.map(d => d.down));
  
  return (
    <div className="glass-card p-6 animate-in">
      <h3 className="text-lg font-semibold mb-4">📈 Traffic Overview (24h)</h3>
      <div className="flex items-end gap-2 h-40">
        {trafficData.map((point, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '120px' }}>
              <div
                className="w-full rounded-t bg-gradient-to-t from-neon-blue/60 to-neon-blue/20 transition-all duration-500"
                style={{ height: `${(point.down / maxDown) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500">{point.time}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-neon-blue" />
          <span className="text-gray-400">Download</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-neon-purple" />
          <span className="text-gray-400">Upload</span>
        </div>
      </div>
    </div>
  );
}

function ServerStatusGrid() {
  const servers = [
    { name: 'US-1 🇺🇸', status: 'online', cpu: 45, memory: 62, users: 156 },
    { name: 'DE-1 🇩🇪', status: 'online', cpu: 32, memory: 48, users: 203 },
    { name: 'NL-1 🇳🇱', status: 'online', cpu: 78, memory: 85, users: 312 },
    { name: 'FI-1 🇫🇮', status: 'offline', cpu: 0, memory: 0, users: 0 },
    { name: 'UK-1 🇬🇧', status: 'online', cpu: 55, memory: 71, users: 189 },
    { name: 'TR-1 🇹🇷', status: 'online', cpu: 23, memory: 35, users: 122 },
  ];

  return (
    <div className="glass-card p-6 animate-in">
      <h3 className="text-lg font-semibold mb-4">🖥️ Server Status</h3>
      <div className="grid grid-cols-2 gap-3">
        {servers.map((server, i) => (
          <div key={i} className={cn(
            'p-3 rounded-xl border transition-all duration-300',
            server.status === 'online' 
              ? 'border-green-500/20 bg-green-500/5 hover:bg-green-500/10' 
              : 'border-red-500/20 bg-red-500/5 opacity-60'
          )}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{server.name}</span>
              <span className={cn('w-2 h-2 rounded-full', server.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500')} />
            </div>
            {server.status === 'online' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>CPU {server.cpu}%</span>
                  <span>RAM {server.memory}%</span>
                </div>
                <div className="flex gap-1">
                  <div className="flex-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-blue rounded-full transition-all" style={{ width: `${server.cpu}%` }} />
                  </div>
                  <div className="flex-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-purple rounded-full transition-all" style={{ width: `${server.memory}%` }} />
                  </div>
                </div>
                <p className="text-xs text-gray-500">{server.users} users</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentUsersTable({ users }: { users: User[] }) {
  return (
    <div className="glass-card p-6 animate-in">
      <h3 className="text-lg font-semibold mb-4">👥 Recent Users</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
              <th className="pb-3 font-medium">User</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Traffic</th>
              <th className="pb-3 font-medium">Expires</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="table-row">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center text-white text-xs font-bold">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email || 'No email'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <span className={cn('badge', getStatusColor(user.status))}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3">
                  <div>
                    <p className="text-sm">{formatBytes(user.traffic_used)}</p>
                    <div className="w-20 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple"
                        style={{ width: `${user.traffic_limit > 0 ? Math.min(100, (user.traffic_used / user.traffic_limit) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 text-sm text-gray-500">
                  {formatDate(user.expires_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SystemInfoCard({ data }: { data: DashboardData }) {
  return (
    <div className="glass-card p-6 animate-in">
      <h3 className="text-lg font-semibold mb-4">⚡ System Info</h3>
      <div className="space-y-4">
        <InfoRow label="Uptime" value={formatUptime(data.system.uptime)} />
        <InfoRow label="Memory" value={formatBytes(data.system.memory_alloc)} />
        <InfoRow label="Goroutines" value={data.system.goroutines.toString()} />
        <InfoRow label="Go Version" value={data.system.go_version} />
        <InfoRow label="OS/Arch" value={`${data.system.os}/${data.system.arch}`} />
        <InfoRow label="CPUs" value={data.system.cpus.toString()} />
        <InfoRow label="Z-UI Version" value={`v${data.version}`} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function ProtocolDistribution() {
  const protocols = [
    { name: 'VLESS', count: 45, color: '#00d4ff' },
    { name: 'VMess', count: 25, color: '#7b2ff7' },
    { name: 'Trojan', count: 15, color: '#c471f5' },
    { name: 'Hysteria2', count: 8, color: '#ffd700' },
    { name: 'SS', count: 5, color: '#00ff88' },
    { name: 'Other', count: 2, color: '#ff4757' },
  ];
  const total = protocols.reduce((s, p) => s + p.count, 0);

  return (
    <div className="glass-card p-6 animate-in">
      <h3 className="text-lg font-semibold mb-4">📡 Protocol Distribution</h3>
      <div className="space-y-3">
        {protocols.map((p, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span>{p.name}</span>
              <span className="text-gray-500">{p.count}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${(p.count / total) * 100}%`, backgroundColor: p.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const data = mockDashboard;

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back! Here's what's happening with Z-UI.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Users"
          value={data.users.total.toLocaleString()}
          subValue={`${data.users.active} active`}
          icon="👥"
          gradient="from-blue-500/20 to-cyan-500/20"
        />
        <StatCard
          title="Active Users"
          value={data.users.active.toLocaleString()}
          subValue={`${Math.round((data.users.active / data.users.total) * 100)}% of total`}
          icon="✅"
          gradient="from-green-500/20 to-emerald-500/20"
        />
        <StatCard
          title="Servers"
          value={data.servers}
          subValue={`${data.inbounds} inbounds`}
          icon="🖥️"
          gradient="from-purple-500/20 to-pink-500/20"
        />
        <StatCard
          title="Total Traffic"
          value={formatBytes(data.traffic.total)}
          subValue={`↑ ${formatBytes(data.traffic.up)} ↓ ${formatBytes(data.traffic.down)}`}
          icon="📊"
          gradient="from-yellow-500/20 to-orange-500/20"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MiniTrafficChart />
        <ServerStatusGrid />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentUsersTable users={data.recent_users} />
        </div>
        <div className="space-y-6">
          <SystemInfoCard data={data} />
          <ProtocolDistribution />
        </div>
      </div>
    </DashboardLayout>
  );
}
