import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/authSlice';
import { useNavigate } from 'react-router-dom';
import { Calendar, LogOut, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary shadow-sm">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg md:text-xl tracking-tight text-foreground">
                Service Scheduler
              </span>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {user && (
                <div className="flex items-center gap-3 pr-2 md:pr-0 border-r border-border md:border-none">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-foreground leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user.email}
                    </p>
                  </div>
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-secondary-foreground font-bold shadow-sm transition-transform hover:scale-105">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                disabled={loading}
                aria-label="Logout"
                className="md:hidden"
              >
                <LogOut className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={loading}
                className="hidden md:flex items-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 lg:py-24">
        <section className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Welcome{user ? `, ${user.name}` : ''}!
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground sm:text-xl md:text-2xl leading-relaxed">
            You are currently logged in as a{' '}
            <span className="font-bold text-primary underline underline-offset-8 decoration-primary/30">
              {user?.role.toLowerCase()}
            </span>
          </p>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8 text-base font-semibold w-full sm:w-auto shadow-lg hover:shadow-primary/20 transition-all">
              Manage Appointments
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base font-semibold w-full sm:w-auto">
              View Schedule
            </Button>
          </div>
          
          <div className="pt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div 
              onClick={() => navigate('/dealerships')}
              className="bg-card hover:bg-muted/50 transition-colors border border-border p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer shadow-sm hover:shadow-md group"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Dealerships</h3>
              <p className="text-muted-foreground mt-2">View and manage service dealerships.</p>
            </div>
            
            {user?.role === 'ADMIN' && (
              <div 
                onClick={() => navigate('/users')}
                className="bg-card hover:bg-muted/50 transition-colors border border-border p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer shadow-sm hover:shadow-md group"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Manage Users</h3>
                <p className="text-muted-foreground mt-2">Manage employee and user access (Admin Only).</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
