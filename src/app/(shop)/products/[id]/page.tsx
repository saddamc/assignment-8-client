import { serverFetch } from "@/lib/server-fetch";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Home/Navbar";
import Footer from "@/components/Home/Footer";
import { ArrowLeft, Star } from "lucide-react";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProductType = any;

const MOCK_PRODUCT: ProductType = {
  id: "mock",
  name: "Midnight Wool Heritage Blazer",
  description: "Crafted from premium Merino wool sourced from the highlands of New Zealand. This blazer is a testament to old-world craftsmanship — hand-stitched lapels, horn buttons, and a full-canvas construction that molds to your body over time. Perfect for the modern professional who refuses to compromise on quality.",
  price: 620.00,
  discount: 20.2,
  stock: 12,
  category: { name: "Essential Apparel" },
  seller: { storeName: "Heritage Atelier", name: "The Atelier" },
  images: [],
  reviews: [
    { id: "1", rating: 5, comment: "The fit is impeccable. As someone who usually struggles with sleeve length, this blazer feels like it was custom-made. The wool quality is exceptional, very breathable but holds its shape well.", customer: { name: "Alexander S.", profilePhoto: null }, createdAt: "2024-01-10" },
    { id: "2", rating: 5, comment: "Stunning craftsmanship. The color is deep and rich, perfect for both corporate settings and semi-formal events. Highly recommend following the size guide as it's very accurate.", customer: { name: "Marcus L.", profilePhoto: null }, createdAt: "2024-01-03" },
  ]
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const res = await serverFetch.get(`/products/${id}`);
    const data = await res.json();
    const product = data?.data;
    if (product) {
      return {
        title: `${product.name} | Cabro`,
        description: product.description?.slice(0, 160),
        openGraph: {
          title: product.name,
          description: product.description?.slice(0, 160),
          images: product.images?.[0] ? [{ url: product.images[0] }] : [],
        },
      };
    }
  } catch { /* fallback below */ }
  return { title: "Product | Cabro" };
}

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let product: ProductType = null;
  let relatedProducts: ProductType[] = [];

  try {
    const res = await serverFetch.get(`/products/${id}`);
    const data = await res.json();
    if (data.success) product = data.data;
  } catch { /* fall through to mock */ }

  if (!product) {
    if (id !== "mock") {
      // Return mock for demo without 404
      product = { ...MOCK_PRODUCT, id };
    } else {
      notFound();
    }
  }

  // Fetch related products
  try {
    const res = await serverFetch.get(`/products?categoryId=${product.category?.id || ""}&limit=4`);
    const data = await res.json();
    if (data.success) {
      relatedProducts = (data.data.data || []).filter((p: ProductType) => p.id !== product.id).slice(0, 4);
    }
  } catch { /* ignore */ }

  const averageRating = product.reviews?.length
    ? product.reviews.reduce((a: number, r: ProductType) => a + r.rating, 0) / product.reviews.length
    : 0;

  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12 md:px-8">
          <Link href="/products" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-indigo-600 mb-10 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Collection
          </Link>

          <ProductDetailClient product={product} discountedPrice={discountedPrice} averageRating={averageRating} />
        </div>

        {/* ─── REVIEWS SECTION ─────────────────────────────── */}
        {product.reviews && product.reviews.length > 0 && (
          <section className="py-20 border-t border-zinc-100">
            <div className="container mx-auto px-4 md:px-8">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Verified Impressions</p>
                  <h2 className="text-3xl font-serif font-bold">Customer Reviews</h2>
                </div>
                <button className="h-10 px-6 rounded-full border-2 border-zinc-200 text-sm font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all">
                  Write a Review
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Rating Summary */}
                <div className="bg-zinc-50 rounded-3xl p-8 flex flex-col items-center justify-center">
                  <p className="text-6xl font-black tracking-tighter text-zinc-900">{averageRating.toFixed(1)}</p>
                  <div className="flex items-center gap-1 my-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "fill-zinc-300 text-zinc-300"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-500">Based on {product.reviews.length} reviews</p>
                  {/* Rating Bars */}
                  <div className="w-full mt-6 space-y-2">
                    {[5, 4, 3].map((star) => {
                      const count = product.reviews.filter((r: ProductType) => r.rating === star).length;
                      const pct = product.reviews.length ? (count / product.reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-3 text-sm">
                          <span className="w-3 text-zinc-500">{star}</span>
                          <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-5 text-zinc-500">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review List */}
                <div className="lg:col-span-2 space-y-8">
                  {product.reviews.map((review: ProductType) => (
                    <div key={review.id} className="border-b border-zinc-100 pb-8 last:border-0">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                          {review.customer?.name?.slice(0, 2).toUpperCase() || "??"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm">{review.customer?.name || "Anonymous"}</p>
                              <p className="text-xs text-zinc-400">Verified Collector · {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : ""}</p>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-zinc-600 leading-relaxed ml-14">&ldquo;{review.comment}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── YOU MAY ALSO LIKE ───────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="py-20 bg-zinc-50">
            <div className="container mx-auto px-4 md:px-8">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-serif font-bold">You May Also Like</h2>
                <Link href="/products" className="text-sm font-semibold text-indigo-600 hover:underline">View All</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((p: ProductType) => (
                  <Link key={p.id} href={`/products/${p.id}`} className="group">
                    <div className="relative aspect-4/5 bg-zinc-100 rounded-2xl overflow-hidden mb-3">
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 bg-linear-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-xs text-zinc-400 font-medium px-3 text-center">{p.name}</div>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 font-medium mb-1">{p.category?.name}</p>
                    <h4 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">{p.name}</h4>
                    <p className="font-bold text-sm mt-1">${p.price.toFixed(2)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

