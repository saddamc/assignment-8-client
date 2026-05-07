/**
 * QUICK START EXAMPLE - Product Listing Page
 * 
 * This shows how to implement a modern product listing page using
 * the eCommerce UI components.
 */

'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import Section from '@/components/shared/Section';
import ProductCard from '@/components/shared/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Home/Navbar';
import Footer from '@/components/Home/Footer';

// Example product data structure
interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  inStock: boolean;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Premium Wireless Headphones',
    price: 199.99,
    originalPrice: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    rating: 4.5,
    reviewCount: 328,
    badge: 'Best Seller',
    inStock: true,
  },
  {
    id: '2',
    title: 'Smart Watch Pro',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    rating: 4.8,
    reviewCount: 512,
    badge: 'New',
    inStock: true,
  },
  {
    id: '3',
    title: '4K Webcam',
    price: 89.99,
    originalPrice: 129.99,
    image: 'https://images.unsplash.com/photo-1598761681033-f3aa415d3d5d?w=500&h=500&fit=crop',
    rating: 4.3,
    reviewCount: 156,
    inStock: true,
  },
  {
    id: '4',
    title: 'USB-C Hub 7-in-1',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=500&fit=crop',
    rating: 4.6,
    reviewCount: 423,
    badge: 'Popular',
    inStock: true,
  },
  {
    id: '5',
    title: 'Mechanical Keyboard RGB',
    price: 139.99,
    image: 'https://images.unsplash.com/photo-1587829191301-c3019db9e0cb?w=500&h=500&fit=crop',
    rating: 4.7,
    reviewCount: 634,
    inStock: false,
  },
  {
    id: '6',
    title: 'Portable Charger 65W',
    price: 59.99,
    originalPrice: 79.99,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=500&fit=crop',
    rating: 4.4,
    reviewCount: 278,
    badge: 'Deal',
    inStock: true,
  },
];

const CATEGORIES = [
  { name: 'Electronics', count: 1240 },
  { name: 'Computers', count: 580 },
  { name: 'Phones', count: 320 },
  { name: 'Accessories', count: 890 },
  { name: 'Audio', count: 450 },
];

const PRICE_RANGES = [
  { label: 'Under $100', min: 0, max: 100 },
  { label: '$100 – $500', min: 100, max: 500 },
  { label: '$500 – $1,000', min: 500, max: 1000 },
  { label: 'Over $1,000', min: 1000, max: 999999 },
];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Best Selling', value: 'bestselling' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'toprated' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Handle filter changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handlePriceChange = (range: { min: number; max: number }) => {
    setPriceRange(priceRange?.min === range.min ? null : range);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery);
      const matchesPrice = !priceRange || (p.price >= priceRange.min && p.price <= priceRange.max);
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'toprated':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />

      <main className="flex-1">
        <Section title="Products" subtitle="Browse our extensive collection">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div
              className={`${
                mobileFiltersOpen ? 'block' : 'hidden'
              } lg:block bg-white rounded-xl p-6 border border-neutral-200 h-fit sticky top-20`}
            >
              <h3 className="font-semibold text-lg mb-6 flex items-center justify-between">
                Filters
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="lg:hidden text-neutral-600"
                >
                  ✕
                </button>
              </h3>

              {/* Search */}
              <div className="mb-6">
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  Search
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-neutral-900 mb-3">Categories</h4>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat.name}
                      className="flex items-center gap-3 cursor-pointer hover:bg-neutral-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategory === cat.name}
                        onChange={() => handleCategoryChange(cat.name)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-neutral-700">{cat.name}</span>
                      <span className="text-xs text-neutral-500 ml-auto">({cat.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-neutral-900 mb-3">Price Range</h4>
                <div className="space-y-2">
                  {PRICE_RANGES.map((range) => (
                    <label
                      key={range.label}
                      className="flex items-center gap-3 cursor-pointer hover:bg-neutral-50 p-2 rounded"
                    >
                      <input
                        type="radio"
                        name="price"
                        checked={priceRange?.min === range.min}
                        onChange={() => handlePriceChange(range)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-neutral-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <Button
                onClick={() => {
                  setSelectedCategory(null);
                  setPriceRange(null);
                  setSearchQuery('');
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm text-neutral-600">
                  Showing {filteredProducts.length} products
                </p>

                <div className="flex items-center gap-2">
                  {/* Mobile Filters Button */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg"
                  >
                    <SlidersHorizontal size={16} />
                    Filters
                  </button>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      {...product}
                      onAddCart={() => {
                        console.log(`Added ${product.title} to cart`);
                      }}
                      onFavorite={() => {
                        console.log(`Favorited ${product.title}`);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-neutral-600 mb-4">No products found</p>
                  <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
                </div>
              )}
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
