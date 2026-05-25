'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ScrollText, Search, Download } from '@/components/ui/Icons';
import { useWebSocket } from '@/hooks/useWebSocket';

type LogLevel = 'all' | 'info' | 'warning' | 'error' | 'access';
interface LogEntry { ts: string; level: string; source: string; msg: string; }

const levelColors: Record<string, string> = {
  info: 'var(--accent-1)', warning: 'var(--warning)', error: 'var(--danger)', access: 'var(--success)',
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel>('all');
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [paused, setPaused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { connected, subscribe } = useWebSocket();

  // Subscribe to live logs via WebSocket
  useEffect(() => {
    const unsub = subscribe('logs', (data: LogEntry) => {
      if (!paused) {
        setLogs(prev => [...prev.slice(-500), data]); // keep last 500
      }
    });
    return unsub;
  }, [subscribe, paused]);

  useEffect(() => {
    if (autoScroll && !paused) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length, autoScroll, paused]);

  const filtered = logs.filter(l => {
    if (filter !== 'all' && l.level !== filter) return false;
    if (search && !l.msg.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: logs.length,
    info: logs.filter(l => l.level === 'info').length,
    access: logs.filter(l => l.level === 'access').length,
    warning: logs.filter(l => l.level === 'warning').length,
    error: logs.filter(l => l.level === 'error').length,
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-2">
          <ScrollText size={20} color="var(--accent-1)" />
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-0)' }}>Logs</h1>
            <p className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
              Real-time log viewer
              {connected && !paused && <span className="flex items-center gap-1"><span className="live-dot" /><span className="text-[9px] font-bold uppercase" style={{ color: 'var(--success)' }}>Live</span></span>}
              {!connected && <span className="text-[9px] font-bold" style={{ color: 'var(--danger)' }}>Disconnected</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPaused(!paused)} className="btn-secondary !text-xs">{paused ? '▶ Resume' : '⏸ Pause'}</button>
          <button onClick={() => setLogs([])} className="btn-secondary !text-xs" style={{ color: 'var(--danger)' }}>Clear</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} color="var(--text-3)" className="absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter logs..." className="input-field !text-xs !pl-8" />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'info', 'access', 'warning', 'error'] as LogLevel[]).map(l => (
            <button key={l} onClick={() => setFilter(l)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
              style={{
                background: filter === l ? (l === 'all' ? 'var(--accent-g)' : `${levelColors[l]}18`) : 'var(--bg-glass)',
                color: filter === l ? (l === 'all' ? '#fff' : levelColors[l]) : 'var(--text-3)',
                border: `1px solid ${filter === l && l !== 'all' ? levelColors[l] : 'var(--border)'}`,
              }}>
              {l.toUpperCase()} ({counts[l]})
            </button>
          ))}
        </div>
      </div>

      {/* Log output */}
      <div className="glass-card p-4 font-mono text-xs overflow-auto" style={{ maxHeight: 'calc(100vh - 260px)', background: 'rgba(0,0,0,0.4)' }}>
        {filtered.length === 0 ? (
          <p className="text-center py-16" style={{ color: 'var(--text-3)' }}>
            {logs.length === 0 ? 'Waiting for log entries...' : 'No matching entries'}
          </p>
        ) : (
          filtered.map((log, i) => (
            <div key={i} className="flex gap-3 py-1 hover:opacity-80" style={{ borderBottom: '1px solid rgba(255,255,255,0.015)' }}>
              <span style={{ color: 'var(--text-3)', minWidth: 140, flexShrink: 0 }}>{log.ts}</span>
              <span className="font-bold uppercase" style={{ color: levelColors[log.level] || 'var(--text-2)', minWidth: 55 }}>[{log.level}]</span>
              <span style={{ color: 'var(--accent-2)', minWidth: 60 }}>[{log.source}]</span>
              <span style={{ color: log.level === 'error' ? 'var(--danger)' : 'var(--text-1)', wordBreak: 'break-all' }}>{log.msg}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex justify-between mt-3">
        <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{filtered.length} entries</span>
        <label className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-2)' }}>
          <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} className="accent-[var(--accent-1)]" /> Auto-scroll
        </label>
      </div>
    </DashboardLayout>
  );
}
