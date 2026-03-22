import {
    Building2,
    Users,
    CalendarDays,
    Calendar,
    LayoutDashboard,
} from 'lucide-react';
import { Role } from '@/constants/role';
import type { User } from '@/store/authSlice';

export const NAVIGATION_MENU_ITEMS = (user: User) => [
    {
        label: 'Dealerships',
        to: '/dealerships',
        icon: Building2,
        active: location.pathname === '/dealerships' || location.pathname === '/',
        show: true,
        roles: [Role.ADMIN, Role.MANAGER, Role.USER],
    },
    {
        label: 'Users',
        to: '/users',
        icon: Users,
        active: location.pathname === '/users',
        show: user?.role === Role.ADMIN,
        roles: [Role.ADMIN],
    },
    {
        label: 'Book Service',
        to: '/booking',
        icon: CalendarDays,
        active: location.pathname === '/booking',
        show: user?.role === Role.USER,
        roles: [Role.USER],
    },
    {
        label: 'Appointments',
        to: '/appointments',
        icon: LayoutDashboard,
        active: location.pathname === '/appointments',
        show: !!user,
        roles: [Role.ADMIN, Role.MANAGER, Role.USER],
    },
    {
        label: 'Schedule',
        to: '/schedule',
        icon: Calendar,
        active: location.pathname === '/schedule',
        show: user?.role === Role.ADMIN || user?.role === Role.MANAGER,
        roles: [Role.ADMIN, Role.MANAGER],
    },
];

export const canAccessPath = (user: User, path: string): boolean => {
    // Basic paths that anyone authenticated can access
    const publicProtectedPaths = ['/', '/unauthorized', '/profile'];
    if (publicProtectedPaths.includes(path)) return true;

    const items = NAVIGATION_MENU_ITEMS(user);
    const item = items.find(i => i.to === path);
    
    // If path is not in menu, we might need a more complex check, 
    // but for now, if it's in menu, check show/roles
    if (item) {
        return item.show;
    }

    // Default to true for other paths for now, or tighten as needed
    return true;
};
