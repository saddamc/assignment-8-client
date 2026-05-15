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

interface DashboardSidebarContentProps {
    user: AuthUser;
    navItems: NavSection[];
    dashboardHome: string;
}

const DashboardSidebarContent = ({ user, navItems, dashboardHome }: DashboardSidebarContentProps) => {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex h-full w-64 flex-col border-r bg-white shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
            {/* Logo/Brand Area */}
            <div className="flex h-[72px] items-center px-7 border-b border-zinc-100">
                <Link href="/" className="transition-opacity hover:opacity-80">
                    <Image src="/logo.png" alt="Cabro" width={110} height={110} priority className="object-contain" />
                </Link>
            </div>

            {/* Navigation Sections */}
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

            {/* Premium User Profile Section at Bottom */}
            <div className="p-4 mt-auto border-t border-zinc-100 bg-zinc-50/50">
                <div className="flex items-center gap-3 p-2 rounded-2xl bg-white border border-zinc-100 shadow-sm transition-all hover:border-zinc-200 group cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-[#131921] flex items-center justify-center shrink-0 shadow-inner">
                        <span className="text-sm font-black text-[#FF9900]">
                            {user.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[13px] font-bold text-zinc-900 truncate leading-tight">{user.name}</p>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <p className="text-[11px] font-medium text-zinc-500 capitalize tracking-tight">
                                {user.role.toLowerCase()} Account
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default DashboardSidebarContent;
