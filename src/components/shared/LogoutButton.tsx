"use client";

import { useAuthStore } from "@/hooks/useAuthStore";
import { useCartStore } from "@/hooks/useCartStore";
import { logoutUser } from "@/services/auth/logoutUser";
import { LogOut } from "lucide-react";

interface Props {
  className?: string;
  showIcon?: boolean;
  label?: string;
}

export default function LogoutButton({
  className = "",
  showIcon = true,
  label = "Sign Out",
}: Props) {
  const clearUser = useAuthStore((s) => s.clearUser);
  const clearCart = useCartStore((s) => s.clearCart);

  const handleLogout = () => {
    clearUser();
    clearCart();
    logoutUser();
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-3 w-full text-left transition-colors ${className}`}
    >
      {showIcon && <LogOut className="w-4 h-4 shrink-0" />}
      <span>{label}</span>
    </button>
  );
}
