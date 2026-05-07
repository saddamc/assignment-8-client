/**
 * EXAMPLE - Seller Dashboard Implementation
 * 
 * Shows complete dashboard with:
 * - Navigation sidebar
 * - Stats cards
 * - Orders table
 * - Products management
 */

'use client';

import { useState } from 'react';
import DashboardSidebar from '@/components/shared/DashboardSidebar';
import { DashboardStats } from '@/components/shared/DashboardStats';
import { OrdersTable, ProductsTable } from '@/components/shared/DashboardTables';
import Section from '@/components/shared/Section';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical } from 'lucide-react';

// Mock data
const MOCK_ORDERS = [
  {
    id: '1',
    orderNumber: '#ORD-001234',
    date: '2024-01-15',
    total: 299.99,
    status: 'delivered' as const,
    items: 3,
  },
  {
    id: '2',
    orderNumber: '#ORD-001235',
    date: '2024-01-16',
    total: 149.99,
    status: 'shipped' as const,
    items: 2,
  },
  {
    id: '3',
    orderNumber: '#ORD-001236',
    date: '2024-01-17',
    total: 499.99,
    status: 'processing' as const,
    items: 5,
  },
  {
    id: '4',
    orderNumber: '#ORD-001237',
    date: '2024-01-18',
    total: 89.99,
    status: 'pending' as const,
    items: 1,
  },
  {
    id: '5',
    orderNumber: '#ORD-001238',
    date: '2024-01-19',
    total: 199.99,
    status: 'delivered' as const,
    items: 2,
  },
];

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 199.99,
    stock: 45,
    sales: 234,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
    status: 'active' as const,
  },
  {
    id: '2',
    name: 'Smart Watch Pro',
    price: 299.99,
    stock: 12,
    sales: 156,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
    status: 'active' as const,
  },
  {
    id: '3',
    name: '4K Webcam',
    price: 89.99,
    stock: 0,
    sales: 89,
    image: 'https://images.unsplash.com/photo-1598761681033-f3aa415d3d5d?w=100&h=100&fit=crop',
    status: 'archived' as const,
  },
  {
    id: '4',
    name: 'USB-C Hub 7-in-1',
    price: 49.99,
    stock: 128,
    sales: 412,
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=100&h=100&fit=crop',
    status: 'active' as const,
  },
  {
    id: '5',
    name: 'Mechanical Keyboard RGB',
    price: 139.99,
    stock: 8,
    sales: 67,
    image: 'https://images.unsplash.com/photo-1587829191301-c3019db9e0cb?w=100&h=100&fit=crop',
    status: 'draft' as const,
  },
];

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products'>('overview');

  const handleLogout = () => {
    console.log('User logged out');
    // TODO: Implement logout logic
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <DashboardSidebar role="seller" onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Seller Dashboard</h1>
                <p className="text-neutral-600 mt-1">Welcome back! Here's your performance.</p>
              </div>
              <Button><Plus size={18} className="mr-2" />Add Product</Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-neutral-200">
            {['overview', 'orders', 'products'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`pb-4 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats */}
              <section>
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Key Metrics</h2>
                <DashboardStats role="seller" />
              </section>

              {/* Recent Orders */}
              <section className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-neutral-900">Recent Orders</h3>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
                <OrdersTable
                  orders={MOCK_ORDERS.slice(0, 5)}
                  onView={(id) => console.log('View order', id)}
                  onEdit={(id) => console.log('Edit order', id)}
                />
              </section>

              {/* Top Products */}
              <section className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-neutral-900">Top Performing Products</h3>
                  <Button variant="ghost" size="sm">
                    Manage All
                  </Button>
                </div>
                <ProductsTable
                  products={MOCK_PRODUCTS.slice(0, 5)}
                  onView={(id) => console.log('View product', id)}
                  onEdit={(id) => console.log('Edit product', id)}
                  onDelete={(id) => console.log('Delete product', id)}
                />
              </section>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <section className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">All Orders</h2>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-neutral-300 rounded-lg text-sm">
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                  </select>
                </div>
              </div>
              <OrdersTable
                orders={MOCK_ORDERS}
                onView={(id) => console.log('View order', id)}
                onEdit={(id) => console.log('Edit order', id)}
                onDelete={(id) => console.log('Delete order', id)}
              />
            </section>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <section className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Product Inventory</h2>
                <Button><Plus size={18} className="mr-2" />Add New Product</Button>
              </div>
              <ProductsTable
                products={MOCK_PRODUCTS}
                onView={(id) => console.log('View product', id)}
                onEdit={(id) => console.log('Edit product', id)}
                onDelete={(id) => console.log('Delete product', id)}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
