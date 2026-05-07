/**
 * EXAMPLE - Modern Home Page Implementation
 * 
 * Shows complete home page with all premium sections:
 * Hero → Featured Products → Categories → Deals → Testimonials → Newsletter → Footer
 */

'use client';

import { useRouter } from 'next/navigation';
import Hero from '@/components/shared/Hero';
import Section from '@/components/shared/Section';
import ProductCard from '@/components/shared/ProductCard';
import CategoryGrid from '@/components/shared/CategoryGrid';
import Testimonials from '@/components/shared/Testimonials';
import Newsletter from '@/components/shared/Newsletter';
import Navbar from '@/components/Home/Navbar';
import Footer from '@/components/Home/Footer';
import { Zap, Smartphone, Watch, Headphones, Keyboard, Battery } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data
const FEATURED_PRODUCTS = [
  {
    id: '1',
    title: 'Premium Wireless Headphones',
    price: 199.99,
    originalPrice: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    rating: 4.5,
    reviewCount: 328,
    badge: 'Best Seller',
  },
  {
    id: '2',
    title: 'Smart Watch Pro',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    rating: 4.8,
    reviewCount: 512,
    badge: 'New',
  },
  {
    id: '3',
    title: '4K Webcam',
    price: 89.99,
    originalPrice: 129.99,
    image: 'https://images.unsplash.com/photo-1598761681033-f3aa415d3d5d?w=500&h=500&fit=crop',
    rating: 4.3,
    reviewCount: 156,
    badge: undefined,
  },
  {
    id: '4',
    title: 'USB-C Hub 7-in-1',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=500&fit=crop',
    rating: 4.6,
    reviewCount: 423,
    badge: 'Popular',
  },
  {
    id: '5',
    title: 'Mechanical Keyboard RGB',
    price: 139.99,
    image: 'https://images.unsplash.com/photo-1587829191301-c3019db9e0cb?w=500&h=500&fit=crop',
    rating: 4.7,
    reviewCount: 634,
    badge: undefined,
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
  },
];

const CATEGORIES = [
  { id: '1', name: 'Electronics', icon: '📱', count: 1240 },
  { id: '2', name: 'Computers', icon: '💻', count: 580 },
  { id: '3', name: 'Phones', icon: '📞', count: 320 },
  { id: '4', name: 'Accessories', icon: '🎧', count: 890 },
  { id: '5', name: 'Audio', icon: '🔊', count: 450 },
  { id: '6', name: 'Wearables', icon: '⌚', count: 310 },
];

const DEALS = [
  {
    id: 'd1',
    title: 'Lightning Deals - Save up to 70%',
    subtitle: 'Limited time offers on bestsellers',
    icon: <Zap size={24} className="text-orange-600" />,
    color: 'orange',
  },
  {
    id: 'd2',
    title: 'Free Shipping on $50+',
    subtitle: 'Fast delivery to your door',
    icon: <Smartphone size={24} className="text-blue-600" />,
    color: 'blue',
  },
  {
    id: 'd3',
    title: '30-Day Money Back',
    subtitle: 'No questions asked returns',
    icon: <Headphones size={24} className="text-green-600" />,
    color: 'green',
  },
];

const TESTIMONIALS = [
  {
    id: '1',
    name: 'Alexandra S.',
    role: 'Tech Enthusiast',
    content:
      'Amazing quality and exceptional customer service. The products arrived quickly and exceeded my expectations. Will definitely shop here again!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: '2',
    name: 'Marcus J.',
    role: 'Software Developer',
    content:
      'Best place to buy electronics. Great prices, authentic products, and hassle-free returns. Highly recommended!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
  {
    id: '3',
    name: 'Emily R.',
    role: 'Content Creator',
    content:
      "I've purchased multiple items and each experience was smooth and pleasant. The variety of products is impressive, and prices are competitive.",
    rating: 4.5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
  },
];

export default function HomePage() {
  const router = useRouter();

  const handleShopNow = () => router.push('/products');
  const handleCategoryClick = (id: string) => {
    router.push(`/products?categoryId=${id}`);
  };
  const handleProductClick = (id: string) => {
    router.push(`/products/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* ─── HERO SECTION ─────────────────────────────────────────── */}
        <Hero
          title="Welcome to Premium Tech"
          subtitle="Discover the latest electronics, gadgets, and accessories curated just for you."
          backgroundImage="https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200&h=600&fit=crop"
          primaryCTA={{
            text: 'Shop Now',
            onClick: handleShopNow,
          }}
          secondaryCTA={{
            text: 'View Deals',
            onClick: () => router.push('#deals'),
          }}
        />

        {/* ─── FEATURED PRODUCTS ────────────────────────────────────── */}
        <Section
          title="Featured Products"
          subtitle="Handpicked bestsellers and newest arrivals"
          headingAlignment="center"
          className="bg-neutral-50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_PRODUCTS.map((product) => (
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

          <div className="text-center mt-12">
            <Button onClick={handleShopNow} variant="default" size="lg">
              View All Products
            </Button>
          </div>
        </Section>

        {/* ─── CATEGORIES ───────────────────────────────────────────── */}
        <Section
          title="Shop by Category"
          subtitle="Find exactly what you're looking for"
          headingAlignment="center"
        >
          <CategoryGrid
            categories={CATEGORIES}
            onCategoryClick={handleCategoryClick}
            columns={6}
          />
        </Section>

        {/* ─── TOP DEALS ────────────────────────────────────────────── */}
        <Section
          title="Top Deals"
          subtitle="Unbeatable offers on premium products"
          headingAlignment="center"
          className="bg-neutral-50"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEALS.map((deal) => (
              <div
                key={deal.id}
                className="bg-white rounded-2xl p-8 border-2 border-neutral-200 hover:border-indigo-600 hover:shadow-lg transition-all duration-300 text-center cursor-pointer"
              >
                <div className="mb-4 flex justify-center">{deal.icon}</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{deal.title}</h3>
                <p className="text-neutral-600 text-sm">{deal.subtitle}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── TESTIMONIALS ─────────────────────────────────────────── */}
        <Section
          title="What Our Customers Say"
          subtitle="Real reviews from real customers"
          headingAlignment="center"
        >
          <Testimonials testimonials={TESTIMONIALS} />
        </Section>

        {/* ─── NEWSLETTER ───────────────────────────────────────────── */}
        <Section
          title=""
          className="bg-neutral-50"
          containerClassName="flex justify-center"
        >
          <Newsletter
            title="Stay in the Loop"
            subtitle="Get exclusive deals, new product launches, and insider tips delivered to your inbox."
            onSubscribe={async (email) => {
              console.log('Subscribed:', email);
              // TODO: Call API to subscribe
            }}
          />
        </Section>
      </main>

      <Footer />
    </div>
  );
}
