import { UserRole } from "@/lib/auth-utils";

export interface NavItem {
    title: string;
    href: string;
    icon: string;
    badge?: string | number;
    roles: UserRole[];
}

export interface NavSection {
    title?: string;
    items: NavItem[];
}
