import { getDefaultDashboardRoute } from "@/lib/auth-utils";
import { getNavItemsByRole } from "@/lib/navItems.config";
import { getCurrentUser } from "@/services/auth/getCurrentUser";
import { AuthUser } from "@/hooks/useAuthStore";
import DashboardNavbarContent from "./DashboardNavbarContent";

const DashboardNavbar = async () => {
    const user = (await getCurrentUser()) as AuthUser;
    const navItems = getNavItemsByRole(user.role);
    const dashboardHome = getDefaultDashboardRoute(user.role);

    return (
        <DashboardNavbarContent
            user={user}
            navItems={navItems}
            dashboardHome={dashboardHome}
        />
    );
};

export default DashboardNavbar;
