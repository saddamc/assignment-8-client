import { serverFetch } from "@/lib/server-fetch";
import Navbar from "@/components/Home/Navbar";
import Footer from "@/components/Home/Footer";
import ProductsClient from "./ProductsClient";

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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const categoryId = params.categoryId || "";
  const categoryIdsParam = params.categoryIds || "";
  const categorySlug = params.categorySlug || "";
  const brandId = params.brandId || "";
  const brandIdsParam = params.brandIds || "";
  const minPrice = params.minPrice || "";
  const maxPrice = params.maxPrice || "";
  const priceRanges = params.priceRanges || "";
  const minRating = params.minRating || "";
  const inStock = params.inStock || "";
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder || "desc";
  const searchTerm = params.searchTerm || "";
  const page = params.page || "1";

  // Fetch categories + brands first so we can resolve categorySlug → categoryId
  let categories: Category[] = [];
  let brands: Brand[] = [];
  try {
    const [categoriesRes, brandsRes] = await Promise.all([
      serverFetch.get("/products/categories?limit=100"),
      serverFetch.get("/products/brands?limit=100"),
    ]);
    const categoriesData = await categoriesRes.json();
    const brandsData = await brandsRes.json();
    if (categoriesData.success) categories = categoriesData.data || [];
    if (brandsData.success) brands = brandsData.data || [];
  } catch {}

  // Resolve slug to ID when categorySlug is present and no direct categoryId
  const resolvedCategoryIds = categoryIdsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (categoryId && !resolvedCategoryIds.includes(categoryId)) {
    resolvedCategoryIds.push(categoryId);
  }

  if (categorySlug && resolvedCategoryIds.length === 0) {
    const matched = categories.find(
      (c) => c.slug?.toLowerCase() === categorySlug.toLowerCase()
    );
    if (matched) resolvedCategoryIds.push(matched.id);
  }

  const resolvedBrandIds = brandIdsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (brandId && !resolvedBrandIds.includes(brandId)) {
    resolvedBrandIds.push(brandId);
  }

  const queryParts: string[] = [
    `page=${page}`,
    `limit=9`,
    `sortBy=${sortBy}`,
    `sortOrder=${sortOrder}`,
  ];
  if (resolvedCategoryIds.length > 0) {
    queryParts.push(`categoryIds=${encodeURIComponent(resolvedCategoryIds.join(","))}`);
  }
  if (resolvedBrandIds.length > 0) {
    queryParts.push(`brandIds=${encodeURIComponent(resolvedBrandIds.join(","))}`);
  }
  if (minPrice) queryParts.push(`minPrice=${minPrice}`);
  if (maxPrice) queryParts.push(`maxPrice=${maxPrice}`);
  if (priceRanges) queryParts.push(`priceRanges=${encodeURIComponent(priceRanges)}`);
  if (minRating) queryParts.push(`minRating=${minRating}`);
  if (inStock) queryParts.push(`inStock=${inStock}`);
  if (searchTerm) queryParts.push(`searchTerm=${encodeURIComponent(searchTerm)}`);

  let products: unknown[] = [];
  let total = 0;

  try {
    const productsRes = await serverFetch.get(`/products?${queryParts.join("&")}`);
    const productsData = await productsRes.json();
    if (productsData.success) {
      products = productsData.data || [];
      total = productsData.meta?.total || 0;
    }
  } catch {
    console.error("Failed to fetch products");
  }

  const activeCategory =
    resolvedCategoryIds.length === 1
      ? categories.find((c) => c.id === resolvedCategoryIds[0])
      : undefined;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-16 md:px-8">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Shop</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
            {activeCategory ? activeCategory.name : "All Products"}
          </h1>
          <p className="text-zinc-500 mt-3 max-w-xl">{total} products available</p>
        </div>
        <ProductsClient
          initialProducts={products}
          categories={categories}
          brands={brands}
          total={total}
          currentPage={parseInt(page)}
          currentParams={{
            categoryIds: resolvedCategoryIds,
            brandIds: resolvedBrandIds,
            minPrice,
            maxPrice,
            priceRanges,
            minRating,
            inStock,
            sortBy,
            sortOrder,
            searchTerm,
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
