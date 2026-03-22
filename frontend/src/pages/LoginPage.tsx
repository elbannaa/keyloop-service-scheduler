import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/authSlice';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  theme
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  CalendarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useAppSelector((state) => state.auth);
  const { token: antdToken } = theme.useToken();

  useEffect(() => {
    if (token) {
      navigate('/dealerships', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onFinish = (values: any) => {
    dispatch(loginUser({ email: values.email, password: values.password }));
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: antdToken.colorBgLayout,
        padding: antdToken.paddingLG
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: antdToken.marginLG }}>
          <div
            style={{
              margin: `0 auto ${antdToken.marginMD}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: antdToken.borderRadiusLG,
              backgroundColor: antdToken.colorPrimary,
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)'
            }}
          >
            <CalendarOutlined style={{ fontSize: 32, color: '#fff' }} />
          </div>
          <Title level={2} style={{ margin: 0 }}>Service Scheduler</Title>
          <Text type="secondary" style={{ fontSize: antdToken.fontSizeLG }}>Sign in to your account</Text>
        </div>

        {/* Card */}
        <Card variant="borderless" style={{ boxShadow: antdToken.boxShadowSecondary }}>
          <div style={{ textAlign: 'center', marginBottom: antdToken.paddingLG }}>
            <Title level={4} style={{ margin: 0 }}>Login</Title>
            <Text type="secondary">Enter your email and password to access your dashboard</Text>
          </div>

          <Form
            name="login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            {error && (
              <Form.Item>
                <Alert message={error} type="error" showIcon closable onClose={() => dispatch(clearError())} />
              </Form.Item>
            )}

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: antdToken.colorTextPlaceholder }} />}
                placeholder="you@example.com"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: antdToken.colorTextPlaceholder }} />}
                placeholder="your password"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                style={{ fontWeight: 600 }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: antdToken.colorPrimary, fontWeight: 500 }}>
                Create one
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default LoginPage;
