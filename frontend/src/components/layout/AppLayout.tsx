import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/authSlice';
import { useLocation, Link } from 'react-router-dom';
import {
  Layout,
  Breadcrumb,
  Dropdown,
  Avatar,
  Button,
  Space,
  Typography,
  theme,
  Badge,
  Grid
} from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

const { Header, Content } = Layout;
const { Text } = Typography;

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumbMap: Record<string, string> = {
    dealerships: 'Dealerships',
    users: 'Users',
    appointments: 'Appointments',
    booking: 'Book Service',
    schedule: 'Schedule',
  };

  const breadcrumbItems = [
    { title: <Link to="/">Dashboard</Link> },
    ...pathnames.map((value, index) => {
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;
      const label = breadcrumbMap[value] || value.charAt(0).toUpperCase() + value.slice(1);
      return { title: index === pathnames.length - 1 ? label : <Link to={to}>{label}</Link> };
    }),
  ];

  const userMenuItems: any[] = [
    {
      key: 'profile',
      label: (
        <div style={{ padding: '4px 0' }}>
          <Space orientation="vertical" size={0}>
            <Text strong style={{ fontSize: 14 }}>{user?.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{user?.email}</Text>
          </Space>
          <div style={{ marginTop: 4 }}>
            <Badge
              count={user?.role}
              style={{ backgroundColor: token.colorPrimary, fontSize: 10 }}
            />
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Log out',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
      disabled: loading,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />}
      <Layout>
        <Header
          style={{
            padding: `0 ${token.paddingMD}px`,
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            position: 'sticky',
            top: 0,
            zIndex: 100,
            height: 64,
          }}
        >
          <Space size={token.paddingMD}>
            {!isMobile && (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
              />
            )}
            {isMobile && <MobileNav />}
            <Breadcrumb items={breadcrumbItems} />
          </Space>

          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Button type="text">
                <Space>
                  <Avatar
                    size="small"
                    style={{ backgroundColor: token.colorPrimary }}
                    icon={<UserOutlined />}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Text className="hidden md:inline">{user.name}</Text>
                </Space>
              </Button>
            </Dropdown>
          )}
        </Header>
        <Content
          style={{
            margin: isMobile ? token.marginMD : token.marginLG,
            padding: isMobile ? token.paddingMD : token.paddingLG,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            minHeight: 280,
            overflow: 'initial'
          }}
          className={isMobile ? 'm-4' : 'm-6'}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
