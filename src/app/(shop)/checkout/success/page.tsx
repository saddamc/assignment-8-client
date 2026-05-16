"use client";

import { useEffect, useState, Suspense } from "react";
import Navbar from "@/components/Home/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, ShoppingBag, Truck, Calendar } from "lucide-react";
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
    const sessionId = searchParams.get("session_id");

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const clearCart = useCartStore((state) => state.clearCart);

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    useEffect(() => {
        if (!orderId) { setLoading(false); return; }

        const run = async () => {
            try {
                // 1. Verify Payment if Session ID is present
                if (sessionId) {
                    await clientFetch(`/payments/verify-session/${sessionId}`, { method: 'POST' }).catch(() => {});
                }

                // 2. Fetch Finalized Order
                const res = await clientFetch(`/orders/${orderId}`);
                const data = await res.json();
                if (data.success) {
                    setOrder(data.data);
                }
            } catch (err) {
                console.error("Failed to load order details");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [orderId, sessionId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
                    <div className="h-4 w-48 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
                <div className="bg-white rounded-3xl shadow-sm border p-8 md:p-12 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Thank you for your order!</h1>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                        Your order has been placed successfully. We've sent a confirmation email to your registered address.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Package className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Order ID</span>
                            </div>
                            <p className="font-mono text-sm font-bold text-slate-700">#{orderId?.slice(-12).toUpperCase()}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Date</span>
                            </div>
                            <p className="text-sm font-bold text-slate-700">
                                {order ? new Date(order.createdAt).toLocaleDateString() : '--'}
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Truck className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Status</span>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase">
                                {order?.paymentStatus === 'PAID' ? 'Confirmed' : 'Processing'}
                            </span>
                        </div>
                    </div>

                    <div className="border-t pt-8 text-left mb-10">
                        <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>
                        <div className="space-y-4">
                            {order?.items?.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600">
                                        <span className="font-bold text-slate-900">{item.quantity}x</span> {item.product?.name}
                                    </span>
                                    <span className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="pt-4 border-t flex justify-between items-center">
                                <span className="font-bold text-slate-900 text-lg">Total Amount</span>
                                <span className="font-black text-2xl text-slate-900">${order?.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button asChild className="flex-1 rounded-2xl h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold">
                            <Link href="/dashboard/orders">
                                Track Your Order
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="flex-1 rounded-2xl h-14 font-bold border-slate-200">
                            <Link href="/products">
                                <ShoppingBag className="w-4 h-4 mr-2" /> Continue Shopping
                            </Link>
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-pulse text-slate-300">Loading Order...</div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
