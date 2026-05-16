import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface DashboardSidebarProps {
  role: 'user' | 'seller' | 'admin';
  onLogout?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ role, onLogout }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems: Record<string, NavItem[]> = {
    user: [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
      { label: 'My Orders', href: '/dashboard/orders', icon: <ShoppingBag size={20} /> },
      { label: 'Wishlist', href: '/dashboard/wishlist', icon: <Package size={20} /> },
      { label: 'My Profile', href: '/dashboard/my-profile', icon: <User size={20} /> },
    ],
    seller: [
      { label: 'Dashboard', href: '/seller', icon: <LayoutDashboard size={20} /> },
      { label: 'Products', href: '/seller/products', icon: <Package size={20} /> },
      { label: 'Orders', href: '/seller/orders', icon: <ShoppingBag size={20} /> },
      { label: 'Analytics', href: '/seller/analytics', icon: <BarChart3 size={20} /> },
      { label: 'Settings', href: '/seller/settings', icon: <Settings size={20} /> },
    ],
    admin: [
      { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} /> },
      { label: 'Users', href: '/admin/users', icon: <ShoppingBag size={20} /> },
      { label: 'Products', href: '/admin/products', icon: <Package size={20} /> },
      { label: 'Orders', href: '/admin/orders', icon: <ShoppingBag size={20} /> },
      { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 size={20} /> },
      { label: 'Settings', href: '/admin/settings', icon: <Settings size={20} /> },
    ],
  };

  const items = navItems[role];
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const sidebarLabel = role === 'user' ? 'Dashboard' : role === 'seller' ? 'Seller Hub' : 'Admin Panel';
  const sidebarTitle = role === 'user' ? 'My Account' : role === 'seller' ? 'My Store' : 'Admin';

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden p-3 bg-slate-900 text-white shadow-2xl rounded-2xl border border-white/10 transition-colors hover:bg-slate-800"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/75 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-72 bg-slate-950/95 text-white z-30 md:z-10 transition-transform duration-300 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.8)] md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="px-6 py-7 border-b border-white/10">
          <div className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500 mb-3">
            {sidebarLabel}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">{sidebarTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400 max-w-76">
            Access product management, orders, analytics, and settings from one sleek control panel.
          </p>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center gap-4 rounded-[30px] bg-white/5 border border-white/10 p-4 shadow-[0_10px_30px_-18px_rgba(255,255,255,0.2)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-500 text-white text-xl font-bold">
              {sidebarTitle.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Welcome back</p>
              <p className="text-xs text-slate-400">Your dashboard is ready.</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-4 rounded-[28px] px-5 py-4 transition-all duration-200',
                isActive(item.href)
                  ? 'bg-indigo-500/15 text-white ring-1 ring-indigo-500/20 shadow-sm shadow-indigo-500/10 border-l-4 border-indigo-400'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              )}
              onClick={() => setIsOpen(false)}
            >
              <span
                className={cn(
                  'grid place-items-center w-12 h-12 rounded-3xl transition-all duration-200',
                  isActive(item.href)
                    ? 'bg-indigo-500 text-white shadow-[0_12px_30px_-18px_rgba(99,102,241,0.7)]'
                    : 'bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white'
                )}
              >
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold leading-tight truncate">{item.label}</p>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                  {isActive(item.href) ? 'Active' : 'Quick access'}
                </p>
              </div>
              {item.badge && (
                <span className="ml-auto text-[11px] font-semibold uppercase tracking-[0.18em] bg-red-500/15 text-red-300 px-2 py-1 rounded-2xl">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-white/10 bg-slate-950/95">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-red-300 transition-all duration-200 hover:bg-red-500/10 hover:text-white"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Padding */}
      <div className="md:w-72" />
    </>
  );
};

export default DashboardSidebar;
