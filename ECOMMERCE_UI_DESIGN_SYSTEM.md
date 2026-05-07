"""
═══════════════════════════════════════════════════════════════════════════════
            MODERN, HIGH-CONVERTING eCOMMERCE UI/UX DESIGN SYSTEM
═══════════════════════════════════════════════════════════════════════════════

DESIGN PHILOSOPHY
─────────────────────────────────────────────────────────────────────────────
Inspired by: Apple, Amazon, Stripe
Principles:
  ✓ Clean, minimal, premium aesthetic
  ✓ Soft shadows & rounded corners
  ✓ Proper whitespace & typography
  ✓ Fully responsive (mobile, tablet, desktop)
  ✓ High-converting, intuitive UX
  ✓ Accessibility-first approach
  ✓ Loading states & error handling

COLOR PALETTE
─────────────────────────────────────────────────────────────────────────────
Primary:       Indigo (6366f1) - Brand color for CTAs, highlights
Neutral:       Grays (White to Dark Gray) - Backgrounds, text, borders
Success:       Green (10b981) - Confirmations, positive actions
Error:         Red (ef4444) - Errors, destructive actions
Warning:       Orange (f59e0b) - Warnings, caution messages
Info:          Blue (3b82f6) - Information, neutral actions

TYPOGRAPHY SYSTEM
─────────────────────────────────────────────────────────────────────────────
H1: 4xl-5xl font-bold (Hero titles)
H2: 3xl-4xl font-bold (Page sections)
H3: 2xl-3xl font-semibold (Section headers)
H4: xl-2xl font-semibold (Subsections)
Body: base text-neutral-700 (Regular text)
Small: sm text-neutral-600 (Secondary text)
Label: sm font-medium text-neutral-700 (Form labels)

SPACING SYSTEM
─────────────────────────────────────────────────────────────────────────────
Padding:  4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
Margins:  Same as padding
Gap:      4px, 8px, 12px, 16px, 24px, 32px
Rounded:  6px (sm), 8px (base), 12px (md), 16px (lg), 24px (xl)

═══════════════════════════════════════════════════════════════════════════════
                            COMPONENT LIBRARY
═══════════════════════════════════════════════════════════════════════════════

SHARED COMPONENTS
─────────────────────────────────────────────────────────────────────────────

1. ProductCard
   Location: /src/components/shared/ProductCard.tsx
   Features:
     - Image with hover zoom effect
     - Star rating with review count
     - Price with discount badge
     - Add to cart button
     - Wishlist toggle
     - Responsive grid layout
   Usage:
     <ProductCard
       id="123"
       image="https://..."
       title="Premium Headphones"
       price={199.99}
       originalPrice={299.99}
       rating={4.5}
       reviewCount={128}
       badge="New"
       badgeColor="success"
       onAddCart={() => {}}
       onFavorite={() => {}}
       isFavorite={false}
     />

2. Hero Section
   Location: /src/components/shared/Hero.tsx
   Features:
     - Full-screen hero with background image
     - Gradient overlay
     - Large headline with subtitle
     - Primary & secondary CTAs
     - Animated scroll indicator
     - Fully responsive
   Usage:
     <Hero
       title="Welcome to Premium Shopping"
       subtitle="Discover curated products for modern living"
       primaryCTA={{ text: "Shop Now", onClick: () => {} }}
       secondaryCTA={{ text: "Learn More", onClick: () => {} }}
     />

3. Category Grid
   Location: /src/components/shared/CategoryGrid.tsx
   Features:
     - Responsive grid (2-6 columns)
     - Icon-based categories
     - Product count display
     - Hover animations
     - Image overlay support
   Usage:
     <CategoryGrid
       categories={[
         { id: "1", name: "Electronics", icon: "📱" },
         { id: "2", name: "Fashion", icon: "👕" },
       ]}
       onCategoryClick={(id) => {}}
       columns={4}
     />

4. Testimonials
   Location: /src/components/shared/Testimonials.tsx
   Features:
     - Star ratings
     - Customer quotes
     - Avatar with name/role
     - Responsive grid
     - Hover effects
   Usage:
     <Testimonials
       testimonials={[
         {
           id: "1",
           name: "John Doe",
           role: "CEO",
           content: "Great product!",
           rating: 5,
           avatar: "https://...",
         },
       ]}
     />

5. Newsletter
   Location: /src/components/shared/Newsletter.tsx
   Features:
     - Email input with validation
     - Subscribe button
     - Loading state
     - Success/error toast
     - Privacy notice
   Usage:
     <Newsletter
       title="Stay Updated"
       subtitle="Get exclusive offers..."
       onSubscribe={async (email) => {}}
     />

6. Section Wrapper
   Location: /src/components/shared/Section.tsx
   Features:
     - Consistent spacing
     - Max-width container
     - Optional title & subtitle
     - Heading alignment control
   Usage:
     <Section
       title="Featured Products"
       subtitle="Explore our bestsellers"
       headingAlignment="center"
     >
       {children}
     </Section>

7. Product Detail
   Location: /src/components/shared/ProductDetail.tsx
   Features:
     - Image gallery with zoom
     - Thumbnail carousel
     - Rating & reviews count
     - Price with discount
     - Quantity selector
     - Add to cart & wishlist
     - Key features list
     - Trust badges (shipping, returns, secure)
   Usage:
     <ProductDetail
       id="123"
       title="Premium Headphones"
       price={199.99}
       originalPrice={299.99}
       rating={4.5}
       reviewCount={128}
       images={[...]}
       description="..."
       highlights={[...]}
       inStock={true}
       onAddCart={(qty) => {}}
       onAddWishlist={() => {}}
     />

8. Cart
   Location: /src/components/shared/Cart.tsx
   Features:
     - Cart item list with images
     - Quantity controls (+ / -)
     - Remove item button
     - Order summary
     - Subtotal, shipping, tax, total
     - Free shipping threshold
     - Checkout button
   Usage:
     <Cart
       items={cartItems}
       onUpdateQuantity={(id, qty) => {}}
       onRemoveItem={(id) => {}}
       onCheckout={() => {}}
       isEmpty={false}
     />

9. Checkout
   Location: /src/components/shared/Checkout.tsx
   Features:
     - Shipping form (address, city, state, postal, country)
     - Payment method selection (Card / PayPal)
     - Card details form (name, number, expiry, CVV)
     - Form validation with Zod
     - Order summary sidebar
     - Security badge
   Usage:
     <Checkout
       orderSummary={{
         subtotal: 199.99,
         shipping: 0,
         tax: 20,
         total: 219.99,
         items: [...],
       }}
       onSubmit={async (data) => {}}
       isLoading={false}
     />

10. Dashboard Stats
    Location: /src/components/shared/DashboardStats.tsx
    Features:
      - Stat cards with icons
      - Trend indicators (up/down)
      - Percentage change
      - Color-coded by role
      - Responsive grid
    Usage:
      <DashboardStats role="user|seller|admin" />

11. Dashboard Tables
    Location: /src/components/shared/DashboardTables.tsx
    Features:
      - OrdersTable: Order list with status badges
      - ProductsTable: Product inventory list
      - Loading skeletons
      - Action buttons (view, edit, delete)
      - Responsive scrolling
    Usage:
      <OrdersTable
        orders={orders}
        onView={(id) => {}}
        onEdit={(id) => {}}
        onDelete={(id) => {}}
      />
      <ProductsTable
        products={products}
        onEdit={(id) => {}}
        onDelete={(id) => {}}
      />

12. Dashboard Sidebar
    Location: /src/components/shared/DashboardSidebar.tsx
    Features:
      - Role-based navigation (user/seller/admin)
      - Active state highlighting
      - Mobile responsive with hamburger
      - Backdrop overlay
      - Logout button
    Usage:
      <DashboardSidebar
        role="seller"
        onLogout={() => {}}
      />

═══════════════════════════════════════════════════════════════════════════════
                             PAGE STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

1. HOME PAGE (/)
   Sections:
     ✓ Hero with CTA
     ✓ Featured Products (6 products grid)
     ✓ Categories Grid (electronics, fashion, home, sports, etc.)
     ✓ Top Deals / Discounts
     ✓ Testimonials (customer reviews)
     ✓ Newsletter Subscription
     ✓ Footer with links

   Components Used:
     - Hero
     - ProductCard (featured)
     - CategoryGrid
     - Newsletter
     - Footer (existing)

2. PRODUCTS PAGE (/products)
   Features:
     ✓ Grid layout (2 cols mobile, 4 cols desktop)
     ✓ Filters: Category, Price range, Rating
     ✓ Search bar
     ✓ Sort options (newest, price, popularity)
     ✓ Pagination
     ✓ Product cards with hover effects

   Components Used:
     - ProductCard (grid)
     - Filter sidebar
     - Sort dropdown
     - Search input

3. PRODUCT DETAILS (/products/[id])
   Features:
     ✓ Image gallery with zoom
     ✓ Product info (title, price, rating)
     ✓ Add to cart button
     ✓ Wishlist toggle
     ✓ Share button
     ✓ Key features list
     ✓ Reviews section
     ✓ Related products
     ✓ Trust badges

   Components Used:
     - ProductDetail
     - Reviews section
     - Related products (ProductCard grid)

4. CART PAGE (/shop/cart)
   Features:
     ✓ Product list with images
     ✓ Quantity controls
     ✓ Remove item buttons
     ✓ Subtotal, shipping, tax, total
     ✓ Free shipping threshold notice
     ✓ Checkout button
     ✓ Continue shopping link

   Components Used:
     - Cart
     - Navbar
     - Footer

5. CHECKOUT PAGE (/shop/checkout)
   Features:
     ✓ Shipping form (validated)
     ✓ Payment method selection
     ✓ Card details form
     ✓ Order summary
     ✓ Security badge
     ✓ Submit button

   Components Used:
     - Checkout
     - Navbar
     - Footer

6. DASHBOARD - USER (/dashboard)
   Sections:
     ✓ Welcome message
     ✓ Dashboard stats (orders, total spent)
     ✓ Recent orders table
     ✓ Quick actions

   Sub-pages:
     - /dashboard/orders - Full order history
     - /dashboard/wishlist - Saved items
     - /dashboard/settings - Account settings

   Components Used:
     - DashboardSidebar
     - DashboardStats
     - OrdersTable

7. DASHBOARD - SELLER (/seller)
   Sections:
     ✓ Revenue overview
     ✓ Sales stats (products, orders, revenue)
     ✓ Recent orders
     ✓ Top products

   Sub-pages:
     - /seller/products - Manage products
     - /seller/orders - Order management
     - /seller/analytics - Sales analytics
     - /seller/settings - Store settings

   Components Used:
     - DashboardSidebar
     - DashboardStats
     - ProductsTable
     - OrdersTable
     - Charts (Recharts)

8. DASHBOARD - ADMIN (/admin)
   Sections:
     ✓ Platform overview
     ✓ System stats (users, revenue, products, orders)
     ✓ Recent orders
     ✓ User management

   Sub-pages:
     - /admin/users - User management
     - /admin/products - Product moderation
     - /admin/orders - Order management
     - /admin/analytics - Platform analytics
     - /admin/settings - System settings

   Components Used:
     - DashboardSidebar
     - DashboardStats
     - OrdersTable
     - ProductsTable
     - Charts

═══════════════════════════════════════════════════════════════════════════════
                          UX BEST PRACTICES IMPLEMENTED
═══════════════════════════════════════════════════════════════════════════════

1. LOADING STATES
   ✓ Skeleton loaders for tables
   ✓ Button loading state with spinner
   ✓ Image loading placeholders
   ✓ Progressive enhancement

2. ERROR STATES
   ✓ Friendly error messages
   ✓ Form validation feedback
   ✓ Empty state illustrations
   ✓ Error toast notifications

3. ACCESSIBILITY
   ✓ ARIA labels on buttons
   ✓ Semantic HTML
   ✓ Keyboard navigation
   ✓ Color contrast compliance
   ✓ Focus indicators
   ✓ Alt text on images

4. RESPONSIVE DESIGN
   ✓ Mobile-first approach
   ✓ Breakpoints: mobile (< 640px), tablet (640px+), desktop (1024px+)
   ✓ Touch-friendly spacing (min 44px for buttons)
   ✓ Fluid typography

5. PERFORMANCE
   ✓ Image optimization
   ✓ Lazy loading
   ✓ CSS class utilities (Tailwind)
   ✓ Efficient animations (no janky transitions)

6. CONVERSION OPTIMIZATION
   ✓ Clear, compelling CTAs
   ✓ Trust signals (security badges, free shipping, reviews)
   ✓ Simple checkout flow
   ✓ Social proof (testimonials, reviews)
   ✓ Urgency signals (limited edition, deals)

═══════════════════════════════════════════════════════════════════════════════
                            INTEGRATION GUIDE
═══════════════════════════════════════════════════════════════════════════════

STEP 1: Import Components
┌─────────────────────────────────────────────────────────────────────────────┐
│ import ProductCard from '@/components/shared/ProductCard';                   │
│ import { DashboardStats } from '@/components/shared/DashboardStats';         │
│ import { OrdersTable } from '@/components/shared/DashboardTables';           │
│ import DashboardSidebar from '@/components/shared/DashboardSidebar';         │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 2: Connect to API
┌─────────────────────────────────────────────────────────────────────────────┐
│ // Fetch products from /api/v1/products                                      │
│ const response = await fetch('/api/v1/products');                            │
│ const { data } = await response.json();                                      │
│                                                                               │
│ // Fetch orders from /api/v1/orders                                          │
│ const orders = await fetch('/api/v1/orders');                                │
│                                                                               │
│ // Implement cart management with Zustand store                              │
│ const { addItem, updateQuantity, removeItem } = useCartStore();              │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 3: Add Loading & Error States
┌─────────────────────────────────────────────────────────────────────────────┐
│ const [isLoading, setIsLoading] = useState(false);                           │
│ const [error, setError] = useState<string | null>(null);                     │
│                                                                               │
│ if (isLoading) return <LoadingSkeletons />;                                  │
│ if (error) return <ErrorMessage message={error} />;                          │
│                                                                               │
│ return <ProductGrid products={products} />;                                  │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 4: Implement Form Validation
┌─────────────────────────────────────────────────────────────────────────────┐
│ import { useForm } from 'react-hook-form';                                   │
│ import { zodResolver } from '@hookform/resolvers/zod';                       │
│ import { checkoutSchema } from '@/zod/checkout';                             │
│                                                                               │
│ const { register, handleSubmit, formState: { errors } } = useForm({          │
│   resolver: zodResolver(checkoutSchema),                                     │
│ });                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                              CUSTOMIZATION TIPS
═══════════════════════════════════════════════════════════════════════════════

1. CHANGE COLOR SCHEME
   Edit src/lib/design-tokens.ts and update the colors object.
   All components automatically use the new palette.

2. ADJUST SPACING
   Modify tailwind.config.ts spacing scale or use design-tokens.ts values.

3. CUSTOMIZE TYPOGRAPHY
   Update font in globals.css and typography values in design-tokens.ts.

4. ADD ANIMATIONS
   Components use Tailwind's animation utilities + custom transitions.
   Modify animations in tailwind.config.ts.

5. EXTEND COMPONENTS
   All components are modular and accept className props for customization.

═══════════════════════════════════════════════════════════════════════════════
                              FILE STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

/src/components/shared/
  ├── ProductCard.tsx              ← Product display card
  ├── Hero.tsx                     ← Hero banner section
  ├── CategoryGrid.tsx             ← Category selection
  ├── Testimonials.tsx             ← Customer reviews
  ├── Newsletter.tsx               ← Email subscription
  ├── Section.tsx                  ← Layout wrapper
  ├── ProductDetail.tsx            ← Product detail view
  ├── Cart.tsx                     ← Shopping cart display
  ├── Checkout.tsx                 ← Checkout form
  ├── DashboardStats.tsx           ← Dashboard metrics
  ├── DashboardTables.tsx          ← Orders & products tables
  ├── DashboardSidebar.tsx         ← Navigation sidebar
  ├── Navbar.tsx                   ← Top navigation (existing)
  └── Footer.tsx                   ← Footer (existing)

/src/lib/
  └── design-tokens.ts            ← Design system tokens

═══════════════════════════════════════════════════════════════════════════════

Created with ❤️ for a world-class eCommerce experience.
"""
