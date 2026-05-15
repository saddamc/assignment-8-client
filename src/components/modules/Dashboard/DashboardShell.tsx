import React from "react";

interface DashboardShellProps {
    sidebar: React.ReactNode;
    navbar: React.ReactNode;
    children: React.ReactNode;
}

export default function DashboardShell({ sidebar, navbar, children }: DashboardShellProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-[#f9fafb]">
            {sidebar}
            <div className="flex flex-1 flex-col overflow-hidden">
                {navbar}
                <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-12">
                    <div className="mx-auto max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
    );
}