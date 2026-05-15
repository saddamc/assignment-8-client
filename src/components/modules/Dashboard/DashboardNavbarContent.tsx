"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AuthUser } from "@/hooks/useAuthStore";
import { NavSection } from "@/types/dashboard.interface";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import DashboardMobileSidebar from "./DashboardMobileSidebar";
import UserDropdown from "./UserDropdown";
import Link from "next/link";

interface DashboardNavbarContentProps {
    user: AuthUser;
    navItems: NavSection[];
    dashboardHome: string;
}

const DashboardNavbarContent = ({ user, navItems, dashboardHome }: DashboardNavbarContentProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // Simple breadcrumb logic
    const pathSegments = pathname.split('/').filter(Boolean);
    const currentPage = pathSegments[pathSegments.length - 1] || 'Dashboard';
    const isDashboardHome = pathname === dashboardHome;

    return (
        <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
            <div className="flex h-18 items-center justify-between gap-4 px-6 md:px-8">
                {/* Left Side: Mobile Menu & Page Title */}
                <div className="flex items-center gap-4">
                    <Sheet open={isMobile && isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon" className="hover:bg-zinc-100 rounded-xl">
                                <Menu className="h-5 w-5 text-zinc-600" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0 border-none">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <SheetDescription className="sr-only">Access your dashboard navigation options</SheetDescription>
                            <DashboardMobileSidebar
                                user={user}
                                navItems={navItems}
                                dashboardHome={dashboardHome}
                            />
                        </SheetContent>
                    </Sheet>

                    {/* Page Info / Breadcrumbs */}
                    <div className="hidden md:flex items-center gap-2 text-[13px] font-medium text-zinc-400">
                        <Link href={dashboardHome} className="hover:text-zinc-900 transition-colors">
                            Dashboard
                        </Link>
                        {!isDashboardHome && pathSegments.length > 1 && (
                            <>
                                <span className="text-zinc-300">/</span>
                                <span className="text-zinc-900 font-bold capitalize">
                                    {currentPage.replace(/-/g, ' ')}
                                </span>
                            </>
                        )}
                    </div>
                    <h1 className="md:hidden text-lg font-bold text-zinc-900 capitalize">
                        {currentPage.replace(/-/g, ' ')}
                    </h1>
                </div>

                {/* Right Side: Search & User Actions */}
                <div className="flex items-center gap-4">
                    <div className="hidden h-8 w-px bg-zinc-100 sm:block" />
                    
                    <div className="flex items-center gap-3 pl-2">
                        <UserDropdown user={user} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardNavbarContent;
