"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AuthUser } from "@/hooks/useAuthStore";
import { NavSection } from "@/types/dashboard.interface";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardMobileSidebar from "./DashboardMobileSidebar";
import UserDropdown from "./UserDropdown";

interface DashboardNavbarContentProps {
    user: AuthUser;
    navItems: NavSection[];
    dashboardHome: string;
}

const DashboardNavbarContent = ({ user, navItems, dashboardHome }: DashboardNavbarContentProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
                {/* Mobile Menu Toggle */}
                <Sheet open={isMobile && isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SheetDescription className="sr-only">Access your dashboard navigation options</SheetDescription>
                        <DashboardMobileSidebar
                            user={user}
                            navItems={navItems}
                            dashboardHome={dashboardHome}
                        />
                    </SheetContent>
                </Sheet>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">
                    <UserDropdown user={user} />
                </div>
            </div>
        </header>
    );
};

export default DashboardNavbarContent;
