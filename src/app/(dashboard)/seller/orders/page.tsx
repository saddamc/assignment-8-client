import { serverFetch } from "@/lib/server-fetch";
import SellerOrdersClient, { SellerOrder } from "./SellerOrdersClient";

export default async function SellerOrdersPage() {
    let orders: SellerOrder[] = [];

    try {
        const res = await serverFetch.get("/orders/seller-orders?limit=100");
        const data = await res.json();
        if (data.success) orders = data.data?.data || data.data || [];
    } catch { /* empty state */ }

    return <SellerOrdersClient initialOrders={orders} />;
}

