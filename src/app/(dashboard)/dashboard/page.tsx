import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CustomerDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Account</h1>
                <p className="text-muted-foreground mt-1">Welcome back! Here's a summary of your activity.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Total Orders"
                    value="12"
                    iconName="Package"
                    description="All time orders"
                    iconClassName="bg-blue-100"
                />
                <StatCard
                    title="Saved Items"
                    value="5"
                    iconName="Heart"
                    description="In your wishlist"
                    iconClassName="bg-rose-100"
                />
                <StatCard
                    title="Store Credit"
                    value="$120.00"
                    iconName="CreditCard"
                    description="Available balance"
                    iconClassName="bg-green-100"
                />
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">Recent Orders</h2>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/orders">View All</Link>
                    </Button>
                </div>
                <div className="p-6 text-center text-muted-foreground py-12">
                    No recent orders found.
                </div>
            </div>
        </div>
    );
}
