'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

interface WSMessage { type: string; channel: string; data: any; }

export function useWebSocket(url?: string) {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const listeners = useRef<Map<string, ((data: any) => void)[]>>(new Map());

  useEffect(() => {
    const wsUrl = url || `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`;
    const connect = () => {
      ws.current = new WebSocket(wsUrl);
      ws.current.onopen = () => setConnected(true);
      ws.current.onclose = () => { setConnected(false); setTimeout(connect, 3000); };
      ws.current.onmessage = (e) => {
        try {
          const msg: WSMessage = JSON.parse(e.data);
          setLastMessage(msg);
          const cbs = listeners.current.get(msg.channel) || [];
          cbs.forEach(cb => cb(msg.data));
        } catch {}
      };
    };
    connect();
    return () => { ws.current?.close(); };
  }, [url]);

  const subscribe = useCallback((channel: string, cb: (data: any) => void) => {
    const cbs = listeners.current.get(channel) || [];
    cbs.push(cb);
    listeners.current.set(channel, cbs);
    ws.current?.send(JSON.stringify({ type: 'subscribe', channel }));
    return () => {
      const arr = listeners.current.get(channel) || [];
      listeners.current.set(channel, arr.filter(c => c !== cb));
    };
  }, []);

  const send = useCallback((type: string, data: any) => {
    ws.current?.send(JSON.stringify({ type, data }));
  }, []);

  return { connected, lastMessage, subscribe, send };
}
