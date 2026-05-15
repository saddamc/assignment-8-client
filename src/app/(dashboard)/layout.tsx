import DashboardNavbar from "@/components/modules/Dashboard/DashboardNavbar";
import DashboardShell from "@/components/modules/Dashboard/DashboardShell";
import DashboardSidebar from "@/components/modules/Dashboard/DashboardSidebar";
import React from "react";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardShell
            sidebar={<DashboardSidebar />}
            navbar={<DashboardNavbar />}
        >
            {children}
        </DashboardShell>
    );
}
