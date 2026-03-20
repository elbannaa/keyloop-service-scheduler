import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/authSlice';
import { Calendar, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
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
        </section>
      </main>
    </div>
  );
};

export default HomePage;
