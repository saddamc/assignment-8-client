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

const MOCK: SellerStats = {
  overview: { totalRevenue: 12450, totalOrders: 142, totalProducts: 38, pendingOrders: 14 },
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
  grossRevenue: 12450,
  totalCommission: 1640,
  totalWithdrawn: 7800,
  availableBalance: 3010,
};

const currency = (value: number) => `$${Number(value || 0).toLocaleString()}`;

const orderStatusClass = (status: string) => {
  if (status === "DELIVERED") return "bg-emerald-50 text-emerald-700";
  if (status === "PENDING") return "bg-amber-50 text-amber-700";
  if (status === "CANCELLED") return "bg-red-50 text-red-700";
  return "bg-indigo-50 text-indigo-700";
};

const stockStatusClass = (stock: number) => {
  if (stock <= 0) return "bg-red-50 text-red-600";
  if (stock <= 5) return "bg-amber-50 text-amber-600";
  return "bg-emerald-50 text-emerald-700";
};

export default async function SellerDashboardPage() {
  let stats: SellerStats = MOCK;
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
      if (data.success) {
        stats = { ...MOCK, ...data.data };
      }
    }

    if (ordersRes.status === "fulfilled") {
      const data = await ordersRes.value.json();
      if (data.success) {
        orders = data.data?.data || data.data || [];
      }
    }

    if (productsRes.status === "fulfilled") {
      const data = await productsRes.value.json();
      if (data.success) {
        products = data.data?.data || data.data || [];
      }
    }

    if (couponsRes.status === "fulfilled") {
      const data = await couponsRes.value.json();
      if (data.success) {
        coupons = data.data?.data || data.data || [];
      }
    }

    if (balanceRes.status === "fulfilled") {
      const data = await balanceRes.value.json();
      if (data.success) {
        balance = { ...FALLBACK_BALANCE, ...data.data };
      }
    }
  } catch { /* use mock */ }

  const overview = stats.overview || MOCK.overview;
  const revenueChart = stats.revenueChart || MOCK.revenueChart;
  const topProducts = stats.topProducts || [];
  const recentOrders = orders.length > 0 ? orders : stats.recentOrders || [];
  const myProducts = products.length > 0 ? products : stats.myProducts || [];

  const activeCoupons = coupons.filter((coupon) => coupon.isActive).length;
  const lowStockCount = myProducts.filter((product: SellerProduct) => Number(product.stock || 0) <= 5).length;
  const avgOrderValue = overview.totalOrders ? overview.totalRevenue / overview.totalOrders : 0;
  const latestTopProducts = topProducts.length > 0 ? topProducts : myProducts.slice(0, 4);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const normalizeOrderDate = (order: SellerOrder) => {
    const rawDate = order.createdAt || order.order?.createdAt || order.date_created;
    return rawDate ? new Date(rawDate) : null;
  };

  const normalizeOrderAmount = (order: SellerOrder) => {
    if (typeof order.totalAmount === "number") return order.totalAmount;
    if (typeof order.order?.totalAmount === "number") return order.order.totalAmount;
    if (typeof order.total === "string") return Number(order.total || 0);
    if (typeof order.price === "number") return order.price * Number(order.quantity || 1);
    return 0;
  };

  const todayOrders = orders.filter((order) => {
    const orderDate = normalizeOrderDate(order);
    return orderDate ? orderDate >= todayStart : false;
  });

  const monthlyOrders = orders.filter((order) => {
    const orderDate = normalizeOrderDate(order);
    return orderDate ? orderDate >= monthStart : false;
  });

  const allOrderCount = Number(overview.totalOrders || orders.length || 0);
  const totalOrderBase = allOrderCount || 1;

  const periodCards = [
    {
      title: "Today",
      subtitle: "Live performance",
      orders: todayOrders.length,
      revenue: todayOrders.reduce((sum, order) => sum + normalizeOrderAmount(order), 0),
      progress: Math.min((todayOrders.length / totalOrderBase) * 100, 100),
      color: "#0f766e",
    },
    {
      title: "Monthly",
      subtitle: "Current month",
      orders: monthlyOrders.length,
      revenue: monthlyOrders.reduce((sum, order) => sum + normalizeOrderAmount(order), 0),
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
      tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      title: "Orders",
      value: (overview.totalOrders || 0).toLocaleString(),
      description: "Total fulfilled and active",
      icon: ShoppingBag,
      tone: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      title: "Products",
      value: (overview.totalProducts || 0).toLocaleString(),
      description: "Published and draft listings",
      icon: Store,
      tone: "bg-violet-50 text-violet-700 border-violet-100",
    },
    {
      title: "Pending",
      value: (overview.pendingOrders || 0).toLocaleString(),
      description: "Orders needing action",
      icon: Clock3,
      tone: "bg-amber-50 text-amber-700 border-amber-100",
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

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
            <LayoutDashboard className="h-3.5 w-3.5" /> Store dashboard
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Seller overview</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Today, monthly, and all-time order performance at the top, with the rest of your store controls below.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-2xl px-6">
            <Link href="/seller/products/new">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-2xl px-6">
            <Link href="/seller/orders">
              View Orders <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <SellerPeriodCharts cards={periodCards} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryStats.map((card) => (
          <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`inline-flex rounded-2xl border p-3 ${card.tone}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-500">{card.title}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.description}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.65fr_0.95fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Performance</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Revenue trend</h2>
            </div>
            <Link href="/seller/analytics" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
              Open analytics
            </Link>
          </div>
          <div className="mt-6">
            <SellerRevenueChart data={revenueChart} />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Store health</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Operational pulse</h2>
            </div>
            <TrendingUp className="h-5 w-5 text-teal-700" />
          </div>

          <div className="mt-6 space-y-4">
            {[
              {
                label: "Pending orders",
                value: overview.pendingOrders || 0,
                helper: "Orders waiting for confirmation or packing",
                tone: "bg-amber-500",
              },
              {
                label: "Low stock items",
                value: lowStockCount,
                helper: "Products at 5 units or fewer",
                tone: "bg-rose-500",
              },
              {
                label: "Active coupons",
                value: activeCoupons,
                helper: "Promotions currently available to buyers",
                tone: "bg-cyan-500",
              },
              {
                label: "Available payout",
                value: currency(balance.availableBalance),
                helper: `${currency(balance.totalCommission)} total commission deducted`,
                tone: "bg-emerald-500",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.helper}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-slate-900">{item.value}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Execution</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Quick actions</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {actionCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-3xl border border-slate-200 bg-slate-50/60 p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md"
              >
                <div className="inline-flex rounded-2xl bg-slate-900 p-3 text-white">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{card.description}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Finance</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Balance snapshot</h2>
            </div>
            <Wallet className="h-5 w-5 text-slate-500" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { label: "Gross revenue", value: currency(balance.grossRevenue), icon: CircleDollarSign, color: "bg-emerald-50 text-emerald-700" },
              { label: "Commission paid", value: currency(balance.totalCommission), icon: Percent, color: "bg-rose-50 text-rose-700" },
              { label: "Withdrawn", value: currency(balance.totalWithdrawn), icon: Wallet, color: "bg-amber-50 text-amber-700" },
              { label: "Available now", value: currency(balance.availableBalance), icon: TrendingUp, color: "bg-cyan-50 text-cyan-700" },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-200 p-5">
                <div className={`inline-flex rounded-2xl p-3 ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-500">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-5 lg:px-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Orders</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Latest orders</h2>
            </div>
            <Link href="/seller/orders" className="text-sm font-semibold text-teal-700 hover:text-teal-800">Manage all</Link>
          </div>

          {recentOrders && recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    <th className="px-6 py-3 lg:px-7">Order</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Items</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.slice(0, 6).map((item: SellerOrder) => {
                    const order = item.order || item;
                    const customerName = order.customer?.name || order.customer?.email || "Customer";
                    const totalAmount = order.totalAmount ?? (item.price || 0) * (item.quantity || 0);
                    const lineItems = order.items?.length ?? item.quantity ?? 0;

                    if (!order) return null;

                    return (
                      <tr key={item.id || order.id} className="border-t border-slate-100 text-sm text-slate-600 transition-colors hover:bg-slate-50/70">
                        <td className="px-6 py-4 lg:px-7">
                          <div>
                            <p className="font-semibold text-slate-900">#{order.id?.slice(-8) || "00000000"}</p>
                            <p className="text-xs text-slate-400">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                : "Recent order"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">{customerName}</td>
                        <td className="px-6 py-4">{lineItems}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{currency(totalAmount || 0)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${orderStatusClass(order.status || "PENDING")}`}>
                            {order.status || "PENDING"}
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
              <ShoppingBag className="mb-3 h-10 w-10 text-slate-200" />
              <p className="text-sm text-slate-500">No orders yet. Your next sale will appear here.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Inventory</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Product watchlist</h2>
              </div>
              <Link href="/seller/products" className="text-sm font-semibold text-teal-700 hover:text-teal-800">View all</Link>
            </div>

            <div className="mt-6 space-y-3">
              {myProducts.length > 0 ? myProducts.slice(0, 4).map((product: SellerProduct) => (
                <div key={product.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{product.category?.name || "Uncategorized"}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stockStatusClass(Number(product.stock || 0))}`}>
                      {Number(product.stock || 0) > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900">{currency(product.discountPrice || product.price || 0)}</span>
                    <Link href={`/seller/products/${product.id}/edit`} className="font-semibold text-slate-600 hover:text-slate-900">Edit</Link>
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-8 text-center text-sm text-slate-500">
                  No products listed yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Growth</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Top products and coupons</h2>
              </div>
              <Package className="h-5 w-5 text-slate-500" />
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-900">Top movers</p>
                <div className="mt-3 space-y-3">
                  {latestTopProducts.length > 0 ? latestTopProducts.slice(0, 3).map((product: SellerProduct, index: number) => (
                    <div key={product.id || `${product.name}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {product.sales || product.total_sales || 0} sold
                        </p>
                      </div>
                      <p className="font-semibold text-slate-900">{currency(product.revenue || product.price || 0)}</p>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                      Top-selling products will appear after your first completed orders.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">Coupon activity</p>
                <div className="mt-3 space-y-3">
                  {coupons.length > 0 ? coupons.slice(0, 3).map((coupon) => (
                    <div key={coupon.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3">
                      <div>
                        <p className="font-mono text-sm font-semibold tracking-[0.2em] text-slate-900">{coupon.code}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {coupon.usedCount || 0}
                          {coupon.maxUses ? ` / ${coupon.maxUses}` : ""} uses
                          {coupon.expiresAt ? ` • ends ${new Date(coupon.expiresAt).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${coupon.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
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


