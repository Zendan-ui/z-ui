'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatDate } from '@/lib/utils';
import { HardDrive, Download, Trash, RefreshCw } from '@/components/ui/Icons';
import api from '@/lib/api';

interface Backup { id: number; name: string; file_path: string; size: number; type: string; admin_id: number; created_at: string; }

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Backups endpoint (would need to be added to API)
      // For now, uses system settings as a proxy
      const res = await api.getAuditLogs(1);
      // In production: const res = await api.getBackups();
      setBackups([]);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-2">
          <HardDrive size={20} color="var(--accent-1)" />
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-0)' }}>Backups</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{backups.length} backups</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-3 mb-5">
        {[
          { icon: HardDrive, title: 'Full Backup', desc: 'Database + Configs + Certs', color: 'var(--accent-1)' },
          { icon: Download, title: 'Database Only', desc: 'Users, Proxies, Traffic', color: 'var(--accent-2)' },
          { icon: RefreshCw, title: 'Restore', desc: 'Upload & restore from file', color: 'var(--warning)' },
        ].map((b) => (
          <button key={b.title} className="glass-card p-5 text-left hover:scale-[1.01] transition-transform cursor-pointer">
            <div className="flex items-start gap-3">
              <b.icon size={20} color={b.color} />
              <div>
                <span className="font-bold text-xs" style={{ color: 'var(--text-0)' }}>{b.title}</span>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>{b.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent-1)' }} /></div>
      ) : backups.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <HardDrive size={40} color="var(--text-3)" className="mx-auto mb-3" />
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>No backups yet. Create one using the buttons above or CLI: z-ui backup</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Name', 'Type', 'Size', 'Date', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-3)' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {backups.map(bk => (
                <tr key={bk.id} className="table-row">
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-1)' }}>{bk.name}</td>
                  <td className="px-4 py-3"><span className="badge badge-info">{bk.type}</span></td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{(bk.size / 1024 / 1024).toFixed(1)} MB</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{formatDate(bk.created_at)}</td>
                  <td className="px-4 py-3"><div className="flex gap-1"><button className="p-1 hover:opacity-60"><Download size={12} /></button><button className="p-1 hover:opacity-60" style={{ color: 'var(--danger)' }}><Trash size={12} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
