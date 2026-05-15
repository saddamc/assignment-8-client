"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, ShoppingBag, Trash2, X, ArrowRight, Package, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/hooks/useCartStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: Props) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  
  // Calculate count and total here since useCartStore in 74-E-Commerce might not have itemCount() or subtotal() exactly like NetBazer
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const [shippingFee, setShippingFee] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!mounted) return null;

  const total = subtotal + shippingFee;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return createPortal(
    <div className={`fixed inset-0 z-[9999] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      {/* Backdrop */}
      <button
        className="absolute inset-0 h-full w-full bg-black/50 backdrop-blur-[3px] border-none cursor-default"
        onClick={onClose}
        aria-label="Close cart"
      />

      {/* Drawer panel — right side */}
      <aside
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-white shadow-2xl sm:max-w-[440px] transition-transform duration-300 transform ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* ── Header ── */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-zinc-800" />
            <span className="text-[15px] font-black uppercase tracking-[0.08em] text-zinc-900">
              Your Cart
            </span>
            {itemCount > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 transition hover:bg-zinc-100 cursor-pointer"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Body ── */}
        {items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
              <ShoppingCart className="h-9 w-9 text-zinc-400" />
            </div>
            <div>
              <p className="text-base font-bold text-zinc-900">Your cart is empty</p>
              <p className="mt-1 text-sm text-zinc-400">Add some products to get started!</p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white transition hover:bg-black/85 cursor-pointer border-none"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* Item list */
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size || 'default'}`}
                  className="flex gap-3 rounded-2xl border border-zinc-100 bg-[#f9fafb] p-3 transition hover:border-zinc-200"
                >
                  {/* Thumbnail */}
                  <div className="relative h-[76px] w-[64px] flex-shrink-0 overflow-hidden rounded-xl bg-zinc-200">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-zinc-900">
                        {item.name}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex-shrink-0 rounded-lg p-1 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 cursor-pointer border-none bg-transparent"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      {/* Size/Category badge */}
                      <span className="rounded-md bg-zinc-200 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                        {item.category || 'Product'}
                      </span>

                      {/* Qty controls */}
                      <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex h-7 w-7 items-center justify-center rounded-l-xl text-zinc-500 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer border-none bg-transparent"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-[13px] font-semibold text-zinc-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-r-xl text-zinc-500 transition hover:bg-zinc-100 cursor-pointer border-none bg-transparent"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-[13px] font-bold text-zinc-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer: totals + CTA ── */}
        {items.length > 0 && (
          <div className="flex-shrink-0 border-t border-zinc-100 bg-white px-5 py-4 space-y-4">
            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span className="font-medium text-zinc-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" />
                  Shipping
                </span>
                {shippingFee === 0 ? (
                  <span className="font-medium text-emerald-600">Calculated at checkout</span>
                ) : (
                  <span className="font-medium text-zinc-900">{formatPrice(shippingFee)}</span>
                )}
              </div>
              <div className="flex justify-between border-t border-zinc-100 pt-2 text-base font-bold text-zinc-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-3.5 text-sm font-bold text-white transition hover:bg-black/85 no-underline"
              >
                Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 no-underline"
              >
                View Full Cart
              </Link>
            </div>

            <p className="text-center text-[11px] text-zinc-400">
              Free returns · Secure checkout
            </p>
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}
