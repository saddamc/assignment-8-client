"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, UserCircle } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";

interface Props {
  open: boolean;
  onClose: () => void;
  categories: { label: string; href: string; icon?: string }[];
}

export function CategoryDrawer({ open, onClose, categories }: Props) {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[9999] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      {/* Backdrop */}
      <button
        className="absolute inset-0 h-full w-full bg-black/50 backdrop-blur-[3px] border-none cursor-default"
        onClick={onClose}
        aria-label="Close menu"
      />

      {/* Drawer panel — left side */}
      <aside
        aria-label="Categories menu"
        className={`absolute left-0 top-0 flex h-full w-full max-w-[360px] flex-col bg-white shadow-2xl transition-transform duration-300 transform ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* ── Header ── */}
        <div className="flex-shrink-0 bg-[#232f3e] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCircle className="h-8 w-8 text-white" />
            <span className="text-[17px] font-bold">
              Hello, {user ? user.name?.split(" ")[0] : "sign in"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto bg-white py-2">
          <div className="px-5 py-3">
            <h3 className="text-[16px] font-bold text-gray-900 mb-2">Shop by Category</h3>
          </div>
          <div className="flex flex-col">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                onClick={onClose}
                className="flex items-center gap-3 px-6 py-3 text-[14px] text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {cat.icon && <span className="text-lg leading-none w-6 text-center">{cat.icon}</span>}
                <span className="flex-1">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
