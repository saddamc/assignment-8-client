import { getDefaultDashboardRoute } from "@/lib/auth-utils";
import { getNavItemsByRole } from "@/lib/navItems.config";
import { getCurrentUser } from "@/services/auth/getCurrentUser";
import { NavSection } from "@/types/dashboard.interface";
import { AuthUser } from "@/hooks/useAuthStore";
import DashboardSidebarContent from "./DashboardSidebarContent";

const DashboardSidebar = async () => {
    const user = (await getCurrentUser()) as AuthUser;
    const navItems: NavSection[] = getNavItemsByRole(user.role);
    const dashboardHome = getDefaultDashboardRoute(user.role);

    return (
        <DashboardSidebarContent
            user={user}
            navItems={navItems}
            dashboardHome={dashboardHome}
        />
    );
};

export default DashboardSidebar;
