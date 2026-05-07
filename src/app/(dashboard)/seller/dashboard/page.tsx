import { serverFetch } from "@/lib/server-fetch";
import { StatCard } from "@/components/shared/StatCard";
import Link from "next/link";
import { ShoppingBag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SellerStats = any;

const MOCK: SellerStats = {
  overview: { totalRevenue: 12450, totalOrders: 142, totalProducts: 38, pendingOrders: 14 },
  recentOrders: [],
  myProducts: []
};

export default async function SellerDashboardPage() {
  let stats: SellerStats = MOCK;
  try {
    const res = await serverFetch.get("/analytics/seller");
    const data = await res.json();
    if (data.success) stats = data.data;
  } catch { /* use mock */ }

  const { overview, recentOrders, myProducts } = stats;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Store Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor your store performance and orders.</p>
        </div>
        <Button asChild>
          <Link href="/seller/products/new">
            <Plus className="w-4 h-4 mr-2" /> List New Product
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={`$${(overview.totalRevenue || 0).toLocaleString()}`} iconName="DollarSign" description="All time earnings" iconClassName="bg-emerald-100" />
        <StatCard title="Total Orders" value={(overview.totalOrders || 0).toString()} iconName="ShoppingBag" description="All time orders" iconClassName="bg-indigo-100" />
        <StatCard title="Products Listed" value={(overview.totalProducts || 0).toString()} iconName="Package" description="Active listings" iconClassName="bg-purple-100" />
        <StatCard title="Pending Orders" value={(overview.pendingOrders || 0).toString()} iconName="TrendingUp" description="Need attention" iconClassName="bg-amber-100" />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Orders</h2>
          <Link href="/seller/orders" className="text-sm text-indigo-600 font-semibold hover:underline">View All</Link>
        </div>
        {recentOrders && recentOrders.length > 0 ? (
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
                    <td className="px-6 py-4 text-sm font-mono text-zinc-500">#{order.id?.slice(-8)}</td>
                    <td className="px-6 py-4 text-sm font-medium">{order.customer?.name || "—"}</td>
                    <td className="px-6 py-4 text-sm font-bold">${(order.totalAmount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        order.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700" :
                        order.status === "PENDING" ? "bg-amber-50 text-amber-700" :
                        "bg-indigo-50 text-indigo-700"
                      }`}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="w-10 h-10 text-zinc-200 mb-3" />
            <p className="text-zinc-400 text-sm">No orders yet. Once customers purchase your products, they&apos;ll appear here.</p>
          </div>
        )}
      </div>

      {/* My Products */}
      {myProducts && myProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-lg font-bold">My Products</h2>
            <Link href="/seller/products" className="text-sm text-indigo-600 font-semibold hover:underline">Manage All</Link>
          </div>
          <div className="divide-y divide-zinc-50">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {myProducts.slice(0, 6).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50/50">
                <div>
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className="text-xs text-zinc-400">{p.category?.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-sm">${(p.price || 0).toFixed(2)}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stock > 5 ? "bg-emerald-50 text-emerald-600" : p.stock > 0 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
                    {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
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


export default function SellerDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back. Here is your store performance.</p>
        </div>
        <Button>Add New Product</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Total Sales</h3>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-3xl font-bold">$12,450.00</h2>
          <p className="text-sm text-green-600 flex items-center mt-2 font-medium">
            <TrendingUp className="w-3 h-3 mr-1" /> +24.5% this week
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Orders</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-3xl font-bold">142</h2>
          <p className="text-sm text-green-600 flex items-center mt-2 font-medium">
            <TrendingUp className="w-3 h-3 mr-1" /> +12% this week
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Store Views</h3>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-3xl font-bold">3,492</h2>
          <p className="text-sm text-green-600 flex items-center mt-2 font-medium">
            <TrendingUp className="w-3 h-3 mr-1" /> +4.2% this week
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Pending Orders</h3>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-3xl font-bold">14</h2>
          <p className="text-sm text-amber-600 flex items-center mt-2 font-medium">
             Requires action
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Recent Orders</h2>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        <div className="p-6 flex items-center justify-center h-64 text-muted-foreground bg-slate-50/50">
          Order Table Placeholder
        </div>
      </div>
    </div>
  );
}
