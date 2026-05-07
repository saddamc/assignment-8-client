"use client";

import { useEffect, useState, Suspense } from "react";
import Navbar from "@/components/Home/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/hooks/useCartStore";
import { clientFetch } from "@/lib/client-fetch";

type OrderItem = {
    id: string;
    quantity: number;
    price: number;
    product?: { name: string; images: string[] };
};

type Order = {
    id: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
    items?: OrderItem[];
};

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const clearCart = useCartStore((state) => state.clearCart);

    useEffect(() => {
        // Always clear local cart on success page
        clearCart();
    }, [clearCart]);

    useEffect(() => {
        if (!orderId) { setLoading(false); return; }
        clientFetch(`/orders/${orderId}`)
            .then((r) => r.json())
            .then((d) => {
                if (d.success) setOrder(d.data);
            })
            .catch(() => { /* ignore */ })
            .finally(() => setLoading(false));
    }, [orderId]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-16 max-w-2xl">
                {/* Success Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold mb-2">Order Placed!</h1>
                    <p className="text-muted-foreground">
                        {order?.paymentMethod === "COD"
                            ? "Your order has been confirmed. Pay when it arrives."
                            : "Your payment was successful. We're preparing your order."}
                    </p>
                    {orderId && (
                        <p className="text-xs font-mono text-zinc-400 mt-3">
                            Order #{orderId.slice(-12).toUpperCase()}
                        </p>
                    )}
                </div>

                {/* Order Card */}
                {loading ? (
                    <div className="bg-white rounded-2xl border p-8 text-center text-muted-foreground text-sm">
                        Loading order details...
                    </div>
                ) : order ? (
                    <div className="bg-white rounded-2xl border overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-zinc-400" />
                                <span className="font-semibold text-sm">
                                    {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                    order.paymentStatus === "PAID"
                                        ? "bg-green-50 text-green-700"
                                        : order.paymentMethod === "COD"
                                        ? "bg-amber-50 text-amber-700"
                                        : "bg-zinc-100 text-zinc-600"
                                }`}>
                                    {order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentStatus}
                                </span>
                                <span className="font-black text-lg">${order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center justify-between px-6 py-4 border-b last:border-0">
                                <div>
                                    <p className="font-semibold text-sm">{item.product?.name ?? "Product"}</p>
                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                </div>
                                <p className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                ) : null}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild className="flex-1 rounded-full h-12">
                        <Link href="/dashboard/orders">
                            <Package className="w-4 h-4 mr-2" /> Track Your Order
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 rounded-full h-12">
                        <Link href="/products">
                            <ShoppingBag className="w-4 h-4 mr-2" /> Continue Shopping
                        </Link>
                    </Button>
                </div>
            </main>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
