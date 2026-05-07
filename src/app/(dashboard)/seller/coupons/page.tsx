import { serverFetch } from "@/lib/server-fetch";
import { Tag, Plus } from "lucide-react";
import Link from "next/link";

type Coupon = {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
};

export default async function SellerCouponsPage() {
  let coupons: Coupon[] = [];

  try {
    const res = await serverFetch.get("/coupon/my-coupons");
    const data = await res.json();
    if (data.success) coupons = data.data?.data || data.data || [];
  } catch { /* empty */ }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Seller</p>
          <h1 className="text-3xl font-serif font-bold">Coupons</h1>
        </div>
        <Link
          href="/seller/coupons/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Coupon
        </Link>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
          <Tag className="w-12 h-12 text-zinc-200 mb-4" />
          <h3 className="text-lg font-bold mb-2">No coupons yet</h3>
          <p className="text-zinc-400 text-sm mb-6">Create discount coupons for your store.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-50 rounded-xl p-3">
                  <Tag className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-mono font-bold text-lg tracking-wider">{coupon.code}</p>
                  <p className="text-sm text-zinc-500">
                    {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}% off` : `$${coupon.discountValue} off`}
                    {" · "}Min order: ${coupon.minOrderAmount}
                    {coupon.maxUses && ` · ${coupon.usedCount}/${coupon.maxUses} used`}
                  </p>
                  {coupon.expiresAt && (
                    <p className="text-xs text-zinc-400 mt-0.5">Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${coupon.isActive ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                  {coupon.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
