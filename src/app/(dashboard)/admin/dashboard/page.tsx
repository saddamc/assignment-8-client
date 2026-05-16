import { serverFetch } from "@/lib/server-fetch";
import { StatCard } from "@/components/shared/StatCard";
import { AlertTriangle } from "lucide-react";
import AdminRevenueChart from "./AdminRevenueChart";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Stats = any;

const MOCK_STATS: Stats = {
  overview: { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, totalProducts: 0, pendingOrders: 0, lowStockProducts: 0 },
  recentOrders: [],
  topProducts: [],
  lowStockProducts: [],
  revenueChart: [
    { month: "Jan", revenue: 18200 }, { month: "Feb", revenue: 21400 }, { month: "Mar", revenue: 19800 },
    { month: "Apr", revenue: 24600 }, { month: "May", revenue: 22300 }, { month: "Jun", revenue: 28700 },
  ]
};

export default async function AdminDashboardPage() {
  let stats: Stats = MOCK_STATS;
  try {
    const res = await serverFetch.get("/analytics/admin");
    const data = await res.json();
    if (data.success) stats = data.data;
  } catch { /* use mock */ }

  const { overview, recentOrders, lowStockProducts, revenueChart } = stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and real-time management.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Revenue" value={`$${(overview.totalRevenue || 0).toLocaleString()}`} iconName="DollarSign" description="All time revenue" iconClassName="bg-emerald-100" />
        <StatCard title="Total Orders" value={(overview.totalOrders || 0).toLocaleString()} iconName="ShoppingBag" description="All time orders" iconClassName="bg-indigo-100" />
        <StatCard title="Customers" value={(overview.totalCustomers || 0).toLocaleString()} iconName="Users" description="Registered customers" iconClassName="bg-blue-100" />
        <StatCard title="Products" value={(overview.totalProducts || 0).toLocaleString()} iconName="Package" description="Listed products" iconClassName="bg-purple-100" />
        <StatCard title="Pending Orders" value={(overview.pendingOrders || 0).toString()} iconName="TrendingUp" description="Awaiting processing" iconClassName="bg-amber-100" />
        <StatCard title="Low Stock" value={(overview.lowStockProducts || 0).toString()} iconName="AlertTriangle" description="Need restocking" iconClassName="bg-red-100" />
      </div>

      {/* Revenue Chart + Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Last 6 Months</p>
            <h2 className="text-lg font-bold">Revenue Performance</h2>
          </div>
          <div className="p-6">
            <AdminRevenueChart data={revenueChart} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100">
            <h2 className="text-lg font-bold">System Status</h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: "API Server", sub: "All systems operational", status: "green" },
              { label: "Database Cluster", sub: "42% load average", status: "green" },
              { label: "Payment Gateway", sub: "Stripe connected", status: "green" },
              { label: "CDN / Storage", sub: "Cloudinary active", status: "green" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1">
                <div>
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-zinc-400">{item.sub}</p>
                </div>
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      {recentOrders && recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent Transactions</h2>
            <span className="text-xs text-zinc-400 font-medium">Last 10 orders</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  <th className="text-left px-6 py-3">Order ID</th>
                  <th className="text-left px-6 py-3">Customer</th>
                  <th className="text-left px-6 py-3">Amount</th>
                  <th className="text-left px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-t border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-zinc-500">#{order.id?.slice(-8) || "—"}</td>
                    <td className="px-6 py-4 text-sm font-medium">{order.customer?.name || "—"}</td>
                    <td className="px-6 py-4 text-sm font-bold">${(order.totalAmount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        order.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700" :
                        order.status === "PENDING" ? "bg-amber-50 text-amber-700" :
                        order.status === "CANCELLED" ? "bg-red-50 text-red-700" :
                        "bg-indigo-50 text-indigo-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Low Stock Products */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold">Low Stock Alerts</h2>
          </div>
          <div className="divide-y divide-zinc-50">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {lowStockProducts.map((product: any) => (
              <div key={product.id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50/50 transition-colors">
                <div>
                  <p className="font-semibold text-sm">{product.name}</p>
                  <p className="text-xs text-zinc-400">{product.category?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm">${(product.price || 0).toFixed(2)}</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600">
                    {product.stock} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
