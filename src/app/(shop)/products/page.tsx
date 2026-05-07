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
  const brandId = params.brandId || "";
  const minPrice = params.minPrice || "";
  const maxPrice = params.maxPrice || "";
  const minRating = params.minRating || "";
  const inStock = params.inStock || "";
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder || "desc";
  const searchTerm = params.searchTerm || "";
  const page = params.page || "1";

  const queryParts: string[] = [
    `page=${page}`,
    `limit=9`,
    `sortBy=${sortBy}`,
    `sortOrder=${sortOrder}`,
  ];
  if (categoryId) queryParts.push(`categoryId=${categoryId}`);
  if (brandId) queryParts.push(`brandId=${brandId}`);
  if (minPrice) queryParts.push(`minPrice=${minPrice}`);
  if (maxPrice) queryParts.push(`maxPrice=${maxPrice}`);
  if (minRating) queryParts.push(`minRating=${minRating}`);
  if (inStock) queryParts.push(`inStock=${inStock}`);
  if (searchTerm) queryParts.push(`searchTerm=${encodeURIComponent(searchTerm)}`);

  let products: unknown[] = [];
  let total = 0;
  let categories: Category[] = [];
  let brands: Brand[] = [];

  try {
    const [productsRes, categoriesRes, brandsRes] = await Promise.all([
      serverFetch.get(`/products?${queryParts.join("&")}`),
      serverFetch.get("/products/categories?limit=100"),
      serverFetch.get("/products/brands?limit=100"),
    ]);
    const productsData = await productsRes.json();
    const categoriesData = await categoriesRes.json();
    const brandsData = await brandsRes.json();
    if (productsData.success) {
      products = productsData.data || [];
      total = productsData.meta?.total || 0;
    }
    if (categoriesData.success) categories = categoriesData.data || [];
    if (brandsData.success) brands = brandsData.data || [];
  } catch {
    console.error("Failed to fetch products");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-16 md:px-8">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Shop</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">All Products</h1>
          <p className="text-zinc-500 mt-3 max-w-xl">{total} products available</p>
        </div>
        <ProductsClient
          initialProducts={products}
          categories={categories}
          brands={brands}
          total={total}
          currentPage={parseInt(page)}
          currentParams={{ categoryId, brandId, minPrice, maxPrice, minRating, inStock, sortBy, sortOrder, searchTerm }}
        />
      </main>
      <Footer />
    </div>
  );
}
