import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { serverFetch } from "@/lib/server-fetch";
import CustomerSpendChart from "./CustomerSpendChart";

interface Order {
  id: string;
  createdAt?: string;
  status?: string;
  totalAmount?: number;
}

interface WishlistItem {
  id: string;
}

function buildMonthlySpendData(orders: Order[]) {
  const monthlyMap: Record<string, { spend: number; orders: number }> = {};

  orders.forEach((order) => {
    if (!order.createdAt) return;
    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) return;

    const monthKey = date.toLocaleString("default", { month: "short", year: "numeric" });
    monthlyMap[monthKey] = monthlyMap[monthKey] || { spend: 0, orders: 0 };
    monthlyMap[monthKey].spend += Number(order.totalAmount || 0);
    monthlyMap[monthKey].orders += 1;
  });

  return Object.entries(monthlyMap)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([period, stats]) => ({ period, spend: stats.spend, orders: stats.orders }));
}

export default async function CustomerDashboard() {
    let orders: Order[] = [];
    let wishlist: WishlistItem[] = [];

    try {
        const [ordersRes, wishlistRes] = await Promise.all([
            serverFetch.get("/orders/my-orders?limit=100"),
            serverFetch.get("/wishlist"),
        ]);

        const [ordersData, wishlistData] = await Promise.all([ordersRes.json(), wishlistRes.json()]);

        if (ordersRes.ok && ordersData.success) {
            orders = ordersData.data?.data || ordersData.data || [];
        }

        if (wishlistRes.ok && wishlistData.success) {
            wishlist = wishlistData.data?.data || wishlistData.data || [];
        }
    } catch {
        // fallback to empty data
    }

    const totalSpend = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const avgOrderValue = orders.length ? totalSpend / orders.length : 0;
    const monthlySpendData = buildMonthlySpendData(orders);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Account</h1>
                <p className="text-muted-foreground mt-1">Welcome back! Here's a summary of your activity.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Orders"
                    value={orders.length.toString()}
                    iconName="Package"
                    description="All time orders"
                    iconClassName="bg-blue-100"
                />
                <StatCard
                    title="Lifetime Spend"
                    value={`$${totalSpend.toFixed(2)}`}
                    iconName="CreditCard"
                    description="Total amount spent"
                    iconClassName="bg-emerald-100"
                />
                <StatCard
                    title="Avg Order Value"
                    value={`$${avgOrderValue.toFixed(2)}`}
                    iconName="TrendingUp"
                    description="Average spend per order"
                    iconClassName="bg-violet-100"
                />
                <StatCard
                    title="Saved Items"
                    value={wishlist.length.toString()}
                    iconName="Heart"
                    description="In your wishlist"
                    iconClassName="bg-rose-100"
                />
            </div>

            <CustomerSpendChart
                data={monthlySpendData}
                title="Spend Trend"
                subtitle="Monthly purchase value"
            />

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">Recent Orders</h2>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/orders">View All</Link>
                    </Button>
                </div>
                <div className="p-6 text-center text-muted-foreground py-12">
                    {orders.length === 0 ? (
                        "No recent orders found."
                    ) : (
                        <div className="space-y-4">
                            {orders.slice(0, 5).map((order) => (
                                <div key={order.id}>
                                    <p className="font-semibold">Order #{order.id.slice(-8).toUpperCase()}</p>
                                    <p className="text-sm text-muted-foreground">{order.status || "Pending"}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
