import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchCurrentUser } from '@/store/authSlice';
import { Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, user, loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [token, user, dispatch]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-muted-foreground animate-pulse">
          Loading your profile...
        </p>
      </main>
    );
  }

  return <AppLayout>{children}</AppLayout>;
};

export default ProtectedRoute;
