"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search, ShoppingCart, Menu, X,
  ChevronDown, MapPin, LayoutDashboard, Package,
  Settings, LogOut, Store, Shield,
} from "lucide-react";
import { useCartStore } from "@/hooks/useCartStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { logoutUser } from "@/services/auth/logoutUser";
import type { AuthUser } from "@/hooks/useAuthStore";

const CAT_LINKS = [
  { label: "Today's Deals", href: "/products?sale=true" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Best Sellers", href: "/products?sortBy=rating&sortOrder=desc" },
  { label: "Collections", href: "/collections" },
  { label: "Electronics", href: "/products?categorySlug=electronics" },
  { label: "Fashion", href: "/products?categorySlug=fashion" },
  { label: "Home & Living", href: "/products?categorySlug=home-living" },
  { label: "Sports", href: "/products?categorySlug=sports" },
  { label: "Gift Cards", href: "/products?categorySlug=gifts" },
];

const ALL_DEPT_CATS = [
  { label: "All Products", href: "/products", icon: "🛍️" },
  { label: "Electronics", href: "/products?categorySlug=electronics", icon: "🔌" },
  { label: "Fashion", href: "/products?categorySlug=fashion", icon: "👗" },
  { label: "Home & Living", href: "/products?categorySlug=home-living", icon: "🏠" },
  { label: "Sports & Outdoors", href: "/products?categorySlug=sports", icon: "⚽" },
  { label: "Books", href: "/products?categorySlug=books", icon: "📚" },
  { label: "Toys & Games", href: "/products?categorySlug=toys", icon: "🧸" },
  { label: "Beauty & Care", href: "/products?categorySlug=beauty", icon: "💄" },
  { label: "Automotive", href: "/products?categorySlug=automotive", icon: "🚗" },
  { label: "Today's Deals", href: "/products?sale=true", icon: "🏷️" },
];

const SEARCH_CATS = [
  "All Departments", "Electronics", "Fashion", "Home & Living",
  "Sports", "Books", "Toys", "Beauty", "Automotive",
];

const SEARCH_CAT_SLUGS: Record<string, string> = {
  "Electronics": "electronics",
  "Fashion": "fashion",
  "Home & Living": "home-living",
  "Sports": "sports",
  "Books": "books",
  "Toys": "toys",
  "Beauty": "beauty",
  "Automotive": "automotive",
};

function dashRoute(role: AuthUser["role"]) {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "SELLER") return "/seller/dashboard";
  return "/dashboard";
}

function UserMenu({ user }: { user: AuthUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const clearUser = useAuthStore((s) => s.clearUser);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleLogout = async () => {
    clearUser(); clearCart();
    await logoutUser();
    router.push("/login");
  };

  const settingsRoute =
    user.role === "ADMIN"
      ? "/admin/settings"
      : user.role === "SELLER"
      ? "/seller/settings"
      : "/dashboard/my-profile";

  const settingsLabel = user.role === "CUSTOMER" ? "My Profile" : "Settings";

  const menuItems = [
    { label: "Dashboard", href: dashRoute(user.role), icon: <LayoutDashboard size={14} />, show: true },
    { label: "My Orders", href: "/dashboard/orders", icon: <Package size={14} />, show: user.role === "CUSTOMER" },
    { label: "My Products", href: "/seller/products", icon: <Store size={14} />, show: user.role === "SELLER" },
    { label: "Admin Panel", href: "/admin/users", icon: <Shield size={14} />, show: user.role === "ADMIN" },
    { label: settingsLabel, href: settingsRoute, icon: <Settings size={14} />, show: true },
  ].filter((item) => item.show);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", flexDirection: "column", alignItems: "flex-start",
          padding: "6px 10px", borderRadius: 4,
          background: "transparent", border: "2px solid transparent",
          cursor: "pointer", color: "#fff", transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#FF9900")}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.borderColor = "transparent"; }}
      >
        <span style={{ fontSize: 11, color: "#ccc", lineHeight: 1 }}>Hello, {user.name?.split(" ")[0]}</span>
        <span style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, lineHeight: 1.4 }}>
          Account <ChevronDown size={12} />
        </span>
      </button>
      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 4px)",
          width: 240, borderRadius: 8,
          background: "#fff", border: "1px solid #ddd",
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)", zIndex: 200,
        }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #eee", background: "#f9f9f9", borderRadius: "8px 8px 0 0" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 2 }}>{user.name}</p>
            <p style={{ fontSize: 11, color: "#888" }}>{user.email}</p>
            <span style={{ display: "inline-block", marginTop: 6, padding: "2px 8px", background: "#FF9900", borderRadius: 100, fontSize: 9, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" as const, color: "#111" }}>{user.role}</span>
          </div>
          <div style={{ padding: "6px" }}>
            {menuItems.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 6, fontSize: 13, color: "#333", textDecoration: "none", transition: "background 0.12s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: "#888" }}>{item.icon}</span>{item.label}
              </Link>
            ))}
          </div>
          <div style={{ padding: "6px", borderTop: "1px solid #eee" }}>
            <button
              onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", width: "100%", borderRadius: 6, fontSize: 13, color: "#c0392b", background: "transparent", border: "none", cursor: "pointer", transition: "background 0.12s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fff0ee")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchCat, setSearchCat] = useState("All Departments");
  const [searchQuery, setSearchQuery] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [allDeptOpen, setAllDeptOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const catRef = useRef<HTMLDivElement>(null);
  const allDeptRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const router = useRouter();

  const itemCount = useCartStore((s) => s.getItemCount());
  const user = useAuthStore((s) => s.user);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setVisible(y <= 10 || y < lastScrollY.current);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (allDeptRef.current && !allDeptRef.current.contains(e.target as Node)) setAllDeptOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const p = new URLSearchParams({ searchTerm: searchQuery.trim() });
    const slug = SEARCH_CAT_SLUGS[searchCat];
    if (slug) p.set("categorySlug", slug);
    router.push(`/products?${p.toString()}`);
  }, [searchQuery, searchCat, router]);

  return (
    <>
      <style>{`
        .hz-nav-catnav {
          background: #232f3e;
          color: #fff;
          border-bottom: 1px solid #3a4553;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .hz-nav-catnav::-webkit-scrollbar { display: none; }
        .hz-nav-link-pill {
          display: inline-flex; align-items: center;
          padding: 8px 12px; font-size: 13px; font-weight: 400;
          color: #fff; text-decoration: none; border-radius: 3px;
          border: 2px solid transparent; white-space: nowrap;
          transition: border-color 0.12s;
        }
        .hz-nav-link-pill:hover { border-color: #fff; }
        .hz-search-cat-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 0 10px; height: 38px;
          background: #f3f3f3; border: none;
          border-radius: 4px 0 0 4px; font-size: 12px;
          color: #333; cursor: pointer; white-space: nowrap;
          border-right: 1px solid #cdcdcd; transition: background 0.12s;
        }
        .hz-search-cat-btn:hover { background: #e8e8e8; }
        .hz-search-input {
          flex: 1; height: 38px; padding: 0 12px; font-size: 14px;
          border: none; outline: none; background: #fff; color: #111; min-width: 0;
        }
        .hz-search-input::placeholder { color: #999; }
        .hz-search-btn {
          width: 44px; height: 38px; background: #FF9900; border: none;
          border-radius: 0 4px 4px 0; display: flex; align-items: center;
          justify-content: center; cursor: pointer; transition: background 0.12s; flex-shrink: 0;
        }
        .hz-search-btn:hover { background: #e68a00; }
        .hz-top-action {
          display: flex; flex-direction: column; padding: 6px 10px; border-radius: 4px;
          border: 2px solid transparent; cursor: pointer; text-decoration: none;
          color: #fff; transition: border-color 0.12s; background: transparent; line-height: 1;
        }
        .hz-top-action:hover { border-color: #FF9900; }
        .hz-cart-btn {
          display: flex; align-items: center; gap: 4px; padding: 6px 10px;
          border-radius: 4px; border: 2px solid transparent;
          text-decoration: none; color: #fff; transition: border-color 0.12s;
        }
        .hz-cart-btn:hover { border-color: #FF9900; }
        @media (max-width: 768px) {
          .hz-desktop-only { display: none !important; }
          .hz-mobile-show { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hz-mobile-show { display: none !important; }
        }
      `}</style>

      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#131921", boxShadow: "0 2px 8px rgba(0,0,0,0.4)", fontFamily: "Arial, sans-serif", transform: visible ? "translateY(0)" : "translateY(-100%)", transition: "transform 0.25s ease" }}>
        {/* Top bar */}
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 8 }}>
          {/* Logo */}
          <Link href="/" >
              <Image src="/logo.png" alt="Cabro" width={100} height={100}  priority className="object-contain" />
            </Link>

          {/* Deliver to */}
          <div className="hz-top-action hz-desktop-only" style={{ flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: "#ccc" }}>Deliver to</span>
            <span style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
              <MapPin size={13} /> New York
            </span>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex: 1, display: "flex", alignItems: "center", borderRadius: 4, overflow: "hidden", minWidth: 0 }}>
            <div ref={catRef} style={{ position: "relative", flexShrink: 0 }} className="hz-desktop-only">
              <button type="button" className="hz-search-cat-btn" onClick={() => setCatOpen((v) => !v)}>
                {searchCat.length > 12 ? searchCat.slice(0, 12) + "…" : searchCat}
                <ChevronDown size={10} />
              </button>
              {catOpen && (
                <div style={{ position: "absolute", top: "100%", left: 0, width: 200, background: "#fff", border: "1px solid #ccc", borderRadius: 4, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", zIndex: 200, maxHeight: 280, overflowY: "auto" }}>
                  {SEARCH_CATS.map((c) => (
                    <button key={c} type="button" onClick={() => { setSearchCat(c); setCatOpen(false); }}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 14px", fontSize: 13, color: "#111", background: c === searchCat ? "#f0f7ff" : "transparent", border: "none", cursor: "pointer", fontWeight: c === searchCat ? 700 : 400 }}
                      onMouseEnter={(e) => { if (c !== searchCat) e.currentTarget.style.background = "#f5f5f5"; }}
                      onMouseLeave={(e) => { if (c !== searchCat) e.currentTarget.style.background = "transparent"; }}
                    >{c}</button>
                  ))}
                </div>
              )}
            </div>
            <input className="hz-search-input" placeholder="Search products, brands, categories…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button type="submit" className="hz-search-btn" aria-label="Search">
              <Search size={18} color="#111" />
            </button>
          </form>

          {/* Account */}
          <div className="hz-desktop-only">
            {mounted && user ? (
              <UserMenu user={user} />
            ) : (
              <Link href="/login" className="hz-top-action" style={{ textDecoration: "none" }}>
                <span style={{ fontSize: 11, color: "#ccc" }}>Hello, sign in</span>
                <span style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                  Account <ChevronDown size={11} />
                </span>
              </Link>
            )}
          </div>

          {/* Returns */}
          <Link href="/dashboard/orders" className="hz-top-action hz-desktop-only" style={{ textDecoration: "none", flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: "#ccc" }}>Returns</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>&amp; Orders</span>
          </Link>

          {/* Cart */}
          <Link href="/cart" className="hz-cart-btn" style={{ flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <ShoppingCart size={28} />
              {mounted && itemCount > 0 && (
                <span style={{ position: "absolute", top: -6, right: -6, minWidth: 18, height: 18, borderRadius: 9, background: "#FF9900", color: "#111", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700 }} className="hz-desktop-only">Cart</span>
          </Link>

          {/* Mobile hamburger */}
          <button className="hz-mobile-show" onClick={() => setMobileOpen((v) => !v)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4 }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Category nav */}
        <nav className="hz-nav-catnav">
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center" }}>
            {/* All Departments dropdown */}
            <div ref={allDeptRef} style={{ position: "relative", flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setAllDeptOpen((v) => !v)}
                className="hz-nav-link-pill"
                style={{ fontWeight: 700, gap: 5, background: allDeptOpen ? "rgba(255,255,255,0.12)" : "transparent", borderColor: allDeptOpen ? "#fff" : "transparent" }}
              >
                <Menu size={14} /> All Departments <ChevronDown size={10} />
              </button>
              {allDeptOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0,
                  width: 232, background: "#fff", border: "1px solid #ddd",
                  borderRadius: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", zIndex: 200,
                  overflow: "hidden",
                }}>
                  {ALL_DEPT_CATS.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={() => setAllDeptOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 14px", fontSize: 13, color: "#222",
                        textDecoration: "none", borderBottom: "1px solid #f2f2f2",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ fontSize: 16, lineHeight: 1 }}>{cat.icon}</span>
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {CAT_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hz-nav-link-pill">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)" }} onClick={() => setMobileOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 280, background: "#131921", overflowY: "auto", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ color: "#FF9900", fontWeight: 800, fontSize: 18 }}>ABRO.com</span>
              <button onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={20} /></button>
            </div>
            {mounted && user && (
              <div style={{ background: "#232f3e", borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
                <p style={{ color: "#FF9900", fontWeight: 700, fontSize: 14 }}>Hello, {user.name}</p>
                <p style={{ color: "#aaa", fontSize: 12 }}>{user.email}</p>
              </div>
            )}
            {CAT_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                style={{ display: "block", padding: "11px 14px", borderRadius: 6, fontSize: 14, color: "#e0e0e0", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >{link.label}</Link>
            ))}
            {!user && (
              <Link href="/login" onClick={() => setMobileOpen(false)}
                style={{ display: "block", marginTop: 16, padding: "12px", background: "#FF9900", color: "#111", fontWeight: 700, fontSize: 14, textAlign: "center", borderRadius: 8, textDecoration: "none" }}
              >Sign In</Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
