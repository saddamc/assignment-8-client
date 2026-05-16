"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, Download, FileText, Printer, User, CreditCard } from "lucide-react";

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    images?: string[];
  };
}

export interface Order {
  id: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress?: string;
  contactNumber?: string;
  createdAt: string;
  updatedAt: string;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  notes?: string;
  items: OrderItem[];
  customer?: {
    name: string;
    email: string;
    contactNumber?: string;
    address?: string;
  };
  shipment?: {
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
  };
}

interface SellerOrderDetailsClientProps {
  order: Order;
}

const formatCurrency = (value: number | undefined) => `$${Number(value || 0).toFixed(2)}`;
const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

const createXlsFile = (order: Order) => {
  const subtotal = order.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const paymentDue = order.paymentMethod === "COD" && order.paymentStatus !== "PAID" ? order.totalAmount : 0;

  const metadataRows = [
    ["Order No", order.id],
    ["Created At", formatDate(order.createdAt)],
    ["Customer", order.customer?.name || order.customerEmail],
    ["Customer Email", order.customer?.email || order.customerEmail],
    ["Contact", order.contactNumber || "-"],
    ["Shipping Address", order.shippingAddress || order.customer?.address || "-"],
    ["Payment Method", order.paymentMethod],
    ["Payment Status", order.paymentStatus],
    ["Subtotal", formatCurrency(subtotal)],
    ["Shipping Cost", formatCurrency(order.shippingAmount)],
    ["Payment Due", formatCurrency(paymentDue)],
    ["Grand Total", formatCurrency(order.totalAmount)],
  ];

  const detailsTable = metadataRows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px;border:1px solid #ddd;background:#f9fafb;font-weight:600">${label}</td><td style="padding:4px;border:1px solid #ddd">${value}</td></tr>`
    )
    .join("");

  const itemsHeader = `
    <tr>
      <th style="padding:6px;border:1px solid #ddd;background:#f3f4f6">SL</th>
      <th style="padding:6px;border:1px solid #ddd;background:#f3f4f6">Product</th>
      <th style="padding:6px;border:1px solid #ddd;background:#f3f4f6">Quantity</th>
      <th style="padding:6px;border:1px solid #ddd;background:#f3f4f6">Unit Price</th>
      <th style="padding:6px;border:1px solid #ddd;background:#f3f4f6">Total</th>
    </tr>
  `;

  const itemsRows = order.items
    .map((item, idx) => {
      const total = Number(item.price || 0) * Number(item.quantity || 0);
      return `
        <tr>
          <td style="padding:4px;border:1px solid #ddd">${idx + 1}</td>
          <td style="padding:4px;border:1px solid #ddd">${item.product?.name || "Item"}</td>
          <td style="padding:4px;border:1px solid #ddd">${item.quantity}</td>
          <td style="padding:4px;border:1px solid #ddd">${formatCurrency(item.price)}</td>
          <td style="padding:4px;border:1px solid #ddd">${formatCurrency(total)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table style="border-collapse:collapse;margin-bottom:20px;">
          ${detailsTable}
        </table>
        <table style="border-collapse:collapse;">
          ${itemsHeader}
          ${itemsRows}
        </table>
      </body>
    </html>
  `;
};

export default function SellerOrderDetailsClient({ order }: SellerOrderDetailsClientProps) {
  const orderSubtotal = useMemo(
    () => order.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [order.items]
  );

  const isDue = order.paymentMethod === "COD" && order.paymentStatus !== "PAID";
  const paymentDue = isDue ? order.totalAmount : 0;

  const saveXls = () => {
    const html = createXlsFile(order);
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `order-${order.id.slice(-8)}.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const savePdf = () => {
    window.print();
  };

  const printOrder = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-purple-700">
            <ArrowLeft className="h-4 w-4" />
            <Link href="/seller/orders" className="font-semibold underline-offset-4 hover:underline">
              Back to orders
            </Link>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Order Details</h1>
            <p className="text-sm text-slate-500">Courier copy with buyer details, payment, and order line items.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={printOrder}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            type="button"
            onClick={savePdf}
            className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
          >
            <FileText className="h-4 w-4" />
            Save PDF
          </button>
          <button
            type="button"
            onClick={saveXls}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            <Download className="h-4 w-4" />
            Download XLS
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-800 font-semibold mb-4">
            <User className="h-4 w-4" /> Buyer Details
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-900">Name:</span> {order.customer?.name || "N/A"}</p>
            <p><span className="font-semibold text-slate-900">Email:</span> {order.customer?.email || order.customerEmail || "N/A"}</p>
            <p><span className="font-semibold text-slate-900">Phone:</span> {order.contactNumber || order.customer?.contactNumber || "N/A"}</p>
            <p><span className="font-semibold text-slate-900">Address:</span> {order.shippingAddress || order.customer?.address || "N/A"}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-800 font-semibold mb-4">
            <CreditCard className="h-4 w-4" /> Payment
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-900">Method:</span> {order.paymentMethod || "N/A"}</p>
            <p><span className="font-semibold text-slate-900">Status:</span> {order.paymentStatus || "N/A"}</p>
            <p><span className="font-semibold text-slate-900">Payment Due:</span> {formatCurrency(paymentDue)}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-slate-800 font-semibold mb-4">Order Details</div>
          <div className="space-y-2 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-900">Order No:</span> #{String(order.id || "").slice(-8).toUpperCase()}</p>
            <p><span className="font-semibold text-slate-900">Date:</span> {formatDate(order.createdAt)}</p>
            <p><span className="font-semibold text-slate-900">Status:</span> {String(order.status || "PENDING").replaceAll("_", " ")}</p>
            <p><span className="font-semibold text-slate-900">Items:</span> {order.items.length}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Order Items</h2>
          <p className="text-sm text-slate-500">Total {order.items.length} products</p>
        </div>

        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="border-b border-slate-200 px-4 py-3">SL</th>
              <th className="border-b border-slate-200 px-4 py-3">Product</th>
              <th className="border-b border-slate-200 px-4 py-3">Qty</th>
              <th className="border-b border-slate-200 px-4 py-3">Unit Price</th>
              <th className="border-b border-slate-200 px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="px-4 py-4 text-slate-700">{idx + 1}</td>
                <td className="px-4 py-4 text-slate-700">{item.product?.name || "Product"}</td>
                <td className="px-4 py-4 text-slate-700">{item.quantity}</td>
                <td className="px-4 py-4 text-slate-700">{formatCurrency(item.price)}</td>
                <td className="px-4 py-4 font-semibold text-slate-900">{formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 max-w-sm ml-auto space-y-2 border-t border-slate-200 pt-4 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold">{formatCurrency(orderSubtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Shipping Cost</span>
            <span className="font-semibold">{formatCurrency(order.shippingAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Payment Due</span>
            <span className="font-semibold">{formatCurrency(paymentDue)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base text-slate-900 font-semibold">
            <span>Grand Total</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
