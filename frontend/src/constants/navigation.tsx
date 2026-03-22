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
        show: !!user,
    },
    {
        label: 'Schedule',
        to: '/schedule',
        icon: Calendar,
        active: location.pathname === '/schedule',
        show: user?.role === Role.ADMIN || user?.role === Role.MANAGER,
    },
];
