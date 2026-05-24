'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast { id: number; type: ToastType; message: string; }
interface ToastCtx { toast: (type: ToastType, message: string) => void; }

const Ctx = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(Ctx);

let _id = 0;
const colors: Record<ToastType, string> = {
  success: 'var(--success)', error: 'var(--danger)', warning: 'var(--warning)', info: 'var(--accent-1)',
};
const icons: Record<ToastType, string> = { success: '✓', error: '✗', warning: '!', info: 'i' };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = ++_id;
    setToasts(p => [...p, { id, type, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div
            key={t.id}
            className="animate-slide"
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderRadius: 12, minWidth: 280,
              background: 'var(--bg-card)', backdropFilter: 'blur(20px)',
              border: `1px solid ${colors[t.type]}30`,
              boxShadow: `0 0 20px ${colors[t.type]}10`,
            }}
          >
            <span style={{
              width: 22, height: 22, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${colors[t.type]}18`, color: colors[t.type], fontSize: 11, fontWeight: 700,
            }}>{icons[t.type]}</span>
            <span style={{ fontSize: 12, color: 'var(--text-0)', flex: 1 }}>{t.message}</span>
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14 }}>×</button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
