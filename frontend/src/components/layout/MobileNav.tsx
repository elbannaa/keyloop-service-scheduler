import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CalendarDays, Building2, Users } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useSidebar } from '@/components/layout/SidebarProvider';
import { Role } from '@/constants/role';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { openMobile, setOpenMobile } = useSidebar();

  const navigation = [
    {
      label: 'Dealerships',
      to: '/dealerships',
      icon: Building2,
      active: location.pathname === '/dealerships' || location.pathname === '/',
      show: true,
    },
    {
      label: 'Users',
      to: '/users',
      icon: Users,
      active: location.pathname === '/users',
      show: user?.role === Role.ADMIN,
    },
    {
      label: 'Book Service',
      to: '/booking',
      icon: CalendarDays,
      active: location.pathname === '/booking',
      show: user?.role === Role.USER,
    },
    {
      label: 'Appointments',
      to: '/appointments',
      icon: CalendarDays,
      active: location.pathname === '/appointments',
      show: user?.role === Role.ADMIN || user?.role === Role.MANAGER,
      disabled: true,
    },
  ];

  return (
    <Sheet open={openMobile} onOpenChange={setOpenMobile}>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle>
            <Link to="/" onClick={() => setOpenMobile(false)} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <CalendarDays className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">Keyloop</span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 p-6 space-y-2">
          {navigation.filter(item => item.show).map((item) => (
            <Link
              key={item.to}
              to={item.disabled ? '#' : item.to}
              onClick={() => !item.disabled && setOpenMobile(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                item.active
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1",
                item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
              )}
            >
              <item.icon className={cn("h-5 w-5", item.active ? "text-primary-foreground" : "text-muted-foreground")} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-border mt-auto">
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Unified Service Scheduler
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              v1.0.0-alpha
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
