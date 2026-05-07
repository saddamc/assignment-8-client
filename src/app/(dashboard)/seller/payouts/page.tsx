import { serverFetch } from "@/lib/server-fetch";
import { DollarSign, TrendingUp, Clock } from "lucide-react";

type Payout = {
  id: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: string;
  periodStart: string;
  periodEnd: string;
  transactionRef?: string;
  processedAt?: string;
};

export default async function SellerPayoutsPage() {
  let balance = { grossRevenue: 0, totalCommission: 0, totalWithdrawn: 0, availableBalance: 0 };
  let withdrawals: Payout[] = [];

  try {
    const [balRes, withRes] = await Promise.all([
      serverFetch.get("/payout/balance"),
      serverFetch.get("/payout/withdrawals"),
    ]);
    const [balData, withData] = await Promise.all([balRes.json(), withRes.json()]);
    if (balData.success) balance = balData.data;
    if (withData.success) withdrawals = withData.data?.data || withData.data || [];
  } catch { /* empty */ }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Seller</p>
        <h1 className="text-3xl font-serif font-bold">Payouts & Balance</h1>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Gross Revenue", value: balance.grossRevenue, icon: DollarSign, color: "text-emerald-600" },
          { label: "Commission Paid", value: balance.totalCommission, icon: TrendingUp, color: "text-red-500" },
          { label: "Withdrawn", value: balance.totalWithdrawn, icon: Clock, color: "text-amber-600" },
          { label: "Available", value: balance.availableBalance, icon: DollarSign, color: "text-indigo-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <div className={`${color} mb-2`}><Icon className="w-5 h-5" /></div>
            <p className="text-2xl font-black">${value.toFixed(2)}</p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Withdrawal History */}
      <div>
        <h2 className="text-xl font-bold mb-4">Withdrawal History</h2>
        {withdrawals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-12 text-center">
            <p className="text-zinc-400">No withdrawal requests yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w: Payout) => (
              <div key={w.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold">${w.amount.toFixed(2)}</p>
                  {w.processedAt && <p className="text-xs text-zinc-400">{new Date(w.processedAt).toLocaleDateString()}</p>}
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                  w.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" :
                  w.status === "PENDING" ? "bg-amber-50 text-amber-700" :
                  w.status === "REJECTED" ? "bg-red-50 text-red-700" :
                  "bg-indigo-50 text-indigo-700"
                }`}>{w.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
