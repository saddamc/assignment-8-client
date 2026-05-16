import { serverFetch } from "@/lib/server-fetch";
import SellerShippingClient from "./SellerShippingClient";

export default async function SellerShippingPage() {
    // Load seller's existing rules + all categories for dropdown
    const [rulesRes, categoriesRes] = await Promise.all([
        serverFetch.get("/seller-shipping"),
        serverFetch.get("/products/categories?limit=200"),
    ]);

    const rulesData = await rulesRes.json().catch(() => ({ data: [] }));
    const categoriesData = await categoriesRes.json().catch(() => ({ data: [] }));

    const rules = rulesData.success ? rulesData.data : [];
    const categories = categoriesData.success ? (categoriesData.data?.data ?? categoriesData.data ?? []) : [];

    return <SellerShippingClient initialRules={rules} categories={categories} />;
}
