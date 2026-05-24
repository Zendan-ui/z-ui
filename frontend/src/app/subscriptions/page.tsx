'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { cn, formatDate, copyToClipboard } from '@/lib/utils';

interface SubInfo {
  id: number;
  username: string;
  name: string;
  token: string;
  shortLink: string;
  format: string;
  hits: number;
  lastAccess: string | null;
  isActive: boolean;
}

const mockSubs: SubInfo[] = [
  { id: 1, username: 'john_doe', name: 'Default', token: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', shortLink: 'abc123', format: 'auto', hits: 342, lastAccess: '2026-05-24T08:30:00Z', isActive: true },
  { id: 2, username: 'jane_smith', name: 'Main Sub', token: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', shortLink: 'def456', format: 'clash', hits: 128, lastAccess: '2026-05-23T14:20:00Z', isActive: true },
  { id: 3, username: 'alex_pro', name: 'Default', token: 'c3d4e5f6-a7b8-9012-cdef-123456789012', shortLink: 'ghi789', format: 'singbox', hits: 89, lastAccess: '2026-05-22T22:10:00Z', isActive: true },
  { id: 4, username: 'bob_user', name: 'Default', token: 'd4e5f6a7-b8c9-0123-defa-234567890123', shortLink: 'jkl012', format: 'v2ray', hits: 56, lastAccess: '2026-05-20T16:00:00Z', isActive: false },
];

function QRCodeSVG({ data, size = 200 }: { data: string; size?: number }) {
  // Simple QR code placeholder using SVG pattern
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 200 200" className="rounded-xl">
        <rect width="200" height="200" fill="white" rx="12" />
        <rect x="10" y="10" width="60" height="60" fill="black" rx="4" />
        <rect x="15" y="15" width="50" height="50" fill="white" rx="2" />
        <rect x="22" y="22" width="36" height="36" fill="black" rx="2" />
        <rect x="130" y="10" width="60" height="60" fill="black" rx="4" />
        <rect x="135" y="15" width="50" height="50" fill="white" rx="2" />
        <rect x="142" y="22" width="36" height="36" fill="black" rx="2" />
        <rect x="10" y="130" width="60" height="60" fill="black" rx="4" />
        <rect x="15" y="135" width="50" height="50" fill="white" rx="2" />
        <rect x="22" y="142" width="36" height="36" fill="black" rx="2" />
        {/* Data pattern */}
        {Array.from({ length: 8 }, (_, i) =>
          Array.from({ length: 8 }, (_, j) => {
            const hash = (data.charCodeAt((i * 8 + j) % data.length) + i * j) % 3;
            if (hash === 0) return null;
            return <rect key={`${i}-${j}`} x={80 + j * 8} y={80 + i * 8} width="6" height="6" fill="black" rx="1" />;
          })
        )}
        {/* Center logo */}
        <rect x="85" y="85" width="30" height="30" fill="white" rx="6" />
        <text x="100" y="105" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#7b2ff7">Z</text>
      </svg>
    </div>
  );
}

function SubDetailModal({ sub, onClose }: { sub: SubInfo; onClose: () => void }) {
  const [copied, setCopied] = useState('');
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const subUrl = `${baseUrl}/sub/${sub.token}`;
  const shortUrl = `${baseUrl}/sub/s/${sub.shortLink}`;

  const handleCopy = async (text: string, label: string) => {
    await copyToClipboard(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const formats = [
    { name: 'Auto Detect', url: subUrl },
    { name: 'Clash Meta', url: `${subUrl}?format=clash` },
    { name: 'Sing-box', url: `${subUrl}?format=singbox` },
    { name: 'V2Ray/Xray', url: `${subUrl}?format=v2ray` },
    { name: 'JSON', url: `${subUrl}?format=json` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-2xl p-6 animate-slide-up mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            📦 Subscription — {sub.username}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <QRCodeSVG data={subUrl} size={200} />
            <p className="text-sm text-gray-400 mt-3">Scan with proxy client</p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Subscription Link</label>
              <div className="flex gap-2">
                <input type="text" value={subUrl} readOnly className="input-field text-xs flex-1" />
                <button
                  onClick={() => handleCopy(subUrl, 'sub')}
                  className={cn('btn-secondary text-sm whitespace-nowrap', copied === 'sub' && 'bg-green-500/20 text-green-400')}
                >
                  {copied === 'sub' ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Short Link</label>
              <div className="flex gap-2">
                <input type="text" value={shortUrl} readOnly className="input-field text-xs flex-1" />
                <button
                  onClick={() => handleCopy(shortUrl, 'short')}
                  className={cn('btn-secondary text-sm whitespace-nowrap', copied === 'short' && 'bg-green-500/20 text-green-400')}
                >
                  {copied === 'short' ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Stats</label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded-lg bg-white/5">
                  <span className="text-gray-400">Hits:</span> {sub.hits}
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <span className="text-gray-400">Last:</span> {formatDate(sub.lastAccess)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Format-specific links */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Client-Specific Links</h3>
          <div className="space-y-2">
            {formats.map((fmt) => (
              <div key={fmt.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-sm font-medium w-28">{fmt.name}</span>
                <input type="text" value={fmt.url} readOnly className="flex-1 bg-transparent text-xs text-gray-400 outline-none" />
                <button
                  onClick={() => handleCopy(fmt.url, fmt.name)}
                  className="text-sm text-neon-blue hover:text-neon-purple transition-colors"
                >
                  {copied === fmt.name ? '✓' : '📋'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Compatible clients */}
        <div className="mt-6 p-4 rounded-xl bg-white/5">
          <h3 className="text-sm font-medium text-gray-400 mb-2">✅ Compatible Clients</h3>
          <div className="flex flex-wrap gap-2">
            {['Clash Meta', 'Nekobox', 'Hiddify', 'Streisand', 'Shadowrocket', 'v2rayNG', 'Sing-box', 'V2Box', 'Kitsunebi'].map((client) => (
              <span key={client} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">{client}</span>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button className="btn-secondary flex-1">🔄 Regenerate Token</button>
          <button onClick={onClose} className="btn-primary flex-1">Done</button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  const [selectedSub, setSelectedSub] = useState<SubInfo | null>(null);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Subscription Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage user subscription links and formats</p>
        </div>
      </div>

      {/* Sub cards */}
      <div className="grid gap-4">
        {mockSubs.map((sub) => (
          <div key={sub.id} className="glass-card-hover p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center text-white font-bold text-lg">
                  {sub.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{sub.username}</h3>
                    <span className={cn('badge', sub.isActive ? 'badge-success' : 'badge-danger')}>
                      {sub.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{sub.name} • {sub.format} • {sub.hits} hits</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-xs text-gray-500">Last access</p>
                  <p className="text-sm">{formatDate(sub.lastAccess)}</p>
                </div>
                <button
                  onClick={() => setSelectedSub(sub)}
                  className="btn-primary text-sm"
                >
                  🔗 View Sub
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedSub && <SubDetailModal sub={selectedSub} onClose={() => setSelectedSub(null)} />}
    </DashboardLayout>
  );
}
