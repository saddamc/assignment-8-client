import { serverFetch } from "@/lib/server-fetch";
import Navbar from "@/components/Home/Navbar";
import Footer from "@/components/Home/Footer";
import ProductsClient from "./ProductsClient";

interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const categoryId = params.categoryId || "";
  const minPrice = params.minPrice || "";
  const maxPrice = params.maxPrice || "";
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
  if (minPrice) queryParts.push(`minPrice=${minPrice}`);
  if (maxPrice) queryParts.push(`maxPrice=${maxPrice}`);
  if (searchTerm) queryParts.push(`searchTerm=${encodeURIComponent(searchTerm)}`);

  let products: unknown[] = [];
  let total = 0;
  let categories: Category[] = [];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      serverFetch.get(`/products?${queryParts.join("&")}`),
      serverFetch.get("/products/categories"),
    ]);
    const productsData = await productsRes.json();
    const categoriesData = await categoriesRes.json();
    if (productsData.success) {
      products = productsData.data.data || [];
      total = productsData.data.meta?.total || 0;
    }
    if (categoriesData.success) categories = categoriesData.data || [];
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
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Essential Collection</h1>
          <p className="text-zinc-500 mt-3 max-w-xl">Showing {total} products — meticulously sourced for the modern connoisseur.</p>
        </div>
        <ProductsClient
          initialProducts={products}
          categories={categories}
          total={total}
          currentPage={parseInt(page)}
          currentParams={{ categoryId, minPrice, maxPrice, sortBy, sortOrder, searchTerm }}
        />
      </main>
      <Footer />
    </div>
  );
}
