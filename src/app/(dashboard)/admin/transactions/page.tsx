import { serverFetch } from "@/lib/server-fetch";
import { CreditCard } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Payment = any;

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-700",
  REFUNDED: "bg-blue-50 text-blue-700",
};

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = params.page || "1";

  let payments: Payment[] = [];
  let total = 0;

  try {
    const res = await serverFetch.get(`/payments?page=${page}&limit=20`);
    const data = await res.json();
    if (data.success) {
      payments = data.data?.data || data.data || [];
      total = data.data?.meta?.total || payments.length;
    }
  } catch { /* empty state */ }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">
          Finance
        </p>
        <h1 className="text-3xl font-serif font-bold">Transactions</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {total} payment transactions
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
          <CreditCard className="w-12 h-12 text-zinc-200 mb-4" />
          <h3 className="text-lg font-bold mb-2">No transactions yet</h3>
          <p className="text-zinc-400 text-sm">
            Payment records will appear here once orders are placed.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-zinc-50 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {payments.map((payment: Payment) => {
                  const statusKey = (payment.status || "PENDING").toUpperCase();
                  return (
                    <tr
                      key={payment.id}
                      className="hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                        #{payment.id?.slice(-12) || payment.transactionId?.slice(-12)}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                        #{payment.orderId?.slice(-10) || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">
                          {payment.order?.customer?.name ||
                            payment.customerName ||
                            "Customer"}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {payment.order?.customer?.email || ""}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        ${(payment.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 capitalize">
                        {payment.method || payment.paymentMethod || "card"}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-xs">
                        {payment.createdAt
                          ? new Date(payment.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
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

          <div className="px-6 py-4 border-t bg-zinc-50 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Showing {payments.length} of {total}
            </p>
            <div className="flex gap-2">
              {Number(page) > 1 && (
                <a
                  href={`/admin/transactions?page=${Number(page) - 1}`}
                  className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-white transition-colors"
                >
                  Previous
                </a>
              )}
              {payments.length === 20 && (
                <a
                  href={`/admin/transactions?page=${Number(page) + 1}`}
                  className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-white transition-colors"
                >
                  Next
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
