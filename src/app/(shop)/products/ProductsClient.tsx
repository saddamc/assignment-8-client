"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Star, SlidersHorizontal, X, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/useCartStore";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Product = any;

interface Props {
  initialProducts: Product[];
  categories: Category[];
  total: number;
  currentPage: number;
  currentParams: {
    categoryId: string;
    minPrice: string;
    maxPrice: string;
    sortBy: string;
    sortOrder: string;
    searchTerm: string;
  };
}

const PRICE_RANGES = [
  { label: "Under $100", min: "", max: "100" },
  { label: "$100 – $500", min: "100", max: "500" },
  { label: "$500 – $1,000", min: "500", max: "1000" },
  { label: "Over $1,000", min: "1000", max: "" },
];

const SORT_OPTIONS = [
  { label: "Newest", value: "createdAt:desc" },
  { label: "Oldest", value: "createdAt:asc" },
  { label: "Price: Low to High", value: "price:asc" },
  { label: "Price: High to Low", value: "price:desc" },
  { label: "Popularity", value: "name:asc" },
];

const LIMIT = 9;

export default function ProductsClient({ initialProducts, categories, total, currentPage, currentParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [, startTransition] = useTransition();
  const addItem = useCartStore((s) => s.addItem);

  const totalPages = Math.ceil(total / LIMIT);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = { ...currentParams, ...updates };
    if (merged.categoryId) params.set("categoryId", merged.categoryId);
    if (merged.minPrice) params.set("minPrice", merged.minPrice);
    if (merged.maxPrice) params.set("maxPrice", merged.maxPrice);
    if (merged.sortBy) params.set("sortBy", merged.sortBy);
    if (merged.sortOrder) params.set("sortOrder", merged.sortOrder);
    if (merged.searchTerm) params.set("searchTerm", merged.searchTerm);
    if (updates.page) params.set("page", updates.page);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleCategoryChange = (id: string) => {
    updateParams({ categoryId: id === currentParams.categoryId ? "" : id, page: "1" });
  };

  const handlePriceRange = (min: string, max: string) => {
    const isActive = currentParams.minPrice === min && currentParams.maxPrice === max;
    updateParams({ minPrice: isActive ? "" : min, maxPrice: isActive ? "" : max, page: "1" });
  };

  const handleSort = (value: string) => {
    const [sortBy, sortOrder] = value.split(":");
    updateParams({ sortBy, sortOrder, page: "1" });
  };

  const handleSearch = (term: string) => {
    updateParams({ searchTerm: term, page: "1" });
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

  const currentSortValue = `${currentParams.sortBy}:${currentParams.sortOrder}`;
  const isPriceActive = (min: string, max: string) =>
    currentParams.minPrice === min && currentParams.maxPrice === max;

  const Filters = () => (
    <div className="space-y-8">
      {/* Search */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Search</h3>
        <input
          type="text"
          defaultValue={currentParams.searchTerm}
          placeholder="Search products..."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch((e.target as HTMLInputElement).value);
          }}
          className="w-full h-10 rounded-xl border border-zinc-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      {/* Category */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Category</h3>
        <ul className="space-y-2">
          <li>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${!currentParams.categoryId ? "bg-indigo-600 border-indigo-600" : "border-zinc-300 group-hover:border-indigo-400"}`}>
                {!currentParams.categoryId && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
              <span className={`text-sm font-medium ${!currentParams.categoryId ? "text-indigo-600" : "text-zinc-600 group-hover:text-zinc-900"}`}
                onClick={() => updateParams({ categoryId: "", page: "1" })}>
                All Collections
              </span>
            </label>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <label className="flex items-center gap-3 cursor-pointer group" onClick={() => handleCategoryChange(cat.id)}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${currentParams.categoryId === cat.id ? "bg-indigo-600 border-indigo-600" : "border-zinc-300 group-hover:border-indigo-400"}`}>
                  {currentParams.categoryId === cat.id && <div className="w-2 h-2 bg-white rounded-sm" />}
                </div>
                <span className={`text-sm font-medium ${currentParams.categoryId === cat.id ? "text-indigo-600" : "text-zinc-600 group-hover:text-zinc-900"}`}>
                  {cat.name}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Price Range</h3>
        <ul className="space-y-2">
          {PRICE_RANGES.map((range) => (
            <li key={range.label}>
              <label className="flex items-center gap-3 cursor-pointer group" onClick={() => handlePriceRange(range.min, range.max)}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isPriceActive(range.min, range.max) ? "bg-indigo-600 border-indigo-600" : "border-zinc-300 group-hover:border-indigo-400"}`}>
                  {isPriceActive(range.min, range.max) && <div className="w-2 h-2 bg-white rounded-sm" />}
                </div>
                <span className={`text-sm font-medium ${isPriceActive(range.min, range.max) ? "text-indigo-600" : "text-zinc-600 group-hover:text-zinc-900"}`}>
                  {range.label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Rating</h3>
        <div className="flex items-center gap-1 text-zinc-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-5 h-5 cursor-pointer hover:text-amber-400 transition-colors ${i < 3 ? "fill-amber-400 text-amber-400" : ""}`} />
          ))}
          <span className="text-sm ml-2 text-zinc-500">&amp; Up</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="flex items-center justify-between mb-6 md:hidden">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 h-10 px-5 rounded-full border border-zinc-200 text-sm font-medium hover:bg-zinc-50 transition"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
        <select
          value={currentSortValue}
          onChange={(e) => handleSort(e.target.value)}
          className="h-10 px-4 rounded-full border border-zinc-200 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative ml-auto w-80 bg-white h-full overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <Filters />
          </div>
        </div>
      )}

      <div className="flex gap-12">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="flex items-center gap-2 mb-8">
            <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Filters</h2>
          </div>
          <Filters />
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="hidden md:flex items-center justify-between mb-8 pb-4 border-b">
            <p className="text-sm text-zinc-500 font-medium">{total} products found</p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500">Sort by:</span>
              <select
                value={currentSortValue}
                onChange={(e) => handleSort(e.target.value)}
                className="h-9 px-4 pr-8 rounded-full border border-zinc-200 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {initialProducts.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-zinc-200 rounded-3xl">
              <p className="text-zinc-400 text-lg mb-6">No products match your filters.</p>
              <Button onClick={() => updateParams({ categoryId: "", minPrice: "", maxPrice: "", searchTerm: "", page: "1" })} variant="outline" className="rounded-full px-8">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
                {initialProducts.map((product: Product) => {
                  const avg = product.reviews?.length
                    ? product.reviews.reduce((a: number, r: { rating: number }) => a + r.rating, 0) / product.reviews.length
                    : null;
                  const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : null;

                  return (
                    <Link href={`/products/${product.id}`} key={product.id} className="group flex flex-col">
                      <div className="relative aspect-4/5 bg-zinc-100 rounded-3xl overflow-hidden mb-4">
                        {product.discount > 0 && (
                          <div className="absolute top-3 left-3 z-10 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            -{product.discount}%
                          </div>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute top-3 right-3 z-10 bg-zinc-800 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            Sold Out
                          </div>
                        )}
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-zinc-200 to-zinc-300 text-zinc-500 text-sm font-medium px-4 text-center">
                            {product.name}
                          </div>
                        )}
                        {/* Quick Add Overlay */}
                        {product.stock > 0 && (
                          <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20">
                            <button
                              onClick={(e) => handleAddToCart(e, product)}
                              className="w-full flex items-center justify-center gap-2 bg-white rounded-2xl py-3 text-sm font-bold text-zinc-900 shadow-lg hover:bg-zinc-50 active:scale-95 transition-all"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              Quick Add
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-1">{product.category?.name} • {product.seller?.storeName}</p>
                        <h3 className="font-bold text-base leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            {discountedPrice ? (
                              <>
                                <span className="font-bold text-indigo-600">${discountedPrice.toFixed(2)}</span>
                                <span className="text-sm text-zinc-400 line-through">${product.price.toFixed(2)}</span>
                              </>
                            ) : (
                              <span className="font-bold">${product.price.toFixed(2)}</span>
                            )}
                          </div>
                          {avg && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-medium text-zinc-500">{avg.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-16">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => updateParams({ page: String(currentPage - 1) })}
                    className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center disabled:opacity-30 hover:bg-zinc-50 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateParams({ page: String(p) })}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition ${currentPage === p ? "bg-indigo-600 text-white" : "border border-zinc-200 hover:bg-zinc-50 text-zinc-700"}`}
                    >
                      {p}
                    </button>
                  ))}

                  {totalPages > 8 && <span className="text-zinc-400">...</span>}

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => updateParams({ page: String(currentPage + 1) })}
                    className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center disabled:opacity-30 hover:bg-zinc-50 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
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
