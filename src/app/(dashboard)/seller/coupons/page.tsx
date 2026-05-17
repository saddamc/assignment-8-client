"use client";

import { useState, useEffect } from "react";
import { Tag, Plus, Trash2, Calendar, Sparkles, Loader2, Copy, Check, ToggleLeft, ToggleRight, DollarSign, Percent } from "lucide-react";
import { clientFetch } from "@/lib/client-fetch";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number;
  maxUses?: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string | null;
}

export default function SellerCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal form states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("0");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    try {
      const res = await clientFetch("/coupon/my-coupons");
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data || []);
      }
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }

  const handleCopyCode = (couponId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(couponId);
    toast.success("Coupon code copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = async (coupon: Coupon) => {
    setActionLoading(coupon.id);
    try {
      const nextActive = !coupon.isActive;
      const res = await clientFetch(`/coupon/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, isActive: nextActive } : c))
        );
        toast.success(`Coupon ${nextActive ? "activated" : "deactivated"} successfully!`);
      } else {
        toast.error(data.message || "Failed to update coupon status");
      }
    } catch {
      toast.error("Request failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) return;
    setActionLoading(id);
    try {
      const res = await clientFetch(`/coupon/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        toast.success("Coupon deleted successfully!");
      } else {
        toast.error(data.message || "Failed to delete coupon");
      }
    } catch {
      toast.error("Request failed");
    } finally {
      setActionLoading(null);
    }
  };

  const generateRandomCode = () => {
    const prefixes = ["SAVE", "OFF", "VIP", "DEAL", "MEGA", "PROMO"];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(10 + Math.random() * 90); // 2 digit number
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    setCode(`${randomPrefix}${randomNum}${randomStr}`);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return toast.error("Coupon code is required");
    if (!discountValue || Number(discountValue) <= 0) return toast.error("Invalid discount value");

    setFormSubmitting(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount || 0),
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      const res = await clientFetch("/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Coupon created successfully!");
        setIsCreateOpen(false);
        // Reset form
        setCode("");
        setDiscountType("PERCENTAGE");
        setDiscountValue("");
        setMinOrderAmount("0");
        setMaxUses("");
        setExpiresAt("");
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to create coupon");
      }
    } catch {
      toast.error("Failed to create coupon");
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Loading coupons...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Seller</p>
          <h1 className="text-3xl font-serif font-bold">Coupons</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage and toggle discount coupons for your store.</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-100 hover:translate-y-[-1px]"
        >
          <Plus className="w-4 h-4" /> New Coupon
        </Button>
      </div>

      {/* Main List */}
      {coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
          <div className="bg-zinc-50 rounded-2xl p-4 mb-4">
            <Tag className="w-10 h-10 text-zinc-300" />
          </div>
          <h3 className="text-lg font-bold mb-2">No coupons yet</h3>
          <p className="text-zinc-400 text-sm mb-6 max-w-sm">Create custom discount coupons to boost conversions and drive sales for your store.</p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-100 px-6 py-2.5 rounded-xl transition-colors"
          >
            Create Your First Coupon
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm p-6 flex flex-col justify-between ${
                coupon.isActive 
                  ? "border-zinc-100 hover:shadow-md hover:border-zinc-200" 
                  : "border-zinc-100 opacity-70 bg-zinc-50/50"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2.5 ${coupon.isActive ? "bg-indigo-50 text-indigo-600" : "bg-zinc-100 text-zinc-400"}`}>
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg tracking-wider text-zinc-900">{coupon.code}</span>
                        <button
                          onClick={() => handleCopyCode(coupon.id, coupon.code)}
                          className="p-1 rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                          title="Copy Code"
                        >
                          {copiedId === coupon.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-xs text-zinc-400">Coupon Code</p>
                    </div>
                  </div>

                  {/* Active Toggle Switch */}
                  <button
                    onClick={() => handleToggleActive(coupon)}
                    disabled={actionLoading === coupon.id}
                    className="focus:outline-none transition-opacity hover:opacity-80"
                    title={coupon.isActive ? "Deactivate Coupon" : "Activate Coupon"}
                  >
                    {coupon.isActive ? (
                      <ToggleRight className="w-9 h-9 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-zinc-300" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-zinc-50 rounded-xl p-3 border border-zinc-100/50">
                  <div>
                    <span className="text-xs text-zinc-400 block">Discount</span>
                    <span className="text-sm font-bold text-zinc-800">
                      {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}% Off` : `$${coupon.discountValue} Off`}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 block">Min. Order</span>
                    <span className="text-sm font-bold text-zinc-800">${coupon.minOrderAmount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {coupon.expiresAt 
                        ? `Expires: ${new Date(coupon.expiresAt).toLocaleDateString()}` 
                        : "No expiry"}
                    </span>
                  </div>
                  <span>
                    {coupon.maxUses 
                      ? `${coupon.usedCount} / ${coupon.maxUses} Uses` 
                      : `${coupon.usedCount} Uses`}
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="border-t border-zinc-100 mt-5 pt-4 flex items-center justify-between">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${coupon.isActive ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                  {coupon.isActive ? "Active" : "Inactive"}
                </span>

                <Button
                  onClick={() => handleDeleteCoupon(coupon.id)}
                  disabled={actionLoading === coupon.id}
                  variant="ghost"
                  className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50/50 rounded-lg flex items-center gap-1 px-2.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Coupon Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white border border-zinc-100 shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" /> Create New Coupon
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateCoupon} className="space-y-4 py-2">
            {/* Coupon Code */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase block">Coupon Code</label>
              <div className="flex gap-2">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER50"
                  className="font-mono uppercase font-bold tracking-wider placeholder:normal-case placeholder:font-normal placeholder:tracking-normal rounded-xl border-zinc-200"
                />
                <Button
                  type="button"
                  onClick={generateRandomCode}
                  variant="outline"
                  className="rounded-xl border-zinc-200 flex items-center gap-1 px-3 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Random
                </Button>
              </div>
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase block">Discount Type</label>
                <Select
                  value={discountType}
                  onValueChange={(value: "PERCENTAGE" | "FIXED") => setDiscountType(value)}
                >
                  <SelectTrigger className="rounded-xl border-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-zinc-100 rounded-xl">
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase block">Discount Value</label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0.01"
                    step="any"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === "PERCENTAGE" ? "20" : "15"}
                    className="rounded-xl border-zinc-200 pr-8"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                    {discountType === "PERCENTAGE" ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Min Order & Max Uses */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase block">Min. Order ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  placeholder="e.g. 50"
                  className="rounded-xl border-zinc-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase block">Max. Uses (Optional)</label>
                <Input
                  type="number"
                  min="1"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="Unlimited"
                  className="rounded-xl border-zinc-200"
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase block">Expiry Date (Optional)</label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="rounded-xl border-zinc-200"
              />
            </div>

            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl border border-transparent hover:bg-zinc-50 text-zinc-500"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formSubmitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                {formSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Coupon"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
