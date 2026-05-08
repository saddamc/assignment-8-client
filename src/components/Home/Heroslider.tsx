"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";

const SLIDES = [
  {
    id: 0,
    badge: "Up to 60% Off",
    badgeColor: "#e94560",
    title: "Big Spring Sale",
    subtitle: "Save big on top electronics, fashion & more. Limited time offers across all categories.",
    cta: "Shop the Sale",
    href: "/products?sale=true",
    bg: "linear-gradient(135deg, #0a0a1a 0%, #12122a 40%, #1a1040 70%, #0f1a3a 100%)",
    accentColor: "#e94560",
    patternColor: "rgba(233,69,96,0.07)",
    stat: "60%",
    statLabel: "Max Savings",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&q=80&auto=format&fit=crop",
    imageAlt: "Sale shopping bags",
  },
  {
    id: 1,
    badge: "Just Landed",
    badgeColor: "#00c896",
    title: "New Arrivals",
    subtitle: "Fresh drops across all categories every week. Be the first to own the latest.",
    cta: "See What's New",
    href: "/products?sort=newest",
    bg: "linear-gradient(135deg, #00100a 0%, #001a10 40%, #002a18 70%, #001810 100%)",
    accentColor: "#00c896",
    patternColor: "rgba(0,200,150,0.07)",
    stat: "200+",
    statLabel: "New This Week",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80&auto=format&fit=crop",
    imageAlt: "New arrivals watch",
  },
  {
    id: 2,
    badge: "Top Rated",
    badgeColor: "#FF9900",
    title: "Top Rated Sellers",
    subtitle: "Shop from our highest-rated marketplace sellers. Quality guaranteed.",
    cta: "Browse Sellers",
    href: "/products?sort=popular",
    bg: "linear-gradient(135deg, #1a0a00 0%, #2a1400 40%, #3a1e00 70%, #2c1600 100%)",
    accentColor: "#FF9900",
    patternColor: "rgba(255,153,0,0.07)",
    stat: "4.9★",
    statLabel: "Avg Rating",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80&auto=format&fit=crop",
    imageAlt: "Top seller products",
  },
  {
    id: 3,
    badge: "Flash Deals",
    badgeColor: "#a855f7",
    title: "Deal of the Day",
    subtitle: "Lightning deals updated every 24 hours. Exclusive prices you won't find anywhere else.",
    cta: "Grab the Deal",
    href: "/products?sale=true&type=flash",
    bg: "linear-gradient(135deg, #0d001a 0%, #160a2a 40%, #200f3a 70%, #1a0a2e 100%)",
    accentColor: "#a855f7",
    patternColor: "rgba(168,85,247,0.07)",
    stat: "24h",
    statLabel: "Limited Time",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80&auto=format&fit=crop",
    imageAlt: "Flash deals",
  },
];

export default function HeroSlider() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setActive(idx);
    setTimeout(() => setAnimating(false), 600);
  }, [animating]);

  const next = useCallback(() => go((active + 1) % SLIDES.length), [active, go]);
  const prev = useCallback(() => go((active - 1 + SLIDES.length) % SLIDES.length), [active, go]);

  useEffect(() => {
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next]);

  const slide = SLIDES[active];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .hero-wrap { position: relative; border-radius: 12px; overflow: hidden; height: 380px; }
        .hero-bg {
          position: absolute; inset: 0;
          transition: background 0.7s ease;
        }
        .hero-pattern {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle at 20% 80%, var(--pat) 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, var(--pat) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .hero-content {
          position: relative; z-index: 2;
          display: flex; align-items: center; justify-content: space-between;
          height: 100%; padding: 0 56px;
          gap: 32px;
        }
        .hero-text { flex: 1; max-width: 560px; }
        .hero-badge {
          display: inline-block; font-size: 11px; font-weight: 700;
          letter-spacing: .12em; text-transform: uppercase;
          padding: 5px 14px; border-radius: 100px;
          margin-bottom: 18px;
          font-family: 'DM Sans', sans-serif;
        }
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(34px, 4.5vw, 58px);
          font-weight: 800; color: #fff;
          line-height: 1.05; margin: 0 0 14px;
          letter-spacing: -.02em;
        }
        .hero-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; color: rgba(255,255,255,.6);
          line-height: 1.6; margin: 0 0 28px;
          max-width: 440px;
        }
        .hero-cta {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 700;
          color: #111; padding: 13px 28px;
          border-radius: 100px; text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hero-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.4); }
        .hero-stat-box {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 4px;
          background: rgba(255,255,255,.06); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 12px; padding: 20px 28px;
          margin-top: 24px; width: fit-content;
        }
        .hero-stat-num {
          font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; color: #fff;
        }
        .hero-stat-lbl { font-family: 'DM Sans', sans-serif; font-size: 11px; color: rgba(255,255,255,.5); text-transform: uppercase; letter-spacing: .08em; }
        .hero-img-wrap {
          flex-shrink: 0; width: 320px; height: 280px;
          position: relative; border-radius: 16px; overflow: hidden;
          box-shadow: 0 24px 60px rgba(0,0,0,.5);
        }
        .hero-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .hero-img-glow {
          position: absolute; inset: -20px;
          border-radius: 50%; filter: blur(60px); opacity: .35; z-index: -1;
        }
        .hero-nav-btn {
          position: absolute; top: 50%; z-index: 10;
          transform: translateY(-50%);
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,.1); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,.15);
          color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .hero-nav-btn:hover { background: rgba(255,255,255,.2); }
        .hero-nav-btn.prev { left: 16px; }
        .hero-nav-btn.next { right: 16px; }
        .hero-dots {
          position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
          display: flex; gap: 8px; z-index: 10;
        }
        .hero-dot {
          height: 4px; border-radius: 100px;
          cursor: pointer; transition: all 0.35s;
          border: none;
        }
        .hero-slide-in { animation: slideIn 0.6s cubic-bezier(.22,1,.36,1) both; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 768px) {
          .hero-img-wrap { display: none; }
          .hero-content { padding: 0 24px; }
          .hero-wrap { height: 300px; }
        }
      `}</style>

      <div className="hero-wrap">
        {/* Background */}
        <div className="hero-bg" style={{ background: slide.bg }} />
        <div className="hero-pattern" style={{ "--pat": slide.patternColor } as React.CSSProperties} />

        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,.3) 0%, transparent 60%)", zIndex: 1 }} />

        {/* Content */}
        <div className="hero-content hero-slide-in" key={active}>
          <div className="hero-text">
            <span className="hero-badge" style={{ background: `${slide.accentColor}22`, color: slide.accentColor, border: `1px solid ${slide.accentColor}44` }}>
              {slide.badge}
            </span>
            <h1 className="hero-title">{slide.title}</h1>
            <p className="hero-sub">{slide.subtitle}</p>
            <Link href={slide.href} className="hero-cta" style={{ background: slide.accentColor }}>
              {slide.cta} <ChevronRight size={15} />
            </Link>
            <div className="hero-stat-box">
              <span className="hero-stat-num" style={{ color: slide.accentColor }}>{slide.stat}</span>
              <span className="hero-stat-lbl">{slide.statLabel}</span>
            </div>
          </div>

          {/* Image */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div className="hero-img-glow" style={{ background: slide.accentColor }} />
            <div className="hero-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.image} alt={slide.imageAlt} />
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${slide.accentColor}22 0%, transparent 60%)` }} />
            </div>
          </div>
        </div>

        {/* Nav arrows */}
        <button className="hero-nav-btn prev" onClick={prev} aria-label="Previous slide">
          <ChevronLeft size={18} />
        </button>
        <button className="hero-nav-btn next" onClick={next} aria-label="Next slide">
          <ChevronRight size={18} />
        </button>

        {/* Dots */}
        <div className="hero-dots">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              className="hero-dot"
              onClick={() => go(i)}
              style={{
                width: active === i ? 28 : 8,
                background: active === i ? slide.accentColor : "rgba(255,255,255,.35)",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}