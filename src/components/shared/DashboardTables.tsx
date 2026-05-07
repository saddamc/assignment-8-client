import React from 'react';
import { ChevronRight, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
}

interface OrdersTableProps {
  orders: Order[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-800',
  processing: 'bg-blue-50 text-blue-800',
  shipped: 'bg-purple-50 text-purple-800',
  delivered: 'bg-green-50 text-green-800',
  cancelled: 'bg-red-50 text-red-800',
};

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onView,
  onEdit,
  onDelete,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-neutral-100 h-16 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">No orders found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="w-full">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-neutral-900">
              Order #
            </th>
            <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-neutral-900">
              Date
            </th>
            <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-neutral-900">
              Items
            </th>
            <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-neutral-900">
              Total
            </th>
            <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-neutral-900">
              Status
            </th>
            <th className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-neutral-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              <td className="px-4 md:px-6 py-4 text-sm font-medium text-neutral-900">
                {order.orderNumber}
              </td>
              <td className="px-4 md:px-6 py-4 text-sm text-neutral-700">
                {new Date(order.date).toLocaleDateString()}
              </td>
              <td className="px-4 md:px-6 py-4 text-sm text-neutral-700">
                {order.items} item{order.items !== 1 ? 's' : ''}
              </td>
              <td className="px-4 md:px-6 py-4 text-sm font-semibold text-neutral-900">
                ${order.total.toFixed(2)}
              </td>
              <td className="px-4 md:px-6 py-4">
                <span
                  className={cn(
                    'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                    statusColors[order.status]
                  )}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </td>
              <td className="px-4 md:px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {onView && (
                    <button
                      onClick={() => onView(order.id)}
                      className="p-2 hover:bg-neutral-200 rounded transition-colors"
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(order.id)}
                      className="p-2 hover:bg-neutral-200 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(order.id)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sales: number;
  image: string;
  status: 'active' | 'draft' | 'archived';
}

interface ProductsTableProps {
  products: Product[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  isLoading?: boolean;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  onEdit,
  onDelete,
  onView,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-neutral-100 h-16 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">No products found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="w-full">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-neutral-900">
              Product
            </th>
            <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-neutral-900">
              Price
            </th>
            <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-neutral-900">
              Stock
            </th>
            <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-neutral-900">
              Sales
            </th>
            <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-neutral-900">
              Status
            </th>
            <th className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-neutral-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              <td className="px-4 md:px-6 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <span className="font-medium text-neutral-900 line-clamp-1">
                    {product.name}
                  </span>
                </div>
              </td>
              <td className="px-4 md:px-6 py-4 text-sm font-semibold text-neutral-900">
                ${product.price.toFixed(2)}
              </td>
              <td className="px-4 md:px-6 py-4 text-sm text-neutral-700">
                {product.stock} units
              </td>
              <td className="px-4 md:px-6 py-4 text-sm text-neutral-700">
                {product.sales} sold
              </td>
              <td className="px-4 md:px-6 py-4">
                <span
                  className={cn(
                    'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                    product.status === 'active'
                      ? 'bg-green-50 text-green-800'
                      : product.status === 'draft'
                      ? 'bg-gray-50 text-gray-800'
                      : 'bg-red-50 text-red-800'
                  )}
                >
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </span>
              </td>
              <td className="px-4 md:px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {onView && (
                    <button
                      onClick={() => onView(product.id)}
                      className="p-2 hover:bg-neutral-200 rounded transition-colors"
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(product.id)}
                      className="p-2 hover:bg-neutral-200 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(product.id)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { OrdersTable, ProductsTable };
