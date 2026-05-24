import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'online':
      return 'badge-success';
    case 'disabled':
    case 'offline':
      return 'badge-danger';
    case 'expired':
      return 'badge-warning';
    case 'limited':
      return 'badge-info';
    case 'error':
      return 'badge-danger';
    default:
      return 'badge-info';
  }
}

export function getProtocolColor(protocol: string): string {
  const colors: Record<string, string> = {
    vless: 'from-blue-500 to-cyan-500',
    vmess: 'from-purple-500 to-pink-500',
    trojan: 'from-red-500 to-orange-500',
    shadowsocks: 'from-green-500 to-emerald-500',
    hysteria2: 'from-yellow-500 to-amber-500',
    tuic: 'from-indigo-500 to-violet-500',
    wireguard: 'from-teal-500 to-green-500',
    socks: 'from-gray-500 to-slate-500',
    ssh: 'from-orange-500 to-red-500',
  };
  return colors[protocol] || 'from-gray-500 to-gray-600';
}

export function trafficPercentage(used: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.min(100, (used / limit) * 100);
}

export function daysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function getSubUrl(token: string): string {
  return `${window.location.origin}/sub/${token}`;
}
