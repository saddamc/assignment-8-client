"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientFetch } from "@/lib/client-fetch";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleAuthError = (res: Response) => {
    if (res.status === 401) {
      toast.error("Session expired. Please log in again.");
      router.push("/login");
      return true;
    }
    return false;
  };

  const fetchCategories = async () => {
    try {
      const res = await clientFetch("/products/categories?limit=100");
      const data = await res.json();
      if (data.success) setCategories(data.data || []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => { await fetchCategories(); };
    load();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Category name is required"); return; }

    startTransition(async () => {
      try {
        const res = await clientFetch("/products/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
        });
        if (handleAuthError(res)) return;
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed");
        toast.success(`Category "${name}" created`);
        setName("");
        setDescription("");
        await fetchCategories();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  const handleDelete = (id: string, catName: string) => {
    if (!confirm(`Delete category "${catName}"? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        const res = await clientFetch(`/products/categories/${id}`, {
          method: "DELETE",
        });
        if (handleAuthError(res)) return;
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed");
        toast.success(`Category "${catName}" deleted`);
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Catalog</p>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Tag className="w-7 h-7" /> Product Categories
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Categories added here appear in the seller&apos;s &quot;Add Product&quot; form.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
            <h2 className="font-bold text-lg mb-5">Add New Category</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Name *</Label>
                <Input
                  id="cat-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Electronics"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-desc">Description</Label>
                <Input
                  id="cat-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                {isPending ? "Creating..." : "Create Category"}
              </Button>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-bold text-lg">All Categories</h2>
              <span className="text-sm text-zinc-400">{categories.length} total</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-zinc-400">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="p-12 text-center">
                <Tag className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
                <p className="text-zinc-400 font-medium">No categories yet</p>
                <p className="text-zinc-300 text-sm mt-1">Create one using the form on the left.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{cat.name}</p>
                        <p className="text-xs text-zinc-400">
                          {cat.slug && <span className="mr-2">/{cat.slug}</span>}
                          {cat._count?.products != null && (
                            <span>{cat._count.products} product{cat._count.products !== 1 ? "s" : ""}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
