import React from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  badgeColor?: 'success' | 'warning' | 'error';
  onAddCart?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

const badgeColors = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-orange-100 text-orange-800',
  error: 'bg-red-100 text-red-800',
};

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  title,
  price,
  originalPrice,
  rating,
  reviewCount,
  badge,
  badgeColor = 'success',
  onAddCart,
  onFavorite,
  isFavorite,
}) => {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-neutral-100 overflow-hidden">
        <Image
          src={image}
          alt={title} fill
          sizes="(max-width: 640px) 50vw,
              (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Badge */}
        {badge && (
          <div className={cn('absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold', badgeColors[badgeColor])}>
            {badge}
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 rounded-lg bg-black px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">
            -{discount}% OFF
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={onFavorite}
          className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
          aria-label="Add to favorites"
        >
          <Heart
            size={18}
            className={cn(
              'transition-colors',
              isFavorite ? 'fill-red-600 text-red-600' : 'text-neutral-600'
            )}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title */}
        <h3 className="text-sm md:text-base font-semibold text-neutral-900 line-clamp-2 mb-2">
          {title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={cn(
                  'transition-colors',
                  i < Math.floor(rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-neutral-300'
                )}
              />
            ))}
          </div>
          <span className="text-xs text-neutral-600">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-lg font-bold text-neutral-900">${price.toFixed(2)}</span>
          {originalPrice && (
            <span className="text-sm text-neutral-500 line-through">${originalPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={onAddCart}
          variant="default"
          size="sm"
          className="w-full mt-auto"
        >
          <ShoppingCart size={16} className="mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
