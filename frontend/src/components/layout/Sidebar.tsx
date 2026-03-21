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
      <Icon className={cn("h-5 w-5", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
      {!collapsed && <span className="font-medium text-sm transition-opacity duration-200">{label}</span>}
    </div>
    {active && !collapsed && <ChevronRight className="h-4 w-4 opacity-70" />}
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
      label: 'Appointments',
      to: '/appointments',
      icon: CalendarDays,
      active: location.pathname === '/appointments',
      show: true,
      disabled: true, // Placeholder for now
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
      <div className={cn("p-6", !open && "px-4")}>
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center min-w-8 h-8 rounded-lg bg-primary">
            <CalendarDays className="w-5 h-5 text-primary-foreground" />
          </div>
          {open && (
            <span className="font-bold text-xl tracking-tight text-foreground transition-opacity duration-300">
              Keyloop
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-8 mt-4 overflow-x-hidden">
        <div>
          {open && (
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
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
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
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

      <div className="p-4 border-t border-border mt-auto">
        <div className={cn("bg-muted/50 rounded-xl p-4", !open && "p-2 text-center")}>
          {open ? (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Need help? Check our <span className="text-primary font-medium cursor-pointer">Documentation</span>.
            </p>
          ) : (
            <div className="text-primary font-bold text-xs uppercase cursor-pointer">?</div>
          )}
        </div>
      </div>
    </aside>
  );
};
