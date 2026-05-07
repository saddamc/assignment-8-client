import React from 'react';
import { X, Minus, Plus, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onRemoveItem?: (productId: string) => void;
  onCheckout?: () => void;
  isLoading?: boolean;
  isEmpty?: boolean;
}

const Cart: React.FC<CartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isLoading,
  isEmpty,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (isEmpty || items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
          <AlertCircle size={32} className="text-neutral-400" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">Your cart is empty</h3>
        <p className="text-neutral-600 mb-6">Add some products to get started!</p>
        <Button variant="default">Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-neutral-200 p-4 md:p-6 flex gap-4 hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="font-semibold text-neutral-900 line-clamp-2 text-sm md:text-base">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-600 mt-1">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => onUpdateQuantity?.(item.productId, Math.max(1, item.quantity - 1))}
                    className="p-1 hover:bg-neutral-100 rounded transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      onUpdateQuantity?.(item.productId, Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-12 text-center border border-neutral-300 rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => onUpdateQuantity?.(item.productId, item.quantity + 1)}
                    className="p-1 hover:bg-neutral-100 rounded transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Price & Remove */}
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => onRemoveItem?.(item.productId)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
                  aria-label="Remove item"
                >
                  <X size={18} />
                </button>
                <p className="font-semibold text-neutral-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 sticky top-20">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h2>

          <div className="space-y-3 mb-4 pb-4 border-b border-neutral-200">
            <div className="flex justify-between text-neutral-700">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-700">
              <span>Shipping</span>
              <span>
                {shipping === 0 ? (
                  <span className="text-green-600 font-semibold">FREE</span>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-neutral-700">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="font-semibold text-neutral-900">Total</span>
            <span className="text-2xl font-bold text-neutral-900">
              ${total.toFixed(2)}
            </span>
          </div>

          {shipping === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-xs text-green-800">
              ✓ Free shipping on this order
            </div>
          )}

          <Button
            onClick={onCheckout}
            isLoading={isLoading}
            variant="default"
            size="lg"
            className="w-full"
          >
            Proceed to Checkout
          </Button>

          <p className="text-xs text-neutral-600 text-center mt-4">
            Free returns within 30 days
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
