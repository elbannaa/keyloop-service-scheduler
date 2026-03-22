import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchCurrentUser } from '@/store/authSlice';
import { Spin, Typography, theme } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { AppLayout } from '@/components/layout';

const { Text } = Typography;

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, user, loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { token: antdToken } = theme.useToken();

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [token, user, dispatch]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading) {
    const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;
    return (
      <main style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: antdToken.colorBgLayout,
        padding: 24,
        textAlign: 'center'
      }}>
        <Spin indicator={antIcon} />
        <Text style={{ 
          marginTop: 24, 
          fontSize: 18, 
          fontWeight: 500, 
          color: antdToken.colorTextSecondary 
        }}>
          Loading your profile...
        </Text>
      </main>
    );
  }

  return <AppLayout>{children}</AppLayout>;
};

export default ProtectedRoute;
