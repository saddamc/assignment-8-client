import Footer from "@/components/Home/Footer";
import Navbar from "@/components/Home/Navbar";
import { serverFetch } from "@/lib/server-fetch";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  images?: string[];
  category?: { name: string };
}

export default async function NewArrivalsPage() {
  let products: Product[] = [];

  try {
    const res = await serverFetch.get("/products?sortBy=createdAt&sortOrder=desc&limit=12");
    const data = await res.json();

    if (data?.success) {
      products = data.data?.data || [];
    }
  } catch {
    console.error("Failed to load new arrivals");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="bg-zinc-950 text-white py-20 md:py-24 px-4">
          <div className="container mx-auto">
            <p className="text-xs uppercase tracking-widest font-bold text-indigo-300 mb-3">Fresh Edit</p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight">New Arrivals</h1>
            <p className="text-zinc-300 mt-4 max-w-2xl text-base md:text-lg">
              The latest pieces to land at Cabro, selected for timeless style and modern utility.
            </p>
          </div>
        </section>

        <section className="py-14 md:py-16 px-4">
          <div className="container mx-auto">
            {products.length === 0 ? (
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 py-20 text-center">
                <p className="text-zinc-500">No new arrivals found right now. Check back soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
                {products.map((product) => {
                  const discountedPrice =
                    typeof product.discount === "number"
                      ? product.price * (1 - product.discount / 100)
                      : null;

                  return (
                    <Link key={product.id} href={`/products/${product.id}`} className="group flex flex-col">
                      <div className="relative aspect-4/5 bg-zinc-100 rounded-3xl overflow-hidden mb-4">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-linear-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-zinc-500 text-sm px-4 text-center">
                            {product.name}
                          </div>
                        )}
                      </div>

                      <p className="text-xs uppercase tracking-wider text-zinc-400 mb-1">
                        {product.category?.name || "Uncategorized"}
                      </p>
                      <h2 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </h2>

                      <div className="mt-2 flex items-center gap-2">
                        {discountedPrice ? (
                          <>
                            <span className="font-bold text-indigo-600">${discountedPrice.toFixed(2)}</span>
                            <span className="text-sm text-zinc-400 line-through">${product.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="font-bold">${product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="mt-14 text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-8 h-12 font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-colors"
              >
                Browse All Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
