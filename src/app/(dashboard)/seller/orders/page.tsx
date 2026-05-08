import { serverFetch } from "@/lib/server-fetch";
import { ShoppingBag } from "lucide-react";
import SellerOrderActions from "./SellerOrderActions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Order = any;

const STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700",
    PROCESSING: "bg-blue-50 text-blue-700",
    PACKED: "bg-indigo-50 text-indigo-700",
    SHIPPED: "bg-violet-50 text-violet-700",
    ON_THE_WAY: "bg-purple-50 text-purple-700",
    DELIVERED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-red-50 text-red-700",
    REFUNDED: "bg-zinc-100 text-zinc-600",
};

export default async function SellerOrdersPage() {
    let orders: Order[] = [];

    try {
        const res = await serverFetch.get("/orders/seller-orders?limit=100");
        const data = await res.json();
        if (data.success) orders = data.data?.data || data.data || [];
    } catch { /* empty state */ }

    return (
        <div className="space-y-8">
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Sales</p>
                <h1 className="text-3xl font-serif font-bold">Orders</h1>
                <p className="text-zinc-500 text-sm mt-1">
                    {orders.length} total order{orders.length !== 1 ? "s" : ""}
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
                    <ShoppingBag className="w-12 h-12 text-zinc-200 mb-4" />
                    <h3 className="text-lg font-bold mb-2">No orders yet</h3>
                    <p className="text-zinc-400 text-sm">When customers purchase your products, orders will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order: Order) => {
                        const statusKey = (order.status || "PENDING").toUpperCase();
                        return (
                            <div key={order.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                                {/* Header */}
                                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b bg-zinc-50/50">
                                    <div>
                                        <p className="text-xs font-mono text-zinc-400">#{order.id?.slice(-12)?.toUpperCase()}</p>
                                        <p className="font-semibold text-sm mt-0.5">
                                            {order.customer?.name || "Customer"}
                                            <span className="text-zinc-400 font-normal ml-2 text-xs">{order.customer?.email}</span>
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-xl">${(order.totalAmount || 0).toFixed(2)}</span>
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_STYLES[statusKey] || "bg-zinc-100 text-zinc-600"}`}>
                                            {statusKey}
                                        </span>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="px-6 py-3 divide-y divide-zinc-50">
                                    {order.items?.map((item: Order) => (
                                        <div key={item.id} className="flex items-center justify-between py-2.5">
                                            <div>
                                                <p className="font-medium text-sm">{item.product?.name || "Product"}</p>
                                                <p className="text-xs text-zinc-400">Qty: {item.quantity} × ${(item.price || 0).toFixed(2)}</p>
                                            </div>
                                            <p className="font-bold text-sm">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipment if present */}
                                {order.shipment?.trackingNumber && (
                                    <div className="px-6 py-2.5 border-t bg-indigo-50/30 text-xs text-zinc-600">
                                        <span className="font-bold text-indigo-700">Tracking: </span>
                                        {order.shipment.carrier && `${order.shipment.carrier} · `}
                                        {order.shipment.trackingNumber}
                                    </div>
                                )}

                                {/* Action Buttons (client component) */}
                                <SellerOrderActions
                                    orderId={order.id}
                                    status={order.status}
                                    existingTracking={order.shipment?.trackingNumber}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

