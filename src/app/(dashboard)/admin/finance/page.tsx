import { serverFetch } from "@/lib/server-fetch";
import { TrendingUp, DollarSign, ShoppingBag } from "lucide-react";

async function getRevenue(period: string) {
  try {
    const res = await serverFetch.get(`/admin/finance/revenue?period=${period}`);
    const data = await res.json();
    if (data.success) return data.data;
  } catch { /* empty */ }
  return { grossRevenue: 0, platformEarnings: 0, orderCount: 0 };
}

export default async function AdminFinancePage() {
  const [day, week, month] = await Promise.all([getRevenue("day"), getRevenue("week"), getRevenue("month")]);

  const periods = [
    { label: "Today", data: day },
    { label: "This Week", data: week },
    { label: "This Month", data: month },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Admin</p>
        <h1 className="text-3xl font-serif font-bold">Finance Overview</h1>
      </div>

      {periods.map(({ label, data }) => (
        <div key={label}>
          <h2 className="text-lg font-bold mb-4">{label}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
              <div className="text-emerald-600 mb-2"><DollarSign className="w-5 h-5" /></div>
              <p className="text-2xl font-black">${(data.grossRevenue ?? 0).toFixed(2)}</p>
              <p className="text-xs text-zinc-400 mt-1 font-medium">Gross Revenue</p>
            </div>
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
              <div className="text-indigo-600 mb-2"><TrendingUp className="w-5 h-5" /></div>
              <p className="text-2xl font-black">${(data.platformEarnings ?? 0).toFixed(2)}</p>
              <p className="text-xs text-zinc-400 mt-1 font-medium">Platform Earnings</p>
            </div>
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
              <div className="text-amber-600 mb-2"><ShoppingBag className="w-5 h-5" /></div>
              <p className="text-2xl font-black">{data.orderCount ?? 0}</p>
              <p className="text-xs text-zinc-400 mt-1 font-medium">Paid Orders</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
