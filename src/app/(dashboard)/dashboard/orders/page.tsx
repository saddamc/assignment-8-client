import { serverFetch } from "@/lib/server-fetch";
import Link from "next/link";
import { Package, ArrowRight, Truck, Box, CheckCircle2, RotateCcw, Clock } from "lucide-react";
import CancelOrderButton from "./CancelOrderButton";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Order = any;

const STATUS_STEPS = [
    { key: "PENDING", label: "Confirmed", icon: Clock },
    { key: "PROCESSING", label: "Processing", icon: Package },
    { key: "PACKED", label: "Packed", icon: Box },
    { key: "SHIPPED", label: "Shipped", icon: Truck },
    { key: "ON_THE_WAY", label: "On the way", icon: Truck },
    { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
];

const STATUS_ORDER = ["PENDING", "PROCESSING", "PACKED", "SHIPPED", "ON_THE_WAY", "DELIVERED"];

function OrderTracker({ status }: { status: string }) {
    if (status === "CANCELLED" || status === "REFUNDED") {
        return (
            <div className="flex items-center gap-2 py-3">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    status === "CANCELLED" ? "bg-red-50 text-red-700" : "bg-purple-50 text-purple-700"
                }`}>{status}</span>
            </div>
        );
    }

    const currentIdx = STATUS_ORDER.indexOf(status);

    return (
        <div className="py-4 px-2 overflow-x-auto">
            <div className="flex items-center min-w-max">
                {STATUS_STEPS.map((step, idx) => {
                    const done = idx <= currentIdx;
                    const active = idx === currentIdx;
                    const Icon = step.icon;
                    return (
                        <div key={step.key} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                    done ? (active ? "bg-indigo-600 ring-4 ring-indigo-100" : "bg-indigo-600") : "bg-zinc-100"
                                }`}>
                                    <Icon className={`w-3.5 h-3.5 ${done ? "text-white" : "text-zinc-400"}`} />
                                </div>
                                <p className={`text-[10px] mt-1.5 font-semibold whitespace-nowrap ${done ? "text-indigo-600" : "text-zinc-400"}`}>
                                    {step.label}
                                </p>
                            </div>
                            {idx < STATUS_STEPS.length - 1 && (
                                <div className={`w-8 h-0.5 mx-1 mb-4 transition-all ${idx < currentIdx ? "bg-indigo-600" : "bg-zinc-100"}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default async function CustomerOrdersPage() {
    let orders: Order[] = [];

    try {
        const res = await serverFetch.get("/orders/my-orders?limit=50");
        const data = await res.json();
        if (data.success) orders = data.data?.data || data.data || [];
    } catch { /* show empty state */ }

    return (
        <div className="space-y-8">
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">My Account</p>
                <h1 className="text-3xl font-serif font-bold">Order History</h1>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
                    <Package className="w-12 h-12 text-zinc-200 mb-4" />
                    <h3 className="text-lg font-bold mb-2">No orders yet</h3>
                    <p className="text-zinc-400 text-sm mb-6">When you place an order, it will appear here.</p>
                    <Link href="/products" className="px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-colors flex items-center gap-2">
                        Start Shopping <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order: Order) => {
                        const canCancel = ["PENDING", "PROCESSING"].includes(order.status);
                        return (
                            <div key={order.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                                {/* Order Header */}
                                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-zinc-50">
                                    <div>
                                        <p className="text-xs font-mono text-zinc-400">
                                            Order #{order.id?.slice(-12)?.toUpperCase()}
                                        </p>
                                        <p className="text-xs text-zinc-400 mt-0.5">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-lg">${(order.totalAmount || 0).toFixed(2)}</span>
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                                            order.paymentStatus === "PAID" ? "bg-green-50 text-green-700" :
                                            order.paymentStatus === "FAILED" ? "bg-red-50 text-red-700" :
                                            order.paymentMethod === "COD" ? "bg-amber-50 text-amber-700" :
                                            "bg-zinc-100 text-zinc-600"
                                        }`}>
                                            {order.paymentMethod === "COD" ? "COD" : order.paymentStatus || "UNPAID"}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Tracker */}
                                <div className="px-6 border-b border-zinc-50">
                                    <OrderTracker status={order.status} />
                                </div>

                                {/* Items */}
                                {order.items && order.items.length > 0 && (
                                    <div className="px-6 py-3 divide-y divide-zinc-50">
                                        {order.items.map((item: Order) => (
                                            <div key={item.id} className="flex items-center justify-between py-3">
                                                <div>
                                                    <p className="font-semibold text-sm">{item.product?.name || "Product"}</p>
                                                    <p className="text-xs text-zinc-400">Qty: {item.quantity} × ${(item.price || 0).toFixed(2)}</p>
                                                </div>
                                                <p className="font-bold text-sm">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Shipment Tracking */}
                                {order.shipment?.trackingNumber && (
                                    <div className="px-6 py-3 border-t border-zinc-50 bg-indigo-50/30 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-indigo-700 mb-0.5">Tracking</p>
                                            <p className="text-xs font-mono text-zinc-600">{order.shipment.carrier && `${order.shipment.carrier} · `}{order.shipment.trackingNumber}</p>
                                        </div>
                                        {order.shipment.trackingUrl && (
                                            <a href={order.shipment.trackingUrl} target="_blank" rel="noopener noreferrer"
                                                className="text-xs font-bold text-indigo-600 hover:underline">
                                                Track Package →
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="px-6 py-3 border-t border-zinc-50 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        {canCancel && (
                                            <CancelOrderButton orderId={order.id} />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {order.status === "DELIVERED" && (
                                            <Link
                                                href={`/cart?reorder=${order.id}`}
                                                className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-indigo-600 transition-colors"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" /> Reorder
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

