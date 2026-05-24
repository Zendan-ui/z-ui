'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

type LogLevel = 'all' | 'info' | 'warning' | 'error' | 'access';

const mockLogs = [
  { ts: '2026-05-24 10:23:45', level: 'info', source: 'xray', msg: 'Xray-core 1.8.24 started' },
  { ts: '2026-05-24 10:23:46', level: 'info', source: 'api', msg: 'API server listening on :8443' },
  { ts: '2026-05-24 10:24:12', level: 'access', source: 'xray', msg: '192.168.1.100:54321 accepted tcp:google.com:443 [vless-ws-tls >> direct] email: john_doe@vless-ws-tls' },
  { ts: '2026-05-24 10:24:15', level: 'access', source: 'xray', msg: '10.0.0.50:43210 accepted tcp:telegram.org:443 [vmess-grpc >> direct] email: sarah_vip@vmess-grpc' },
  { ts: '2026-05-24 10:24:18', level: 'warning', source: 'xray', msg: 'app/proxyman/inbound: connection ends > proxy/vless/inbound: invalid request from 45.67.89.10' },
  { ts: '2026-05-24 10:24:20', level: 'access', source: 'xray', msg: '172.16.0.5:12345 accepted tcp:youtube.com:443 [trojan-ws >> direct] email: alex_pro@trojan-ws' },
  { ts: '2026-05-24 10:24:25', level: 'info', source: 'system', msg: 'Traffic sync completed: 1247 users updated' },
  { ts: '2026-05-24 10:24:30', level: 'error', source: 'node', msg: 'Connection to FI-Helsinki lost: timeout after 30s' },
  { ts: '2026-05-24 10:24:35', level: 'access', source: 'xray', msg: '192.168.2.50:8888 accepted tcp:chat.openai.com:443 [vless-reality >> direct] email: bob_user@vless-reality' },
  { ts: '2026-05-24 10:24:40', level: 'info', source: 'telegram', msg: 'Alert sent: alex_pro reached traffic limit (100GB)' },
  { ts: '2026-05-24 10:24:45', level: 'warning', source: 'system', msg: 'NL-Amsterdam CPU usage at 78% — consider scaling' },
  { ts: '2026-05-24 10:24:50', level: 'access', source: 'xray', msg: '10.10.10.1:5555 accepted udp:dns.google:443 [hysteria2 >> direct] email: jane_smith@hy2' },
  { ts: '2026-05-24 10:24:55', level: 'info', source: 'system', msg: 'Auto-renewed user: sarah_vip (30 days)' },
  { ts: '2026-05-24 10:25:00', level: 'error', source: 'xray', msg: 'app/proxyman/inbound: connection ends > context canceled' },
];

const levelColors: Record<string, string> = {
  info: 'var(--accent-1)', warning: 'var(--warning)', error: 'var(--danger)', access: 'var(--success)',
};

export default function LogsPage() {
  const [filter, setFilter] = useState<LogLevel>('all');
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [paused, setPaused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const filtered = mockLogs.filter(l => {
    if (filter !== 'all' && l.level !== filter) return false;
    if (search && !l.msg.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    if (autoScroll && !paused) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filtered.length, autoScroll, paused]);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-0)' }}>System Logs</h1>
          <p className="text-xs mt-1 flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
            Real-time log viewer
            {!paused && <span className="flex items-center gap-1"><span className="live-dot" /> <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--success)' }}>Live</span></span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPaused(!paused)} className="btn-secondary !text-xs">
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button className="btn-secondary !text-xs">📥 Export</button>
          <button className="btn-secondary !text-xs" style={{ color: 'var(--danger)' }}>🗑️ Clear</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-3)' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter logs..."
            className="input-field !text-xs !pl-8" />
        </div>
        <div className="flex gap-1.5">
          {(['all','info','access','warning','error'] as LogLevel[]).map(l => (
            <button key={l} onClick={() => setFilter(l)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
              style={{
                background: filter === l ? (l === 'all' ? 'var(--accent-g)' : `${levelColors[l]}18`) : 'var(--bg-glass)',
                color: filter === l ? (l === 'all' ? '#fff' : levelColors[l]) : 'var(--text-3)',
                border: `1px solid ${filter === l ? (l === 'all' ? 'transparent' : levelColors[l]) : 'var(--border)'}`,
              }}>
              {l.toUpperCase()} ({l === 'all' ? mockLogs.length : mockLogs.filter(x => x.level === l).length})
            </button>
          ))}
        </div>
      </div>

      {/* Log output */}
      <div className="glass-card p-4 font-mono text-xs overflow-auto" style={{ maxHeight: 'calc(100vh - 260px)', background: 'rgba(0,0,0,0.4)' }}>
        {filtered.map((log, i) => (
          <div key={i} className="flex gap-3 py-1 hover:opacity-80 transition-opacity" style={{ borderBottom: '1px solid rgba(255,255,255,0.015)' }}>
            <span style={{ color: 'var(--text-3)', minWidth: 140, flexShrink: 0 }}>{log.ts}</span>
            <span className="font-bold uppercase" style={{ color: levelColors[log.level] || 'var(--text-2)', minWidth: 55 }}>
              [{log.level}]
            </span>
            <span style={{ color: 'var(--accent-2)', minWidth: 60 }}>[{log.source}]</span>
            <span style={{ color: log.level === 'error' ? 'var(--danger)' : log.level === 'warning' ? 'var(--warning)' : 'var(--text-1)', wordBreak: 'break-all' }}>
              {log.msg}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{filtered.length} entries shown</span>
        <label className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-2)' }}>
          <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} className="accent-[var(--accent-1)]" />
          Auto-scroll
        </label>
      </div>
    </DashboardLayout>
  );
}
