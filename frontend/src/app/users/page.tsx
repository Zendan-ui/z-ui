'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { cn, formatBytes, formatDate, getStatusColor, trafficPercentage, daysUntilExpiry } from '@/lib/utils';
import type { User } from '@/types';

const mockUsers: User[] = [
  { id: 1, uuid: 'u1', username: 'john_doe', email: 'john@example.com', telegram_id: 0, status: 'active', traffic_limit: 107374182400, traffic_used: 21474836480, traffic_up: 5368709120, traffic_down: 16106127360, expires_at: '2026-07-15T00:00:00Z', device_limit: 3, online_devices: 2, sub_token: 'tok1', sub_short_link: 'abc123', note: '', admin_id: 1, auto_renew: true, renew_days: 30, renew_traffic: 107374182400, tags: 'premium', created_at: '2026-01-15T10:00:00Z', updated_at: '2026-05-20T10:00:00Z' },
  { id: 2, uuid: 'u2', username: 'jane_smith', email: 'jane@example.com', telegram_id: 0, status: 'active', traffic_limit: 53687091200, traffic_used: 42949672960, traffic_up: 10737418240, traffic_down: 32212254720, expires_at: '2026-06-01T00:00:00Z', device_limit: 2, online_devices: 1, sub_token: 'tok2', sub_short_link: 'def456', note: 'VIP user', admin_id: 1, auto_renew: false, renew_days: 0, renew_traffic: 0, tags: 'vip', created_at: '2026-02-01T14:00:00Z', updated_at: '2026-05-19T14:00:00Z' },
  { id: 3, uuid: 'u3', username: 'alex_pro', email: '', telegram_id: 12345, status: 'limited', traffic_limit: 107374182400, traffic_used: 107374182400, traffic_up: 26843545600, traffic_down: 80530636800, expires_at: '2026-08-01T00:00:00Z', device_limit: 0, online_devices: 0, sub_token: 'tok3', sub_short_link: 'ghi789', note: '', admin_id: 1, auto_renew: true, renew_days: 30, renew_traffic: 107374182400, tags: '', created_at: '2026-03-01T08:00:00Z', updated_at: '2026-05-18T08:00:00Z' },
  { id: 4, uuid: 'u4', username: 'bob_user', email: 'bob@test.com', telegram_id: 0, status: 'expired', traffic_limit: 32212254720, traffic_used: 5368709120, traffic_up: 1073741824, traffic_down: 4294967296, expires_at: '2026-05-20T00:00:00Z', device_limit: 1, online_devices: 0, sub_token: 'tok4', sub_short_link: 'jkl012', note: 'Trial user', admin_id: 1, auto_renew: false, renew_days: 0, renew_traffic: 0, tags: 'trial', created_at: '2026-04-01T12:00:00Z', updated_at: '2026-05-20T12:00:00Z' },
  { id: 5, uuid: 'u5', username: 'sarah_vip', email: 'sarah@vip.com', telegram_id: 67890, status: 'disabled', traffic_limit: 0, traffic_used: 214748364800, traffic_up: 53687091200, traffic_down: 161061273600, expires_at: null, device_limit: 0, online_devices: 0, sub_token: 'tok5', sub_short_link: 'mno345', note: 'Suspended for abuse', admin_id: 1, auto_renew: false, renew_days: 0, renew_traffic: 0, tags: '', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-05-15T00:00:00Z' },
];

function CreateUserModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-lg p-6 animate-slide-up mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">➕ Create User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username *</label>
            <input type="text" className="input-field" placeholder="Enter username" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Traffic Limit (GB)</label>
              <input type="number" className="input-field" placeholder="0 = Unlimited" defaultValue={100} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Subscription Days</label>
              <input type="number" className="input-field" placeholder="30" defaultValue={30} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Device Limit</label>
              <input type="number" className="input-field" placeholder="0 = Unlimited" defaultValue={0} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="email" className="input-field" placeholder="Optional" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Inbounds</label>
            <div className="grid grid-cols-3 gap-2">
              {['VLESS-WS', 'VLESS-gRPC', 'VMess-WS', 'Trojan-WS', 'Hysteria2', 'TUIC'].map((inb) => (
                <label key={inb} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:border-neon-blue/50 transition-colors">
                  <input type="checkbox" defaultChecked className="accent-neon-blue" />
                  <span className="text-xs">{inb}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-neon-blue" />
              <span className="text-sm">Auto Renew</span>
            </label>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Note</label>
            <textarea className="input-field h-20 resize-none" placeholder="Optional note..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Create User</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const filteredUsers = mockUsers.filter(u => {
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (search && !u.username.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage users, subscriptions, and traffic</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          ➕ Create User
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: mockUsers.length, color: 'text-white' },
          { label: 'Active', value: mockUsers.filter(u => u.status === 'active').length, color: 'text-green-400' },
          { label: 'Limited', value: mockUsers.filter(u => u.status === 'limited').length, color: 'text-yellow-400' },
          { label: 'Expired', value: mockUsers.filter(u => u.status === 'expired').length, color: 'text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'disabled', 'expired', 'limited'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  statusFilter === s
                    ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                )}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/5">
                <th className="px-6 py-4 font-medium">
                  <input
                    type="checkbox"
                    className="accent-neon-blue"
                    onChange={(e) => setSelectedUsers(e.target.checked ? filteredUsers.map(u => u.id) : [])}
                  />
                </th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Traffic</th>
                <th className="px-6 py-4 font-medium">Expires</th>
                <th className="px-6 py-4 font-medium">Devices</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const pct = trafficPercentage(user.traffic_used, user.traffic_limit);
                const days = daysUntilExpiry(user.expires_at);

                return (
                  <tr key={user.id} className="table-row">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="accent-neon-blue"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedUsers([...selectedUsers, user.id]);
                          else setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center text-white font-bold">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.email || `ID: ${user.id}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('badge', getStatusColor(user.status))}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="min-w-[150px]">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{formatBytes(user.traffic_used)}</span>
                          <span className="text-gray-500">
                            {user.traffic_limit > 0 ? formatBytes(user.traffic_limit) : '♾️'}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-gradient-to-r from-neon-blue to-neon-purple'
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm">{formatDate(user.expires_at)}</p>
                        {days !== null && (
                          <p className={cn('text-xs', days <= 3 ? 'text-red-400' : days <= 7 ? 'text-yellow-400' : 'text-gray-500')}>
                            {days > 0 ? `${days} days left` : 'Expired'}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className={cn('text-sm', user.online_devices > 0 ? 'text-green-400' : 'text-gray-500')}>
                          {user.online_devices}
                        </span>
                        <span className="text-gray-500 text-sm">/</span>
                        <span className="text-sm text-gray-500">
                          {user.device_limit > 0 ? user.device_limit : '♾️'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Edit">✏️</button>
                        <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Subscription">🔗</button>
                        <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="QR Code">📱</button>
                        <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Reset Traffic">🔄</button>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-red-400" title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-white/5">
          <p className="text-sm text-gray-500">
            Showing {filteredUsers.length} of {mockUsers.length} users
          </p>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm px-3 py-1">← Prev</button>
            <button className="px-3 py-1 rounded-lg bg-neon-blue/20 text-neon-blue text-sm">1</button>
            <button className="btn-secondary text-sm px-3 py-1">Next →</button>
          </div>
        </div>
      </div>

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
    </DashboardLayout>
  );
}
