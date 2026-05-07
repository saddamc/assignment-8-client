import { serverFetch } from "@/lib/server-fetch";
import SellerAnalyticsClient from "./SellerAnalyticsClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Analytics = any;

const MOCK: Analytics = {
  overview: { totalRevenue: 12450, totalOrders: 142, totalProducts: 38, pendingOrders: 14 },
  revenueChart: [
    { month: "Jan", revenue: 1800 },
    { month: "Feb", revenue: 2400 },
    { month: "Mar", revenue: 1900 },
    { month: "Apr", revenue: 3200 },
    { month: "May", revenue: 2800 },
    { month: "Jun", revenue: 3600 },
  ],
  topProducts: [],
};

export default async function SellerAnalyticsPage() {
  let analytics: Analytics = MOCK;

  try {
    const res = await serverFetch.get("/analytics/seller");
    const data = await res.json();
    if (data.success) analytics = { ...MOCK, ...data.data };
  } catch { /* use mock */ }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">
          Insights
        </p>
        <h1 className="text-3xl font-serif font-bold">Analytics</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Your store performance at a glance.
        </p>
      </div>

      <SellerAnalyticsClient analytics={analytics} />
    </div>
  );
}
