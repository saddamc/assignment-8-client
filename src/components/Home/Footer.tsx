import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

/* ─── Data ───────────────────────────────────────────────────── */
const FOOTER_LINKS = [
  {
    heading: "Shop",
    links: [
      { label: "All Products",  href: "/products" },
      { label: "New Arrivals",  href: "/new-arrivals" },
      { label: "Collections",   href: "/collections" },
      { label: "Sale",          href: "/products?sale=true" },
      { label: "Editorial",     href: "/editorial" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Track Order",         href: "/dashboard" },
      { label: "Shipping Policy",     href: "/shipping-policy" },
      { label: "Returns & Exchanges", href: "/returns" },
      { label: "Contact Us",          href: "/contact" },
      { label: "FAQ",                 href: "/faq" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us",       href: "/about" },
      { label: "Careers",        href: "/careers" },
      { label: "Press",          href: "/press" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Investors",      href: "/investors" },
    ],
  },
];

const SOCIAL = [
  {
    label: "Instagram",
    href: "#",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "#",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={17} height={17}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
      </svg>
    ),
  },
];

const TRUST_BADGES = [
  { label: "Free Returns",      icon: "↩" },
  { label: "Secure Checkout",   icon: "🔒" },
  { label: "Authentic Products", icon: "✦" },
  { label: "24/7 Support",      icon: "◎" },
];

/* ─── Component ──────────────────────────────────────────────── */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        .ft-root {
          font-family: 'DM Sans', sans-serif;
          background: #050505;
          color: #52525b;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* Newsletter input */
        .ft-input {
          height: 48px; flex: 1; min-width: 0;
          padding: 0 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          font-size: 14px; color: #f5f5f7;
          outline: none; font-family: inherit;
          transition: border-color 0.2s ease;
        }
        .ft-input::placeholder { color: #3f3f46; }
        .ft-input:focus { border-color: rgba(99,102,241,0.5); }

        .ft-sub-btn {
          height: 48px; padding: 0 24px;
          background: #f5f5f7; color: #050505;
          border: none; border-radius: 100px;
          font-size: 14px; font-weight: 700;
          cursor: pointer; white-space: nowrap;
          display: flex; align-items: center; gap: 8px;
          font-family: inherit;
          transition: background 0.2s ease;
          flex-shrink: 0;
        }
        .ft-sub-btn:hover { background: #fff; }

        /* Nav links */
        .ft-link {
          font-size: 13px; color: #52525b;
          text-decoration: none;
          transition: color 0.2s ease;
          display: block; padding: 3px 0;
        }
        .ft-link:hover { color: #a1a1aa; }

        /* Social btn */
        .ft-social {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          color: #52525b; text-decoration: none;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .ft-social:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
          color: #f5f5f7;
        }

        /* Bottom links */
        .ft-bottom-link {
          font-size: 12px; color: #3f3f46;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .ft-bottom-link:hover { color: #71717a; }

        /* Trust badge */
        .ft-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 16px; border-radius: 100px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          font-size: 12px; font-weight: 500; color: #52525b;
          white-space: nowrap;
        }
      `}</style>

      <footer className="ft-root">

        {/* ── Trust bar ──────────────────────────────────────── */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "20px 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            {TRUST_BADGES.map((b) => (
              <span key={b.label} className="ft-badge">
                <span style={{ fontSize: 14 }}>{b.icon}</span>
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Newsletter ─────────────────────────────────────── */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "64px 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8, marginBottom: 32 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#3f3f46", marginBottom: 4 }}>
                Stay in the loop
              </p>
              <h3 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, color: "#f5f5f7", letterSpacing: "-0.03em", lineHeight: 1.1, fontFamily: "'Playfair Display', Georgia, serif" }}>
                Elevate Your Inbox.
              </h3>
              <p style={{ fontSize: 15, color: "#52525b", maxWidth: 420, lineHeight: 1.6, fontWeight: 300, marginTop: 4 }}>
                Private collection previews, exclusive editorials, and white-glove concierge updates — directly to you.
              </p>
            </div>
            <form style={{ display: "flex", gap: 10, maxWidth: 500, margin: "0 auto" }}>
              <input type="email" placeholder="your@email.com" className="ft-input" />
              <button type="submit" className="ft-sub-btn">
                Subscribe <ArrowRight size={14} />
              </button>
            </form>
            <p style={{ fontSize: 11, color: "#3f3f46", textAlign: "center", marginTop: 14 }}>
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* ── Main grid ──────────────────────────────────────── */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 48px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr", gap: 48 }}>

            {/* Brand column */}
            <div>
              {/* Logo text fallback if no image */}
              <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", marginBottom: 20 }}>
                <Image src="/logo.png" alt="Logo" width={28} height={28} style={{ objectFit: "contain", height: 28, width: "auto" }} />
                <Image src="/name.png" alt="Brand" width={100} height={28} style={{ objectFit: "contain", height: 26, width: "auto" }} />
              </Link>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "#3f3f46", maxWidth: 260, marginBottom: 28 }}>
                Curating the finest selection of modern luxury, premium apparel, and everyday functional goods since 2024.
              </p>

              {/* Social */}
              <div style={{ display: "flex", gap: 8 }}>
                {SOCIAL.map((s) => (
                  <a key={s.label} href={s.href} aria-label={s.label} className="ft-social">
                    {s.svg}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_LINKS.map((col) => (
              <div key={col.heading}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#71717a", marginBottom: 20 }}>
                  {col.heading}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="ft-link">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────── */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "20px 0" }}>
          <div style={{
            maxWidth: 1200, margin: "0 auto", padding: "0 48px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16,
          }}>

            <p style={{ fontSize: 12, color: "#3f3f46" }}>
              © {year} Cabro. All rights reserved.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Cookie Policy", href: "/cookies" },
              ].map((l) => (
                <Link key={l.label} href={l.href} className="ft-bottom-link">{l.label}</Link>
              ))}
            </div>

            {/* Payment badges */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "#3f3f46", marginRight: 4 }}>Secure payments</span>
              {["Visa", "MC", "Amex", "PayPal", "Stripe"].map((p) => (
                <span key={p} style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  height: 22, padding: "0 8px", borderRadius: 4,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontSize: 10, fontWeight: 700, color: "#52525b",
                  letterSpacing: "0.02em",
                }}>{p}</span>
              ))}
            </div>

          </div>
        </div>

      </footer>
    </>
  );
}