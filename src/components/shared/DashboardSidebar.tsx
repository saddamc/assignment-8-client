import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  BarChart3,
  Settings,
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
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
      { label: 'My Orders', href: '/dashboard/orders', icon: <ShoppingBag size={18} /> },
      { label: 'Wishlist', href: '/dashboard/wishlist', icon: <Package size={18} /> },
      { label: 'Settings', href: '/dashboard/settings', icon: <Settings size={18} /> },
    ],
    seller: [
      { label: 'Dashboard', href: '/seller', icon: <LayoutDashboard size={18} /> },
      { label: 'Products', href: '/seller/products', icon: <Package size={18} /> },
      { label: 'Orders', href: '/seller/orders', icon: <ShoppingBag size={18} /> },
      { label: 'Analytics', href: '/seller/analytics', icon: <BarChart3 size={18} /> },
      { label: 'Settings', href: '/seller/settings', icon: <Settings size={18} /> },
    ],
    admin: [
      { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={18} /> },
      { label: 'Users', href: '/admin/users', icon: <ShoppingBag size={18} /> },
      { label: 'Products', href: '/admin/products', icon: <Package size={18} /> },
      { label: 'Orders', href: '/admin/orders', icon: <ShoppingBag size={18} /> },
      { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 size={18} /> },
      { label: 'Settings', href: '/admin/settings', icon: <Settings size={18} /> },
    ],
  };

  const items = navItems[role];
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden p-2 hover:bg-neutral-100 rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-neutral-900 text-white z-30 md:z-10 transition-transform duration-300 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-2xl font-bold">
            {role === 'user' ? 'My Account' : role === 'seller' ? 'Store' : 'Admin'}
          </h1>
        </div>

        <nav className="p-4 space-y-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive(item.href)
                  ? 'bg-indigo-600 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              )}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-xs bg-red-600 px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Padding */}
      <div className="md:w-64" />
    </>
  );
};

export default DashboardSidebar;
