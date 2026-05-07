import { NavSection } from "@/types/dashboard.interface";
import { UserRole } from "./auth-utils";

export const getCustomerNavItems = (): NavSection[] => [
    {
        items: [
            { title: "Overview", href: "/dashboard", icon: "LayoutDashboard", roles: ["CUSTOMER"] },
            { title: "My Orders", href: "/dashboard/orders", icon: "Package", roles: ["CUSTOMER"] },
            { title: "Wishlist", href: "/dashboard/wishlist", icon: "Heart", roles: ["CUSTOMER"] },
        ],
    },
    {
        title: "Account",
        items: [
            { title: "My Profile", href: "/dashboard/my-profile", icon: "User", roles: ["CUSTOMER"] },
            { title: "Change Password", href: "/change-password", icon: "KeyRound", roles: ["CUSTOMER"] },
        ],
    },
    {
        title: "Quick Links",
        items: [
            { title: "Shop", href: "/", icon: "ShoppingBag", roles: ["CUSTOMER"] },
        ],
    },
];

export const getSellerNavItems = (): NavSection[] => [
    {
        items: [
            { title: "Dashboard", href: "/seller/dashboard", icon: "LayoutDashboard", roles: ["SELLER"] },
        ],
    },
    {
        title: "Store",
        items: [
            { title: "My Products", href: "/seller/products", icon: "Package", roles: ["SELLER"] },
            { title: "Orders", href: "/seller/orders", icon: "ShoppingBag", roles: ["SELLER"] },
            { title: "Analytics", href: "/seller/analytics", icon: "BarChart3", roles: ["SELLER"] },
        ],
    },
    {
        title: "Account",
        items: [
            { title: "My Profile", href: "/dashboard/my-profile", icon: "User", roles: ["SELLER"] },
            { title: "Store Settings", href: "/seller/settings", icon: "Settings", roles: ["SELLER"] },
            { title: "Change Password", href: "/change-password", icon: "KeyRound", roles: ["SELLER"] },
        ],
    },
];

export const getAdminNavItems = (): NavSection[] => [
    {
        items: [
            { title: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard", roles: ["ADMIN"] },
        ],
    },
    {
        title: "Management",
        items: [
            { title: "Users", href: "/admin/users", icon: "Users", roles: ["ADMIN"] },
            { title: "Products", href: "/admin/products", icon: "Package", roles: ["ADMIN"] },
            { title: "Transactions", href: "/admin/transactions", icon: "CreditCard", roles: ["ADMIN"] },
        ],
    },
    {
        title: "Account",
        items: [
            { title: "My Profile", href: "/dashboard/my-profile", icon: "User", roles: ["ADMIN"] },
            { title: "Admin Settings", href: "/admin/settings", icon: "Settings", roles: ["ADMIN"] },
            { title: "Change Password", href: "/change-password", icon: "KeyRound", roles: ["ADMIN"] },
        ],
    },
];

export const getNavItemsByRole = (role: UserRole): NavSection[] => {
    if (role === "ADMIN") return getAdminNavItems();
    if (role === "SELLER") return getSellerNavItems();
    return getCustomerNavItems();
};
