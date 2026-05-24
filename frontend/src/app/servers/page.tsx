'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { cn, formatBytes, formatUptime } from '@/lib/utils';

const mockServers = [
  { id: 1, name: 'US-East-1', host: '45.33.32.156', status: 'online', location: 'New York, US', country_code: 'US', isp: 'DigitalOcean', cpu: 45, memory: 62, disk: 38, uptime: 2592000, network_in: 1099511627776, network_out: 3298534883328, xray_version: '1.8.24', singbox_version: '1.9.7', type: 'master', weight: 1, users: 245 },
  { id: 2, name: 'DE-Frankfurt-1', host: '185.220.101.34', status: 'online', location: 'Frankfurt, DE', country_code: 'DE', isp: 'Hetzner', cpu: 32, memory: 48, disk: 22, uptime: 1728000, network_in: 549755813888, network_out: 1649267441664, xray_version: '1.8.24', singbox_version: '1.9.7', type: 'node', weight: 2, users: 312 },
  { id: 3, name: 'NL-Amsterdam-1', host: '95.179.241.87', status: 'online', location: 'Amsterdam, NL', country_code: 'NL', isp: 'Vultr', cpu: 78, memory: 85, disk: 56, uptime: 864000, network_in: 824633720832, network_out: 2473901162496, xray_version: '1.8.24', singbox_version: '1.9.7', type: 'node', weight: 1, users: 189 },
  { id: 4, name: 'FI-Helsinki-1', host: '185.112.83.42', status: 'offline', location: 'Helsinki, FI', country_code: 'FI', isp: 'Creanova', cpu: 0, memory: 0, disk: 0, uptime: 0, network_in: 0, network_out: 0, xray_version: '1.8.23', singbox_version: '1.9.6', type: 'node', weight: 1, users: 0 },
  { id: 5, name: 'UK-London-1', host: '51.89.42.156', status: 'online', location: 'London, UK', country_code: 'GB', isp: 'OVH', cpu: 55, memory: 71, disk: 45, uptime: 3456000, network_in: 1374389534720, network_out: 4123168604160, xray_version: '1.8.24', singbox_version: '1.9.7', type: 'node', weight: 3, users: 456 },
];

const flags: Record<string, string> = { US: '🇺🇸', DE: '🇩🇪', NL: '🇳🇱', FI: '🇫🇮', GB: '🇬🇧', TR: '🇹🇷', FR: '🇫🇷', CA: '🇨🇦', JP: '🇯🇵', SG: '🇸🇬' };

function ProgressBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
      <div className={cn('h-full rounded-full transition-all duration-1000', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function ServersPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const onlineCount = mockServers.filter(s => s.status === 'online').length;
  const totalUsers = mockServers.reduce((s, sv) => s + sv.users, 0);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Server Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {onlineCount}/{mockServers.length} servers online • {totalUsers} total users
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-xl overflow-hidden border border-white/10">
            <button onClick={() => setViewMode('grid')} className={cn('px-3 py-2 text-sm', viewMode === 'grid' ? 'bg-neon-blue/20 text-neon-blue' : 'text-gray-400')}>Grid</button>
            <button onClick={() => setViewMode('list')} className={cn('px-3 py-2 text-sm', viewMode === 'list' ? 'bg-neon-blue/20 text-neon-blue' : 'text-gray-400')}>List</button>
          </div>
          <button className="btn-primary">➕ Add Server</button>
        </div>
      </div>

      {/* Server Grid */}
      <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4')}>
        {mockServers.map((server) => (
          <div key={server.id} className={cn(
            'glass-card-hover p-6 relative overflow-hidden',
            server.status === 'offline' && 'opacity-60'
          )}>
            {/* Status indicator */}
            <div className={cn(
              'absolute top-0 right-0 w-20 h-20 rounded-bl-full',
              server.status === 'online' ? 'bg-green-500/10' : 'bg-red-500/10'
            )} />

            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{flags[server.country_code] || '🌍'}</span>
                <div>
                  <h3 className="font-semibold">{server.name}</h3>
                  <p className="text-xs text-gray-500">{server.host} • {server.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  server.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                )} />
                <span className={cn(
                  'badge text-xs',
                  server.status === 'online' ? 'badge-success' : 'badge-danger'
                )}>
                  {server.status}
                </span>
              </div>
            </div>

            {server.status === 'online' ? (
              <>
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">CPU</span>
                      <span className={cn(server.cpu > 80 ? 'text-red-400' : server.cpu > 60 ? 'text-yellow-400' : 'text-green-400')}>
                        {server.cpu}%
                      </span>
                    </div>
                    <ProgressBar value={server.cpu} color={server.cpu > 80 ? 'bg-red-500' : server.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Memory</span>
                      <span className={cn(server.memory > 80 ? 'text-red-400' : 'text-blue-400')}>{server.memory}%</span>
                    </div>
                    <ProgressBar value={server.memory} color="bg-gradient-to-r from-neon-blue to-neon-purple" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Disk</span>
                      <span>{server.disk}%</span>
                    </div>
                    <ProgressBar value={server.disk} color="bg-gradient-to-r from-purple-500 to-pink-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="text-gray-400">Users:</span> <span className="font-medium">{server.users}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="text-gray-400">Uptime:</span> <span className="font-medium">{formatUptime(server.uptime)}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="text-gray-400">↓</span> <span className="font-medium">{formatBytes(server.network_in)}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="text-gray-400">↑</span> <span className="font-medium">{formatBytes(server.network_out)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                  <span className="px-2 py-0.5 rounded bg-white/5">Xray {server.xray_version}</span>
                  <span className="px-2 py-0.5 rounded bg-white/5">SB {server.singbox_version}</span>
                  <span className={cn('px-2 py-0.5 rounded', server.type === 'master' ? 'bg-neon-purple/20 text-neon-purple' : 'bg-white/5')}>
                    {server.type}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Server is offline</p>
                <button className="btn-secondary text-sm mt-3">🔄 Reconnect</button>
              </div>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
              <button className="btn-secondary text-xs flex-1">⚙️ Configure</button>
              <button className="btn-secondary text-xs flex-1">📊 Details</button>
              <button className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors text-xs">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
