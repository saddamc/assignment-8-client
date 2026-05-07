"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Analytics = any;

interface Props {
  analytics: Analytics;
}

export default function SellerAnalyticsClient({ analytics }: Props) {
  const { overview, revenueChart, topProducts } = analytics;

  const stats = [
    {
      label: "Total Revenue",
      value: `$${(overview.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Total Orders",
      value: (overview.totalOrders || 0).toString(),
      icon: ShoppingBag,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Products Listed",
      value: (overview.totalProducts || 0).toString(),
      icon: Package,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Pending Orders",
      value: (overview.pendingOrders || 0).toString(),
      icon: TrendingUp,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}
            >
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black">{stat.value}</p>
            <p className="text-xs text-zinc-400 font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <h2 className="text-lg font-bold mb-6">Revenue Over Time</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChart}>
              <defs>
                <linearGradient id="sellerRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#a1a1aa" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#a1a1aa" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e4e4e7",
                  borderRadius: 12,
                  fontSize: 13,
                }}
                formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#sellerRevGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      {topProducts && topProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b">
            <h2 className="font-bold text-lg">Top Products by Revenue</h2>
          </div>
          <div className="divide-y">
            {topProducts.slice(0, 5).map((p: Analytics, i: number) => (
              <div key={p.id || i} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-zinc-400 w-5">{i + 1}</span>
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-zinc-400">{p.sales || 0} units sold</p>
                  </div>
                </div>
                <p className="font-bold">${(p.revenue || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
