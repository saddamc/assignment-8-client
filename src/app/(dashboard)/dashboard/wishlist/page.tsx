import { serverFetch } from "@/lib/server-fetch";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WishlistItem = any;

export const metadata = { title: "My Wishlist | Cabro" };

export default async function WishlistPage() {
  let items: WishlistItem[] = [];

  try {
    const res = await serverFetch.get("/wishlist");
    const data = await res.json();
    if (data.success) items = data.data?.items || data.data || [];
  } catch { /* empty state */ }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">
          My Account
        </p>
        <h1 className="text-3xl font-serif font-bold">Wishlist</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {items.length} saved item{items.length !== 1 ? "s" : ""}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
          <Heart className="w-12 h-12 text-zinc-200 mb-4" />
          <h3 className="text-lg font-bold mb-2">Your wishlist is empty</h3>
          <p className="text-zinc-400 text-sm mb-6">
            Save items you love and come back to them anytime.
          </p>
          <Link
            href="/products"
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item: WishlistItem) => {
            const product = item.product || item;
            const image = product.images?.[0];
            const price = product.price || 0;
            const discount = product.discount || 0;
            const salePrice = discount > 0 ? price * (1 - discount / 100) : null;

            return (
              <div
                key={item.id || product.id}
                className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden group"
              >
                {/* Image */}
                <div className="relative aspect-square bg-zinc-50">
                  {image ? (
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw,
                        (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-zinc-100" />
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="font-semibold text-sm line-clamp-2 mb-1">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    {salePrice ? (
                      <>
                        <span className="font-black">${salePrice.toFixed(2)}</span>
                        <span className="text-xs text-zinc-400 line-through">
                          ${price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="font-black">${price.toFixed(2)}</span>
                    )}
                  </div>

                  <Link
                    href={`/products/${product.id}`}
                    className="block w-full text-center py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-700 transition-colors"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
