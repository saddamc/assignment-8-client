"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Home/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, CreditCard, Truck, CheckCircle2, Plus, MapPin } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/hooks/useCartStore";
import { clientFetch } from "@/lib/client-fetch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Address = {
    id: string;
    label?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    isDefault: boolean;
};

export default function CheckoutPage() {
    const [step, setStep] = useState(1);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    const { items: cartItems, getTotal } = useCartStore();

    // Address step
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showNewAddress, setShowNewAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({ addressLine1: "", city: "", country: "US", postalCode: "" });
    const [addressesLoading, setAddressesLoading] = useState(false);

    // Payment step
    const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "COD">("STRIPE");

    // Coupon
    const [coupon, setCoupon] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);

    // Placing order
    const [placing, setPlacing] = useState(false);

    const subtotal = getTotal();
    const discount = appliedCoupon?.discountAmount ?? 0;
    const taxes = subtotal * 0.1; // 10% tax
    const total = Math.max(subtotal - discount, 0);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const fetchAddresses = async () => {
            setAddressesLoading(true);
            try {
                const res = await clientFetch("/address");
                const data = await res.json();
                if (data.success) {
                    const list: Address[] = data.data || [];
                    setAddresses(list);
                    const def = list.find((a) => a.isDefault);
                    if (def) setSelectedAddressId(def.id);
                    else if (list.length > 0) setSelectedAddressId(list[0].id);
                }
            } catch { /* user not logged in or no addresses */ }
            setAddressesLoading(false);
        };
        fetchAddresses();
    }, [mounted]);

    const handleSaveNewAddress = async () => {
        if (!newAddress.addressLine1 || !newAddress.city || !newAddress.postalCode) {
            toast.error("Please fill in all required address fields");
            return;
        }
        try {
            const res = await clientFetch("/address", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newAddress, label: "Home" }),
            });
            const data = await res.json();
            if (data.success) {
                const saved: Address = data.data;
                setAddresses((prev) => [...prev, saved]);
                setSelectedAddressId(saved.id);
                setShowNewAddress(false);
                toast.success("Address saved!");
            } else {
                toast.error(data.message || "Failed to save address");
            }
        } catch {
            toast.error("Failed to save address");
        }
    };

    const handleApplyCoupon = () => {
        if (!coupon.trim()) return;
        clientFetch("/coupon/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: coupon.trim(), orderTotal: subtotal }),
        })
            .then((r) => r.json())
            .then((d) => {
                if (d.success) {
                    setAppliedCoupon({ code: coupon.trim().toUpperCase(), discountAmount: d.data.discountAmount });
                    toast.success("Coupon applied!");
                } else {
                    toast.error(d.message || "Invalid code");
                }
            });
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId && !showNewAddress) {
            toast.error("Please select a delivery address");
            return;
        }
        if (cartItems.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        setPlacing(true);
        try {
            const orderRes = await clientFetch("/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    addressId: selectedAddressId ?? undefined,
                    couponCode: appliedCoupon?.code ?? undefined,
                    paymentMethod,
                    notes: "",
                }),
            });
            const orderData = await orderRes.json();

            if (!orderData.success) {
                toast.error(orderData.message || "Failed to place order");
                setPlacing(false);
                return;
            }

            const orderId: string = orderData.data.id;

            if (paymentMethod === "COD") {
                toast.success("Order placed! Pay on delivery.");
                router.push(`/checkout/success?orderId=${orderId}`);
                return;
            }

            const sessionRes = await clientFetch("/payments/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
            });
            const sessionData = await sessionRes.json();

            if (!sessionData.success || !sessionData.data?.url) {
                toast.error("Failed to initialize payment. Please try again.");
                setPlacing(false);
                return;
            }

            window.location.href = sessionData.data.url;
        } catch {
            toast.error("Something went wrong. Please try again.");
            setPlacing(false);
        }
    };

    if (!mounted) return null;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-serif">Your cart is empty.</h1>
                <Button onClick={() => router.push("/products")}>Return to Shop</Button>
            </div>
        );
    }

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-6xl">

                {/* Step Indicator */}
                <div className="flex items-center justify-center space-x-4 mb-12 text-sm font-medium">
                    {[{ n: 1, label: "Shipping" }, { n: 2, label: "Payment" }, { n: 3, label: "Review" }].map(({ n, label }, i) => (
                        <div key={n} className="flex items-center gap-2">
                            {i > 0 && <ChevronRight className="w-4 h-4 text-slate-300" />}
                            <div className={`flex items-center gap-2 ${step >= n ? "text-primary" : "text-muted-foreground"}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step >= n ? "bg-primary" : "bg-slate-300"}`}>{n}</div>
                                {label}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Steps */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* STEP 1: ADDRESS */}
                        {step === 1 && (
                            <div className="bg-white p-8 rounded-3xl border shadow-sm">
                                <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                                    <Truck className="w-6 h-6" /> Delivery Address
                                </h2>

                                {addressesLoading ? (
                                    <p className="text-muted-foreground text-sm">Loading addresses...</p>
                                ) : (
                                    <div className="space-y-3">
                                        {addresses.map((addr) => (
                                            <label
                                                key={addr.id}
                                                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${selectedAddressId === addr.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-zinc-300"}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    className="mt-1"
                                                    checked={selectedAddressId === addr.id}
                                                    onChange={() => { setSelectedAddressId(addr.id); setShowNewAddress(false); }}
                                                />
                                                <div>
                                                    <p className="font-semibold text-sm">
                                                        {addr.label || "Address"}
                                                        {addr.isDefault && <span className="text-xs text-primary ml-2 font-bold">Default</span>}
                                                    </p>
                                                    <p className="text-muted-foreground text-sm">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                                                    <p className="text-muted-foreground text-sm">{addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.postalCode}, {addr.country}</p>
                                                </div>
                                            </label>
                                        ))}

                                        {!showNewAddress ? (
                                            <button
                                                onClick={() => { setShowNewAddress(true); setSelectedAddressId(null); }}
                                                className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline mt-2"
                                            >
                                                <Plus className="w-4 h-4" /> Add new address
                                            </button>
                                        ) : (
                                            <div className="border rounded-2xl p-5 space-y-4 bg-slate-50">
                                                <p className="font-semibold text-sm flex items-center gap-2"><MapPin className="w-4 h-4" /> New Address</p>
                                                <div className="space-y-2">
                                                    <Label>Street Address *</Label>
                                                    <Input placeholder="123 Main St" value={newAddress.addressLine1}
                                                        onChange={(e) => setNewAddress((p) => ({ ...p, addressLine1: e.target.value }))} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>City *</Label>
                                                        <Input placeholder="New York" value={newAddress.city}
                                                            onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>ZIP *</Label>
                                                        <Input placeholder="10001" value={newAddress.postalCode}
                                                            onChange={(e) => setNewAddress((p) => ({ ...p, postalCode: e.target.value }))} />
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <Button size="sm" onClick={handleSaveNewAddress}>Save Address</Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setShowNewAddress(false)}>Cancel</Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="pt-6 border-t mt-6 flex justify-end">
                                    <Button
                                        size="lg"
                                        className="rounded-full px-8"
                                        disabled={!selectedAddressId && !showNewAddress}
                                        onClick={() => setStep(2)}
                                    >
                                        Continue to Payment
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: PAYMENT METHOD */}
                        {step === 2 && (
                            <div className="bg-white p-8 rounded-3xl border shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                                        <CreditCard className="w-6 h-6" /> Payment Method
                                    </h2>
                                    <button onClick={() => setStep(1)} className="text-sm font-medium text-primary hover:underline">
                                        Edit Address
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <label className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === "STRIPE" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-zinc-300"}`}>
                                        <input type="radio" name="payment" checked={paymentMethod === "STRIPE"} onChange={() => setPaymentMethod("STRIPE")} />
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">Credit / Debit Card</p>
                                            <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex · Powered by Stripe</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {["VISA", "MC", "AMEX"].map((b) => (
                                                <span key={b} className="text-[9px] font-bold bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">{b}</span>
                                            ))}
                                        </div>
                                    </label>

                                    <label className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === "COD" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-zinc-300"}`}>
                                        <input type="radio" name="payment" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">Cash on Delivery</p>
                                            <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                                        </div>
                                        <Truck className="w-5 h-5 text-zinc-400" />
                                    </label>
                                </div>

                                {/* Coupon */}
                                <div className="mt-6 border-t pt-5">
                                    <Label className="text-sm font-semibold mb-3 block">Promo Code</Label>
                                    {appliedCoupon ? (
                                        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
                                            <span className="font-bold text-green-700 flex-1">{appliedCoupon.code} — saves ${appliedCoupon.discountAmount.toFixed(2)}</span>
                                            <button onClick={() => setAppliedCoupon(null)} className="text-green-600 hover:text-green-800 font-semibold text-xs">Remove</button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3">
                                            <Input
                                                placeholder="PROMO CODE"
                                                value={coupon}
                                                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                                                onKeyDown={(e) => { if (e.key === "Enter") handleApplyCoupon(); }}
                                                className="rounded-xl"
                                            />
                                            <Button variant="outline" className="rounded-xl shrink-0" onClick={handleApplyCoupon}>
                                                Apply
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t mt-6 flex justify-end">
                                    <Button size="lg" className="rounded-full px-8" onClick={() => setStep(3)}>
                                        Review Order
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: REVIEW & PLACE ORDER */}
                        {step === 3 && (
                            <div className="bg-white p-8 rounded-3xl border shadow-sm">
                                <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                                    <CheckCircle2 className="w-6 h-6" /> Review Your Order
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border mb-6">
                                    <div>
                                        <h3 className="font-semibold text-xs uppercase text-muted-foreground mb-2 flex justify-between items-center">
                                            Shipping Address
                                            <button onClick={() => setStep(1)} className="text-primary normal-case hover:underline">Edit</button>
                                        </h3>
                                        {selectedAddress && (
                                            <>
                                                <p className="font-semibold text-sm">{selectedAddress.label || "Home"}</p>
                                                <p className="text-muted-foreground text-sm">{selectedAddress.addressLine1}</p>
                                                <p className="text-muted-foreground text-sm">{selectedAddress.city}, {selectedAddress.postalCode}</p>
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-xs uppercase text-muted-foreground mb-2 flex justify-between items-center">
                                            Payment
                                            <button onClick={() => setStep(2)} className="text-primary normal-case hover:underline">Edit</button>
                                        </h3>
                                        <p className="font-semibold text-sm">{paymentMethod === "STRIPE" ? "Credit / Debit Card via Stripe" : "Cash on Delivery"}</p>
                                        {appliedCoupon && (
                                            <p className="text-sm text-green-600 font-semibold mt-1">Coupon: {appliedCoupon.code} (-${appliedCoupon.discountAmount.toFixed(2)})</p>
                                        )}
                                    </div>
                                </div>

                                {paymentMethod === "STRIPE" && (
                                    <p className="text-xs text-muted-foreground bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6">
                                        You will be redirected to Stripe&apos;s secure checkout to complete payment. Your order will be confirmed once payment succeeds.
                                    </p>
                                )}

                                <div className="flex justify-end">
                                    <Button
                                        size="lg"
                                        className="rounded-full px-8 h-14 text-base"
                                        onClick={handlePlaceOrder}
                                        disabled={placing}
                                    >
                                        {placing ? "Processing..." : paymentMethod === "STRIPE" ? `Pay · $${total.toFixed(2)}` : `Place Order · $${total.toFixed(2)}`}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-3xl border shadow-sm sticky top-24">
                            <h3 className="text-xl font-bold mb-6">Order Summary</h3>

                            <div className="space-y-4 mb-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-14 h-14 bg-zinc-100 rounded-xl shrink-0 border relative overflow-hidden">
                                            {item.image && <Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />}
                                        </div>
                                        <div className="flex-1 text-sm">
                                            <p className="font-semibold leading-tight line-clamp-2 mb-0.5">{item.name}</p>
                                            <p className="text-muted-foreground text-xs">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="font-bold text-sm shrink-0">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 mb-4 text-sm border-t pt-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="font-medium text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Taxes</span>
                                    <span className="font-medium">${taxes.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span className="font-medium">-${discount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-end">
                                    <span className="font-bold">Total</span>
                                    <span className="text-2xl font-serif font-bold">${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}