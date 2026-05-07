import { serverFetch } from "@/lib/server-fetch";
import NewProductForm from "./NewProductForm";

interface Category {
  id: string;
  name: string;
}

export default async function NewProductPage() {
  let categories: Category[] = [];
  try {
    const res = await serverFetch.get("/products/categories");
    const data = await res.json();
    if (data.success) categories = data.data || [];
  } catch { /* empty */ }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">
          Inventory
        </p>
        <h1 className="text-3xl font-serif font-bold">List New Product</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Fill in the details below to add a product to your store.
        </p>
      </div>

      <NewProductForm categories={categories} />
    </div>
  );
}
