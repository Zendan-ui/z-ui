import React from 'react';
import { Button, Dropdown, Avatar } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  BellOutlined,
  SearchOutlined 
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { HttpUtil } from '@/utils';
import { ZUIIcon } from '@/assets/icons/ZUIIcon';

interface GlassNavbarProps {
  title?: string;
  actions?: React.ReactNode;
}

export default function GlassNavbar({ title, actions }: GlassNavbarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const userMenuItems = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('menu.settings'),
      onClick: () => navigate('/settings'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('logout'),
      danger: true,
      onClick: async () => {
        await HttpUtil.post('/logout');
        window.location.href = window.X_UI_BASE_PATH || '/';
      },
    },
  ];

  return (
    <div className="glass-navbar sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile brand */}
        <div className="md:hidden flex items-center gap-3">
          <ZUIIcon size={32} />
          <div className="font-semibold tracking-tight text-lg">Z-UI</div>
        </div>

        {/* Page Title */}
        {title && (
          <div className="hidden md:block">
            <h1 className="text-2xl font-semibold tracking-[-1px] text-white">{title}</h1>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:block relative w-72">
          <div className="glass-input flex items-center gap-3 px-4 py-2 text-sm text-white/60">
            <SearchOutlined />
            <span>Search inbounds, clients...</span>
          </div>
        </div>

        {/* Custom Actions */}
        {actions}

        {/* Notifications */}
        <Button 
          type="text" 
          shape="circle" 
          icon={<BellOutlined />} 
          className="!text-white/70 hover:!text-white !bg-white/5 hover:!bg-white/10 backdrop-blur-xl"
        />

        {/* User Menu */}
        <Dropdown 
          menu={{ items: userMenuItems }} 
          placement="bottomRight"
          trigger={['click']}
        >
          <div className="glass-btn flex items-center gap-2 px-3 py-1.5 cursor-pointer">
            <Avatar 
              size="small" 
              icon={<UserOutlined />} 
              className="!bg-white/10 !text-white/80"
            />
            <span className="hidden md:inline text-sm font-medium">Admin</span>
          </div>
        </Dropdown>
      </div>
    </div>
  );
}
