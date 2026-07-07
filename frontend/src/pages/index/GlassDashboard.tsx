import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Col, Statistic, Spin, Result, Button } from 'antd';
import {
  ThunderboltOutlined,
  DesktopOutlined,
  DatabaseOutlined,
  ForkOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  GlobalOutlined,
  SwapOutlined,
} from '@ant-design/icons';

import { useStatusQuery } from '@/api/queries/useStatusQuery';
import { SizeFormatter, TimeFormatter } from '@/utils';
import GlassCard from '@/components/glass/GlassCard';
import GlassButton from '@/components/glass/GlassButton';

export default function GlassDashboard() {
  const { t } = useTranslation();
  const { status, fetched, fetchError, refresh } = useStatusQuery();
  const [showIp, setShowIp] = useState(false);

  if (!fetched) {
    return (
      <div className="glass-loading h-[60vh]">
        <div className="glass-spinner" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <Result
        status="error"
        title={t('somethingWentWrong')}
        subTitle={fetchError}
        extra={<GlassButton variant="primary" onClick={refresh}>{t('refresh')}</GlassButton>}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Status Overview */}
      <div className="mb-2">
        <h2 className="text-3xl font-semibold tracking-[-1.5px] mb-1">Dashboard</h2>
        <p className="text-white/60">Real-time overview of your Z-UI panel</p>
      </div>

      <Row gutter={[24, 24]}>
        {/* Xray Uptime */}
        <Col xs={24} md={12} lg={8}>
          <GlassCard>
            <Statistic
              title={<span className="text-white/60 text-sm">Xray Uptime</span>}
              value={TimeFormatter.formatSecond(status.appStats.uptime)}
              prefix={<ThunderboltOutlined className="text-blue-400" />}
              valueStyle={{ color: '#f8fafc', fontSize: 28, fontWeight: 600 }}
            />
          </GlassCard>
        </Col>

        {/* OS Uptime */}
        <Col xs={24} md={12} lg={8}>
          <GlassCard>
            <Statistic
              title={<span className="text-white/60 text-sm">System Uptime</span>}
              value={TimeFormatter.formatSecond(status.uptime)}
              prefix={<DesktopOutlined className="text-emerald-400" />}
              valueStyle={{ color: '#f8fafc', fontSize: 28, fontWeight: 600 }}
            />
          </GlassCard>
        </Col>

        {/* Memory */}
        <Col xs={24} md={12} lg={8}>
          <GlassCard>
            <Statistic
              title={<span className="text-white/60 text-sm">Memory Usage</span>}
              value={SizeFormatter.sizeFormat(status.appStats.mem)}
              prefix={<DatabaseOutlined className="text-violet-400" />}
              valueStyle={{ color: '#f8fafc', fontSize: 28, fontWeight: 600 }}
            />
          </GlassCard>
        </Col>

        {/* Network Speed */}
        <Col xs={24} md={12} lg={12}>
          <GlassCard>
            <div className="space-y-4">
              <div className="text-sm text-white/60 font-medium">Network Speed</div>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title={<span className="text-white/50">Upload</span>}
                    value={SizeFormatter.sizeFormat(status.netIO.up)}
                    prefix={<ArrowUpOutlined className="text-emerald-400" />}
                    suffix="/s"
                    valueStyle={{ color: '#10b981', fontSize: 22, fontWeight: 600 }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={<span className="text-white/50">Download</span>}
                    value={SizeFormatter.sizeFormat(status.netIO.down)}
                    prefix={<ArrowDownOutlined className="text-blue-400" />}
                    suffix="/s"
                    valueStyle={{ color: '#3b82f6', fontSize: 22, fontWeight: 600 }}
                  />
                </Col>
              </Row>
            </div>
          </GlassCard>
        </Col>

        {/* Total Traffic */}
        <Col xs={24} md={12} lg={12}>
          <GlassCard>
            <div className="space-y-4">
              <div className="text-sm text-white/60 font-medium">Total Traffic</div>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title={<span className="text-white/50">Sent</span>}
                    value={SizeFormatter.sizeFormat(status.netTraffic.sent)}
                    prefix={<CloudUploadOutlined className="text-emerald-400" />}
                    valueStyle={{ color: '#f8fafc', fontSize: 22, fontWeight: 600 }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={<span className="text-white/50">Received</span>}
                    value={SizeFormatter.sizeFormat(status.netTraffic.recv)}
                    prefix={<CloudDownloadOutlined className="text-blue-400" />}
                    valueStyle={{ color: '#f8fafc', fontSize: 22, fontWeight: 600 }}
                  />
                </Col>
              </Row>
            </div>
          </GlassCard>
        </Col>

        {/* Connections */}
        <Col xs={24} md={12} lg={8}>
          <GlassCard>
            <div className="text-sm text-white/60 mb-4 font-medium">Active Connections</div>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="TCP"
                  value={status.tcpCount}
                  prefix={<SwapOutlined />}
                  valueStyle={{ color: '#f8fafc', fontSize: 26, fontWeight: 700 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="UDP"
                  value={status.udpCount}
                  prefix={<SwapOutlined />}
                  valueStyle={{ color: '#f8fafc', fontSize: 26, fontWeight: 700 }}
                />
              </Col>
            </Row>
          </GlassCard>
        </Col>

        {/* IP Addresses */}
        <Col xs={24} md={12} lg={16}>
          <GlassCard>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-white/60 font-medium">Public IP Addresses</div>
              <Button 
                type="text" 
                size="small"
                onClick={() => setShowIp(!showIp)}
                className="!text-white/60"
              >
                {showIp ? 'Hide' : 'Show'}
              </Button>
            </div>
            
            {showIp ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="IPv4"
                    value={status.publicIP.ipv4 || '—'}
                    prefix={<GlobalOutlined />}
                    valueStyle={{ color: '#f8fafc', fontSize: 18 }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="IPv6"
                    value={status.publicIP.ipv6 || '—'}
                    prefix={<GlobalOutlined />}
                    valueStyle={{ color: '#f8fafc', fontSize: 18 }}
                  />
                </Col>
              </Row>
            ) : (
              <div className="text-white/40 text-sm py-2">Click "Show" to reveal IP addresses</div>
            )}
          </GlassCard>
        </Col>
      </Row>

      {/* Quick Actions */}
      <div className="pt-4">
        <div className="text-sm text-white/60 mb-4 font-medium">Quick Actions</div>
        <div className="flex flex-wrap gap-3">
          <GlassButton variant="primary">Restart Xray</GlassButton>
          <GlassButton>View Logs</GlassButton>
          <GlassButton>Backup Panel</GlassButton>
          <GlassButton>Update Panel</GlassButton>
        </div>
      </div>
    </div>
  );
}
