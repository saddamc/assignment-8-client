import { serverFetch } from "@/lib/server-fetch";
import { ShoppingBag } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Order = any;

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default async function SellerOrdersPage() {
  let orders: Order[] = [];

  try {
    const res = await serverFetch.get("/orders/seller-orders");
    const data = await res.json();
    if (data.success) orders = data.data?.data || data.data || [];
  } catch { /* empty state */ }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">
          Sales
        </p>
        <h1 className="text-3xl font-serif font-bold">Orders</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {orders.length} total order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
          <ShoppingBag className="w-12 h-12 text-zinc-200 mb-4" />
          <h3 className="text-lg font-bold mb-2">No orders yet</h3>
          <p className="text-zinc-400 text-sm">
            When customers purchase your products, orders will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-zinc-50 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {orders.map((order: Order) => {
                  const statusKey = (order.status || "PENDING").toUpperCase();
                  return (
                    <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                        #{order.id?.slice(-12)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">
                          {order.customer?.name ||
                            order.customerName ||
                            "Customer"}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {order.customer?.email || ""}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-zinc-600">
                        {order.items?.length ?? 0} item
                        {(order.items?.length ?? 0) !== 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4 font-bold">
                        ${(order.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-xs">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "numeric" }
                            )
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            STATUS_STYLES[statusKey] || "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {statusKey}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
