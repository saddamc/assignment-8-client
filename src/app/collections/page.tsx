import { serverFetch } from "@/lib/server-fetch";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Home/Navbar";
import Footer from "@/components/Home/Footer";
import { ArrowRight } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Category = any;

const GRADIENT_PALETTES = [
  "from-indigo-900 to-indigo-600",
  "from-zinc-900 to-zinc-700",
  "from-rose-900 to-rose-600",
  "from-emerald-900 to-emerald-600",
  "from-amber-900 to-amber-700",
  "from-violet-900 to-violet-600",
];

export default async function CollectionsPage() {
  let categories: Category[] = [];

  try {
    const res = await serverFetch.get("/products/categories");
    const data = await res.json();
    if (data.success) categories = data.data || [];
  } catch { /* empty */ }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-zinc-950 text-white pt-24 pb-16 px-4">
          <div className="container mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400 mb-4">Curated Selection</p>
            <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tight mb-4">
              The Collections
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Discover our carefully curated product families, each one a world unto itself.
            </p>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-8">
            {categories.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {["Avant-Garde Tech", "Quiet Luxury Fashion", "Artisan Home", "Essential Wellness", "Rare Collectibles", "Seasonal Exclusives"].map((name, i) => (
                  <Link key={name} href={`/products`} className="group relative overflow-hidden rounded-3xl aspect-4/3 block">
                    <div className={`absolute inset-0 bg-linear-to-br ${GRADIENT_PALETTES[i % GRADIENT_PALETTES.length]}`} />
                    <div className="absolute inset-0 flex flex-col justify-end p-8">
                      <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Collection</p>
                      <h3 className="text-white text-2xl font-serif font-bold mb-2 group-hover:text-indigo-300 transition-colors">{name}</h3>
                      <div className="flex items-center gap-2 text-white/70 text-sm font-medium group-hover:gap-3 transition-all">
                        <span>Explore</span><ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat: Category, i: number) => (
                  <Link key={cat.id} href={`/products?categoryId=${cat.id}`} className="group relative overflow-hidden rounded-3xl aspect-4/3 block">
                    {cat.image ? (
                      <Image src={cat.image} alt={cat.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className={`absolute inset-0 bg-linear-to-br ${GRADIENT_PALETTES[i % GRADIENT_PALETTES.length]}`} />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-8">
                      <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Collection</p>
                      <h3 className="text-white text-2xl font-serif font-bold mb-2 group-hover:text-indigo-300 transition-colors">{cat.name}</h3>
                      {cat._count?.products !== undefined && (
                        <p className="text-white/50 text-sm mb-2">{cat._count.products} pieces</p>
                      )}
                      <div className="flex items-center gap-2 text-white/70 text-sm font-medium group-hover:gap-3 transition-all">
                        <span>Explore Collection</span><ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
