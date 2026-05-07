import React from 'react';
import { Star, Minus, Plus, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

interface ProductDetailProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  images: ProductImage[];
  description: string;
  highlights?: string[];
  inStock: boolean;
  quantity?: number;
  onAddCart?: (quantity: number) => void;
  onAddWishlist?: () => void;
  isWishlisted?: boolean;
}

interface ImageGalleryProps {
  images: ProductImage[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [zoom, setZoom] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ x, y });
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="bg-neutral-100 rounded-xl overflow-hidden aspect-square relative group cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={images[selectedIndex]?.url}
          alt={images[selectedIndex]?.alt || 'Product'}
          className={cn(
            'w-full h-full object-cover transition-transform duration-300',
            isZoomed ? 'scale-200 cursor-zoom-out' : ''
          )}
          style={isZoomed ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : {}}
        />
        {isZoomed && (
          <div className="absolute inset-0 pointer-events-none border-2 border-indigo-400" />
        )}
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
              selectedIndex === index
                ? 'border-indigo-600'
                : 'border-neutral-200 hover:border-neutral-300'
            )}
          >
            <img
              src={image.url}
              alt={image.alt || `Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

const ProductDetail: React.FC<ProductDetailProps> = ({
  id,
  title,
  price,
  originalPrice,
  rating,
  reviewCount,
  images,
  description,
  highlights,
  inStock,
  onAddCart,
  onAddWishlist,
  isWishlisted,
}) => {
  const [quantity, setQuantity] = React.useState(1);
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Image Gallery */}
      <div>
        <ImageGallery images={images} />
      </div>

      {/* Details */}
      <div className="flex flex-col">
        {/* Rating */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}
              />
            ))}
          </div>
          <span className="text-sm text-neutral-600">({reviewCount} reviews)</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">{title}</h1>

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-neutral-200">
          <span className="text-3xl font-bold text-neutral-900">${price.toFixed(2)}</span>
          {originalPrice && (
            <>
              <span className="text-lg text-neutral-500 line-through">${originalPrice.toFixed(2)}</span>
              <span className="text-sm font-semibold text-red-600">Save {discount}%</span>
            </>
          )}
        </div>

        {/* Description */}
        <p className="text-neutral-700 text-base leading-relaxed mb-6">{description}</p>

        {/* Highlights */}
        {highlights && highlights.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-neutral-900 mb-3">Key Features</h3>
            <ul className="space-y-2">
              {highlights.map((highlight, index) => (
                <li key={index} className="flex gap-3 text-neutral-700">
                  <span className="text-indigo-600 font-bold flex-shrink-0">✓</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Stock Status */}
        <div className={cn(
          'mb-6 px-3 py-2 rounded-lg text-sm font-medium w-fit',
          inStock
            ? 'bg-green-50 text-green-800'
            : 'bg-red-50 text-red-800'
        )}>
          {inStock ? '✓ In Stock' : 'Out of Stock'}
        </div>

        {/* Quantity Selector */}
        {inStock && (
          <div className="flex items-center gap-4 mb-6">
            <span className="text-neutral-700 font-medium">Quantity:</span>
            <div className="flex items-center gap-3 border border-neutral-300 rounded-lg p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-neutral-100 rounded transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-neutral-100 rounded transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <Button
            onClick={() => onAddCart?.(quantity)}
            disabled={!inStock}
            variant="default"
            size="lg"
            className="w-full"
          >
            Add to Cart
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={onAddWishlist}
              variant="outline"
              size="lg"
              className="flex-1"
              icon={<Heart size={18} className={isWishlisted ? 'fill-current' : ''} />}
            >
              Save
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              icon={<Share2 size={18} />}
            >
              Share
            </Button>
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-3 pt-8 border-t border-neutral-200">
          <div className="flex gap-3">
            <Truck size={20} className="text-indigo-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-neutral-900">Free Shipping</p>
              <p className="text-sm text-neutral-600">On orders over $50</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Shield size={20} className="text-indigo-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-neutral-900">Secure Payment</p>
              <p className="text-sm text-neutral-600">SSL encrypted transactions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <RotateCcw size={20} className="text-indigo-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-neutral-900">30-Day Returns</p>
              <p className="text-sm text-neutral-600">Easy returns & exchanges</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
