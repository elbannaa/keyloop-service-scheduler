import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/authSlice';
import { useLocation, Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { SidebarInset } from '@/components/ui/sidebar-inset';
import { SidebarProvider } from './SidebarProvider';
import { SidebarTrigger } from '@/components/ui/sidebar-trigger';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user, loading } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // Dynamic breadcrumb generation
  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumbMap: Record<string, string> = {
    dealerships: 'Dealerships',
    users: 'Users',
    appointments: 'Appointments',
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-card overflow-hidden">
        {/* Desktop Sidebar & Mobile Sidebar Wrapper */}
        <Sidebar />
        <MobileNav />

        <SidebarInset>
          {/* Header */}
          <header className="sticky top-0 z-30 w-full border-b border-border bg-card/50 backdrop-blur-md">
            <div className="px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 cursor-pointer" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink asChild>
                        <Link to="/">Dashboard</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {pathnames.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                    {pathnames.map((value, index) => {
                      const last = index === pathnames.length - 1;
                      const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                      const label = breadcrumbMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

                      return (
                        <React.Fragment key={to}>
                          <BreadcrumbItem>
                            {last ? (
                              <BreadcrumbPage>{label}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild>
                                <Link to={to}>{label}</Link>
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {!last && <BreadcrumbSeparator />}
                        </React.Fragment>
                      );
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <div className="flex items-center gap-4">
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden border border-border transition-transform hover:scale-105">
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 font-bold text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-2 justify-between">
                            <p className="text-md font-medium leading-none">{user.name}</p>
                            <Badge variant="outline" className="text-xs w-fit">
                              {user.role}
                            </Badge>
                          </div>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {/* TODO: Add profile */}
                      {/* <DropdownMenuItem className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem> */}
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-destructive focus:text-destructive"
                        onClick={handleLogout}
                        disabled={loading}
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-xs">Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-background/30">
            <div className="mx-auto w-full">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
