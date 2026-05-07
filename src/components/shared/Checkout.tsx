import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, CreditCard, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const checkoutSchema = z.object({
  // Shipping
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(5, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),

  // Payment
  cardName: z.string().min(2, 'Cardholder name is required'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Valid card number required'),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'MM/YY format required'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Valid CVV required'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutProps {
  orderSummary: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    items: Array<{ title: string; quantity: number; price: number }>;
  };
  onSubmit?: (data: CheckoutFormData) => Promise<void>;
  isLoading?: boolean;
}

const Checkout: React.FC<CheckoutProps> = ({ orderSummary, onSubmit, isLoading }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const handleCheckoutSubmit = async (data: CheckoutFormData) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Checkout Form */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit(handleCheckoutSubmit)} className="space-y-8">
          {/* Shipping Information */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
              <Truck size={20} className="text-indigo-600" />
              Shipping Information
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name
                  </label>
                  <Input
                    {...register('fullName')}
                    placeholder="John Doe"
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-red-600 text-xs mt-1">{errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email
                  </label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="john@example.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone Number
                </label>
                <Input
                  {...register('phone')}
                  placeholder="+1 (555) 123-4567"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Street Address
                </label>
                <Input
                  {...register('address')}
                  placeholder="123 Main Street"
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && (
                  <p className="text-red-600 text-xs mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    City
                  </label>
                  <Input
                    {...register('city')}
                    placeholder="New York"
                    className={errors.city ? 'border-red-500' : ''}
                  />
                  {errors.city && (
                    <p className="text-red-600 text-xs mt-1">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    State
                  </label>
                  <Input
                    {...register('state')}
                    placeholder="NY"
                    className={errors.state ? 'border-red-500' : ''}
                  />
                  {errors.state && (
                    <p className="text-red-600 text-xs mt-1">{errors.state.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Postal Code
                  </label>
                  <Input
                    {...register('postalCode')}
                    placeholder="10001"
                    className={errors.postalCode ? 'border-red-500' : ''}
                  />
                  {errors.postalCode && (
                    <p className="text-red-600 text-xs mt-1">{errors.postalCode.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Country
                  </label>
                  <Input
                    {...register('country')}
                    placeholder="United States"
                    className={errors.country ? 'border-red-500' : ''}
                  />
                  {errors.country && (
                    <p className="text-red-600 text-xs mt-1">{errors.country.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
              <CreditCard size={20} className="text-indigo-600" />
              Payment Method
            </h2>

            <div className="space-y-4 mb-6">
              {['card', 'paypal'].map((method) => (
                <label
                  key={method}
                  className={cn(
                    'flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all',
                    paymentMethod === method
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'paypal')}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 font-medium text-neutral-900">
                    {method === 'card' ? 'Credit/Debit Card' : 'PayPal'}
                  </span>
                </label>
              ))}
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Cardholder Name
                  </label>
                  <Input
                    {...register('cardName')}
                    placeholder="John Doe"
                    className={errors.cardName ? 'border-red-500' : ''}
                  />
                  {errors.cardName && (
                    <p className="text-red-600 text-xs mt-1">{errors.cardName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Card Number
                  </label>
                  <Input
                    {...register('cardNumber')}
                    placeholder="1234 5678 9012 3456"
                    className={errors.cardNumber ? 'border-red-500' : ''}
                  />
                  {errors.cardNumber && (
                    <p className="text-red-600 text-xs mt-1">{errors.cardNumber.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Expiry Date
                    </label>
                    <Input
                      {...register('expiryDate')}
                      placeholder="MM/YY"
                      className={errors.expiryDate ? 'border-red-500' : ''}
                    />
                    {errors.expiryDate && (
                      <p className="text-red-600 text-xs mt-1">{errors.expiryDate.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      CVV
                    </label>
                    <Input
                      {...register('cvv')}
                      placeholder="123"
                      type="password"
                      className={errors.cvv ? 'border-red-500' : ''}
                    />
                    {errors.cvv && (
                      <p className="text-red-600 text-xs mt-1">{errors.cvv.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
                <p className="text-neutral-700">
                  You will be redirected to PayPal to complete your payment.
                </p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            variant="default"
            size="lg"
            className="w-full"
          >
            <Lock size={20} className="mr-2" />
            {isLoading ? 'Processing...' : 'Complete Purchase'}
          </Button>
        </form>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 sticky top-20">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h3>

          <div className="space-y-3 mb-6 pb-6 border-b border-neutral-200">
            {orderSummary.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-neutral-700">
                  {item.title} x{item.quantity}
                </span>
                <span className="font-medium text-neutral-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-4 pb-4 border-b border-neutral-200">
            <div className="flex justify-between text-neutral-700">
              <span>Subtotal</span>
              <span>${orderSummary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-700">
              <span>Shipping</span>
              <span>
                {orderSummary.shipping === 0 ? (
                  <span className="text-green-600 font-semibold">FREE</span>
                ) : (
                  `$${orderSummary.shipping.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-neutral-700">
              <span>Tax</span>
              <span>${orderSummary.tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-neutral-900">Total</span>
            <span className="text-2xl font-bold text-neutral-900">
              ${orderSummary.total.toFixed(2)}
            </span>
          </div>

          <div className="mt-6 flex items-start gap-2 text-xs text-neutral-600 bg-blue-50 p-3 rounded-lg">
            <Lock size={14} className="flex-shrink-0 mt-0.5" />
            <p>Your payment is secure and encrypted.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
