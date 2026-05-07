import { serverFetch } from "@/lib/server-fetch";
import NewProductForm from "./NewProductForm";

interface Category { id: string; name: string }
interface Brand    { id: string; name: string }

export default async function NewProductPage() {
  let rootCategories: Category[] = [];
  let brands: Brand[] = [];

  try {
    const [catRes, brandRes] = await Promise.all([
      serverFetch.get("/products/categories?parentId=null&limit=100"),
      serverFetch.get("/products/brands?limit=100"),
    ]);
    const [catData, brandData] = await Promise.all([catRes.json(), brandRes.json()]);
    if (catData.success) rootCategories = catData.data || [];
    if (brandData.success) brands = brandData.data || [];
  } catch { /* empty */ }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">
          Inventory
        </p>
        <h1 className="text-3xl font-serif font-bold">List New Product</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Complete each step to add a product to your store.
        </p>
      </div>

      <NewProductForm rootCategories={rootCategories} brands={brands} />
    </div>
  );
}
