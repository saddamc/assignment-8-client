"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search, ShoppingBag, User, Menu, X,
  ChevronDown, LayoutDashboard, Package,
  Settings, LogOut, Store, Shield, ArrowRight,
} from "lucide-react";
import { useCartStore } from "@/hooks/useCartStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { logoutUser } from "@/services/auth/logoutUser";
import type { AuthUser } from "@/hooks/useAuthStore";

/* ─── Nav data ───────────────────────────────────────────────── */
const NAV_LINKS = [
  {
    label: "Shop",
    href: "/products",
    mega: [
      { label: "New Arrivals", href: "/new-arrivals", tag: "New" },
      { label: "Best Sellers", href: "/products?sort=popular" },
      { label: "Sale",         href: "/products?sale=true", tag: "Sale" },
      { label: "All Products", href: "/products?view=all" },
    ],
  },
  {
    label: "Collections",
    href: "/collections",
    mega: [
      { label: "Avant-Garde Tech",    href: "/collections?cat=tech" },
      { label: "Quiet Luxury Fashion",href: "/collections?cat=fashion" },
      { label: "Accessories",         href: "/collections?cat=accessories" },
      { label: "Footwear",            href: "/collections?cat=footwear" },
    ],
  },
  { label: "New Arrivals", href: "/new-arrivals" },
];

/* role → dashboard route */
function dashRoute(role: AuthUser["role"]) {
  if (role === "ADMIN")  return "/admin/dashboard";
  if (role === "SELLER") return "/seller/dashboard";
  return "/dashboard";
}

/* ─── User dropdown ──────────────────────────────────────────── */
function UserMenu({ user }: { user: AuthUser }) {
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);
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

  const initial  = user.name?.[0]?.toUpperCase() ?? "U";
  const route    = dashRoute(user.role);

  /* menu item definitions — unique labels used as keys */
  const menuItems = [
    { label: "Dashboard",   href: route,                    icon: <LayoutDashboard size={14} />, show: true },
    { label: "My Orders",   href: "/dashboard/orders",      icon: <Package size={14} />,         show: user.role === "CUSTOMER" },
    { label: "My Products", href: "/seller/products",       icon: <Store size={14} />,           show: user.role === "SELLER" },
    { label: "Admin Panel", href: "/admin/users",           icon: <Shield size={14} />,          show: user.role === "ADMIN" },
    { label: "Settings",    href: "/dashboard/settings",    icon: <Settings size={14} />,        show: true },
  ].filter((item) => item.show);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          height: 36, padding: "0 14px", borderRadius: 100,
          background: open ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          cursor: "pointer", color: "#f5f5f7",
          transition: "background 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: "50%",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0,
        }}>{initial}</div>
        <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 88, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user.name}
        </span>
        <ChevronDown size={12} style={{ color: "#86868b", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 10px)",
          width: 240, borderRadius: 18, overflow: "hidden",
          background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          animation: "lxDropIn 0.18s cubic-bezier(.16,1,.3,1) both",
          zIndex: 200,
        }}>
          {/* header */}
          <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#f5f5f7", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
            <p style={{ fontSize: 11, color: "#52525b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
            <span style={{
              display: "inline-block", marginTop: 8, padding: "2px 10px",
              background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 100, fontSize: 9, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase", color: "#a5b4fc",
            }}>{user.role}</span>
          </div>

          {/* links — keyed by label (guaranteed unique) */}
          <div style={{ padding: "8px" }}>
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 12,
                  fontSize: 13, color: "#a1a1aa", textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "#f5f5f7"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#a1a1aa"; }}
              >
                <span style={{ color: "#52525b" }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* sign out */}
          <div style={{ padding: "8px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", width: "100%", borderRadius: 12,
                fontSize: 13, color: "#f87171", background: "transparent",
                border: "none", cursor: "pointer", textAlign: "left",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
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

/* ─── Mega dropdown ──────────────────────────────────────────── */
function MegaMenu({
  items,
  visible,
}: {
  items: { label: string; href: string; tag?: string }[];
  visible: boolean;
}) {
  return (
    <div style={{
      position: "absolute", top: "calc(100% + 8px)", left: "50%",
      minWidth: 220, borderRadius: 16,
      background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
      padding: "8px",
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? "all" : "none",
      transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-8px)",
      transition: "opacity 0.2s ease, transform 0.2s ease",
      zIndex: 100,
    }}>
      {/* key by label — always unique within a single mega menu */}
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px", borderRadius: 10,
            fontSize: 13, color: "#a1a1aa", textDecoration: "none",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "#f5f5f7"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#a1a1aa"; }}
        >
          <span>{item.label}</span>
          {item.tag && (
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", padding: "2px 8px", borderRadius: 100,
              background: item.tag === "Sale" ? "rgba(239,68,68,0.2)" : "rgba(99,102,241,0.2)",
              color: item.tag === "Sale" ? "#f87171" : "#a5b4fc",
              border: `1px solid ${item.tag === "Sale" ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.3)"}`,
            }}>{item.tag}</span>
          )}
        </Link>
      ))}
    </div>
  );
}

/* ─── Search overlay ─────────────────────────────────────────── */
function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?searchTerm=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(20px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", paddingTop: "20vh",
        animation: "lxFadeIn 0.2s ease both",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "100%", maxWidth: 640, padding: "0 24px" }}>
        <p style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "#52525b",
          marginBottom: 20, textAlign: "center",
        }}>Search</p>

        <form onSubmit={handleSubmit} style={{ position: "relative" }}>
          <Search size={20} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", color: "#52525b" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, collections…"
            style={{
              width: "100%", height: 60,
              paddingLeft: 56, paddingRight: 60,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16, fontSize: 18, color: "#f5f5f7",
              outline: "none", fontFamily: "inherit",
              transition: "border-color 0.2s",
            }}
            onFocus={(e)  => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)")}
            onBlur={(e)   => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
          />
          {query && (
            <button
              type="submit"
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                width: 36, height: 36, borderRadius: 10,
                background: "#6366f1", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <ArrowRight size={16} style={{ color: "#fff" }} />
            </button>
          )}
        </form>

        <button
          onClick={onClose}
          style={{
            display: "block", margin: "20px auto 0",
            fontSize: 12, color: "#52525b",
            background: "none", border: "none", cursor: "pointer",
            letterSpacing: "0.06em",
          }}
        >Press ESC to close</button>
      </div>
    </div>
  );
}

/* ─── Navbar ─────────────────────────────────────────────────── */
const Navbar = () => {
  const [mounted,    setMounted]    = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const itemCount = useCartStore((s) => s.getItemCount());
  const user      = useAuthStore((s) => s.user);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const openMenu  = useCallback((label: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveMenu(label);
  }, []);

  const closeMenu = useCallback(() => {
    timerRef.current = setTimeout(() => setActiveMenu(null), 120);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        @keyframes lxDropIn {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes lxFadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes lxSlideDown {
          from { opacity:0; transform:translateY(-12px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .lx-nav-link {
          position: relative;
          font-size: 13px; font-weight: 500;
          color: #a1a1aa; text-decoration: none;
          letter-spacing: 0.01em;
          transition: color 0.2s ease;
          padding: 4px 0;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .lx-nav-link::after {
          content: '';
          position: absolute; bottom: -2px; left: 0; right: 0;
          height: 1px; background: #f5f5f7;
          transform: scaleX(0);
          transition: transform 0.25s cubic-bezier(.16,1,.3,1);
          transform-origin: left;
        }
        .lx-nav-link:hover            { color: #f5f5f7; }
        .lx-nav-link:hover::after     { transform: scaleX(1); }

        .lx-icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 50%;
          background: transparent; border: none;
          cursor: pointer; color: #a1a1aa;
          transition: background 0.2s, color 0.2s;
          text-decoration: none; position: relative;
        }
        .lx-icon-btn:hover { background: rgba(255,255,255,0.08); color: #f5f5f7; }

        .lx-mobile-link {
          display: flex; align-items: center;
          height: 50px; padding: 0 20px; border-radius: 14px;
          font-size: 15px; font-weight: 500;
          color: #a1a1aa; text-decoration: none;
          transition: all 0.15s ease;
        }
        .lx-mobile-link:hover { background: rgba(255,255,255,0.06); color: #f5f5f7; }

        .lx-cart-badge {
          position: absolute; top: 2px; right: 2px;
          min-width: 16px; height: 16px; border-radius: 8px;
          background: #6366f1; color: #fff;
          font-size: 9px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px;
        }

        .lx-signin-btn {
          display: inline-flex; align-items: center; gap: 7px;
          height: 34px; padding: 0 16px; border-radius: 100px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          font-size: 13px; font-weight: 500; color: #a1a1aa;
          text-decoration: none; transition: all 0.2s ease; margin-left: 4px;
        }
        .lx-signin-btn:hover { background: rgba(255,255,255,0.1); color: #f5f5f7; }

        @media (max-width: 767px) {
          .lx-desktop-nav   { display: none !important; }
          .lx-mobile-toggle { display: flex !important; }
        }
        @media (min-width: 768px) {
          .lx-mobile-toggle { display: none !important; }
        }
      `}</style>

      <header style={{
        position: "sticky", top: 0, zIndex: 50, width: "100%",
        fontFamily: "DM Sans, sans-serif",
        background: scrolled ? "rgba(5,5,5,0.9)" : "rgba(5,5,5,0.75)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)"}`,
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 48px", height: 52,
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 24,
        }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, textDecoration: "none" }}>
            <Image src="/logo.png" alt="Logo"  width={30} height={30} style={{ objectFit: "contain", height: 30, width: "auto" }} />
            <Image src="/name.png" alt="Brand" width={110} height={30} style={{ objectFit: "contain", height: 28, width: "auto" }} />
          </Link>

          {/* Desktop nav — keyed by label (unique) */}
          <nav className="lx-desktop-nav" style={{ display: "flex", alignItems: "center", gap: 32, flex: 1, justifyContent: "center" }}>
            {NAV_LINKS.map((link) => (
              <div
                key={link.label}
                style={{ position: "relative" }}
                onMouseEnter={() => link.mega && openMenu(link.label)}
                onMouseLeave={() => link.mega && closeMenu()}
              >
                <Link href={link.href} className="lx-nav-link">
                  {link.label}
                  {link.mega && (
                    <ChevronDown size={11} style={{
                      color: "#52525b", transition: "transform 0.2s",
                      transform: activeMenu === link.label ? "rotate(180deg)" : "rotate(0deg)",
                    }} />
                  )}
                </Link>
                {link.mega && (
                  <MegaMenu items={link.mega} visible={activeMenu === link.label} />
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <button className="lx-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={17} />
            </button>

            <Link href="/cart" className="lx-icon-btn" aria-label="Cart">
              <ShoppingBag size={17} />
              {mounted && itemCount > 0 && (
                <span className="lx-cart-badge">{itemCount > 9 ? "9+" : itemCount}</span>
              )}
            </Link>

            {mounted && user ? (
              <UserMenu user={user} />
            ) : (
              <Link href="/login" className="lx-signin-btn">
                <User size={14} /> Sign in
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              className="lx-icon-btn lx-mobile-toggle"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
              style={{ marginLeft: 4 }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(5,5,5,0.97)",
            backdropFilter: "blur(24px)",
            padding: "16px 20px 28px",
            animation: "lxSlideDown 0.22s cubic-bezier(.16,1,.3,1) both",
          }}>
            {/* Tap to open full search overlay */}
            <div
              onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
              style={{
                position: "relative", marginBottom: 16, cursor: "pointer",
              }}
            >
              <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#52525b" }} />
              <div style={{
                height: 44, paddingLeft: 42,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, display: "flex", alignItems: "center",
                fontSize: 14, color: "#52525b",
              }}>Search products…</div>
            </div>

            {/* Mobile nav links — keyed by label (unique) */}
            <nav style={{ marginBottom: 20 }}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="lx-mobile-link"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {!user && (
              <div style={{ display: "flex", gap: 10 }}>
                <Link href="/login" onClick={() => setMobileOpen(false)} style={{
                  flex: 1, height: 46, borderRadius: 100,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 600, color: "#f5f5f7",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  textDecoration: "none",
                }}>Sign in</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} style={{
                  flex: 1, height: 46, borderRadius: 100,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 600, color: "#fff",
                  background: "#6366f1", textDecoration: "none",
                }}>Register</Link>
              </div>
            )}
          </div>
        )}
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
};

export default Navbar;