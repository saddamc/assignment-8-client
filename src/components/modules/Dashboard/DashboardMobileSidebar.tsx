"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AuthUser } from "@/hooks/useAuthStore";
import { getIconComponent } from "@/lib/icon-mapper";
import { cn } from "@/lib/utils";
import { NavSection } from "@/types/dashboard.interface";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardMobileSidebarProps {
    user: AuthUser;
    navItems: NavSection[];
    dashboardHome: string;
}

const DashboardMobileSidebar = ({ user, navItems, dashboardHome }: DashboardMobileSidebarProps) => {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-full flex-col bg-white">
            {/* Logo Area */}
            <div className="flex h-[72px] items-center px-7 border-b border-zinc-100">
                <Link href="/" className="transition-opacity hover:opacity-80">
                    <Image src="/logo.png" alt="Cabro" width={100} height={100} priority className="object-contain" />
                </Link>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-4 py-6">
                <nav className="space-y-8">
                    {navItems.map((section, sectionIdx) => (
                        <div key={sectionIdx} className="space-y-3">
                            {section.title && (
                                <h4 className="px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-[0.1em]">
                                    {section.title}
                                </h4>
                            )}
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = getIconComponent(item.icon);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-200",
                                                isActive
                                                    ? "bg-[#131921] text-white shadow-md shadow-zinc-200"
                                                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                                            )}
                                        >
                                            <Icon className={cn(
                                                "h-[18px] w-[18px] transition-colors",
                                                isActive ? "text-[#FF9900]" : "text-zinc-400 group-hover:text-zinc-900"
                                            )} />
                                            <span className="flex-1">{item.title}</span>
                                            {item.badge && (
                                                <Badge 
                                                    variant="secondary" 
                                                    className={cn(
                                                        "ml-auto text-[10px] h-5 px-1.5 font-bold",
                                                        isActive ? "bg-white/20 text-white border-transparent" : "bg-zinc-100 text-zinc-600"
                                                    )}
                                                >
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </ScrollArea>

            {/* User Info at Bottom */}
            <div className="p-4 mt-auto border-t border-zinc-100 bg-zinc-50/50">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                    <div className="h-10 w-10 rounded-xl bg-[#131921] flex items-center justify-center shrink-0 shadow-inner">
                        <span className="text-sm font-black text-[#FF9900]">
                            {user.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[13px] font-bold text-zinc-900 truncate leading-tight">{user.name}</p>
                        <p className="text-[11px] font-medium text-zinc-500 capitalize tracking-tight">
                            {user.role.toLowerCase()} Account
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardMobileSidebar;
