import { serverFetch } from "@/lib/server-fetch";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Package } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Product = any;

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-zinc-100 text-zinc-600",
  ARCHIVED: "bg-red-50 text-red-600",
};

export default async function SellerProductsPage() {
  let products: Product[] = [];

  try {
    const res = await serverFetch.get("/products/my-products");
    const data = await res.json();
    if (data.success) products = data.data?.data || data.data || [];
  } catch { /* empty state */ }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Inventory</p>
          <h1 className="text-3xl font-serif font-bold">My Products</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {products.length} product{products.length !== 1 ? "s" : ""} listed
          </p>
        </div>
        <Link
          href="/seller/products/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Table */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
          <Package className="w-12 h-12 text-zinc-200 mb-4" />
          <h3 className="text-lg font-bold mb-2">No products yet</h3>
          <p className="text-zinc-400 text-sm mb-6">
            List your first product to start selling.
          </p>
          <Link
            href="/seller/products/new"
            className="px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> List Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-zinc-50 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {products.map((product: Product) => {
                  const statusKey = (product.status || "ACTIVE").toUpperCase();
                  return (
                    <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
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
                              <div className="absolute inset-0 bg-zinc-200 flex items-center justify-center text-zinc-400 text-xs">
                                No img
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold line-clamp-1 max-w-48">
                              {product.name}
                            </p>
                            <p className="text-xs text-zinc-400 font-mono">
                              #{product.id?.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        ${(product.price || 0).toFixed(2)}
                        {product.discount > 0 && (
                          <span className="ml-2 text-xs text-red-500 font-normal">
                            -{product.discount}%
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-semibold ${
                            (product.stock || 0) <= 5
                              ? "text-red-600"
                              : "text-zinc-700"
                          }`}
                        >
                          {product.stock ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-600">
                        {product.category?.name || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            STATUS_STYLES[statusKey] || "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {statusKey}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/seller/products/${product.id}/edit`}
                            className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/products/${product.id}`}
                            className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors text-xs font-semibold"
                            title="View listing"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
