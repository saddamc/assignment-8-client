import { serverFetch } from "@/lib/server-fetch";
import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Product = any;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; searchTerm?: string }>;
}) {
  const params = await searchParams;
  const page = params.page || "1";
  const searchTerm = params.searchTerm || "";

  let products: Product[] = [];
  let total = 0;

  const qs = [`page=${page}`, "limit=20"];
  if (searchTerm) qs.push(`searchTerm=${encodeURIComponent(searchTerm)}`);

  try {
    const res = await serverFetch.get(`/products?${qs.join("&")}`);
    const data = await res.json();
    if (data.success) {
      products = data.data || [];
      total = data.meta?.total || products.length;
    }
  } catch { /* empty state */ }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">
            Catalog Management
          </p>
          <h1 className="text-3xl font-serif font-bold">All Products</h1>
          <p className="text-zinc-500 text-sm mt-1">{total} products in catalog</p>
        </div>

        {/* Search */}
        <form method="get" className="flex items-center gap-2">
          <input
            type="text"
            name="searchTerm"
            defaultValue={searchTerm}
            placeholder="Search products..."
            className="h-10 w-64 rounded-xl border border-zinc-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
          <Package className="w-12 h-12 text-zinc-200 mb-4" />
          <h3 className="text-lg font-bold mb-2">No products found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-zinc-50 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Seller</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {products.map((product: Product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden relative shrink-0 border">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-zinc-200" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold line-clamp-1 max-w-40">
                            {product.name}
                          </p>
                          <p className="text-xs text-zinc-400 font-mono">
                            #{product.id?.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 text-xs">
                      {product.seller?.storeName ||
                        product.seller?.name ||
                        "Unknown"}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      ${(product.price || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          (product.stock || 0) <= 5
                            ? "text-red-600 font-semibold"
                            : "text-zinc-600"
                        }
                      >
                        {product.stock ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs">
                      {product.category?.name || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/products/${product.id}`}
                        className="text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t bg-zinc-50 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Showing {products.length} of {total}
            </p>
            <div className="flex gap-2">
              {Number(page) > 1 && (
                <a
                  href={`/admin/products?page=${Number(page) - 1}&searchTerm=${searchTerm}`}
                  className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-white transition-colors"
                >
                  Previous
                </a>
              )}
              {products.length === 20 && (
                <a
                  href={`/admin/products?page=${Number(page) + 1}&searchTerm=${searchTerm}`}
                  className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-white transition-colors"
                >
                  Next
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
