import { serverFetch } from "@/lib/server-fetch";
import { ClipboardCheck } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  seller?: { name: string; email: string };
  approval?: { status: string; reviewNote?: string };
  createdAt: string;
};

export default async function AdminProductApprovalsPage() {
  let products: Product[] = [];

  try {
    const res = await serverFetch.get("/product-approval/pending");
    const data = await res.json();
    if (data.success) products = data.data?.data || data.data || [];
  } catch { /* empty */ }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Admin</p>
        <h1 className="text-3xl font-serif font-bold">Product Approvals</h1>
        <p className="text-zinc-400 text-sm mt-1">{products.length} pending review</p>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
          <ClipboardCheck className="w-12 h-12 text-zinc-200 mb-4" />
          <h3 className="text-lg font-bold mb-2">No pending products</h3>
          <p className="text-zinc-400 text-sm">All product submissions are reviewed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex items-center gap-5">
              {product.images?.[0] && (
                <img src={product.images[0]} alt={product.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-zinc-500">${product.price?.toFixed(2)}</p>
                {product.seller && (
                  <p className="text-xs text-zinc-400 mt-0.5">By {product.seller.name} ({product.seller.email})</p>
                )}
                <p className="text-xs text-zinc-400 mt-0.5">Submitted {new Date(product.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700">
                  {product.approval?.status || "PENDING"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
