import React from 'react';
import { Button, Table } from 'antd';
import GlassCard from '@/components/glass/GlassCard';
import GlassButton from '@/components/glass/GlassButton';

export default function GlassInboundsPage() {
  const columns = [
    { title: 'Tag', dataIndex: 'tag', key: 'tag' },
    { title: 'Protocol', dataIndex: 'protocol', key: 'protocol' },
    { title: 'Port', dataIndex: 'port', key: 'port' },
    { title: 'Clients', dataIndex: 'clients', key: 'clients' },
    { 
      title: 'Actions', 
      key: 'actions',
      render: () => (
        <div className="flex gap-2">
          <GlassButton size="sm">Edit</GlassButton>
          <GlassButton size="sm" variant="ghost">Delete</GlassButton>
        </div>
      )
    }
  ];

  const data = [
    { key: '1', tag: 'vless-reality', protocol: 'VLESS', port: 443, clients: 128 },
    { key: '2', tag: 'trojan-ws', protocol: 'Trojan', port: 8443, clients: 64 },
    { key: '3', tag: 'vmess-grpc', protocol: 'VMess', port: 2053, clients: 42 },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-2px]">Inbounds</h1>
          <p className="text-white/60 mt-1">Manage your proxy entry points</p>
        </div>
        <GlassButton variant="primary">+ New Inbound</GlassButton>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={false}
          className="glass-table"
        />
      </GlassCard>
    </div>
  );
}
