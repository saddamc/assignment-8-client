"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Package, Eye, Trash2 } from "lucide-react";
import SubmitForReview from "./SubmitForReview";
import { clientFetch } from "@/lib/client-fetch";

export interface Product {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  stock?: number;
  images?: string[];
  status?: string;
  slug?: string;
  approval?: { reviewNote?: string };
  _count?: { variants?: number };
  variants?: any[];
  createdAt?: string;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600",
  PENDING: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-600",
  DISABLED: "bg-zinc-700 text-white",
};

interface SellerProductsClientProps {
  initialProducts: Product[];
  activeTab: string;
}

export default function SellerProductsClient({
  initialProducts,
  activeTab,
}: SellerProductsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((product) =>
      product.name.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await clientFetch(`/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Unable to delete product");
        return;
      }
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (error) {
      console.error("Failed to delete product", error);
      alert("Unable to delete product.");
    }
  };

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

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "DRAFT", "PENDING", "PUBLISHED", "REJECTED", "DISABLED"].map((tab) => (
          <Link
            key={tab}
            href={tab === "ALL" ? "/seller/products" : `/seller/products?status=${tab}`}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              activeTab === tab
                ? "bg-indigo-600 text-white border-indigo-600"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
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
                <tr className="border-b bg-zinc-50 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <th className="px-6 py-4">SL</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Added On</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Variants</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredProducts.map((product, index) => {
                  const statusKey = (product.status || "DRAFT").toUpperCase();
                  return (
                    <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4 text-center font-semibold text-zinc-600">{index + 1}</td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden relative shrink-0 border">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 50vw, 25vw"
                                className="object-cover"
                                quality={75}
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
                              #{product.id.toString().slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {product.discountPrice ? (
                          <span>
                            <span className="text-red-600">${product.discountPrice.toFixed(2)}</span>
                            <span className="ml-2 text-xs text-zinc-400 line-through font-normal">
                              ${product.price.toFixed(2)}
                            </span>
                          </span>
                        ) : (
                          <span>${(product.price || 0).toFixed(2)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-sm">
                        {product.createdAt ? new Date(product.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }) : "—"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`font-semibold ${
                            (product.stock || 0) <= 5 ? "text-red-600" : "text-zinc-700"
                          }`}
                        >
                          {product.stock ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-zinc-600">
                        {product._count?.variants ?? product.variants?.length ?? 0}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            STATUS_STYLES[statusKey] || "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {statusKey}
                        </span>
                        {statusKey === "REJECTED" && product.approval?.reviewNote && (
                          <p className="text-xs text-red-500 mt-1 max-w-40 line-clamp-2">
                            {product.approval.reviewNote}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/seller/products/${product.id}/edit`}
                            className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          {(statusKey === "DRAFT" || statusKey === "REJECTED") && (
                            <SubmitForReview productId={product.id.toString()} />
                          )}
                          {statusKey === "PUBLISHED" && (
                            <Link
                              href={`/products/${product.slug || product.id}`}
                              className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors"
                              title="View listing"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
