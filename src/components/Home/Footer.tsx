"use client";

import Image from "next/image";
import Link from "next/link";

const FOOTER_COL = [
  {
    heading: "Get to Know Us",
    links: [
      { label: "About Cabro", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press Releases", href: "/press" },
      { label: "Cabro Cares", href: "/sustainability" },
      { label: "Gift a Smile", href: "/gift" },
    ],
  },
  {
    heading: "Make Money with Us",
    links: [
      { label: "Sell on Cabro", href: "/register?role=SELLER" },
      { label: "Sell Under Cabro Accelerator", href: "/seller/dashboard" },
      { label: "Protect & Build Your Brand", href: "/seller/dashboard" },
      { label: "Cabro Pay on Merchants", href: "/seller/payouts" },
      { label: "Become an Affiliate", href: "/affiliate" },
    ],
  },
  {
    heading: "Cabro Payment Products",
    links: [
      { label: "Cabro Business Card", href: "/payment" },
      { label: "Shop with Points", href: "/payment" },
      { label: "Reload Your Balance", href: "/payment" },
      { label: "Cabro Currency Converter", href: "/payment" },
    ],
  },
  {
    heading: "Let Us Help You",
    links: [
      { label: "Your Account", href: "/dashboard" },
      { label: "Your Orders", href: "/dashboard/orders" },
      { label: "Shipping Rates & Policies", href: "/shipping-policy" },
      { label: "Returns & Replacements", href: "/returns" },
      { label: "Cabro App", href: "/" },
      { label: "Help", href: "/contact" },
    ],
  },
];

const BOTTOM_LINKS = [
  "Conditions of Use", "Privacy Notice", "Consumer Health Data Privacy Disclosure",
  "Your Ads Privacy Choices",
];

export default function Footer() {
  return (
    <footer style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Back to top */}
      <div
        style={{ background: "#37475a", color: "#fff", textAlign: "center", padding: "14px", fontSize: 13, cursor: "pointer" }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        Back to top
      </div>

      {/* Main footer */}
      <div style={{ background: "#232f3e", color: "#ddd", padding: "40px 0 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, marginBottom: 32 }}>
            {FOOTER_COL.map((col) => (
              <div key={col.heading}>
                <h4 style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{col.heading}</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} style={{ color: "#aaa", fontSize: 13, textDecoration: "none", transition: "color 0.12s" }}
                        onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#fff")}
                        onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#aaa")}
                      >{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", maxWidth: 1200, margin: "0 auto" }} />

        {/* Logo row */}
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <Link href="/" >
              <Image src="/logo.png" alt="Cabro" width={100} height={100}  priority className="object-contain" />
            </Link>
        </div>

        {/* Bottom links */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", maxWidth: "100%", padding: "16px 24px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 24px" }}>
          {BOTTOM_LINKS.map((label) => (
            <Link key={label} href="#" style={{ fontSize: 12, color: "#aaa", textDecoration: "none" }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#aaa")}
            >{label}</Link>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "#666", paddingBottom: 16 }}>
          © 2025, Cabro.com, Inc. or its affiliates
        </p>
      </div>
    </footer>
  );
}
