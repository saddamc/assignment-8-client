import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/server-fetch";
import EditProductForm from "./EditProductForm";

interface Category { id: string; name: string }
interface Brand    { id: string; name: string }

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product = null;
  let rootCategories: Category[] = [];
  let brands: Brand[] = [];

  try {
    const [productRes, catRes, brandRes] = await Promise.all([
      serverFetch.get(`/products/${id}`),
      serverFetch.get("/products/categories?parentId=null&limit=100"),
      serverFetch.get("/products/brands?limit=100"),
    ]);
    const [productData, catData, brandData] = await Promise.all([
      productRes.json(),
      catRes.json(),
      brandRes.json(),
    ]);
    if (productData.success) product = productData.data;
    if (catData.success) rootCategories = catData.data || [];
    if (brandData.success) brands = brandData.data || [];
  } catch { /* will notFound below */ }

  if (!product) notFound();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Inventory</p>
        <h1 className="text-3xl font-serif font-bold">Edit Product</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Update details for <span className="font-semibold text-zinc-700">{product.name}</span>
        </p>
      </div>
      <EditProductForm product={product} rootCategories={rootCategories} brands={brands} />
    </div>
  );
}
