import { Star, ChevronRight, Zap, Shield, Truck, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { serverFetch } from "@/lib/server-fetch";
import Footer from "@/components/Home/Footer";
import Navbar from "@/components/Home/Navbar";

async function getFeaturedProducts() {
  try {
    const res = await serverFetch.get("/products?limit=8&sortBy=createdAt&sortOrder=desc");
    const data = await res.json();
    if (data.success) return data.data || [];
  } catch {}
  return [];
}

async function getCategories() {
  try {
    const res = await serverFetch.get("/products/categories");
    const data = await res.json();
    if (data.success) return data.data || [];
  } catch {}
  return [];
}

const HERO_BANNERS = [
  {
    title: "Big Spring Sale",
    subtitle: "Save big on top electronics, fashion & more",
    cta: "Shop the Sale",
    href: "/products?sale=true",
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    accent: "#e94560",
    badge: "Up to 60% off",
  },
  {
    title: "New Arrivals",
    subtitle: "Fresh drops across all categories every week",
    cta: "See What's New",
    href: "/new-arrivals",
    bg: "linear-gradient(135deg, #0a3d0a 0%, #1a5e1a 50%, #0d4a1f 100%)",
    accent: "#FF9900",
    badge: "Just Landed",
  },
  {
    title: "Top Rated Sellers",
    subtitle: "Shop from our highest-rated marketplace sellers",
    cta: "Browse Sellers",
    href: "/products?sort=popular",
    bg: "linear-gradient(135deg, #2c1810 0%, #4a2c1a 50%, #3d2010 100%)",
    accent: "#FF9900",
    badge: "Best Sellers",
  },
];

const CATEGORY_CARDS = [
  { name: "Electronics", icon: "🔌", href: "/products?cat=electronics", color: "#fff9f0" },
  { name: "Fashion", icon: "👗", href: "/products?cat=fashion", color: "#f0f7ff" },
  { name: "Home & Living", icon: "🏠", href: "/products?cat=home", color: "#f0fff4" },
  { name: "Sports", icon: "⚽", href: "/products?cat=sports", color: "#fff0f0" },
  { name: "Beauty", icon: "💄", href: "/products?cat=beauty", color: "#fdf0ff" },
  { name: "Books", icon: "📚", href: "/products?cat=books", color: "#fffbf0" },
  { name: "Toys", icon: "🧸", href: "/products?cat=toys", color: "#f0faff" },
  { name: "Automotive", icon: "🚗", href: "/products?cat=auto", color: "#f5f5f5" },
];

const TRUST_ITEMS = [
  { icon: <Truck size={20} color="#FF9900" />, title: "FREE Delivery", desc: "On orders over $25" },
  { icon: <RotateCcw size={20} color="#FF9900" />, title: "Easy Returns", desc: "30-day return window" },
  { icon: <Shield size={20} color="#FF9900" />, title: "Secure Payments", desc: "100% buyer protection" },
  { icon: <Zap size={20} color="#FF9900" />, title: "Same Day Dispatch", desc: "Order before 2 PM" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProductCard({ product, index }: { product: any; index: number }) {
  const avg = product.reviews?.length
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? product.reviews.reduce((a: number, r: any) => a + r.rating, 0) / product.reviews.length
    : null;
  const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : null;

  return (
    <Link href={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="hz-prod-card" style={{
        background: "#fff", borderRadius: 8, overflow: "hidden",
        border: "1px solid #ddd", transition: "box-shadow 0.2s",
        height: "100%",
      }}>
        {/* Image */}
        <div style={{ aspectRatio: "1/1", background: "#f5f5f5", position: "relative", overflow: "hidden" }}>
          {index < 2 && (
            <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1, background: "#CC0C39", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 3 }}>
              {index === 0 ? "Best Seller" : "New"}
            </div>
          )}
          {product.discount && (
            <div style={{ position: "absolute", top: index < 2 ? 34 : 10, left: 10, zIndex: 1, background: "#FF9900", color: "#111", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 3 }}>
              -{product.discount}%
            </div>
          )}
          {product.images?.[0] ? (
            <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: "contain", padding: "8px" }} />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb", fontSize: 13, textAlign: "center", padding: 12 }}>
              {product.name}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "12px" }}>
          <p style={{ fontSize: 13, color: "#111", lineHeight: 1.4, marginBottom: 6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
            {product.name}
          </p>

          {/* Stars */}
          {avg && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={12} style={{ fill: s <= Math.round(avg) ? "#FF9900" : "#ddd", color: s <= Math.round(avg) ? "#FF9900" : "#ddd" }} />
              ))}
              <span style={{ fontSize: 11, color: "#007185" }}>({product.reviews?.length || 0})</span>
            </div>
          )}

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
            {discountedPrice ? (
              <>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#CC0C39" }}>
                  <sup style={{ fontSize: 11 }}>$</sup>{discountedPrice.toFixed(2)}
                </span>
                <span style={{ fontSize: 12, color: "#666", textDecoration: "line-through" }}>${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
                <sup style={{ fontSize: 11 }}>$</sup>{product.price.toFixed(2)}
              </span>
            )}
          </div>

          <p style={{ fontSize: 12, color: "#007600", fontWeight: 500, marginTop: 4 }}>
            {product.stock > 0 ? `In Stock` : "Out of Stock"}
          </p>

          <p style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
            FREE delivery <span style={{ fontWeight: 700 }}>Tomorrow</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

export default async function Home() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const displayCats = categories.length > 0 ? categories.slice(0, 8).map((c: any) => ({ name: c.name, icon: "📦", href: `/products?cat=${c.id}`, color: "#fff9f0" })) : CATEGORY_CARDS;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #eaeded; }
        .hz-root { font-family: Arial, sans-serif; background: #eaeded; }
        .hz-section-card { background: #fff; border-radius: 8px; overflow: hidden; }
        .hz-add-cart-btn {
          width: 100%; padding: 9px 0;
          background: #FF9900;
          border: 1px solid #FF8C00;
          border-radius: 24px;
          font-size: 13px; font-weight: 600;
          color: #111; cursor: pointer; margin-top: 8px;
          transition: background 0.12s;
        }
        .hz-add-cart-btn:hover { background: #e68a00; }
        .hz-section-title {
          font-size: 21px; font-weight: 700; color: #111;
          margin: 0 0 16px; padding: 0;
        }
        .hz-see-more {
          font-size: 13px; color: #007185;
          text-decoration: none; font-weight: 400;
          display: inline-block; margin-top: 8px;
        }
        .hz-see-more:hover { color: #c7511f; text-decoration: underline; }
        .hz-cat-card {
          background: #fff; border-radius: 8px; padding: 16px;
          text-align: center; text-decoration: none; color: #111;
          border: 1px solid #ddd; transition: box-shadow 0.15s;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .hz-cat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
        .hz-prod-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .hz-hero-cta:hover { background: #e68a00 !important; }
        .hz-deal-tile:hover { opacity: 0.85; }
      `}</style>

      <div className="hz-root">
        <Navbar />

        <main style={{ maxWidth: 1400, margin: "0 auto", padding: "16px" }}>

          {/* ── HERO BANNER ──────────────────────────────────── */}
          <div style={{ borderRadius: 8, overflow: "hidden", marginBottom: 16, position: "relative" }}
            className="hz-section-card"
          >
            <div style={{ background: HERO_BANNERS[0].bg, padding: "48px 60px", minHeight: 340, display: "flex", alignItems: "center" }}>
              <div>
                <span style={{ display: "inline-block", background: HERO_BANNERS[0].accent, color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 3, marginBottom: 16, letterSpacing: ".04em" }}>
                  {HERO_BANNERS[0].badge}
                </span>
                <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: "#fff", marginBottom: 12, lineHeight: 1.1 }}>
                  {HERO_BANNERS[0].title}
                </h1>
                <p style={{ fontSize: 18, color: "#ccc", marginBottom: 28, maxWidth: 480 }}>
                  {HERO_BANNERS[0].subtitle}
                </p>
                <Link href={HERO_BANNERS[0].href} className="hz-hero-cta" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "#FF9900", color: "#111",
                  padding: "12px 32px", borderRadius: 24,
                  fontSize: 15, fontWeight: 700, textDecoration: "none",
                  transition: "background 0.12s",
                }}>
                  {HERO_BANNERS[0].cta} <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* ── TRUST BAR ────────────────────────────────────── */}
          <div className="hz-section-card" style={{ padding: "20px 32px", marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {TRUST_ITEMS.map((item) => (
                <div key={item.title} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {item.icon}
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: 0 }}>{item.title}</p>
                    <p style={{ fontSize: 12, color: "#666", margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3-COLUMN PROMO STRIP ─────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
            {HERO_BANNERS.slice(1).concat(HERO_BANNERS[0]).map((b, i) => (
              <Link key={i} href={b.href} style={{ borderRadius: 8, overflow: "hidden", textDecoration: "none", display: "block" }}>
                <div style={{ background: b.bg, padding: "28px 24px", minHeight: 160, position: "relative" }}>
                  <span style={{ display: "inline-block", background: b.accent, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 3, marginBottom: 10, letterSpacing: ".06em" }}>
                    {b.badge}
                  </span>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 6, lineHeight: 1.2 }}>{b.title}</h3>
                  <p style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>{b.subtitle}</p>
                  <span style={{ fontSize: 13, color: b.accent, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {b.cta} <ChevronRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* ── CATEGORIES GRID ──────────────────────────────── */}
          <div className="hz-section-card" style={{ padding: "24px", marginBottom: 16 }}>
            <h2 className="hz-section-title">Shop by Category</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 12 }}>
              {displayCats.map((cat: { name: string; icon: string; href: string; color: string }) => (
                <Link key={cat.name} href={cat.href} className="hz-cat-card">
                  <div style={{ fontSize: 28, lineHeight: 1 }}>{cat.icon}</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#111", textAlign: "center", lineHeight: 1.3 }}>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ── FEATURED PRODUCTS ────────────────────────────── */}
          <div className="hz-section-card" style={{ padding: "24px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 className="hz-section-title" style={{ margin: 0 }}>Featured Products</h2>
              <Link href="/products" className="hz-see-more">See all results →</Link>
            </div>

            {featuredProducts.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {featuredProducts.slice(0, 8).map((product: any, idx: number) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 8, border: "1px solid #eee", overflow: "hidden" }}>
                    <div style={{ aspectRatio: "1/1", background: "#f5f5f5" }} />
                    <div style={{ padding: "12px" }}>
                      <div style={{ height: 12, background: "#eee", borderRadius: 4, marginBottom: 8, width: "80%" }} />
                      <div style={{ height: 10, background: "#eee", borderRadius: 4, width: "55%" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── DEAL OF THE DAY ──────────────────────────────── */}
          <div className="hz-section-card" style={{ padding: "24px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <h2 className="hz-section-title" style={{ margin: 0 }}>Deal of the Day</h2>
              <span style={{ background: "#CC0C39", color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 3 }}>
                LIMITED TIME OFFERS
              </span>
              <Link href="/products?sale=true" className="hz-see-more" style={{ marginLeft: "auto" }}>See all deals →</Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Big deal card */}
              <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: 8, padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 240 }}>
                <div>
                  <span style={{ background: "#CC0C39", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 3, display: "inline-block", marginBottom: 14 }}>DEAL OF THE DAY</span>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Electronics Flash Sale</h3>
                  <p style={{ fontSize: 14, color: "#aaa", marginBottom: 20 }}>Premium electronics at unbeatable prices. Don&rsquo;t miss out!</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: "#FF9900" }}>Up to 60%</span>
                    <span style={{ fontSize: 14, color: "#aaa" }}>off selected items</span>
                  </div>
                </div>
                <Link href="/products?sale=true&cat=electronics" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FF9900", color: "#111", padding: "11px 24px", borderRadius: 24, fontSize: 14, fontWeight: 700, textDecoration: "none", width: "fit-content" }}>
                  Shop Electronics <ChevronRight size={14} />
                </Link>
              </div>

              {/* Sub deals grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { cat: "Fashion", pct: "40%", color: "#0f3460", icon: "👗" },
                  { cat: "Home Decor", pct: "35%", color: "#1a4a1a", icon: "🏠" },
                  { cat: "Sports", pct: "50%", color: "#4a1a0a", icon: "⚽" },
                  { cat: "Beauty", pct: "30%", color: "#3a0a3a", icon: "💄" },
                ].map((deal) => (
                  <Link key={deal.cat} href={`/products?sale=true&cat=${deal.cat.toLowerCase()}`}
                    className="hz-deal-tile"
                    style={{ background: deal.color, borderRadius: 8, padding: "20px", textDecoration: "none", display: "flex", flexDirection: "column", gap: 6, transition: "opacity 0.15s" }}
                  >
                    <span style={{ fontSize: 24 }}>{deal.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{deal.cat}</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#FF9900" }}>-{deal.pct}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── NEW ARRIVALS STRIP ───────────────────────────── */}
          <div className="hz-section-card" style={{ padding: "24px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 className="hz-section-title" style={{ margin: 0 }}>New Arrivals</h2>
              <Link href="/new-arrivals" className="hz-see-more">See all →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {featuredProducts.slice(0, 4).length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                featuredProducts.slice(0, 4).map((product: any, idx: number) => (
                  <ProductCard key={product.id + "-new"} product={product} index={idx + 10} />
                ))
              ) : (
                [...Array(4)].map((_, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 8, border: "1px solid #eee", overflow: "hidden" }}>
                    <div style={{ aspectRatio: "1/1", background: "#f5f5f5" }} />
                    <div style={{ padding: "12px" }}>
                      <div style={{ height: 12, background: "#eee", borderRadius: 4, marginBottom: 8, width: "80%" }} />
                      <div style={{ height: 10, background: "#eee", borderRadius: 4, width: "55%" }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── BECOME A SELLER CTA ──────────────────────────── */}
          <div className="hz-section-card" style={{ marginBottom: 16, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #131921 0%, #232f3e 100%)", padding: "40px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Start Selling on Cabro</h2>
                <p style={{ fontSize: 15, color: "#aaa", maxWidth: 500 }}>
                  Join thousands of sellers. Reach millions of customers. Set up your store in minutes.
                </p>
              </div>
              <Link href="/register?role=SELLER" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FF9900", color: "#111", padding: "14px 36px", borderRadius: 24, fontSize: 15, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>
                Start Selling <ChevronRight size={16} />
              </Link>
            </div>
          </div>

        </main>

        <Footer />
      </div>
    </>
  );
}
