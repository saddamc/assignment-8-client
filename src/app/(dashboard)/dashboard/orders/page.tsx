import { serverFetch } from "@/lib/server-fetch";
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Order = any;

export default async function CustomerOrdersPage() {
  let orders: Order[] = [];

  try {
    const res = await serverFetch.get("/orders/my-orders");
    const data = await res.json();
    if (data.success) orders = data.data?.data || data.data || [];
  } catch { /* show empty state */ }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">My Account</p>
        <h1 className="text-3xl font-serif font-bold">Order History</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
          <Package className="w-12 h-12 text-zinc-200 mb-4" />
          <h3 className="text-lg font-bold mb-2">No orders yet</h3>
          <p className="text-zinc-400 text-sm mb-6">When you place an order, it will appear here.</p>
          <Link href="/products" className="px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-colors flex items-center gap-2">
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-50">
                <div>
                  <p className="text-xs font-mono text-zinc-400">Order #{order.id?.slice(-12)}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-lg">${(order.totalAmount || 0).toFixed(2)}</span>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    order.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700" :
                    order.status === "PENDING" ? "bg-amber-50 text-amber-700" :
                    order.status === "CANCELLED" ? "bg-red-50 text-red-700" :
                    "bg-indigo-50 text-indigo-700"
                  }`}>{order.status}</span>
                </div>
              </div>
              {order.items && order.items.length > 0 && (
                <div className="px-6 py-4 divide-y divide-zinc-50">
                  {order.items.map((item: Order) => (
                    <div key={item.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-semibold text-sm">{item.product?.name || item.productName || "Product"}</p>
                        <p className="text-xs text-zinc-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-sm">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
