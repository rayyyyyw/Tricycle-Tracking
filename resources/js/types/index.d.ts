// types/index.ts
import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

// Update NavItem to support nested items
export interface NavItem {
    title: string;
    href?: NonNullable<InertiaLinkProps['href']>; // Make href optional for parent items
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: NavItem[]; // Add support for nested items
}

export interface AdminProfile {
    id?: number;
    user_id?: number;
    avatar?: string;
    theme?: string;
    settings?: Record<string, unknown>;
    notification_preferences?: Record<string, boolean | string>;
    created_at?: string;
    updated_at?: string;
}

// Base User interface
export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    role?: string;
    phone?: string;
    address?: string;
    emergency_contact?: {
        name?: string;
        phone?: string;
        relationship?: string;
    };
    settings?: Record<string, unknown>;
    
    //[key: string]: unknown; // This allows for additional properties...
}

// Driver User interface extending base User
export interface DriverUser extends User {
    license_number?: string;
    vehicle_type?: string;
    vehicle_plate?: string;
    vehicle_year?: string;
    vehicle_color?: string;
    vehicle_model?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    adminProfile?: AdminProfile;
    [key: string]: unknown;
}

// For driver-specific pages
export interface DriverSharedData extends Omit<SharedData, 'auth'> {
    auth: {
        user: DriverUser;
    };
    driver_application?: {
        id?: number;
        status?: string;
        license_number?: string;
        vehicle_plate_number?: string;
        [key: string]: unknown;
    };
}