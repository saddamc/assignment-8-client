import { serverFetch } from "@/lib/server-fetch";
import Link from "next/link";
import {
  ArrowRight,
  CircleDollarSign,
  Clock3,
  LayoutDashboard,
  Package,
  Percent,
  Plus,
  ShoppingBag,
  Store,
  Ticket,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SellerPeriodCharts from "./SellerPeriodCharts";
import SellerRevenueChart from "./SellerRevenueChart";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SellerStats = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SellerOrder = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SellerProduct = any;

type SellerCoupon = {
  id: string;
  code: string;
  isActive: boolean;
  usedCount?: number;
  maxUses?: number;
  expiresAt?: string;
};

type SellerBalance = {
  grossRevenue: number;
  totalCommission: number;
  totalWithdrawn: number;
  availableBalance: number;
};

const MOCK_STATS: SellerStats = {
  overview: { totalRevenue: 0, totalOrders: 0, totalProducts: 0, pendingOrders: 0 },
  recentOrders: [],
  myProducts: [],
  revenueChart: [
    { month: "Jan", revenue: 1800 },
    { month: "Feb", revenue: 2400 },
    { month: "Mar", revenue: 1900 },
    { month: "Apr", revenue: 3200 },
    { month: "May", revenue: 2800 },
    { month: "Jun", revenue: 3600 },
  ],
  topProducts: [],
};

const FALLBACK_BALANCE: SellerBalance = {
  grossRevenue: 0,
  totalCommission: 0,
  totalWithdrawn: 0,
  availableBalance: 0,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const orderStatusClass = (status: string): string => {
  const map: Record<string, string> = {
    DELIVERED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    CANCELLED: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return map[status] ?? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
};

const stockStatusClass = (stock: number): string => {
  if (stock <= 0) return "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400";
  if (stock <= 5) return "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
};

/**
 * Resolve the canonical order object from a seller-order item.
 * The API can return either a flat order or a nested `{ order: Order }` wrapper.
 */
const resolveOrder = (item: SellerOrder): SellerOrder => item.order ?? item;

/**
 * Calculate the line-item total for a resolved order object.
 * We always operate on the resolved order so we never double-unwrap.
 */
const calcOrderAmount = (order: SellerOrder): number => {
  if (Array.isArray(order.items) && order.items.length > 0) {
    return order.items.reduce(
      (sum: number, item: SellerOrder) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );
  }
  if (typeof order.totalAmount === "number") return order.totalAmount;
  if (typeof order.total === "string") return Number(order.total) || 0;
  if (typeof order.price === "number") return order.price * Number(order.quantity || 1);
  return 0;
};

const isPaidOrder = (order: SellerOrder): boolean =>
  (order.paymentStatus ?? order.order?.paymentStatus) === "PAID";

const parseOrderDate = (item: SellerOrder): Date | null => {
  const raw = item.createdAt ?? item.order?.createdAt ?? item.date_created;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function SellerDashboardPage() {
  let stats: SellerStats = MOCK_STATS;
  let orders: SellerOrder[] = [];
  let products: SellerProduct[] = [];
  let coupons: SellerCoupon[] = [];
  let balance: SellerBalance = FALLBACK_BALANCE;

  try {
    const [analyticsRes, ordersRes, productsRes, couponsRes, balanceRes] = await Promise.allSettled([
      serverFetch.get("/analytics/seller"),
      serverFetch.get("/orders/seller-orders?limit=100"),
      serverFetch.get("/products/my-products?limit=6"),
      serverFetch.get("/coupon/my-coupons"),
      serverFetch.get("/payout/balance"),
    ]);

    if (analyticsRes.status === "fulfilled") {
      const data = await analyticsRes.value.json();
      if (data.success) stats = { ...MOCK_STATS, ...data.data };
    }
    if (ordersRes.status === "fulfilled") {
      const data = await ordersRes.value.json();
      if (data.success) orders = data.data?.data ?? data.data ?? [];
    }
    if (productsRes.status === "fulfilled") {
      const data = await productsRes.value.json();
      if (data.success) products = data.data?.data ?? data.data ?? [];
    }
    if (couponsRes.status === "fulfilled") {
      const data = await couponsRes.value.json();
      if (data.success) coupons = data.data?.data ?? data.data ?? [];
    }
    if (balanceRes.status === "fulfilled") {
      const data = await balanceRes.value.json();
      if (data.success) balance = { ...FALLBACK_BALANCE, ...data.data };
    }
  } catch {
    /* silently fall back to mock data */
  }

  // ─── Derived values ────────────────────────────────────────────────────────

  const overview = stats.overview ?? MOCK_STATS.overview;
  const revenueChart = stats.revenueChart ?? MOCK_STATS.revenueChart;
  const topProducts: SellerProduct[] = stats.topProducts ?? [];
  const recentOrders: SellerOrder[] = orders.length > 0 ? orders : (stats.recentOrders ?? []);
  const myProducts: SellerProduct[] = products.length > 0 ? products : (stats.myProducts ?? []);

  const activeCoupons = coupons.filter((c) => c.isActive).length;

  // Guard against products missing a stock field entirely
  const lowStockCount = myProducts.filter(
    (p: SellerProduct) => typeof p.stock !== "undefined" && Number(p.stock) <= 5
  ).length;

  // Only use topProducts if they carry the expected shape (sales + revenue),
  // otherwise show nothing rather than showing products with wrong schema.
  const displayTopProducts =
    topProducts.length > 0 && typeof topProducts[0].sales !== "undefined"
      ? topProducts.slice(0, 3)
      : [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const allOrderCount = Number(overview.totalOrders || orders.length || 0);
  const totalOrderBase = allOrderCount || 1; // avoid divide-by-zero

  const todayOrders = orders.filter((item) => {
    const d = parseOrderDate(item);
    return d !== null && d >= todayStart;
  });

  const monthlyOrders = orders.filter((item) => {
    const d = parseOrderDate(item);
    return d !== null && d >= monthStart;
  });

  const sumRevenue = (list: SellerOrder[]) =>
    list.reduce((sum, item) => {
      const order = resolveOrder(item);
      return sum + (isPaidOrder(item) ? calcOrderAmount(order) : 0);
    }, 0);

  const periodCards = [
    {
      title: "Today",
      subtitle: "Live performance",
      orders: todayOrders.length,
      revenue: sumRevenue(todayOrders),
      progress: Math.min((todayOrders.length / totalOrderBase) * 100, 100),
      color: "#0f766e",
    },
    {
      title: "Monthly",
      subtitle: "Current month",
      orders: monthlyOrders.length,
      revenue: sumRevenue(monthlyOrders),
      progress: Math.min((monthlyOrders.length / totalOrderBase) * 100, 100),
      color: "#2563eb",
    },
    {
      title: "All Time",
      subtitle: "Overall store totals",
      orders: allOrderCount,
      revenue: Number(overview.totalRevenue || 0),
      progress: allOrderCount > 0 ? 100 : 0,
      color: "#7c3aed",
    },
  ];

  const primaryStats = [
    {
      title: "Revenue",
      value: currency(overview.totalRevenue || 0),
      description: "All-time sales",
      icon: CircleDollarSign,
      tone: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    },
    {
      title: "Orders",
      value: (overview.totalOrders || 0).toLocaleString(),
      description: "Total fulfilled and active",
      icon: ShoppingBag,
      tone: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    },
    {
      title: "Products",
      value: (overview.totalProducts || 0).toLocaleString(),
      description: "Published and draft listings",
      icon: Store,
      tone: "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800",
    },
    {
      title: "Pending",
      value: (overview.pendingOrders || 0).toLocaleString(),
      description: "Orders needing action",
      icon: Clock3,
      tone: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    },
  ];

  const actionCards = [
    {
      href: "/seller/products/new",
      title: "Add product",
      description: "Create a new listing with images, variants, and pricing.",
      icon: Plus,
    },
    {
      href: "/seller/orders",
      title: "Manage orders",
      description: "Update statuses, packing progress, and shipment tracking.",
      icon: ShoppingBag,
    },
    {
      href: "/seller/coupons",
      title: "Run coupons",
      description: "Launch discount codes to increase repeat purchases.",
      icon: Ticket,
    },
    {
      href: "/seller/payouts",
      title: "Review payouts",
      description: "Track balance, withdrawals, and available earnings.",
      icon: Wallet,
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* ── Header ── */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Store dashboard
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            Seller overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
            Today, monthly, and all-time order performance at the top, with the rest of your store controls below.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-2xl px-6">
            <Link href="/seller/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-2xl px-6">
            <Link href="/seller/orders">
              View Orders
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Period charts ── */}
      <SellerPeriodCharts cards={periodCards} />

      {/* ── Primary stat cards ── */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryStats.map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className={`inline-flex rounded-2xl border p-3 ${card.tone}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">{card.title}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {card.value}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{card.description}</p>
          </div>
        ))}
      </section>

      {/* ── Revenue chart + Operational pulse ── */}
      <section className="grid gap-6 xl:grid-cols-[1.65fr_0.95fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                Performance
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Revenue trend
              </h2>
            </div>
            <Link
              href="/seller/analytics"
              className="text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
            >
              Open analytics
            </Link>
          </div>
          <div className="mt-6">
            <SellerRevenueChart data={revenueChart} />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                Store health
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Operational pulse
              </h2>
            </div>
            <TrendingUp className="h-5 w-5 text-teal-700 dark:text-teal-400" />
          </div>

          <div className="mt-6 space-y-4">
            {(
              [
                {
                  label: "Pending orders",
                  value: overview.pendingOrders || 0,
                  helper: "Orders waiting for confirmation or packing",
                  dot: "bg-amber-500",
                },
                {
                  label: "Low stock items",
                  value: lowStockCount,
                  helper: "Products at 5 units or fewer",
                  dot: "bg-rose-500",
                },
                {
                  label: "Active coupons",
                  value: activeCoupons,
                  helper: "Promotions currently available to buyers",
                  dot: "bg-cyan-500",
                },
                {
                  label: "Available payout",
                  value: currency(balance.availableBalance),
                  helper: `${currency(balance.totalCommission)} total commission deducted`,
                  dot: "bg-emerald-500",
                },
              ] as const
            ).map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.helper}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">{item.value}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick actions + Balance snapshot ── */}
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Execution
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Quick actions
            </h2>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {actionCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-3xl border border-slate-200 bg-slate-50/60 p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700 dark:hover:bg-slate-800"
              >
                <div className="inline-flex rounded-2xl bg-slate-900 p-3 text-white dark:bg-slate-50 dark:text-slate-900">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{card.description}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Open
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                Finance
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Balance snapshot
              </h2>
            </div>
            <Wallet className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(
              [
                {
                  label: "Gross revenue",
                  value: currency(balance.grossRevenue),
                  icon: CircleDollarSign,
                  color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                },
                {
                  label: "Commission paid",
                  value: currency(balance.totalCommission),
                  icon: Percent,
                  color: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
                },
                {
                  label: "Withdrawn",
                  value: currency(balance.totalWithdrawn),
                  icon: Wallet,
                  color: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                },
                {
                  label: "Available now",
                  value: currency(balance.availableBalance),
                  icon: TrendingUp,
                  color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
                },
              ] as const
            ).map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800"
              >
                <div className={`inline-flex rounded-2xl p-3 ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest orders + Watchlist + Growth ── */}
      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        {/* Orders table */}
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-5 dark:border-slate-800 lg:px-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                Orders
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Latest orders
              </h2>
            </div>
            <Link
              href="/seller/orders"
              className="text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
            >
              Manage all
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:bg-slate-800/60 dark:text-slate-500">
                    <th className="px-6 py-3 lg:px-7">Order</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Items</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.slice(0, 6).map((item: SellerOrder) => {
                    const order = resolveOrder(item);
                    if (!order?.id) return null;

                    const customerName =
                      order.customer?.name ?? order.customer?.email ?? "Customer";
                    const totalAmount = calcOrderAmount(order);
                    const isCodDue =
                      order.paymentMethod === "COD" && order.paymentStatus !== "PAID";
                    const lineItems = order.items?.length ?? item.quantity ?? 0;

                    return (
                      <tr
                        key={item.id ?? order.id}
                        className="border-t border-slate-100 text-sm text-slate-600 transition-colors hover:bg-slate-50/70 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-6 py-4 lg:px-7">
                          <p className="font-semibold text-slate-900 dark:text-slate-50">
                            #{order.id.slice(-8)}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Recent order"}
                          </p>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                          {customerName}
                        </td>
                        <td className="px-6 py-4">{lineItems}</td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-50">
                            {currency(totalAmount)}
                          </p>
                          <span
                            className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              isCodDue
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            }`}
                          >
                            {isCodDue ? "Due" : "Received"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${orderStatusClass(order.status ?? "PENDING")}`}
                          >
                            {order.status ?? "PENDING"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <ShoppingBag className="mb-3 h-10 w-10 text-slate-200 dark:text-slate-700" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No orders yet. Your next sale will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Product watchlist */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  Inventory
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  Product watchlist
                </h2>
              </div>
              <Link
                href="/seller/products"
                className="text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
              >
                View all
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {myProducts.length > 0 ? (
                myProducts.slice(0, 4).map((product: SellerProduct) => (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">{product.name}</p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          {product.category?.name ?? "Uncategorized"}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${stockStatusClass(Number(product.stock ?? 0))}`}
                      >
                        {Number(product.stock ?? 0) > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-900 dark:text-slate-50">
                        {currency(product.discountPrice ?? product.price ?? 0)}
                      </span>
                      <Link
                        href={`/seller/products/${product.id}/edit`}
                        className="font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No products listed yet.
                </div>
              )}
            </div>
          </div>

          {/* Top products + coupons */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  Growth
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  Top products &amp; coupons
                </h2>
              </div>
              <Package className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </div>

            <div className="mt-6 space-y-5">
              {/* Top movers */}
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Top movers</p>
                <div className="mt-3 space-y-3">
                  {displayTopProducts.length > 0 ? (
                    displayTopProducts.map((product: SellerProduct, index: number) => (
                      <div
                        key={product.id ?? `${product.name}-${index}`}
                        className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60"
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50">{product.name}</p>
                          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            {Number(product.sales ?? product.total_sales ?? 0).toLocaleString()} sold
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {currency(product.revenue ?? 0)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      Top-selling products appear after your first completed orders.
                    </div>
                  )}
                </div>
              </div>

              {/* Coupon activity */}
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Coupon activity</p>
                <div className="mt-3 space-y-3">
                  {coupons.length > 0 ? (
                    coupons.slice(0, 3).map((coupon) => (
                      <div
                        key={coupon.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800"
                      >
                        <div>
                          <p className="font-mono text-sm font-semibold tracking-[0.2em] text-slate-900 dark:text-slate-50">
                            {coupon.code}
                          </p>
                          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            {coupon.usedCount ?? 0}
                            {coupon.maxUses ? ` / ${coupon.maxUses}` : ""} uses
                            {coupon.expiresAt
                              ? ` · ends ${new Date(coupon.expiresAt).toLocaleDateString()}`
                              : ""}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            coupon.isActive
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {coupon.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      No coupons created yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}