import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/server-fetch";
import SellerOrderDetailsClient from "./SellerOrderDetailsClient";

interface SellerOrderDetailsPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function SellerOrderDetailsPage({ params }: SellerOrderDetailsPageProps) {
  try {
    const { orderId } = await params;
    // Resolve from seller orders list so both full ID and short order number URLs work.
    const listRes = await serverFetch.get("/orders/seller-orders?limit=500");
    const listData = await listRes.json();

    if (!listRes.ok || !listData.success) {
      return notFound();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orders: any[] = listData.data?.data || listData.data || [];
    const input = String(orderId || "").trim().toLowerCase();
    const matchedOrder = orders.find((order) => {
      const fullId = String(order.id || "").toLowerCase();
      const shortId = String(order.id || "").slice(-8).toLowerCase();
      return fullId === input || shortId === input;
    });

    if (!matchedOrder?.id) {
      return notFound();
    }

    return <SellerOrderDetailsClient order={matchedOrder} />;
  } catch (error) {
    return notFound();
  }
}
