import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import {
  Building2,
  Users,
  CalendarDays,
  LayoutDashboard,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/layout/SidebarProvider';
import { Role } from '@/constants/role';
import { Separator } from '../ui/separator';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  disabled?: boolean;
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, active, disabled, collapsed }) => (
  <Link
    to={disabled ? '#' : to}
    className={cn(
      "group flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200",
      active
        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      disabled && "opacity-50 cursor-not-allowed grayscale",
      collapsed && "justify-center px-2"
    )}
  >
    <div className="flex items-center gap-3">
      <Icon className={cn("h-4 w-4", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
      {!collapsed && <span className="font-semibold text-xs transition-opacity duration-200">{label}</span>}
    </div>
    {active && !collapsed && <ChevronRight className="h-3 w-3 opacity-70" />}
  </Link>
);

export const Sidebar: React.FC<{ className?: string }> = ({ className }) => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { open, isMobile } = useSidebar();

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
      icon: LayoutDashboard,
      active: location.pathname === '/appointments',
      show: user?.role === Role.ADMIN || user?.role === Role.MANAGER,
      disabled: true,
    },
  ];

  if (isMobile) return null;

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border bg-card h-screen sticky top-0 transition-all duration-300 ease-in-out",
        open ? "w-64" : "w-16",
        className
      )}
    >
      <div className='p-4'>
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center min-w-8 h-8 rounded-lg bg-primary">
            <CalendarDays className="w-4 h-4 text-primary-foreground" />
          </div>
          {open && (
            <div className="flex flex-col items-start leading-none transition-opacity duration-300">
              <span className="font-bold text-lg tracking-tight text-foreground">
                Keyloop
              </span>
            </div>
          )}
        </Link>
      </div>
      <Separator />
      <nav className="flex-1 px-3 space-y-8 mt-4 overflow-x-hidden">
        <div>
          {open && (
            <h3 className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4 opacity-60">
              Main Menu
            </h3>
          )}
          <div className="space-y-1">
            {navigation.filter(item => item.show).map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={item.active}
                disabled={item.disabled}
                collapsed={!open}
              />
            ))}
          </div>
        </div>

        <div>
          {open && (
            <h3 className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4 opacity-60">
              System
            </h3>
          )}
          <div className="space-y-1">
            <NavItem
              to="/dashboard"
              icon={LayoutDashboard}
              label="Analytics"
              active={false}
              disabled={true}
              collapsed={!open}
            />
          </div>
        </div>
      </nav>
    </aside>
  );
};
