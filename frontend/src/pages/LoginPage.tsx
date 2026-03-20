import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/authSlice';
import { Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo / Brand */}
        <header className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Calendar className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Service Scheduler
            </h1>
            <p className="text-base text-muted-foreground md:text-lg">
              Sign in to your account
            </p>
          </div>
        </header>

        {/* Card */}
        <Card className="border-border shadow-xl md:shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-destructive text-sm font-medium animate-in fade-in zoom-in duration-200">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-11 md:h-10" // Mobile-friendly touch target
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-11 md:h-10" // Mobile-friendly touch target
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 md:h-10 text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium underline-offset-4 transition-colors"
              >
                Create one
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
};

export default LoginPage;
