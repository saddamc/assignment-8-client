"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Home/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/hooks/useCartStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
    const [step, setStep] = useState(1);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    
    const { items: cartItems, getTotal, clearCart } = useCartStore();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);
    
    const subtotal = getTotal();
    const shipping = 0;
    const taxes = subtotal * 0.08; // 8% tax mock
    const total = subtotal + shipping + taxes;

    if (!mounted) return null;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-serif mb-4">Your cart is empty.</h1>
                <Button onClick={() => router.push("/products")}>Return to Shop</Button>
            </div>
        );
    }

    const handlePlaceOrder = () => {
        // Here we would call the backend to place the order
        toast.success("Order Placed Successfully!");
        clearCart();
        router.push("/dashboard/orders");
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            
            <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-6xl">
                
                {/* Checkout Steps Indicator */}
                <div className="flex items-center justify-center space-x-4 mb-12 text-sm font-medium">
                    <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs text-white ${step >= 1 ? 'bg-primary' : 'bg-slate-300'}`}>1</div>
                        Shipping
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs text-white ${step >= 2 ? 'bg-primary' : 'bg-slate-300'}`}>2</div>
                        Payment
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs text-white ${step >= 3 ? 'bg-primary' : 'bg-slate-300'}`}>3</div>
                        Review
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Form Steps */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* STEP 1: SHIPPING */}
                        {step === 1 && (
                            <div className="bg-white p-8 rounded-3xl border shadow-sm animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="text-2xl font-serif font-bold mb-6">Shipping Address</h2>
                                
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First name</Label>
                                            <Input id="firstName" placeholder="John" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last name</Label>
                                            <Input id="lastName" placeholder="Doe" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address line 1</Label>
                                        <Input id="address" placeholder="123 Luxury Ave" />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input id="city" placeholder="New York" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="zip">ZIP code</Label>
                                            <Input id="zip" placeholder="10001" />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-6 border-t flex justify-end">
                                        <Button size="lg" className="rounded-full px-8" onClick={() => setStep(2)}>
                                            Continue to Payment
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: PAYMENT */}
                        {step === 2 && (
                            <div className="bg-white p-8 rounded-3xl border shadow-sm animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-serif font-bold">Payment Method</h2>
                                    <button onClick={() => setStep(1)} className="text-sm font-medium text-primary hover:underline">Edit Shipping</button>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="border rounded-2xl p-4 flex items-center justify-between bg-slate-50 ring-1 ring-primary">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full border-4 border-primary bg-white"></div>
                                            <span className="font-semibold">Credit Card</span>
                                        </div>
                                        {/* Simple cc icons placeholder */}
                                        <div className="flex gap-2">
                                            <div className="w-8 h-5 bg-zinc-200 rounded text-[10px] font-bold flex items-center justify-center text-zinc-500">VISA</div>
                                            <div className="w-8 h-5 bg-zinc-200 rounded text-[10px] font-bold flex items-center justify-center text-zinc-500">MC</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cardName">Name on card</Label>
                                            <Input id="cardName" placeholder="John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cardNumber">Card number</Label>
                                            <Input id="cardNumber" placeholder="0000 0000 0000 0000" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="exp">Expiry date</Label>
                                                <Input id="exp" placeholder="MM/YY" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cvc">CVC</Label>
                                                <Input id="cvc" placeholder="123" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-6 border-t flex justify-end">
                                        <Button size="lg" className="rounded-full px-8" onClick={() => setStep(3)}>
                                            Review Order
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: REVIEW */}
                        {step === 3 && (
                            <div className="bg-white p-8 rounded-3xl border shadow-sm animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="text-2xl font-serif font-bold mb-6">Review Your Order</h2>
                                
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-6 rounded-2xl border">
                                        <div>
                                            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2 flex justify-between">
                                                Shipping Address
                                                <button onClick={() => setStep(1)} className="text-primary hover:underline normal-case">Edit</button>
                                            </h3>
                                            <p className="font-medium">John Doe</p>
                                            <p className="text-muted-foreground text-sm">123 Luxury Ave<br/>New York, 10001</p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2 flex justify-between">
                                                Payment Method
                                                <button onClick={() => setStep(2)} className="text-primary hover:underline normal-case">Edit</button>
                                            </h3>
                                            <p className="font-medium">Visa ending in 4242</p>
                                            <p className="text-muted-foreground text-sm">Exp 12/26</p>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 flex justify-end">
                                        {/* Mocking the order confirmation */}
                                        <Button size="lg" className="rounded-full px-8 h-14 text-base" onClick={handlePlaceOrder}>
                                            Place Order &middot; ${total.toFixed(2)}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-3xl border shadow-sm sticky top-24">
                            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                            
                            <div className="space-y-6 mb-6">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 bg-zinc-100 rounded-xl shrink-0 border relative overflow-hidden">
                                            {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                                        </div>
                                        <div className="flex-1 text-sm">
                                            <p className="font-semibold leading-tight line-clamp-2 mb-1">{item.name}</p>
                                            <p className="text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="font-medium text-sm">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 mb-6 text-sm border-t pt-6">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="font-medium text-green-600">Free Express</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Taxes</span>
                                    <span className="font-medium">${taxes.toFixed(2)}</span>
                                </div>
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
