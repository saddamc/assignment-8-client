"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ZoomIn, ShoppingBag, Minus, Plus, Heart, ShieldCheck, Truck, RefreshCcw, Zap, Star } from "lucide-react";
import { useCartStore } from "@/hooks/useCartStore";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Product = any;

interface Props {
  product: Product;
  discountedPrice: number | null;
  averageRating: number;
}

const COLORS = [
  { color: "bg-zinc-900", label: "Midnight Navy" },
  { color: "bg-zinc-500", label: "Charcoal Grey" },
  { color: "bg-zinc-200", label: "Ivory White" },
];
const SIZES = ["S", "M", "L", "XL"];

export default function ProductDetailClient({ product, discountedPrice, averageRating }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [wishlisted, setWishlisted] = useState(false);

  const variantSizes: string[] = Array.from(
    new Set<string>(
      (product.variants || [])
        .map((v: { size?: string | null }) => (v.size || "").trim())
        .filter(Boolean)
    )
  );
  const hasVariantSizes = variantSizes.length > 0;
  const displayedSizes = hasVariantSizes ? variantSizes : SIZES;
  const selectedVariant = hasVariantSizes
    ? (product.variants || []).find((v: { size?: string | null; stock?: number }) => (v.size || "").trim() === selectedSize)
    : null;

  // If seller set product-level shipping, show it directly; otherwise fetch from rules
  const productShippingCost: number | null = product.shippingCost ?? null;
  const [shippingLabel, setShippingLabel] = useState<string>("Calculated at checkout");

  useEffect(() => {
    // If product has its own shipping cost, use it directly
    if (productShippingCost !== null && productShippingCost >= 0) {
      setShippingLabel(`৳${productShippingCost}`);
      return;
    }

    // Otherwise: check seller's category shipping rules
    const BASE = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1";
    const sellerEmail: string | undefined = product.sellerEmail || product.seller?.email;

    if (sellerEmail) {
      fetch(`${BASE}/seller-shipping/public/${encodeURIComponent(sellerEmail)}`)
        .then((r) => r.json())
        .then((d) => {
          if (!d.success || !Array.isArray(d.data) || d.data.length === 0) {
            // Fall back to global config
            return fetchGlobalShipping(BASE);
          }
          const rules: { categoryId: string | null; charge: number; category?: { name: string } | null }[] = d.data;
          // Find category-specific rule first, then seller default
          const catRule = rules.find((r) => r.categoryId && r.categoryId === product.categoryId);
          const defaultRule = rules.find((r) => r.categoryId === null);
          const matched = catRule ?? defaultRule;
          if (matched) {
            const scope = matched.categoryId ? (matched.category?.name ?? "category") : "all categories";
            setShippingLabel(`৳${matched.charge} (${scope})`);
          } else {
            fetchGlobalShipping(BASE);
          }
        })
        .catch(() => fetchGlobalShipping(BASE));
    } else {
      fetchGlobalShipping(BASE);
    }

    function fetchGlobalShipping(base: string) {
      fetch(`${base}/site-config/public/shipping_rules`)
        .then((r) => r.json())
        .then((d) => {
          if (!d.success) return;
          const rules: { state?: string; city?: string; country?: string; charge: number; priority: number }[] =
            JSON.parse(typeof d.data?.value === "string" ? d.data.value : JSON.stringify(d.data?.value ?? []));
          if (!Array.isArray(rules) || rules.length === 0) return;
          const sorted = [...rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
          const named = sorted.filter((r) => r.state || r.city || r.country);
          const fallback = sorted.find((r) => !r.state && !r.city && !r.country);
          const parts: string[] = named.map((r) => {
            const loc = r.city || r.state || r.country || "";
            return `৳${r.charge} (${loc})`;
          });
          if (fallback) parts.push(`৳${fallback.charge} (others)`);
          if (parts.length > 0) setShippingLabel(parts.join(" · "));
        })
        .catch(() => {});
    }
  }, [productShippingCost, product.categoryId, product.sellerEmail, product.seller?.email]);
  const { items, addItem } = useCartStore();
  const existingItem = items.find(item => item.productId === product.id);
  const currentQuantity = existingItem ? existingItem.quantity : 0;
  const isOutOfStock = !product.stock || product.stock <= 0;
  const isMaxReached = currentQuantity >= 5;
  const canAddMore = (product.stock || 0) > currentQuantity && currentQuantity < 5;

  const images = product.images?.length > 0 ? product.images : Array(4).fill(null);

  const handleAddToCart = () => {
    if (hasVariantSizes && !selectedSize) {
      toast.error("Please select a size before adding to cart");
      return;
    }

    // Check stock
    const availableStock = hasVariantSizes
      ? Number(selectedVariant?.stock || 0)
      : Number(product.stock || 0);

    if (!availableStock || availableStock < quantity) {
      toast.error("Insufficient stock for this item");
      return;
    }

    // Check current cart quantity for this product
    const { items } = useCartStore.getState();
    const existingItem = items.find(item => item.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;

    // Check if adding would exceed the limit
    if (currentQuantity + quantity > 5) {
      toast.error(`You can only have up to 5 of this item in your cart. You currently have ${currentQuantity} in your cart.`);
      return;
    }

    addItem(
      {
        id: product.id,
        productId: product.id,
        name: product.name,
        price: discountedPrice ?? product.price,
        image: product.images?.[0] || "",
        category: product.category?.name || "Uncategorized",
        size: selectedSize || undefined,
      },
      quantity
    );
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
      {/* LEFT: Image Gallery */}
      <div className="flex flex-row gap-4">
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex flex-col gap-3 w-16 shrink-0">
            {images.map((img: string | null, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? "border-indigo-600 ring-2 ring-indigo-200" : "border-zinc-200 hover:border-zinc-400"}`}
              >
                {img ? (
                  <Image src={img} alt={`Thumb ${idx + 1}`} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-zinc-100 to-zinc-200" />
                )}
              </button>
            ))}
          </div>
        )}
        {/* Main Image */}
        <div className="flex-1 relative aspect-4/5 bg-zinc-100 rounded-3xl overflow-hidden group border border-zinc-200">
          {images[selectedImage] ? (
            <Image src={images[selectedImage]} alt={product.name} fill  sizes="(max-width: 640px) 50vw, 25vw"className="object-cover transition-transform duration-700 group-hover:scale-105" priority />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-zinc-100 to-zinc-200 text-zinc-400 text-sm font-medium text-center px-8">
              {product.name}
            </div>
          )}
          <button className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-white transition-colors z-10">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RIGHT: Product Info */}
      <div className="flex flex-col">
        {/* Badge + Rating */}
        <div className="flex items-start justify-between mb-4">
          <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-200">
            New Collection
          </span>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"}`} />
            ))}
            <span className="text-sm text-zinc-500 ml-1.5">{averageRating.toFixed(1)} ({product.reviews?.length || 0} Reviews)</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight leading-tight mb-4">
          {product.name}
        </h1>

        {/* Price */}
        <div className="flex items-center gap-4 mb-5">
          {discountedPrice ? (
            <>
              <span className="text-3xl font-black text-indigo-600">${discountedPrice.toFixed(2)}</span>
              <span className="text-xl text-zinc-400 line-through">${product.price.toFixed(2)}</span>
              <span className="text-xs bg-red-50 text-red-600 font-bold px-2.5 py-1 rounded-full">-{product.discount.toFixed(0)}% OFF</span>
            </>
          ) : (
            <span className="text-3xl font-black">${product.price.toFixed(2)}</span>
          )}
        </div>

        <p className="text-zinc-600 leading-relaxed mb-7">{product.description}</p>

        {/* Color */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
            Select Color: <span className="text-zinc-900">{COLORS[selectedColor].label}</span>
          </p>
          <div className="flex gap-3">
            {COLORS.map((c, i) => (
              <button key={i} title={c.label} onClick={() => setSelectedColor(i)}
                className={`w-8 h-8 rounded-full ${c.color} border-2 transition-all hover:scale-110 ${selectedColor === i ? "border-indigo-600 ring-2 ring-indigo-300 ring-offset-2" : "border-transparent"}`}
              />
            ))}
          </div>
        </div>

        {/* Size */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Select Size {hasVariantSizes ? <span className="text-red-500">*</span> : null}
            </p>
            <button className="text-xs font-semibold text-indigo-600 hover:underline">Size Guide</button>
          </div>
          <div className="flex gap-3">
            {displayedSizes.map((size) => (
              <button key={size} onClick={() => setSelectedSize(size)}
                className={`w-12 h-12 rounded-xl text-sm font-bold border-2 transition-all hover:border-indigo-600 ${selectedSize === size ? "bg-indigo-600 text-white border-indigo-600" : "border-zinc-200 text-zinc-700 hover:text-indigo-600"}`}
              >
                {size}
              </button>
            ))}
          </div>
          {hasVariantSizes && !selectedSize && (
            <p className="mt-2 text-xs font-medium text-red-500">Size selection is required for this product.</p>
          )}
        </div>

        {/* Quantity + Add to Cart */}
        <div className="flex gap-3 mb-4">
          <div className="flex items-center border-2 border-zinc-200 rounded-2xl h-14 overflow-hidden">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center hover:bg-zinc-50 text-zinc-600 transition-colors">
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold">{quantity}</span>
            <button onClick={() => {
              const { items } = useCartStore.getState();
              const existingItem = items.find(item => item.id === product.id);
              const currentQuantity = existingItem ? existingItem.quantity : 0;
              const selectedStock = hasVariantSizes ? Number(selectedVariant?.stock || 0) : Number(product.stock || 0);
              const maxAllowed = Math.min(selectedStock || 99, 5 - currentQuantity);
              setQuantity(Math.min(maxAllowed, quantity + 1));
            }} className="w-12 h-full flex items-center justify-center hover:bg-zinc-50 text-zinc-600 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!canAddMore}
            className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-base hover:bg-indigo-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(79,70,229,0.2)]"
          >
            <ShoppingBag className="w-5 h-5" />
            {isOutOfStock ? "Out of Stock" : isMaxReached ? "Max Limit Reached" : "Add to Cart"}
          </button>
          <button
            onClick={() => { setWishlisted(!wishlisted); toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist"); }}
            className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 ${wishlisted ? "border-red-400 text-red-500" : "border-zinc-200 text-zinc-400 hover:border-red-400 hover:text-red-500"}`}
          >
            <Heart className={`w-5 h-5 transition-colors ${wishlisted ? "fill-red-400" : ""}`} />
          </button>
        </div>

        {/* Value Props */}
        <div className="space-y-3 pt-6 border-t border-zinc-100">
          <div className="flex items-start gap-3 text-sm">
            <Truck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <p><span className="font-semibold">Shipping: {shippingLabel}</span><span className="text-zinc-500"> — Estimated delivery: 2–4 business days.</span></p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <RefreshCcw className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <p><span className="font-semibold">30-Day Easy Returns</span><span className="text-zinc-500"> — Hassle-free exchanges and full refunds.</span></p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <p><span className="font-semibold">Authenticity Guaranteed</span><span className="text-zinc-500"> — Verified by our expert curators.</span></p>
          </div>
        </div>

        {/* Stock warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="flex items-center gap-2 mt-4 text-sm text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-200">
            <Zap className="w-4 h-4" /> Only {product.stock} left — order soon!
          </div>
        )}
      </div>
    </div>
  );
}
