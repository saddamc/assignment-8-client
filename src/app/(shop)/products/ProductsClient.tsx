"use client";

import { useState, useTransition, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Star,
  SlidersHorizontal,
  X,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  Zap,
} from "lucide-react";
import { useCartStore } from "@/hooks/useCartStore";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Product = any;

interface Props {
  initialProducts: Product[];
  categories: Category[];
  brands: Brand[];
  total: number;
  currentPage: number;
  currentParams: {
    categoryIds: string[];
    brandIds: string[];
    minPrice: string;
    maxPrice: string;
    priceRanges: string;
    minRating: string;
    inStock: string;
    sortBy: string;
    sortOrder: string;
    searchTerm: string;
  };
}

const RATING_OPTIONS = [4, 3, 2, 1];

const SORT_OPTIONS = [
  { label: "Newest", value: "createdAt:desc" },
  { label: "Oldest", value: "createdAt:asc" },
  { label: "Price: Low to High", value: "price:asc" },
  { label: "Price: High to Low", value: "price:desc" },
  { label: "Name A–Z", value: "name:asc" },
  { label: "Name Z–A", value: "name:desc" },
];

const LIMIT = 9;
const PRICE_MAX = 10000;
const PRICE_STEP = 50;

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Dual Range Slider ────────────────────────────────────────────────────────

function DualRangeSlider({
  min,
  max,
  value,
  step = PRICE_STEP,
  onChange,
}: {
  min: number;
  max: number;
  value: [number, number];
  step?: number;
  onChange: (v: [number, number]) => void;
}) {
  const [minVal, maxVal] = value;
  const minPercent = ((minVal - min) / (max - min)) * 100;
  const maxPercent = ((maxVal - min) / (max - min)) * 100;

  const handleMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), maxVal - step);
    onChange([v, maxVal]);
  };

  const handleMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), minVal + step);
    onChange([minVal, v]);
  };

  return (
    <div className="relative pt-1 pb-2">
      <div className="relative h-1.5 w-full rounded-full bg-[#e7ebf0]">
        <div
          className="absolute h-full rounded-full bg-black"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
      </div>
      <div
        className="pointer-events-none absolute top-0 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-black bg-white shadow-[0_2px_8px_rgba(0,0,0,0.22)]"
        style={{ left: `${minPercent}%` }}
      />
      <div
        className="pointer-events-none absolute top-0 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-black bg-white shadow-[0_2px_8px_rgba(0,0,0,0.22)]"
        style={{ left: `${maxPercent}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={handleMin}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        style={{ zIndex: minVal > max - step * 5 ? 5 : 3 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={handleMax}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        style={{ zIndex: 4 }}
      />
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function SidebarSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#eceff3] py-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-semibold uppercase tracking-widest text-black"
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4 text-black/40" /> : <ChevronDown className="h-4 w-4 text-black/40" />}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

// ─── Main Shell ───────────────────────────────────────────────────────────────

export default function ProductsClient({
  initialProducts,
  categories,
  brands,
  total,
  currentPage,
  currentParams,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, startTransition] = useTransition();
  const addItem = useCartStore((s) => s.addItem);
  
  const totalPages = Math.ceil(total / LIMIT);

  const priceRangeVal: [number, number] = [
    currentParams.minPrice ? Number(currentParams.minPrice) : 0,
    currentParams.maxPrice ? Number(currentParams.maxPrice) : PRICE_MAX,
  ];

  const hasActiveFilters =
    currentParams.categoryIds.length > 0 ||
    currentParams.brandIds.length > 0 ||
    !!currentParams.minPrice ||
    !!currentParams.maxPrice ||
    !!currentParams.minRating ||
    !!currentParams.inStock ||
    !!currentParams.searchTerm;

  const updateParams = (updates: Record<string, string | string[]>) => {
    const params = new URLSearchParams();
    const merged = { ...currentParams, ...updates } as Record<string, any>;

    if (Array.isArray(merged.categoryIds) && merged.categoryIds.length > 0) {
      params.set("categoryIds", merged.categoryIds.join(","));
    }
    if (Array.isArray(merged.brandIds) && merged.brandIds.length > 0) {
      params.set("brandIds", merged.brandIds.join(","));
    }
    if (merged.minPrice) params.set("minPrice", merged.minPrice);
    if (merged.maxPrice) params.set("maxPrice", merged.maxPrice);
    if (merged.minRating) params.set("minRating", merged.minRating);
    if (merged.inStock) params.set("inStock", merged.inStock);
    if (merged.sortBy) params.set("sortBy", merged.sortBy);
    if (merged.sortOrder) params.set("sortOrder", merged.sortOrder);
    if (merged.searchTerm) params.set("searchTerm", merged.searchTerm);
    if (updates.page) params.set("page", updates.page as string);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const handleCategoryChange = (id: string) => {
    const next = currentParams.categoryIds.includes(id)
      ? currentParams.categoryIds.filter((cid) => cid !== id)
      : [...currentParams.categoryIds, id];
    updateParams({ categoryIds: next, page: "1" });
  };

  const handleBrandChange = (id: string) => {
    const next = currentParams.brandIds.includes(id)
      ? currentParams.brandIds.filter((bid) => bid !== id)
      : [...currentParams.brandIds, id];
    updateParams({ brandIds: next, page: "1" });
  };

  const handlePriceRange = (v: [number, number]) => {
    updateParams({
      minPrice: v[0] === 0 ? "" : String(v[0]),
      maxPrice: v[1] === PRICE_MAX ? "" : String(v[1]),
      page: "1",
    });
  };

  const currentSortValue = `${currentParams.sortBy}:${currentParams.sortOrder}`;
  const handleSort = (value: string) => {
    const [sortBy, sortOrder] = value.split(":");
    updateParams({ sortBy, sortOrder, page: "1" });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateParams({ searchTerm: e.target.value, page: "1" });
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.discount ? product.price * (1 - product.discount / 100) : product.price,
      image: product.images?.[0] || "",
      category: product.category?.name || "",
    });
    toast.success(`${product.name} added to cart`);
  };

  const activeChips: { label: string; onRemove: () => void }[] = [];
  
  if (currentParams.searchTerm) {
    activeChips.push({
      label: `"${currentParams.searchTerm}"`,
      onRemove: () => updateParams({ searchTerm: "", page: "1" })
    });
  }
  currentParams.categoryIds.forEach((id) => {
    const cat = categories.find((c) => c.id === id);
    activeChips.push({
      label: cat?.name || "Category",
      onRemove: () => updateParams({ categoryIds: currentParams.categoryIds.filter((cid) => cid !== id), page: "1" })
    });
  });
  currentParams.brandIds.forEach((id) => {
    const brand = brands.find((b) => b.id === id);
    activeChips.push({
      label: brand?.name || "Brand",
      onRemove: () => updateParams({ brandIds: currentParams.brandIds.filter((bid) => bid !== id), page: "1" })
    });
  });
  if (currentParams.minPrice || currentParams.maxPrice) {
    activeChips.push({
      label: `${currentParams.minPrice ? `$${currentParams.minPrice}` : "$0"} – ${currentParams.maxPrice ? `$${currentParams.maxPrice}` : "∞"}`,
      onRemove: () => updateParams({ minPrice: "", maxPrice: "", page: "1" })
    });
  }
  if (currentParams.minRating) {
    activeChips.push({
      label: `${currentParams.minRating}+ Stars`,
      onRemove: () => updateParams({ minRating: "", page: "1" })
    });
  }
  if (currentParams.inStock === "true") {
    activeChips.push({
      label: "In Stock",
      onRemove: () => updateParams({ inStock: "", page: "1" })
    });
  }

  const FilterSidebar = () => (
    <aside className="flex flex-col">
      <div className="mb-1 flex items-center justify-between pb-4 border-b border-[#eceff3]">
        <h2 className="text-sm font-bold uppercase tracking-widest text-black">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-[11px] font-semibold uppercase tracking-wider text-black/45 underline underline-offset-2 transition hover:text-black"
          >
            Clear All
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <SidebarSection title="Category">
          <div className="space-y-2.5">
            {categories.map((cat) => {
              const checked = currentParams.categoryIds.includes(cat.id);
              return (
                <label key={cat.id} className="flex cursor-pointer items-center justify-between gap-3 group">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex items-center justify-center rounded border transition ${checked ? "border-black bg-black" : "border-[#d1d9e0] bg-white group-hover:border-black/50"}`} style={{ width: 18, height: 18 }}>
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-black/70 group-hover:text-black transition capitalize">{cat.name}</span>
                  </div>
                  {cat._count !== undefined && <span className="text-[11px] text-black/35">{cat._count.products}</span>}
                  <input type="checkbox" checked={checked} onChange={() => handleCategoryChange(cat.id)} className="sr-only" />
                </label>
              );
            })}
          </div>
        </SidebarSection>
      )}

      {brands.length > 0 && (
        <SidebarSection title="Brand">
          <div className="space-y-2.5">
            {brands.map((brand) => {
              const checked = currentParams.brandIds.includes(brand.id);
              return (
                <label key={brand.id} className="flex cursor-pointer items-center justify-between gap-3 group">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex items-center justify-center rounded border transition ${checked ? "border-black bg-black" : "border-[#d1d9e0] bg-white group-hover:border-black/50"}`} style={{ width: 18, height: 18 }}>
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-black/70 group-hover:text-black transition capitalize">{brand.name}</span>
                  </div>
                  {brand._count !== undefined && <span className="text-[11px] text-black/35">{brand._count.products}</span>}
                  <input type="checkbox" checked={checked} onChange={() => handleBrandChange(brand.id)} className="sr-only" />
                </label>
              );
            })}
          </div>
        </SidebarSection>
      )}

      <SidebarSection title="Price Range">
        <div className="px-1">
          <div className="mb-4 flex items-center justify-between text-sm font-semibold text-black">
            <span>{formatPrice(priceRangeVal[0])}</span>
            <span>{formatPrice(priceRangeVal[1])}{priceRangeVal[1] >= PRICE_MAX ? "+" : ""}</span>
          </div>
          <DualRangeSlider
            min={0}
            max={PRICE_MAX}
            value={priceRangeVal}
            onChange={handlePriceRange}
          />
          <div className="mt-3 flex gap-2">
            <div className="flex-1 rounded-lg border border-[#e7ebf0] bg-[#f7f8fa] px-2.5 py-1.5">
              <p className="text-[10px] text-black/35 uppercase tracking-wider">Min</p>
              <input
                type="number"
                min={0}
                max={priceRangeVal[1] - PRICE_STEP}
                step={PRICE_STEP}
                value={priceRangeVal[0]}
                onChange={(e) => handlePriceRange([Math.max(0, Number(e.target.value)), priceRangeVal[1]])}
                className="w-full bg-transparent text-sm font-semibold text-black outline-none"
              />
            </div>
            <div className="flex-1 rounded-lg border border-[#e7ebf0] bg-[#f7f8fa] px-2.5 py-1.5">
              <p className="text-[10px] text-black/35 uppercase tracking-wider">Max</p>
              <input
                type="number"
                min={priceRangeVal[0] + PRICE_STEP}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={priceRangeVal[1]}
                onChange={(e) => handlePriceRange([priceRangeVal[0], Math.min(PRICE_MAX, Number(e.target.value))])}
                className="w-full bg-transparent text-sm font-semibold text-black outline-none"
              />
            </div>
          </div>
        </div>
      </SidebarSection>

      <SidebarSection title="Rating">
        <div className="space-y-2.5">
          {RATING_OPTIONS.map((rating) => {
            const checked = currentParams.minRating === String(rating);
            return (
              <label key={rating} className="flex cursor-pointer items-center justify-between gap-3 group">
                <div className="flex items-center gap-2.5">
                  <div className={`flex items-center justify-center rounded border transition ${checked ? "border-black bg-black" : "border-[#d1d9e0] bg-white group-hover:border-black/50"}`} style={{ width: 18, height: 18 }}>
                    {checked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-zinc-300"}`} />
                    ))}
                  </span>
                </div>
                <span className="text-[11px] text-black/45">& Up</span>
                <input type="checkbox" checked={checked} onChange={() => updateParams({ minRating: checked ? "" : String(rating), page: "1" })} className="sr-only" />
              </label>
            );
          })}
        </div>
      </SidebarSection>

      <SidebarSection title="Availability" defaultOpen={false}>
        <label className="flex cursor-pointer items-center gap-3">
          <div className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${currentParams.inStock === "true" ? "bg-black" : "bg-[#d1d9e0]"}`}>
            <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${currentParams.inStock === "true" ? "translate-x-4" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm text-black/70">In stock only</span>
          <input type="checkbox" checked={currentParams.inStock === "true"} onChange={() => updateParams({ inStock: currentParams.inStock === "true" ? "" : "true", page: "1" })} className="sr-only" />
        </label>
      </SidebarSection>
    </aside>
  );

  return (
    <>
      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setMobileOpen(false)} />
      <div className={`fixed bottom-0 left-0 right-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-4 shadow-[0_-20px_60px_rgba(15,23,42,0.18)] transition-transform duration-300 ${mobileOpen ? "translate-y-0" : "translate-y-full"}`}>
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-black/10" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-black">Filters</h3>
          <button type="button" onClick={() => setMobileOpen(false)} className="rounded-full p-1 transition hover:bg-[#f7f8fa]">
            <X className="h-5 w-5 text-black/60" />
          </button>
        </div>
        <FilterSidebar />
        <button type="button" onClick={() => setMobileOpen(false)} className="mt-6 w-full rounded-full bg-black py-3.5 text-sm font-bold text-white transition hover:bg-black/85">
          Show Results
        </button>
      </div>

      <div className="flex gap-8 lg:gap-10">
        {/* Sidebar (desktop) */}
        <div className="hidden w-[260px] flex-shrink-0 lg:block">
          <div className="sticky top-24">
            <FilterSidebar />
          </div>
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
              <input
                type="text"
                value={currentParams.searchTerm}
                onChange={handleSearch}
                placeholder="Search products..."
                className="h-10 w-full rounded-full border border-[#e7ebf0] bg-white pl-10 pr-4 text-sm text-black shadow-[0_2px_10px_rgba(15,23,42,0.06)] outline-none transition placeholder:text-black/30 focus:border-black/30 focus:shadow-[0_2px_16px_rgba(15,23,42,0.12)]"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Result count */}
              <span className="hidden text-sm text-black/45 sm:block">
                Showing {total > 0 ? (currentPage - 1) * LIMIT + 1 : 0}–{Math.min(currentPage * LIMIT, total)} of {total}
              </span>

              {/* Sort */}
              <select
                value={currentSortValue}
                onChange={(e) => handleSort(e.target.value)}
                className="h-10 rounded-full border border-[#e7ebf0] bg-white px-4 pr-8 text-sm text-black shadow-[0_2px_10px_rgba(15,23,42,0.06)] outline-none transition focus:border-black/30 appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Mobile filter button */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[#e7ebf0] bg-white px-4 text-sm font-semibold text-black shadow-[0_2px_10px_rgba(15,23,42,0.06)] transition hover:bg-[#f7f8fa] lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeChips.length > 0 && (
                  <span className="flex items-center justify-center rounded-full bg-black text-[10px] font-bold text-white" style={{ width: 18, height: 18 }}>
                    {activeChips.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile result count */}
          <p className="mb-3 text-sm text-black/45 sm:hidden">
            Showing {total > 0 ? (currentPage - 1) * LIMIT + 1 : 0}–{Math.min(currentPage * LIMIT, total)} of {total}
          </p>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {activeChips.map((chip) => (
                <span key={chip.label} className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1 text-[12px] font-semibold text-black shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                  {chip.label}
                  <button type="button" onClick={chip.onRemove} className="rounded-full transition hover:bg-black/8" aria-label={`Remove ${chip.label} filter`}>
                    <X className="h-3 w-3 text-black/50" />
                  </button>
                </span>
              ))}
              {activeChips.length > 1 && (
                <button type="button" onClick={clearFilters} className="rounded-full px-3 py-1 text-[12px] font-semibold text-black/45 underline underline-offset-2 transition hover:text-black">
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Product grid */}
          {initialProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#eceff3] bg-[#f7f8fa] py-20 text-center">
              <div className="mb-4 text-5xl">🔍</div>
              <p className="text-base font-semibold text-black">No products match your filters</p>
              <p className="mt-1.5 text-sm text-black/45">Try adjusting or clearing your filters</p>
              <button type="button" onClick={clearFilters} className="mt-5 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black/85">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {initialProducts.map((product, index) => {
                  const avg = product.reviews?.length
                    ? product.reviews.reduce((a: number, r: { rating: number }) => a + r.rating, 0) / product.reviews.length
                    : null;
                  const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : null;
                  const inStock = product.stock > 0;
                  const image = product.images?.[0] || "https://placehold.co/800x1000/f3f4f6/999.png?text=Product";

                  return (
                    <article key={product.id} className="group relative flex flex-col">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#f3f4f6] mb-3">
                        <Link href={`/products/${product.slug || product.id}`} className="absolute inset-0 z-0" tabIndex={-1} aria-label={product.name}>
                          <Image
                            src={image}
                            alt={product.name}
                            fill
                            loading={index < 4 ? "eager" : "lazy"}
                            className="object-cover transition duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          />
                        </Link>

                        {/* Badges */}
                        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-1.5">
                          {product.discount > 0 && (
                            <span className="rounded-full bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                              -{product.discount}% Sale
                            </span>
                          )}
                          {!inStock && (
                            <span className="rounded-full bg-gray-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                              Sold Out
                            </span>
                          )}
                        </div>

                        {/* Action overlay (Tailwind transition instead of Framer Motion) */}
                        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          <div className="flex gap-1.5 bg-white/95 px-2 pb-2 pt-2 backdrop-blur-sm rounded-b-2xl">
                            <button
                              type="button"
                              disabled={!inStock}
                              onClick={(e) => handleAddToCart(e, product)}
                              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-black text-white text-[12px] font-bold transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
                            </button>
                            <Link
                              href={`/checkout?product=${product.id}`}
                              className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-black text-[12px] font-bold text-black transition hover:bg-black hover:text-white ${!inStock ? "pointer-events-none opacity-40" : ""}`}
                            >
                              <Zap className="h-3.5 w-3.5" /> Order Now
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div>
                        <Link href={`/products/${product.slug || product.id}`}>
                          <h3 className="line-clamp-2 text-sm leading-snug text-black transition hover:text-gray-600">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="mt-1 text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                          {product.category?.name}{product.brand && ` • ${product.brand.name}`}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {discountedPrice ? (
                              <>
                                <span className="text-sm font-semibold text-black">{formatPrice(discountedPrice)}</span>
                                <span className="text-xs text-black/45 line-through">{formatPrice(product.price)}</span>
                              </>
                            ) : (
                              <span className="text-sm font-semibold text-black">{formatPrice(product.price)}</span>
                            )}
                          </div>
                          {avg && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-medium text-black/50">{avg.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateParams({ page: String(Math.max(1, currentPage - 1)) })}
                    disabled={currentPage === 1}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e7ebf0] bg-white text-black shadow-[0_2px_10px_rgba(15,23,42,0.06)] transition hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="min-w-[80px] text-center text-sm font-semibold text-black">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateParams({ page: String(Math.min(totalPages, currentPage + 1)) })}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e7ebf0] bg-white text-black shadow-[0_2px_10px_rgba(15,23,42,0.06)] transition hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
