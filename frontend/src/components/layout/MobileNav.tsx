import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store';
import { Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { NAVIGATION_MENU_ITEMS } from '@/constants/navigation';

export const MobileNav: React.FC = () => {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const menuItems: MenuProps['items'] = NAVIGATION_MENU_ITEMS(user)
    .filter((item) => item.show)
    .map((item) => ({
      key: item.to,
      icon: React.createElement(item.icon, { size: 16 }),
      label: item.label,
      disabled: (item as any).disabled,
      onClick: () => {
        navigate(item.to);
      },
      style: { fontSize: 13 }
    }));

  return (
    <div className="lg:hidden block">
      <Dropdown 
        menu={{ 
          items: menuItems, 
          selectedKeys: [location.pathname],
        }} 
        trigger={['click']}
        placement="bottomLeft"
        overlayStyle={{ minWidth: 200 }}
      >
        <Button
          type="text"
          icon={<MenuOutlined />}
          style={{ fontSize: 16, width: 40, height: 40 }}
        />
      </Dropdown>
    </div>
  );
};
