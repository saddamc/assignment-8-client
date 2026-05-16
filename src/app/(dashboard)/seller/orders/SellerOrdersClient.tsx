"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, ShoppingCart, Users, Phone, MapPin, X, Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { clientFetch } from "@/lib/client-fetch";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SellerOrder = any;

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  PACKED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  SHIPPED: "bg-violet-50 text-violet-700 border-violet-200",
  ON_THE_WAY: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  REFUNDED: "bg-zinc-100 text-zinc-600 border-zinc-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_OPTIONS = [
  { key: "PENDING", label: "Pending", desc: "Awaiting confirmation", color: "amber" },
  { key: "PROCESSING", label: "Confirmed", desc: "Order accepted for processing", color: "blue" },
  { key: "PACKED", label: "Packed", desc: "Order packed and ready to ship", color: "indigo" },
  { key: "SHIPPED", label: "Shipped", desc: "Handed over to courier", color: "violet" },
  { key: "ON_THE_WAY", label: "On The Way", desc: "In transit to customer", color: "purple" },
  { key: "DELIVERED", label: "Delivered", desc: "Successfully delivered", color: "emerald" },
  { key: "CANCELLED", label: "Cancelled", desc: "Order cancelled", color: "red" },
  { key: "REFUNDED", label: "Refunded", desc: "Payment refunded", color: "zinc" },
];

const FINAL_STATUSES = ["DELIVERED", "CANCELLED", "REFUNDED"];

const STATUS_MODAL_COLORS: Record<string, string> = {
  amber: "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
  blue: "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100",
  indigo: "border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
  violet: "border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100",
  purple: "border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100",
  emerald: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  red: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100",
  zinc: "border-zinc-300 bg-zinc-50 text-zinc-700 hover:bg-zinc-100",
};

const STATUS_ACTIVE_COLORS: Record<string, string> = {
  amber: "border-amber-500 bg-amber-100 text-amber-800 ring-2 ring-amber-300",
  blue: "border-blue-500 bg-blue-100 text-blue-800 ring-2 ring-blue-300",
  indigo: "border-indigo-500 bg-indigo-100 text-indigo-800 ring-2 ring-indigo-300",
  violet: "border-violet-500 bg-violet-100 text-violet-800 ring-2 ring-violet-300",
  purple: "border-purple-500 bg-purple-100 text-purple-800 ring-2 ring-purple-300",
  emerald: "border-emerald-500 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300",
  red: "border-red-500 bg-red-100 text-red-800 ring-2 ring-red-300",
  zinc: "border-zinc-500 bg-zinc-100 text-zinc-800 ring-2 ring-zinc-300",
};

const ORDER_TABS = [
  { key: "ALL", label: "All", statuses: ["ALL"] },
  { key: "PENDING", label: "Pending", statuses: ["PENDING"] },
  { key: "PROCESSING", label: "Confirmed", statuses: ["PROCESSING"] },
  { key: "ON_THE_WAY", label: "On Hold", statuses: ["ON_THE_WAY", "PACKED", "SHIPPED"] },
  { key: "DELIVERED", label: "Delivered", statuses: ["DELIVERED"] },
  { key: "CANCELLED", label: "Cancelled", statuses: ["CANCELLED"] },
  { key: "REFUNDED", label: "Returned", statuses: ["REFUNDED"] },
  { key: "FAILED", label: "Failed", statuses: ["FAILED"] },
];

const money = (value: number) => `$${Number(value || 0).toFixed(2)}`;

interface SellerOrdersClientProps {
  initialOrders: SellerOrder[];
}

export default function SellerOrdersClient({ initialOrders }: SellerOrdersClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<SellerOrder[]>(initialOrders);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [draftQuery, setDraftQuery] = useState("");
  const [statusModal, setStatusModal] = useState<SellerOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [warningModal, setWarningModal] = useState<{ orderId: string; status: string; orderNo: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: orders.length,
      PENDING: 0,
      PROCESSING: 0,
      ON_THE_WAY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      REFUNDED: 0,
      FAILED: 0,
    };

    orders.forEach((order) => {
      const status = String(order.status || "PENDING").toUpperCase();
      if (status === "PENDING") counts.PENDING += 1;
      if (status === "PROCESSING") counts.PROCESSING += 1;
      if (status === "PACKED" || status === "SHIPPED" || status === "ON_THE_WAY") counts.ON_THE_WAY += 1;
      if (status === "DELIVERED") counts.DELIVERED += 1;
      if (status === "CANCELLED") counts.CANCELLED += 1;
      if (status === "REFUNDED") counts.REFUNDED += 1;
      if (status === "FAILED") counts.FAILED += 1;
    });

    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const status = String(order.status || "PENDING").toUpperCase();
      const tab = ORDER_TABS.find((t) => t.key === activeTab);
      const passStatus = !tab || tab.key === "ALL" || tab.statuses.includes(status);
      if (!passStatus) return false;

      if (!q) return true;

      const customer = `${order.customer?.name || ""} ${order.customer?.email || ""} ${order.contactNumber || ""}`.toLowerCase();
      const orderId = String(order.id || "").toLowerCase();
      const shipping = String(order.shippingAddress || "").toLowerCase();
      const products = (order.items || [])
        .map((item: SellerOrder) => String(item.product?.name || ""))
        .join(" ")
        .toLowerCase();

      return customer.includes(q) || orderId.includes(q) || shipping.includes(q) || products.includes(q);
    });
  }, [activeTab, orders, searchQuery]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await clientFetch(`/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to update order status");
        return;
      }

      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)));
      toast.success(`Order status changed to ${status.replaceAll("_", " ")}`);
      setStatusModal(null);
      setSelectedStatus(null);
      setWarningModal(null);
      router.refresh();
    } catch {
      toast.error("Network error while updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  const loadOrders = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await clientFetch("/orders/seller-orders?limit=100", { method: "GET" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (showLoader) toast.error(data.message || "Failed to load orders");
        return;
      }
      setOrders(data.data?.data || data.data || []);
    } catch {
      if (showLoader) toast.error("Network error while loading orders");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      void loadOrders(false);
    }, 30_000);
    return () => clearInterval(timer);
  }, [loadOrders]);

  const openStatusModal = (order: SellerOrder) => {
    const statusKey = String(order.status || "PENDING").toUpperCase();
    if (FINAL_STATUSES.includes(statusKey)) return;
    setStatusModal(order);
    setSelectedStatus(statusKey);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Orders</h1>
            <p className="text-[12px] text-gray-400">Order List - auto-refreshes every 30s</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-purple-100/60 p-4 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Order</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ORDER_TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 border ${
                  active
                    ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200"
                    : "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600"
                }`}
              >
                {tab.label}
                <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-bold px-1 ${active ? "bg-white/20 text-white" : "bg-purple-100 text-purple-600"}`}>
                  {statusCounts[tab.key] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div />
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={draftQuery}
              onChange={(e) => setDraftQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const query = draftQuery.trim();
                  setSearchQuery(query);
                  if (!query) setActiveTab("ALL");
                  void loadOrders(true);
                }
              }}
              className="rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition w-full sm:w-60"
            />
          </div>
          <button
            onClick={() => {
              const query = draftQuery.trim();
              setSearchQuery(query);
              if (!query) setActiveTab("ALL");
              void loadOrders(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[13px] text-gray-500 hover:text-purple-600 hover:border-purple-300 transition"
            title="Refresh / Apply Search"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-purple-100/60 overflow-hidden shadow-sm">
        {loading ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-purple-50/50 animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <p className="text-center py-24 text-gray-400 text-sm">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-245">
              <div className="grid grid-cols-[50px_160px_1fr_1fr_120px_120px_120px_140px_110px] gap-2 px-5 py-3 bg-purple-50/70 text-[10px] font-bold uppercase tracking-widest text-purple-500 border-b border-purple-100">
                <span>SL</span>
                <span>Order No & Date</span>
                <span>Customer Info</span>
                <span>Product Info</span>
                <span>Discount</span>
                <span>Total Price</span>
                <span>Due</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              <div className="divide-y divide-purple-50">
                {filteredOrders.map((order, idx) => {
                  const statusKey = String(order.status || "PENDING").toUpperCase();
                  const sellerAmount = (order.items || []).reduce(
                    (sum: number, item: SellerOrder) => sum + Number(item.price || 0) * Number(item.quantity || 1),
                    0
                  );
                  const totalQty = (order.items || []).reduce((sum: number, item: SellerOrder) => sum + Number(item.quantity || 0), 0);
                  const firstItem = order.items?.[0];
                  const firstImage = firstItem?.product?.images?.[0];
                  const isDue = order.paymentMethod === "COD" && order.paymentStatus !== "PAID";
                  const badgeClass = STATUS_BADGE[statusKey] || "bg-gray-50 text-gray-600 border-gray-200";
                  const discount = Number(order.discountAmount || 0);

                  return (
                    <div key={order.id} className="group">
                      <div className="grid grid-cols-[50px_160px_1fr_1fr_120px_120px_120px_140px_110px] items-center gap-2 px-5 py-3.5 text-left hover:bg-purple-50/30 transition">
                        <span className="text-[12px] text-purple-500 font-bold">{idx + 1}</span>

                        <div>
                          <p className="text-[12px] font-bold text-purple-600">#{String(order.id || "").slice(-8).toUpperCase()}</p>
                          <p className="text-[10px] text-gray-400">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })
                              : "--/--/--"}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3 w-3 text-gray-400 shrink-0" />
                            <span className="text-[12px] font-semibold text-gray-700 truncate">{order.customer?.name || "Customer"}</span>
                          </div>
                          {order.contactNumber && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-gray-400 shrink-0" />
                              <span className="text-[11px] text-gray-500">{order.contactNumber}</span>
                            </div>
                          )}
                          {order.shippingAddress && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                              <span className="text-[10px] text-gray-400 truncate">{order.shippingAddress}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 min-w-0">
                          {firstImage && (
                            <div className="h-9 w-9 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-purple-100">
                              <Image src={firstImage} alt={firstItem?.product?.name || "Product"} width={36} height={36} className="object-cover w-full h-full" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-[12px] text-gray-700 truncate">{firstItem?.product?.name || "Product"}</p>
                            <p className="text-[11px] text-purple-500 font-semibold">{money(firstItem?.price || 0)}</p>
                            <p className="text-[10px] text-gray-400">Quantity: {totalQty}</p>
                          </div>
                        </div>

                        <span className="text-[12px] text-gray-500">{money(discount)}</span>
                        <span className="text-[13px] font-bold text-gray-700">{money(sellerAmount)}</span>
                        <span className="text-[13px] font-bold text-gray-700">{isDue ? money(sellerAmount) : money(0)}</span>

                        <button
                          onClick={() => openStatusModal(order)}
                          disabled={FINAL_STATUSES.includes(statusKey)}
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize transition ${FINAL_STATUSES.includes(statusKey) ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:shadow"} ${badgeClass}`}
                          title={FINAL_STATUSES.includes(statusKey) ? `Status locked (${statusKey.replaceAll("_", " ")})` : "Click to change status"}
                        >
                          {statusKey.replaceAll("_", " ")}
                        </button>

                        <Link href={`/seller/orders/${String(order.id || "").slice(-8).toUpperCase()}`} className="inline-flex items-center justify-center rounded-full border border-purple-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-purple-600 hover:bg-purple-50 transition">
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {statusModal && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setStatusModal(null);
              setSelectedStatus(null);
            }}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl border border-purple-100 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-purple-50 bg-purple-50/30">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">Update Order Status</h3>
                <p className="text-[12px] text-gray-400">Order #{String(statusModal.id || "").slice(-8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => {
                  setStatusModal(null);
                  setSelectedStatus(null);
                }}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-2">
              {STATUS_OPTIONS.map((option) => {
                const currentStatus = String(statusModal.status || "PENDING").toUpperCase();
                const isCurrent = currentStatus === option.key;
                const isSelected = selectedStatus === option.key;
                const colorClass = isCurrent || isSelected
                  ? STATUS_ACTIVE_COLORS[option.color]
                  : STATUS_MODAL_COLORS[option.color];

                return (
                  <button
                    key={option.key}
                    disabled={isCurrent}
                    onClick={() => setSelectedStatus(option.key)}
                    className={`w-full flex items-center gap-4 rounded-xl border-2 px-4 py-3.5 text-left transition-all duration-200 disabled:opacity-50 ${colorClass}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold">{option.label}</p>
                      <p className="text-[11px] opacity-70">{option.desc}</p>
                    </div>
                    {isCurrent && <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Current</span>}
                    {isSelected && !isCurrent && <span className="text-[10px] font-bold uppercase tracking-wider">Selected</span>}
                  </button>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t border-purple-50 bg-gray-50/50 flex items-center justify-between">
              <button
                onClick={() => {
                  setStatusModal(null);
                  setSelectedStatus(null);
                }}
                className="px-4 py-2.5 rounded-xl text-[13px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                disabled={!selectedStatus || selectedStatus === String(statusModal.status || "").toUpperCase() || updatingId === statusModal.id}
                onClick={() => {
                  if (!selectedStatus) return;
                  if (FINAL_STATUSES.includes(selectedStatus)) {
                    setWarningModal({
                      orderId: statusModal.id,
                      status: selectedStatus,
                      orderNo: String(statusModal.id || "").slice(-8).toUpperCase(),
                    });
                    return;
                  }
                  void updateOrderStatus(statusModal.id, selectedStatus);
                }}
                className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md shadow-purple-200 flex items-center gap-2"
              >
                {updatingId === statusModal.id && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm Status Change
              </button>
            </div>
          </div>
        </div>
      )}

      {warningModal && (
        <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setWarningModal(null)} />

          <div className="relative bg-white rounded-2xl shadow-2xl border border-red-200 w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-[18px] font-bold text-gray-800 mb-2">Warning: Final Status</h3>
              <p className="text-[13px] text-gray-500 mb-1">
                You are about to set order <strong>#{warningModal.orderNo}</strong> to
              </p>
              <p className="text-[16px] font-bold capitalize text-red-600 mb-4">{warningModal.status.replaceAll("_", " ")}</p>

              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5">
                <p className="text-[12px] text-red-600 font-medium">
                  This action is final. After this, status changes are locked.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setWarningModal(null)}
                  className="flex-1 px-4 py-3 rounded-xl text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                >
                  Go Back
                </button>
                <button
                  disabled={updatingId === warningModal.orderId}
                  onClick={() => void updateOrderStatus(warningModal.orderId, warningModal.status)}
                  className="flex-1 px-4 py-3 rounded-xl text-[13px] font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition shadow-md flex items-center justify-center gap-2"
                >
                  {updatingId === warningModal.orderId && <Loader2 className="h-4 w-4 animate-spin" />}
                  Yes, Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
