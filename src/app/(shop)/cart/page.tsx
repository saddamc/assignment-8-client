"use client";

import Navbar from "@/components/Home/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/hooks/useCartStore";
import { useEffect, useState } from "react";

export default function CartPage() {
    const [mounted, setMounted] = useState(false);
    const { items: cartItems, updateQuantity, removeItem, getTotal } = useCartStore();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const subtotal = getTotal();
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

    if (!mounted) return null; // Prevent hydration mismatch

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
                                    <div key={item.id} className={`p-6 flex flex-col sm:flex-row gap-6 ${idx !== cartItems.length - 1 ? 'border-b' : ''}`}>
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-zinc-100 rounded-xl shrink-0 relative overflow-hidden border">
                                            {item.image && (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-xs font-semibold text-primary uppercase mb-1">{item.category}</p>
                                                    <Link href={`/products/${item.id}`} className="font-semibold text-lg hover:text-primary transition-colors">
                                                        {item.name}
                                                    </Link>
                                                </div>
                                                <p className="font-bold">${item.price.toFixed(2)}</p>
                                            </div>
                                            
                                            <div className="mt-auto flex items-center justify-between pt-4">
                                                <div className="flex items-center border rounded-full overflow-hidden h-10 w-32">
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="flex-1 h-full flex items-center justify-center hover:bg-slate-50 transition-colors text-muted-foreground"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="flex-1 text-center font-medium">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="flex-1 h-full flex items-center justify-center hover:bg-slate-50 transition-colors text-muted-foreground"
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
                    </div>
                    
                    {/* Order Summary */}
                    {cartItems.length > 0 && (
                        <div className="lg:col-span-1">
                            <div className="bg-white p-8 rounded-3xl border sticky top-24">
                                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                                
                                <div className="space-y-4 mb-6 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="font-medium text-green-600">Free</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Estimated Tax</span>
                                        <span className="font-medium">Calculated at checkout</span>
                                    </div>
                                </div>
                                
                                <div className="border-t pt-4 mb-8">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold">Total</span>
                                        <span className="text-2xl font-serif font-bold">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                <Button asChild size="lg" className="w-full rounded-full h-14 text-base gap-2">
                                    <Link href="/checkout">
                                        Proceed to Checkout <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
