import { serverFetch } from "@/lib/server-fetch";
import { Users, Store, CheckCircle, XCircle } from "lucide-react";

type Seller = {
  id: string;
  name: string;
  email: string;
  storeName?: string;
  isApproved: boolean;
  commissionRate: number;
  storeRating: number;
  createdAt: string;
};

export default async function AdminSellersPage() {
  let sellers: Seller[] = [];

  try {
    const res = await serverFetch.get("/admin/sellers?limit=50");
    const data = await res.json();
    if (data.success) sellers = data.data?.data || data.data || [];
  } catch { /* empty */ }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Admin</p>
        <h1 className="text-3xl font-serif font-bold">Seller Management</h1>
        <p className="text-zinc-400 text-sm mt-1">{sellers.length} sellers registered</p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="text-left px-6 py-4 font-semibold text-zinc-500">Seller</th>
              <th className="text-left px-6 py-4 font-semibold text-zinc-500">Email</th>
              <th className="text-left px-6 py-4 font-semibold text-zinc-500">Commission</th>
              <th className="text-left px-6 py-4 font-semibold text-zinc-500">Rating</th>
              <th className="text-left px-6 py-4 font-semibold text-zinc-500">Status</th>
              <th className="text-left px-6 py-4 font-semibold text-zinc-500">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {sellers.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-16 text-zinc-400">
                <Store className="w-10 h-10 mx-auto mb-3 text-zinc-200" />
                No sellers found
              </td></tr>
            ) : sellers.map((seller) => (
              <tr key={seller.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4 font-medium">{seller.name || seller.storeName}</td>
                <td className="px-6 py-4 text-zinc-500">{seller.email}</td>
                <td className="px-6 py-4 text-zinc-500">{seller.commissionRate}%</td>
                <td className="px-6 py-4 text-zinc-500">{"★".repeat(Math.round(seller.storeRating || 0))}{seller.storeRating?.toFixed(1) || "—"}</td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 text-xs font-bold ${seller.isApproved ? "text-emerald-600" : "text-amber-600"}`}>
                    {seller.isApproved ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {seller.isApproved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-400 text-xs">{new Date(seller.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
