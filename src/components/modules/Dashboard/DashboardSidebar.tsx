import { getDefaultDashboardRoute } from "@/lib/auth-utils";
import { getNavItemsByRole } from "@/lib/navItems.config";
import { getCurrentUser } from "@/services/auth/getCurrentUser";
import { NavSection } from "@/types/dashboard.interface";
import { AuthUser } from "@/hooks/useAuthStore";
import DashboardSidebarContent from "./DashboardSidebarContent";
import { redirect } from "next/navigation";

const DashboardSidebar = async () => {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const navItems: NavSection[] = getNavItemsByRole((user as AuthUser).role);
    const dashboardHome = getDefaultDashboardRoute((user as AuthUser).role);

    return (
        <DashboardSidebarContent
            user={user as AuthUser}
            navItems={navItems}
            dashboardHome={dashboardHome}
        />
    );
};

export default DashboardSidebar;
