'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { cn, formatBytes, formatDate, getStatusColor, trafficPercentage, daysUntilExpiry } from '@/lib/utils';
import { Plus, Edit, Trash, Link, RefreshCw, Power, Search, Filter, Users as UsersIcon } from '@/components/ui/Icons';
import api from '@/lib/api';
import type { User } from '@/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, disabled: 0, expired: 0, limited: 0 });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), page_size: '20' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.getUsers(params);
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch {} finally { setLoading(false); }
  }, [page, search, statusFilter]);

  const loadStats = useCallback(async () => {
    try {
      const res = await api.getUserStats();
      setStats(res.data);
    } catch {}
  }, []);

  useEffect(() => { loadUsers(); loadStats(); }, [loadUsers, loadStats]);

  const handleAction = async (action: string, userId: number) => {
    try {
      switch (action) {
        case 'suspend': await api.suspendUser(userId); break;
        case 'activate': await api.activateUser(userId); break;
        case 'reset-traffic': await api.resetTraffic(userId); break;
        case 'delete':
          if (!confirm('Delete this user?')) return;
          await api.deleteUser(userId); break;
        case 'revoke-sub': await api.revokeSubscription(userId); break;
      }
      loadUsers();
      loadStats();
    } catch {}
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api.createUser({
        username: form.get('username'),
        email: form.get('email'),
        traffic_limit: Number(form.get('traffic_limit')) * 1024 * 1024 * 1024,
        device_limit: Number(form.get('device_limit')) || 0,
        expires_at: form.get('expires_at') ? new Date(form.get('expires_at') as string).toISOString() : undefined,
        note: form.get('note'),
      });
      setShowCreate(false);
      loadUsers();
      loadStats();
    } catch {}
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <UsersIcon size={20} color="var(--accent-1)" />
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-0)' }}>User Management</h1>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>{total} users total</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary !text-sm">
          <span className="flex items-center gap-1.5"><Plus size={14} /> Create User</span>
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Total', value: stats.total, color: 'var(--text-0)' },
          { label: 'Active', value: stats.active, color: 'var(--success)' },
          { label: 'Disabled', value: stats.disabled, color: 'var(--danger)' },
          { label: 'Expired', value: stats.expired, color: 'var(--warning)' },
          { label: 'Limited', value: stats.limited, color: 'var(--info)' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 text-center cursor-pointer" onClick={() => setStatusFilter(s.label === 'Total' ? '' : s.label.toLowerCase())}>
            <p className="text-lg font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & filter */}
      <div className="glass-card p-3 mb-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} color="var(--text-3)" className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search users..." className="input-field !text-xs !pl-9" />
          </div>
          <div className="flex gap-1.5">
            {['', 'active', 'disabled', 'expired', 'limited'].map((s) => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  background: statusFilter === s ? 'var(--accent-g)' : 'var(--bg-glass)',
                  color: statusFilter === s ? '#fff' : 'var(--text-3)',
                  border: '1px solid var(--border)',
                }}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent-1)' }} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['User', 'Status', 'Traffic', 'Expires', 'Devices', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const pct = trafficPercentage(user.traffic_used, user.traffic_limit);
                    const days = daysUntilExpiry(user.expires_at);
                    return (
                      <tr key={user.id} className="table-row">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'var(--accent-g)' }}>
                              {user.username[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-semibold" style={{ color: 'var(--text-0)' }}>{user.username}</p>
                              <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{user.email || `ID: ${user.id}`}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('badge', getStatusColor(user.status))}>{user.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div style={{ minWidth: 120 }}>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span style={{ color: 'var(--text-1)' }}>{formatBytes(user.traffic_used)}</span>
                              <span style={{ color: 'var(--text-3)' }}>{user.traffic_limit > 0 ? formatBytes(user.traffic_limit) : '∞'}</span>
                            </div>
                            <div className="progress-bar" style={{ height: 4 }}>
                              <div className="progress-fill" style={{
                                width: `${pct}%`,
                                background: pct > 90 ? 'var(--danger)' : pct > 70 ? 'var(--warning)' : 'var(--accent-g)',
                              }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs" style={{ color: 'var(--text-1)' }}>{formatDate(user.expires_at)}</p>
                          {days !== null && (
                            <p className="text-[10px]" style={{ color: days <= 3 ? 'var(--danger)' : days <= 7 ? 'var(--warning)' : 'var(--text-3)' }}>
                              {days > 0 ? `${days}d left` : 'Expired'}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs" style={{ color: user.online_devices > 0 ? 'var(--success)' : 'var(--text-3)' }}>
                            {user.online_devices}/{user.device_limit > 0 ? user.device_limit : '∞'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-0.5">
                            <button onClick={() => handleAction('activate', user.id)} className="p-1.5 rounded-lg hover:opacity-60" title="Activate"><Power size={13} color="var(--success)" /></button>
                            <button onClick={() => handleAction('suspend', user.id)} className="p-1.5 rounded-lg hover:opacity-60" title="Suspend"><Power size={13} color="var(--warning)" /></button>
                            <button onClick={() => handleAction('reset-traffic', user.id)} className="p-1.5 rounded-lg hover:opacity-60" title="Reset Traffic"><RefreshCw size={13} color="var(--text-2)" /></button>
                            <button onClick={() => handleAction('delete', user.id)} className="p-1.5 rounded-lg hover:opacity-60" title="Delete"><Trash size={13} color="var(--danger)" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex justify-between items-center px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>Page {page} · {total} total</span>
              <div className="flex gap-1.5">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="btn-secondary !text-xs !px-3 !py-1 disabled:opacity-30">Prev</button>
                <button onClick={() => setPage(p => p + 1)} disabled={users.length < 20} className="btn-secondary !text-xs !px-3 !py-1 disabled:opacity-30">Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <form onSubmit={handleCreate} className="glass-card w-full max-w-lg p-6 mx-4 animate-in">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-0)' }}>
                <Plus size={16} color="var(--accent-1)" /> Create User
              </h2>
              <button type="button" onClick={() => setShowCreate(false)} style={{ color: 'var(--text-3)' }}>×</button>
            </div>
            <div className="space-y-4">
              <div><label className="text-[11px] mb-1 block" style={{ color: 'var(--text-2)' }}>Username *</label>
                <input name="username" required className="input-field !text-sm" placeholder="Username" /></div>
              <div><label className="text-[11px] mb-1 block" style={{ color: 'var(--text-2)' }}>Email</label>
                <input name="email" type="email" className="input-field !text-sm" placeholder="Optional" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[11px] mb-1 block" style={{ color: 'var(--text-2)' }}>Traffic (GB)</label>
                  <input name="traffic_limit" type="number" className="input-field !text-sm" placeholder="0 = unlimited" defaultValue={100} /></div>
                <div><label className="text-[11px] mb-1 block" style={{ color: 'var(--text-2)' }}>Device Limit</label>
                  <input name="device_limit" type="number" className="input-field !text-sm" placeholder="0 = unlimited" defaultValue={0} /></div>
              </div>
              <div><label className="text-[11px] mb-1 block" style={{ color: 'var(--text-2)' }}>Expiry Date</label>
                <input name="expires_at" type="date" className="input-field !text-sm" /></div>
              <div><label className="text-[11px] mb-1 block" style={{ color: 'var(--text-2)' }}>Note</label>
                <textarea name="note" className="input-field !text-sm h-16 resize-none" placeholder="Optional note" /></div>
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
