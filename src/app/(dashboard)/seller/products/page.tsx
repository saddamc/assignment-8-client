import { serverFetch } from "@/lib/server-fetch";
import SellerProductsClient, { Product } from "./SellerProductsClient";

export default async function SellerProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const statusFilter = status && status !== "ALL" ? `&status=${status}` : "";

  let products: Product[] = [];

  try {
    const res = await serverFetch.get(`/products/my-products?limit=50${statusFilter}`);
    const data = await res.json();
    if (data.success) products = data.data?.data || data.data || [];
  } catch {
    // ignore fetch errors and show empty state
  }

  const activeTab = (status || "ALL").toUpperCase();

  return <SellerProductsClient initialProducts={products} activeTab={activeTab} />;
}
