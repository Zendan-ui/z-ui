import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Drawer, 
  Menu, 
  Button, 
  Tooltip 
} from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  ImportOutlined,
  TeamOutlined,
  TagsOutlined,
  GlobalOutlined,
  ExportOutlined,
  SwapOutlined,
  SettingOutlined,
  ToolOutlined,
  ApiOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  HeartOutlined,
  ReadOutlined,
  SunOutlined,
  MoonOutlined,
  GithubOutlined,
} from '@ant-design/icons';

import { HttpUtil } from '@/utils';
import { formatPanelVersion } from '@/lib/panel-version';
import { useTheme } from '@/hooks/useTheme';
import { useAllSettings } from '@/api/queries/useAllSettings';
import { ZUIIcon } from '@/assets/icons/ZUIIcon';

const SIDEBAR_COLLAPSED_KEY = 'zui-glass-sidebar-collapsed';
const LOGOUT_KEY = '__logout__';

interface GlassSidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export default function GlassSidebar({ collapsed = false, onCollapse }: GlassSidebarProps) {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const { allSetting } = useAllSettings();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) || 'false');
    } catch {
      return collapsed;
    }
  });

  const panelVersion = window.X_UI_CUR_VER || '';

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: t('menu.dashboard') },
    { key: '/inbounds', icon: <ImportOutlined />, label: t('menu.inbounds') },
    { key: '/clients', icon: <TeamOutlined />, label: t('menu.clients') },
    { key: '/groups', icon: <TagsOutlined />, label: t('menu.groups') },
    { key: '/nodes', icon: <GlobalOutlined />, label: t('menu.nodes') },
    { key: '/hosts', icon: <GlobalOutlined />, label: t('menu.hosts') },
    { key: '/outbound', icon: <ExportOutlined />, label: t('menu.outbounds') },
    { key: '/routing', icon: <SwapOutlined />, label: t('menu.routing') },
    { key: '/xray', icon: <ToolOutlined />, label: t('menu.xray') },
    { key: '/settings', icon: <SettingOutlined />, label: t('menu.settings') },
    { key: '/api-docs', icon: <ApiOutlined />, label: t('menu.apiDocs') },
    { key: LOGOUT_KEY, icon: <LogoutOutlined />, label: t('logout') },
  ];

  const handleMenuClick = useCallback(async ({ key }: { key: string }) => {
    if (key === LOGOUT_KEY) {
      await HttpUtil.post('/logout');
      window.location.href = window.X_UI_BASE_PATH || '/';
      return;
    }
    navigate(key);
    setDrawerOpen(false);
  }, [navigate]);

  const toggleCollapse = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newCollapsed));
    onCollapse?.(newCollapsed);
  }, [isCollapsed, onCollapse]);

  const selectedKey = pathname === '' ? '/' : pathname;

  return (
    <>
      {/* Desktop Floating Sidebar */}
      <div className="glass-sidebar fixed left-4 top-4 bottom-4 z-50 hidden md:flex flex-col w-72 transition-all duration-300"
           style={{ width: isCollapsed ? '72px' : '288px' }}>
        
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <ZUIIcon size={isCollapsed ? 36 : 42} />
            </div>
            {!isCollapsed && (
              <div>
                <div className="font-semibold text-xl tracking-[-1.5px] bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  Z-UI
                </div>
                <div className="text-[10px] text-white/50 -mt-1">2027</div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Tooltip title={t('menu.theme')}>
              <Button 
                type="text" 
                size="small" 
                icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleTheme}
                className="!text-white/70 hover:!text-white"
              />
            </Tooltip>
            <Tooltip title="Collapse">
              <Button 
                type="text" 
                size="small" 
                icon={<MenuOutlined />}
                onClick={toggleCollapse}
                className="!text-white/70 hover:!text-white"
              />
            </Tooltip>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3 glass-scroll">
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={handleMenuClick}
            className="!bg-transparent !border-none"
            inlineCollapsed={isCollapsed}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-white/50 px-2">
            {!isCollapsed && (
              <a 
                href="https://github.com/MHSanaei/z-ui" 
                target="_blank" 
                className="flex items-center gap-1.5 hover:text-white/80 transition-colors"
              >
                <GithubOutlined /> {formatPanelVersion(panelVersion)}
              </a>
            )}
            <div className="flex gap-2">
              <a href="https://docs.sanaei.dev/" target="_blank" className="hover:text-white/80">
                <ReadOutlined />
              </a>
              <a href="https://donate.sanaei.dev/" target="_blank" className="hover:text-white/80">
                <HeartOutlined />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MenuOutlined />}
          onClick={() => setDrawerOpen(true)}
          className="!bg-white/10 hover:!bg-white/20 backdrop-blur-xl border border-white/10"
        />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="left"
        width={280}
        className="glass-drawer"
        closeIcon={<CloseOutlined className="text-white" />}
        styles={{
          body: { padding: 0, background: 'transparent' },
          header: { display: 'none' },
        }}
      >
        <div className="glass-sidebar h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <span className="text-white font-bold text-xl">Z</span>
              </div>
              <div className="font-semibold text-xl tracking-[-1.5px]">Z-UI</div>
            </div>
          </div>

          <div className="flex-1 p-3">
            <Menu
              mode="inline"
              theme="dark"
              selectedKeys={[selectedKey]}
              items={menuItems}
              onClick={handleMenuClick}
              className="!bg-transparent"
            />
          </div>
        </div>
      </Drawer>
    </>
  );
}
