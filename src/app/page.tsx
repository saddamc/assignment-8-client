import { ArrowRight, ArrowUpRight, PlayCircle, ShieldCheck, Leaf, Truck, Star, Zap, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { serverFetch } from "@/lib/server-fetch";
import Footer from "@/components/Home/Footer";
import Navbar from "@/components/Home/Navbar";

async function getFeaturedProducts() {
  try {
    const res = await serverFetch.get("/products?limit=6&sortBy=createdAt&sortOrder=desc");
    const data = await res.json();
    if (data.success) return data.data.data || [];
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

const TESTIMONIALS = [
  {
    name: "Alexander S.",
    role: "Verified Collector",
    text: "The attention to detail is unparalleled. Cabro is truly a cut above — every product exceeded my expectations.",
    avatar: "AS",
    rating: 5,
  },
  {
    name: "Janessa Parling",
    role: "Premium Member",
    text: "Finally, a platform that pairs luxury with trust. Delivery was pristine and my purchases exceeded all expectations.",
    avatar: "JP",
    rating: 5,
  },
  {
    name: "Diana Hasor",
    role: "Elite Collector",
    text: "Cabro sets the gold standard. A platform that combines luxury shopping with an experience second to none.",
    avatar: "DH",
    rating: 5,
  },
];

const MARQUEE_ITEMS = [
  "Free Shipping Worldwide",
  "Authenticated Products",
  "30-Day Returns",
  "Exclusive Collections",
  "Member Rewards",
  "24/7 Concierge",
];

export default async function Home() {
  const [featuredProducts] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lx-root { font-family: 'DM Sans', sans-serif; background: #050505; }
        .lx-display { font-family: 'Playfair Display', Georgia, serif; }

        /* ── Marquee ── */
        @keyframes lx-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .lx-marquee { animation: lx-marquee 22s linear infinite; display: flex; white-space: nowrap; }
        .lx-marquee:hover { animation-play-state: paused; }

        /* ── Entrance animations ── */
        @keyframes lx-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lx-a1 { animation: lx-up 0.9s cubic-bezier(.16,1,.3,1) 0.05s both; }
        .lx-a2 { animation: lx-up 0.9s cubic-bezier(.16,1,.3,1) 0.2s  both; }
        .lx-a3 { animation: lx-up 0.9s cubic-bezier(.16,1,.3,1) 0.35s both; }
        .lx-a4 { animation: lx-up 0.9s cubic-bezier(.16,1,.3,1) 0.5s  both; }
        .lx-a5 { animation: lx-up 0.9s cubic-bezier(.16,1,.3,1) 0.65s both; }

        /* ── Gradient headline ── */
        @keyframes lx-grad {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        .lx-grad-text {
          background: linear-gradient(120deg, #e8e8ec 0%, #9090a0 35%, #e8e8ec 65%, #c8c8d4 100%);
          background-size: 250% auto;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: lx-grad 5s ease infinite;
        }

        /* ── Grid noise texture ── */
        .lx-grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px);
          background-size: 72px 72px;
        }

        /* ── Card hover lift ── */
        .lx-card { transition: transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s ease; }
        .lx-card:hover { transform: translateY(-5px); box-shadow: 0 24px 64px rgba(0,0,0,.5); }

        /* ── Philosophy card hover ── */
        .lx-phil { transition: transform .3s ease, box-shadow .3s ease; }
        .lx-phil:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,.08); }

        /* ── Product card image zoom ── */
        .lx-prod-img { transition: transform .7s cubic-bezier(.16,1,.3,1); }
        .lx-prod:hover .lx-prod-img { transform: scale(1.07); }
        .lx-prod-cta {
          opacity: 0; transform: translateY(6px);
          transition: opacity .3s ease, transform .3s ease;
        }
        .lx-prod:hover .lx-prod-cta { opacity: 1; transform: translateY(0); }

        /* ── Testimonial card ── */
        .lx-test {
          background: linear-gradient(135deg, rgba(255,255,255,.03), rgba(255,255,255,.06));
          border: 1px solid rgba(255,255,255,.07);
          transition: border-color .3s ease;
        }
        .lx-test:hover { border-color: rgba(255,255,255,.16); }

        /* ── Pill button ── */
        .lx-pill-outline {
          border: 1px solid rgba(255,255,255,.14);
          transition: border-color .2s, background .2s;
        }
        .lx-pill-outline:hover { border-color: rgba(255,255,255,.35); background: rgba(255,255,255,.06); }

        /* ── Label ── */
        .lx-label {
          font-size: 11px; font-weight: 600;
          letter-spacing: .14em; text-transform: uppercase; color: #86868b;
        }
      `}</style>

      <div className="lx-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        <main style={{ flex: 1 }}>

          {/* ── TICKER ──────────────────────────────────────────── */}
          <div style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,.05)', padding: '12px 0', overflow: 'hidden' }}>
            <div className="lx-marquee">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '20px',
                  padding: '0 28px', fontSize: '11px', fontWeight: 600,
                  letterSpacing: '.12em', textTransform: 'uppercase', color: '#52525b',
                }}>
                  {item}
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#3f3f46', display: 'inline-block' }} />
                </span>
              ))}
            </div>
          </div>

          {/* ── HERO ────────────────────────────────────────────── */}
          <section style={{ position: 'relative', background: '#050505', overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            {/* Grid bg */}
            <div className="lx-grid-bg" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

            {/* Glow blobs */}
            <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 900, background: 'radial-gradient(ellipse, rgba(99,102,241,.1) 0%, transparent 68%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(139,92,246,.07) 0%, transparent 68%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />

            {/* Bottom fade */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(transparent, #050505)', zIndex: 2 }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '120px 48px', width: '100%' }}>

              {/* Eyebrow */}
              <div className="lx-a1" style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '8px 20px', borderRadius: 100,
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.1)',
                  backdropFilter: 'blur(20px)',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 8px #34d399' }} />
                  <span className="lx-label" style={{ color: '#a1a1aa' }}>New Collection — Spring 2025</span>
                </div>
              </div>

              {/* Headline */}
              <div className="lx-a2" style={{ textAlign: 'center', marginBottom: 24 }}>
                <h1 className="lx-display" style={{
                  fontSize: 'clamp(56px, 11vw, 148px)',
                  fontWeight: 900, lineHeight: .9,
                  letterSpacing: '-0.03em', color: '#f5f5f7',
                }}>
                  Crafted for
                </h1>
                <h1 className="lx-display lx-grad-text" style={{
                  fontSize: 'clamp(56px, 11vw, 148px)',
                  fontWeight: 900, lineHeight: .9,
                  letterSpacing: '-0.03em', fontStyle: 'italic',
                }}>
                  the Bold.
                </h1>
              </div>

              {/* Sub */}
              <div className="lx-a3" style={{ textAlign: 'center', marginBottom: 44 }}>
                <p style={{ fontSize: 'clamp(16px, 1.8vw, 20px)', color: '#6e6e73', maxWidth: 500, margin: '0 auto', lineHeight: 1.65, fontWeight: 300 }}>
                  Products at the intersection of art and function. No compromises. No exceptions.
                </p>
              </div>

              {/* CTA row */}
              <div className="lx-a4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 72, flexWrap: 'wrap' }}>
                <Link href="/products" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  height: 52, padding: '0 32px', borderRadius: 100,
                  background: '#f5f5f7', color: '#050505',
                  fontSize: 15, fontWeight: 700, textDecoration: 'none',
                  boxShadow: '0 0 40px rgba(245,245,247,.12)',
                  transition: 'background .2s, box-shadow .2s',
                }}>
                  Shop Now <ArrowRight size={15} />
                </Link>
                <button className="lx-pill-outline" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  height: 52, padding: '0 28px', borderRadius: 100,
                  background: 'transparent', color: '#f5f5f7',
                  fontSize: 15, fontWeight: 500, cursor: 'pointer',
                }}>
                  <PlayCircle size={18} style={{ color: '#52525b' }} />
                  Watch the Story
                </button>
              </div>

              {/* Stats bar */}
              <div className="lx-a5" style={{ maxWidth: 600, margin: '0 auto' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                  background: 'rgba(255,255,255,.03)',
                  border: '1px solid rgba(255,255,255,.07)',
                  borderRadius: 20, overflow: 'hidden',
                }}>
                  {[
                    { num: '50K+', label: 'Happy Clients' },
                    { num: '4.9 ★', label: 'Avg Rating' },
                    { num: '120+', label: 'Brand Partners' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      padding: '28px 16px', textAlign: 'center',
                      borderRight: i < 2 ? '1px solid rgba(255,255,255,.06)' : 'none',
                    }}>
                      <p className="lx-display" style={{ fontSize: 34, fontWeight: 900, color: '#f5f5f7', marginBottom: 4, letterSpacing: '-0.03em' }}>{s.num}</p>
                      <p className="lx-label">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* ── CATEGORY GRID (Nike-scale editorial) ────────────── */}
          <section style={{ background: '#050505', padding: '0 0 120px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
                <div>
                  <p className="lx-label" style={{ marginBottom: 12 }}>Collections</p>
                  <h2 className="lx-display" style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.03em', lineHeight: 1 }}>Shop the Edit</h2>
                </div>
                <Link href="/collections" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#52525b', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                  All Collections <ArrowUpRight size={14} />
                </Link>
              </div>

              {/* Asymmetric 3-col grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'auto auto', gap: 16 }}>

                {/* Main hero card */}
                <div className="lx-card" style={{
                  gridColumn: '1 / 3', gridRow: '1 / 2',
                  borderRadius: 22, overflow: 'hidden', minHeight: 400,
                  background: 'linear-gradient(135deg, #0a0a18 0%, #141430 100%)',
                  border: '1px solid rgba(255,255,255,.06)',
                  position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 40,
                }}>
                  <div style={{ position: 'absolute', top: -80, right: -80, width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(99,102,241,.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.75) 0%, transparent 55%)', zIndex: 0 }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 14px',
                      background: 'rgba(99,102,241,.18)', border: '1px solid rgba(99,102,241,.4)',
                      borderRadius: 100, fontSize: '10px', fontWeight: 700, letterSpacing: '.1em',
                      color: '#a5b4fc', marginBottom: 18, textTransform: 'uppercase',
                    }}>Featured Drop</span>
                    <h3 className="lx-display" style={{ fontSize: 40, fontWeight: 800, color: '#f5f5f7', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 12 }}>Avant-Garde<br />Tech</h3>
                    <p style={{ color: '#6e6e73', fontSize: 15, marginBottom: 24, maxWidth: 340 }}>Sculptural electronics that blur the line between art and engineering.</p>
                    <Link href="/collections" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#f5f5f7', fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                      Explore <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>

                {/* Side card */}
                <div className="lx-card" style={{
                  gridColumn: '3 / 4', gridRow: '1 / 2',
                  borderRadius: 22, overflow: 'hidden', minHeight: 400,
                  background: 'linear-gradient(135deg, #0f0f0a 0%, #1a1608 100%)',
                  border: '1px solid rgba(255,255,255,.06)',
                  position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 32,
                }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 280, height: 280, background: 'radial-gradient(ellipse, rgba(251,191,36,.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.85) 0%, transparent 50%)', zIndex: 0 }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3 className="lx-display" style={{ fontSize: 26, fontWeight: 700, color: '#f5f5f7', lineHeight: 1.1, marginBottom: 8 }}>Quiet Luxury<br />Fashion</h3>
                    <p style={{ color: '#52525b', fontSize: 13, marginBottom: 20 }}>Timeless, refined, forever.</p>
                    <Link href="/collections" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#f5f5f7', fontSize: 12, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      Shop <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>

                {/* Row 2 left */}
                <div className="lx-card" style={{
                  gridColumn: '1 / 2', gridRow: '2 / 3',
                  borderRadius: 22, minHeight: 220,
                  background: 'linear-gradient(135deg, #0a1510 0%, #0d1f16 100%)',
                  border: '1px solid rgba(255,255,255,.06)',
                  position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 28,
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 220, height: 220, background: 'radial-gradient(ellipse, rgba(16,185,129,.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.85) 0%, transparent 50%)', zIndex: 0, borderRadius: 22 }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3 className="lx-display" style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f7', marginBottom: 6 }}>Accessories</h3>
                    <p style={{ color: '#52525b', fontSize: 12 }}>Complete the look →</p>
                  </div>
                </div>

                {/* Row 2 mid */}
                <div className="lx-card" style={{
                  gridColumn: '2 / 3', gridRow: '2 / 3',
                  borderRadius: 22, minHeight: 220,
                  background: 'linear-gradient(135deg, #150a0b 0%, #200f12 100%)',
                  border: '1px solid rgba(255,255,255,.06)',
                  position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 28,
                }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 220, height: 220, background: 'radial-gradient(ellipse, rgba(239,68,68,.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.85) 0%, transparent 50%)', zIndex: 0, borderRadius: 22 }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3 className="lx-display" style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f7', marginBottom: 6 }}>Footwear</h3>
                    <p style={{ color: '#52525b', fontSize: 12 }}>New drops weekly →</p>
                  </div>
                </div>

                {/* Row 2 right — CTA */}
                <div className="lx-card" style={{
                  gridColumn: '3 / 4', gridRow: '2 / 3',
                  borderRadius: 22, minHeight: 220,
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                  border: '1px solid rgba(99,102,241,.25)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 28,
                }}>
                  <Zap size={26} style={{ color: '#a5b4fc', marginBottom: 16 }} />
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f5f5f7', marginBottom: 8 }}>Member Drops</h3>
                  <p style={{ color: '#a5b4fc', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>Early access. Exclusive pricing. Members only.</p>
                  <Link href="/new-arrivals" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#f5f5f7', fontSize: 12, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                    Join Now <ArrowRight size={12} />
                  </Link>
                </div>

              </div>
            </div>
          </section>

          {/* ── PHILOSOPHY (Apple light section) ────────────────── */}
          <section style={{ background: '#f5f5f7', padding: '120px 0' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px' }}>
              <div style={{ textAlign: 'center', marginBottom: 80 }}>
                <p className="lx-label" style={{ marginBottom: 16 }}>Why Cabro</p>
                <h2 className="lx-display" style={{ fontSize: 'clamp(30px, 4.5vw, 58px)', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 20 }}>
                  Obsessively curated.<br />Relentlessly authentic.
                </h2>
                <p style={{ color: '#6e6e73', fontSize: 18, maxWidth: 500, margin: '0 auto', lineHeight: 1.65, fontWeight: 300 }}>
                  Every product passes a 3-tier authentication. We partner only with heritage workshops that share our commitment to quality.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                {[
                  { icon: <ShieldCheck size={22} />, title: 'Artisanal Sourcing', desc: 'Direct from heritage workshops across Europe and Asia. Zero middlemen. Full traceability.', accent: '#6366f1' },
                  { icon: <Leaf size={22} />, title: 'Conscious Luxury', desc: 'Recycled metals. Organic textiles. Every material selected with the planet in mind.', accent: '#10b981' },
                  { icon: <Truck size={22} />, title: 'White-Glove Delivery', desc: 'Climate-controlled. Discreet packaging. Delivered in pristine condition, every time.', accent: '#f59e0b' },
                ].map((item, i) => (
                  <div key={i} className="lx-phil" style={{ background: '#fff', borderRadius: 20, padding: '40px 32px', border: '1px solid rgba(0,0,0,.06)' }}>
                    <div style={{ width: 50, height: 50, borderRadius: 14, background: `${item.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.accent, marginBottom: 24 }}>
                      {item.icon}
                    </div>
                    <h3 style={{ fontSize: 19, fontWeight: 700, color: '#1d1d1f', marginBottom: 12 }}>{item.title}</h3>
                    <p style={{ color: '#6e6e73', fontSize: 15, lineHeight: 1.65 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── WEEKLY PRODUCTS ──────────────────────────────────── */}
          <section style={{ background: '#050505', padding: '120px 0' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56 }}>
                <div>
                  <p className="lx-label" style={{ marginBottom: 12 }}>Curated Weekly</p>
                  <h2 className="lx-display" style={{ fontSize: 'clamp(26px, 3.5vw, 46px)', fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.03em', lineHeight: 1 }}>The Weekly Selection</h2>
                </div>
                <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#52525b', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                  View All <ArrowUpRight size={14} />
                </Link>
              </div>

              {featuredProducts.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {featuredProducts.map((product: any, idx: number) => {
                    const avg = product.reviews?.length
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ? product.reviews.reduce((a: number, r: any) => a + r.rating, 0) / product.reviews.length
                      : null;
                    const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : null;
                    return (
                      <Link key={product.id} href={`/products/${product.id}`} className="lx-prod" style={{ textDecoration: 'none' }}>
                        {/* Image box */}
                        <div style={{ borderRadius: 18, overflow: 'hidden', aspectRatio: '4/5', position: 'relative', background: '#0f0f0f', marginBottom: 18, border: '1px solid rgba(255,255,255,.05)' }}>
                          {idx === 0 && (
                            <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 10, background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', padding: '4px 12px', borderRadius: 100, textTransform: 'uppercase' }}>Hot</div>
                          )}
                          {product.discount && (
                            <div style={{ position: 'absolute', top: idx === 0 ? 44 : 14, left: 14, zIndex: 10, background: '#6366f1', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: 100 }}>−{product.discount}%</div>
                          )}
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill className="lx-prod-img" style={{ objectFit: 'cover' }} />
                          ) : (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#181818,#0d0d0d)', color: '#333', fontSize: 13, padding: 20, textAlign: 'center' }}>{product.name}</div>
                          )}
                          <div className="lx-prod-cta" style={{ position: 'absolute', inset: '0 12px 12px', top: 'auto', height: 44, background: 'rgba(245,245,247,.96)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#050505' }}>
                            Quick View
                          </div>
                        </div>
                        {/* Info */}
                        <p className="lx-label" style={{ marginBottom: 6 }}>{product.category?.name}</p>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f5f5f7', lineHeight: 1.35, marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {discountedPrice ? (
                              <>
                                <span style={{ fontWeight: 700, color: '#f5f5f7', fontSize: 16 }}>${discountedPrice.toFixed(2)}</span>
                                <span style={{ fontSize: 13, color: '#3f3f46', textDecoration: 'line-through' }}>${product.price.toFixed(2)}</span>
                              </>
                            ) : (
                              <span style={{ fontWeight: 700, color: '#f5f5f7', fontSize: 16 }}>${product.price.toFixed(2)}</span>
                            )}
                          </div>
                          {avg && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Star size={11} style={{ fill: '#fbbf24', color: '#fbbf24' }} />
                              <span style={{ fontSize: 12, color: '#52525b', fontWeight: 500 }}>{avg.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i}>
                      <div style={{ aspectRatio: '4/5', background: '#111', borderRadius: 18, marginBottom: 16 }} />
                      <div style={{ height: 13, background: '#111', borderRadius: 8, width: '68%', marginBottom: 8 }} />
                      <div style={{ height: 11, background: '#111', borderRadius: 8, width: '44%' }} />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: 64 }}>
                <Link href="/products" className="lx-pill-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 52, padding: '0 36px', borderRadius: 100, color: '#f5f5f7', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                  Browse All Products <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </section>

          {/* ── TESTIMONIALS ─────────────────────────────────────── */}
          <section style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,.05)', padding: '120px 0' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}>
              <div style={{ textAlign: 'center', marginBottom: 64 }}>
                <p className="lx-label" style={{ marginBottom: 14 }}>Client Stories</p>
                <h2 className="lx-display" style={{ fontSize: 'clamp(26px, 3.5vw, 46px)', fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.03em' }}>The Luxe Experience</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} className="lx-test" style={{ borderRadius: 20, padding: 36 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>
                      {[...Array(t.rating)].map((_, s) => <Star key={s} size={13} style={{ fill: '#6366f1', color: '#6366f1' }} />)}
                    </div>
                    <p style={{ color: '#a1a1aa', fontSize: 15, lineHeight: 1.7, fontStyle: 'italic', marginBottom: 28 }}>"{t.text}"</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.06)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{t.avatar}</div>
                      <div>
                        <p style={{ fontWeight: 600, color: '#f5f5f7', fontSize: 14, marginBottom: 2 }}>{t.name}</p>
                        <p style={{ fontSize: 12, color: '#3f3f46' }}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FLASH SALE (Nike bold energy) ───────────────────── */}
          <section style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)', padding: '100px 0', borderTop: '1px solid rgba(99,102,241,.2)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', padding: '6px 18px', borderRadius: 100, marginBottom: 20, border: '1px solid rgba(255,255,255,.12)' }}>
                <Zap size={12} style={{ color: '#c7d2fe' }} />
                <span className="lx-label" style={{ color: '#c7d2fe' }}>Limited Time</span>
              </div>
              <h3 className="lx-display" style={{ fontSize: 'clamp(40px, 7vw, 96px)', fontWeight: 900, color: '#f5f5f7', letterSpacing: '-0.04em', lineHeight: .92, marginBottom: 18 }}>
                Up to 40% off.
              </h3>
              <p style={{ color: '#a5b4fc', fontSize: 17, marginBottom: 40 }}>Selected items across all categories. No code needed.</p>
              <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, height: 56, padding: '0 44px', background: '#f5f5f7', color: '#1e1b4b', borderRadius: 100, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 0 50px rgba(165,180,252,.2)' }}>
                Shop the Sale <ArrowRight size={16} />
              </Link>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
}