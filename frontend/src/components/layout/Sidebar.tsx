import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store';
import { Layout, Menu, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import { CalendarDays } from 'lucide-react';
import { NAVIGATION_MENU_ITEMS } from '@/constants/navigation';

const { Sider } = Layout;
const { Title } = Typography;

export const Sidebar: React.FC<{
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  className?: string;
}> = ({ collapsed, onCollapse, className }) => {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  if (!user) return null;

  const menuItems: MenuProps['items'] = NAVIGATION_MENU_ITEMS(user)
    .filter((item) => item.show)
    .map((item) => ({
      key: item.to,
      icon: React.createElement(item.icon, { size: 18 }),
      label: item.label,
      disabled: (item as any).disabled,
      onClick: () => navigate(item.to),
    }));

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      theme="light"
      width={256}
      breakpoint="lg"
      collapsedWidth={80}
      className={`${className} border-r border-gray-200 h-screen sticky top-0`}
      trigger={null}
    >
      <div style={{ padding: token.padding, display: 'flex', alignItems: 'center', gap: token.paddingSM }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: token.colorPrimary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}
        >
          <CalendarDays size={18} />
        </div>
        {!collapsed && (
          <Title level={5} style={{ margin: 0, color: token.colorTextHeading }}>
            Keyloop
          </Title>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{ borderInlineEnd: 'none' }}
      />
    </Sider>
  );
};
