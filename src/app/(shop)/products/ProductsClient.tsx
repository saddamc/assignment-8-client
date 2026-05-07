"use client";

import { useState, useTransition, useRef } from "react";
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
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    categoryId: string;
    brandId: string;
    minPrice: string;
    maxPrice: string;
    minRating: string;
    inStock: string;
    sortBy: string;
    sortOrder: string;
    searchTerm: string;
  };
}

const PRICE_RANGES = [
  { label: "Under $50", min: "", max: "50" },
  { label: "$50 – $200", min: "50", max: "200" },
  { label: "$200 – $500", min: "200", max: "500" },
  { label: "$500 – $1,000", min: "500", max: "1000" },
  { label: "Over $1,000", min: "1000", max: "" },
];

const RATING_OPTIONS = [4, 3, 2, 1];

const SORT_OPTIONS = [
  { label: "Newest", value: "createdAt:desc" },
  { label: "Oldest", value: "createdAt:asc" },
  { label: "Price: Low to High", value: "price:asc" },
  { label: "Price: High to Low", value: "price:desc" },
  { label: "Name A–Z", value: "name:asc" },
];

const LIMIT = 9;

function FilterSection({
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
    <div className="border-b border-zinc-100 pb-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-800 transition-colors">
          {title}
        </h3>
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
        )}
      </button>
      {open && children}
    </div>
  );
}

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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [customMin, setCustomMin] = useState(currentParams.minPrice);
  const [customMax, setCustomMax] = useState(currentParams.maxPrice);
  const searchRef = useRef<HTMLInputElement>(null);
  const addItem = useCartStore((s) => s.addItem);

  const totalPages = Math.ceil(total / LIMIT);

  const hasActiveFilters =
    !!currentParams.categoryId ||
    !!currentParams.brandId ||
    !!currentParams.minPrice ||
    !!currentParams.maxPrice ||
    !!currentParams.minRating ||
    !!currentParams.inStock ||
    !!currentParams.searchTerm;

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = { ...currentParams, ...updates };
    if (merged.categoryId) params.set("categoryId", merged.categoryId);
    if (merged.brandId) params.set("brandId", merged.brandId);
    if (merged.minPrice) params.set("minPrice", merged.minPrice);
    if (merged.maxPrice) params.set("maxPrice", merged.maxPrice);
    if (merged.minRating) params.set("minRating", merged.minRating);
    if (merged.inStock) params.set("inStock", merged.inStock);
    if (merged.sortBy) params.set("sortBy", merged.sortBy);
    if (merged.sortOrder) params.set("sortOrder", merged.sortOrder);
    if (merged.searchTerm) params.set("searchTerm", merged.searchTerm);
    if (updates.page) params.set("page", updates.page);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearAllFilters = () => {
    setCustomMin("");
    setCustomMax("");
    if (searchRef.current) searchRef.current.value = "";
    startTransition(() => { router.push(pathname); });
  };

  const handleCategoryChange = (id: string) =>
    updateParams({ categoryId: id === currentParams.categoryId ? "" : id, page: "1" });

  const handleBrandChange = (id: string) =>
    updateParams({ brandId: id === currentParams.brandId ? "" : id, page: "1" });

  const handlePriceRange = (min: string, max: string) => {
    const isActive = currentParams.minPrice === min && currentParams.maxPrice === max;
    setCustomMin(isActive ? "" : min);
    setCustomMax(isActive ? "" : max);
    updateParams({ minPrice: isActive ? "" : min, maxPrice: isActive ? "" : max, page: "1" });
  };

  const handleCustomPrice = () => updateParams({ minPrice: customMin, maxPrice: customMax, page: "1" });

  const handleRating = (rating: number) => {
    const val = String(rating);
    updateParams({ minRating: currentParams.minRating === val ? "" : val, page: "1" });
  };

  const handleInStock = () =>
    updateParams({ inStock: currentParams.inStock === "true" ? "" : "true", page: "1" });

  const handleSort = (value: string) => {
    const [sortBy, sortOrder] = value.split(":");
    updateParams({ sortBy, sortOrder, page: "1" });
  };

  const handleSearch = (term: string) => updateParams({ searchTerm: term, page: "1" });

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

  const FilterSidebar = () => (
    <div className="space-y-5">
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="flex items-center gap-2 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors mb-2"
        >
          <X className="w-3.5 h-3.5" /> Clear all filters
        </button>
      )}

      <FilterSection title="Search">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            ref={searchRef}
            type="text"
            defaultValue={currentParams.searchTerm}
            placeholder="Search products..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch((e.target as HTMLInputElement).value);
            }}
            className="w-full h-9 rounded-xl border border-zinc-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
      </FilterSection>

      {categories.length > 0 && (
        <FilterSection title="Category">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => updateParams({ categoryId: "", page: "1" })}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition ${!currentParams.categoryId ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-zinc-600 hover:bg-zinc-50"}`}
              >
                <span>All Categories</span>
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition ${currentParams.categoryId === cat.id ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-zinc-600 hover:bg-zinc-50"}`}
                >
                  <span>{cat.name}</span>
                  {cat._count !== undefined && <span className="text-xs text-zinc-400">{cat._count.products}</span>}
                </button>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {brands.length > 0 && (
        <FilterSection title="Brand">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => updateParams({ brandId: "", page: "1" })}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition ${!currentParams.brandId ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-zinc-600 hover:bg-zinc-50"}`}
              >
                <span>All Brands</span>
              </button>
            </li>
            {brands.map((brand) => (
              <li key={brand.id}>
                <button
                  onClick={() => handleBrandChange(brand.id)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition ${currentParams.brandId === brand.id ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-zinc-600 hover:bg-zinc-50"}`}
                >
                  <span>{brand.name}</span>
                  {brand._count !== undefined && <span className="text-xs text-zinc-400">{brand._count.products}</span>}
                </button>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      <FilterSection title="Price Range">
        <ul className="space-y-1 mb-4">
          {PRICE_RANGES.map((range) => (
            <li key={range.label}>
              <button
                onClick={() => handlePriceRange(range.min, range.max)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition ${isPriceActive(range.min, range.max) ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-zinc-600 hover:bg-zinc-50"}`}
              >
                {range.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={customMin} onChange={(e) => setCustomMin(e.target.value)}
            className="w-full h-8 rounded-lg border border-zinc-200 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          <span className="text-zinc-400 text-xs shrink-0">–</span>
          <input type="number" placeholder="Max" value={customMax} onChange={(e) => setCustomMax(e.target.value)}
            className="w-full h-8 rounded-lg border border-zinc-200 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          <button onClick={handleCustomPrice}
            className="shrink-0 h-8 px-3 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition">
            Go
          </button>
        </div>
      </FilterSection>

      <FilterSection title="Rating">
        <ul className="space-y-1">
          {RATING_OPTIONS.map((rating) => (
            <li key={rating}>
              <button
                onClick={() => handleRating(rating)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition ${currentParams.minRating === String(rating) ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-zinc-600 hover:bg-zinc-50"}`}
              >
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-zinc-300"}`} />
                  ))}
                </span>
                <span className="text-xs">& Up</span>
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Availability" defaultOpen={false}>
        <button
          onClick={handleInStock}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm w-full transition ${currentParams.inStock === "true" ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-zinc-600 hover:bg-zinc-50"}`}
        >
          <Package className="w-3.5 h-3.5" />
          In Stock Only
        </button>
      </FilterSection>
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
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-indigo-600 ml-0.5" />}
        </button>
        <select value={currentSortValue} onChange={(e) => handleSort(e.target.value)}
          className="h-10 px-4 rounded-full border border-zinc-200 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative ml-auto w-80 bg-white h-full overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <FilterSidebar />
          </div>
        </div>
      )}

      <div className="flex gap-10">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-6">
            <div className="flex items-center gap-2 mb-6">
              <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Filters</h2>
            </div>
            <FilterSidebar />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="hidden md:flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
            <p className="text-sm text-zinc-500 font-medium">
              {total} product{total !== 1 ? "s" : ""} found
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="ml-3 text-xs text-red-400 hover:text-red-600 underline underline-offset-2 transition">
                  Clear filters
                </button>
              )}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500">Sort by:</span>
              <select value={currentSortValue} onChange={(e) => handleSort(e.target.value)}
                className="h-9 px-4 pr-8 rounded-full border border-zinc-200 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {currentParams.searchTerm && (
                <span className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700">
                  &ldquo;{currentParams.searchTerm}&rdquo;
                  <button onClick={() => updateParams({ searchTerm: "", page: "1" })}><X className="w-3 h-3" /></button>
                </span>
              )}
              {currentParams.categoryId && (
                <span className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-indigo-100 text-xs font-medium text-indigo-700">
                  {categories.find((c) => c.id === currentParams.categoryId)?.name || "Category"}
                  <button onClick={() => updateParams({ categoryId: "", page: "1" })}><X className="w-3 h-3" /></button>
                </span>
              )}
              {currentParams.brandId && (
                <span className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-indigo-100 text-xs font-medium text-indigo-700">
                  {brands.find((b) => b.id === currentParams.brandId)?.name || "Brand"}
                  <button onClick={() => updateParams({ brandId: "", page: "1" })}><X className="w-3 h-3" /></button>
                </span>
              )}
              {(currentParams.minPrice || currentParams.maxPrice) && (
                <span className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-green-100 text-xs font-medium text-green-700">
                  {currentParams.minPrice ? `$${currentParams.minPrice}` : "$0"} – {currentParams.maxPrice ? `$${currentParams.maxPrice}` : "∞"}
                  <button onClick={() => { setCustomMin(""); setCustomMax(""); updateParams({ minPrice: "", maxPrice: "", page: "1" }); }}><X className="w-3 h-3" /></button>
                </span>
              )}
              {currentParams.minRating && (
                <span className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-amber-100 text-xs font-medium text-amber-700">
                  {currentParams.minRating}+ Stars
                  <button onClick={() => updateParams({ minRating: "", page: "1" })}><X className="w-3 h-3" /></button>
                </span>
              )}
              {currentParams.inStock === "true" && (
                <span className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-emerald-100 text-xs font-medium text-emerald-700">
                  In Stock
                  <button onClick={() => updateParams({ inStock: "", page: "1" })}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {initialProducts.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-zinc-200 rounded-3xl">
              <p className="text-zinc-400 text-lg mb-6">No products match your filters.</p>
              <Button onClick={clearAllFilters} variant="outline" className="rounded-full px-8">
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
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 text-zinc-500 text-sm font-medium px-4 text-center">
                            {product.name}
                          </div>
                        )}
                        {product.stock > 0 && (
                          <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20">
                            <button onClick={(e) => handleAddToCart(e, product)}
                              className="w-full flex items-center justify-center gap-2 bg-white rounded-2xl py-3 text-sm font-bold text-zinc-900 shadow-lg hover:bg-zinc-50 active:scale-95 transition-all">
                              <ShoppingBag className="w-4 h-4" />
                              Quick Add
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-1">
                          {product.category?.name}{product.brand && ` • ${product.brand.name}`}
                        </p>
                        <h3 className="font-bold text-base leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </h3>
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
                  <button disabled={currentPage <= 1} onClick={() => updateParams({ page: String(currentPage - 1) })}
                    className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center disabled:opacity-30 hover:bg-zinc-50 transition">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => updateParams({ page: String(p) })}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition ${currentPage === p ? "bg-indigo-600 text-white" : "border border-zinc-200 hover:bg-zinc-50 text-zinc-700"}`}>
                      {p}
                    </button>
                  ))}
                  {totalPages > 8 && <span className="text-zinc-400">...</span>}
                  <button disabled={currentPage >= totalPages} onClick={() => updateParams({ page: String(currentPage + 1) })}
                    className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center disabled:opacity-30 hover:bg-zinc-50 transition">
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
