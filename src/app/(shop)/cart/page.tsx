"use client";

import Navbar from "@/components/Home/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Minus, Plus, Tag, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/hooks/useCartStore";
import { useEffect, useState } from "react";
import { clientFetch } from "@/lib/client-fetch";
import { toast } from "sonner";

export default function CartPage() {
    const [mounted, setMounted] = useState(false);
    const { items: cartItems, updateQuantity, removeItem, getTotal, syncWithBackend } = useCartStore();

    const [coupon, setCoupon] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Sync cart when cart page loads
        syncWithBackend();
    }, [syncWithBackend]);

    const subtotal = getTotal();
    const discount = appliedCoupon?.discountAmount ?? 0;
    const total = Math.max(subtotal - discount, 0);

    const handleApplyCoupon = async () => {
        if (!coupon.trim()) return;
        setCouponLoading(true);
        try {
            const res = await clientFetch(`/coupon/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: coupon.trim(), orderTotal: subtotal }),
            });
            const data = await res.json();
            if (data.success) {
                setAppliedCoupon({ code: coupon.trim().toUpperCase(), discountAmount: data.data.discountAmount });
                toast.success(`Coupon applied! You save $${data.data.discountAmount.toFixed(2)}`);
            } else {
                toast.error(data.message || "Invalid coupon code");
            }
        } catch {
            toast.error("Could not validate coupon");
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCoupon("");
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12 md:py-16">
                <h1 className="text-3xl md:text-5xl font-serif mb-12">Your Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {cartItems.length === 0 ? (
                            <div className="bg-white p-12 text-center rounded-3xl border">
                                <p className="text-lg text-muted-foreground mb-6">Your cart is currently empty.</p>
                                <Button asChild className="rounded-full px-8">
                                    <Link href="/products">Continue Shopping</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border overflow-hidden">
                                {cartItems.map((item, idx) => (
                                    <div key={item.id} className={`p-6 flex flex-col sm:flex-row gap-6 ${idx !== cartItems.length - 1 ? "border-b" : ""}`}>
                                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-zinc-100 rounded-xl shrink-0 relative overflow-hidden border">
                                            {item.image && (
                                                <Image src={item.image} alt={item.name} fill 
                                                sizes="(max-width: 640px) 50vw, 25vw"
                                                className="object-cover" />
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-1">
                                                <div>
                                                    <p className="text-xs font-semibold text-primary uppercase mb-0.5">{item.category}</p>
                                                    <Link href={`/products/${item.id}`} className="font-semibold text-base hover:text-primary transition-colors">
                                                        {item.name}
                                                    </Link>
                                                </div>
                                                <div className="text-right ml-4 shrink-0">
                                                    <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                                                    <p className="font-bold text-base">${(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            </div>

                                            <div className="mt-auto flex items-center justify-between pt-4">
                                                <div className="flex items-center border rounded-full overflow-hidden h-10 w-32">
                                                    <button
                                                        onClick={() => {
                                                            if (item.quantity > 1) {
                                                                updateQuantity(item.id, item.quantity - 1);
                                                            } else {
                                                                removeItem(item.id);
                                                            }
                                                        }}
                                                        className="flex-1 h-full flex items-center justify-center hover:bg-slate-50 transition-colors text-muted-foreground disabled:opacity-50"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="flex-1 text-center font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="flex-1 h-full flex items-center justify-center hover:bg-slate-50 transition-colors text-muted-foreground disabled:opacity-50"
                                                        disabled={item.quantity >= 5}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-muted-foreground hover:text-red-500 transition-colors flex items-center text-sm font-medium"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Coupon Input */}
                        {cartItems.length > 0 && (
                            <div className="bg-white rounded-2xl border p-6">
                                <p className="font-semibold text-sm mb-3 flex items-center gap-2">
                                    <Tag className="w-4 h-4" /> Promo Code
                                </p>
                                {appliedCoupon ? (
                                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                        <Tag className="w-4 h-4 text-green-600" />
                                        <span className="font-bold text-green-700 text-sm flex-1">
                                            {appliedCoupon.code} — saves ${appliedCoupon.discountAmount.toFixed(2)}
                                        </span>
                                        <button onClick={handleRemoveCoupon} className="text-green-500 hover:text-green-700">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-3">
                                        <Input
                                            placeholder="Enter promo code"
                                            value={coupon}
                                            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                                            onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                                            className="rounded-xl"
                                        />
                                        <Button
                                            variant="outline"
                                            className="rounded-xl shrink-0"
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading || !coupon.trim()}
                                        >
                                            {couponLoading ? "..." : "Apply"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    {cartItems.length > 0 && (
                        <div className="lg:col-span-1">
                            <div className="bg-white p-8 rounded-3xl border sticky top-24">
                                <h3 className="text-xl font-bold mb-6">Order Summary</h3>

                                {/* Per-item breakdown */}
                                <div className="space-y-2 mb-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground truncate mr-2 max-w-35">
                                                {item.name} ×{item.quantity}
                                            </span>
                                            <span className="font-medium shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 mb-6 text-sm border-t pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="font-medium text-green-600">Free</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount ({appliedCoupon?.code})</span>
                                            <span className="font-medium">-${discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax</span>
                                        <span className="font-medium">Calculated at checkout</span>
                                    </div>
                                </div>

                                <div className="border-t pt-4 mb-8">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold">Total</span>
                                        <span className="text-2xl font-serif font-bold">${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Button asChild size="lg" className="w-full rounded-full h-14 text-base">
                                    <Link href="/checkout">
                                        Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                </Button>

                                <p className="text-xs text-center text-muted-foreground mt-4">
                                    Secure checkout &middot; SSL encrypted
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
