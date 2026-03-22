import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Button, 
  Card, 
  Row, 
  Col, 
  Space, 
  theme 
} from 'antd';
import { 
  ShopOutlined, 
  TeamOutlined,
  CalendarOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { Role } from '@/constants/role';

const { Title, Paragraph, Text } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { token } = theme.useToken();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: token.paddingLG }}>
      <section style={{ textAlign: 'center', marginBottom: token.marginXXL, marginTop: token.marginXL }}>
        <Title level={1} style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: token.paddingMD }}>
          Welcome{user ? `, ${user.name}` : ''}!
        </Title>
        <Paragraph style={{ fontSize: token.fontSizeLG, color: token.colorTextSecondary, marginBottom: token.paddingXL }}>
          You are currently logged in as a{' '}
          <Text strong style={{ color: token.colorPrimary, textTransform: 'lowercase' }}>
            {user?.role}
          </Text>
        </Paragraph>
        
        <Space size={token.paddingMD} wrap>
          <Button 
            type="primary" 
            icon={<CalendarOutlined />} 
            onClick={() => navigate('/booking')}
            style={{ fontWeight: 600 }}
          >
            Manage Appointments
          </Button>
          <Button 
            onClick={() => navigate('/schedule')}
          >
            View Schedule
          </Button>
        </Space>
      </section>

      <Row gutter={[token.paddingLG, token.paddingLG]} justify="center">
        <Col xs={24} sm={12} md={10} lg={8}>
          <Card 
            hoverable 
            style={{ height: '100%', borderRadius: token.borderRadiusLG }}
            cover={
              <div style={{ 
                height: 120, 
                background: `linear-gradient(135deg, ${token.colorPrimary}22 0%, ${token.colorPrimary}11 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShopOutlined style={{ fontSize: 48, color: token.colorPrimary }} />
              </div>
            }
            onClick={() => navigate('/dealerships')}
          >
            <Card.Meta 
              title={<Title level={4}>Dealerships</Title>}
              description={
                <Space direction="vertical" size={token.paddingSM}>
                  <Text type="secondary">View and manage service dealerships in your network.</Text>
                  <Button type="link" style={{ padding: 0 }}>
                    Go to Dealerships <ArrowRightOutlined />
                  </Button>
                </Space>
              }
            />
          </Card>
        </Col>

        {user?.role === Role.ADMIN && (
          <Col xs={24} sm={12} md={10} lg={8}>
            <Card 
              hoverable 
              style={{ height: '100%', borderRadius: token.borderRadiusLG }}
              cover={
                <div style={{ 
                  height: 120, 
                  background: `linear-gradient(135deg, ${token.colorInfoHover}22 0%, ${token.colorInfoHover}11 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TeamOutlined style={{ fontSize: 48, color: token.colorInfo }} />
                </div>
              }
              onClick={() => navigate('/users')}
            >
              <Card.Meta 
                title={<Title level={4}>Manage Users</Title>}
                description={
                  <Space direction="vertical" size={token.paddingSM}>
                    <Text type="secondary">Manage employee accounts and system access levels.</Text>
                    <Button type="link" style={{ padding: 0 }}>
                      Go to Users <ArrowRightOutlined />
                    </Button>
                  </Space>
                }
              />
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default HomePage;
