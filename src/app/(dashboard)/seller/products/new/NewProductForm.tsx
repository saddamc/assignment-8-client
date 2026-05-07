"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  X, Plus, ImagePlus, ChevronRight, ChevronLeft,
  Check, Tag, Package, DollarSign, Image as ImageIcon, Settings, Search,
} from "lucide-react";
import { clientFetch } from "@/lib/client-fetch";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category { id: string; name: string }
interface Variant { size: string; color: string; stock: string; price: string }
interface Brand { id: string; name: string }

interface FormState {
  name: string;
  shortDescription: string;
  description: string;
  price: string;
  discountPrice: string;
  sku: string;
  stock: string;
  categoryId: string;
  subCategoryId: string;
  childCategoryId: string;
  brandId: string;
  status: "DRAFT" | "PENDING";
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

const INITIAL: FormState = {
  name: "", shortDescription: "", description: "",
  price: "", discountPrice: "", sku: "", stock: "0",
  categoryId: "", subCategoryId: "", childCategoryId: "", brandId: "",
  status: "DRAFT",
  seoTitle: "", seoDescription: "", seoKeywords: "",
};

const STEPS = [
  { id: 1, label: "Category",       icon: Tag },
  { id: 2, label: "Details",        icon: Package },
  { id: 3, label: "Pricing",        icon: DollarSign },
  { id: 4, label: "Images",         icon: ImageIcon },
  { id: 5, label: "Variants",       icon: Settings },
  { id: 6, label: "SEO & Publish",  icon: Search },
];

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function NewProductForm({
  rootCategories,
  brands,
}: {
  rootCategories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [newVariant, setNewVariant] = useState<Variant>({ size: "", color: "", stock: "1", price: "" });

  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(false);

  const loadSubcategories = useCallback(async (parentId: string) => {
    setLoadingSubs(true);
    setSubCategories([]);
    setChildCategories([]);
    setForm((f) => ({ ...f, subCategoryId: "", childCategoryId: "" }));
    try {
      const res = await clientFetch(`/products/categories/${parentId}/subcategories`);
      const data = await res.json();
      if (data.success) setSubCategories(data.data || []);
    } finally {
      setLoadingSubs(false);
    }
  }, []);

  const loadChildCategories = useCallback(async (parentId: string) => {
    setLoadingChildren(true);
    setChildCategories([]);
    setForm((f) => ({ ...f, childCategoryId: "" }));
    try {
      const res = await clientFetch(`/products/categories/${parentId}/subcategories`);
      const data = await res.json();
      if (data.success) setChildCategories(data.data || []);
    } finally {
      setLoadingChildren(false);
    }
  }, []);

  useEffect(() => {
    if (form.categoryId) loadSubcategories(form.categoryId);
  }, [form.categoryId, loadSubcategories]);

  useEffect(() => {
    if (form.subCategoryId) loadChildCategories(form.subCategoryId);
  }, [form.subCategoryId, loadChildCategories]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
      ...(name === "name" && !f.seoTitle ? { seoTitle: value } : {}),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 10 - files.length);
    const newFiles = [...files, ...selected].slice(0, 10);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (idx: number) => {
    const newFiles = files.filter((_, i) => i !== idx);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const addVariant = () => {
    if (!newVariant.size && !newVariant.color) { toast.error("Enter size or color"); return; }
    setVariants((v) => [...v, newVariant]);
    setNewVariant({ size: "", color: "", stock: "1", price: "" });
  };

  const validateStep = (): boolean => {
    if (step === 1 && !form.categoryId) { toast.error("Select a main category"); return false; }
    if (step === 2) {
      if (!form.name.trim()) { toast.error("Product name required"); return false; }
      if (!form.description.trim()) { toast.error("Description required"); return false; }
    }
    if (step === 3) {
      if (!form.price || Number(form.price) <= 0) { toast.error("Valid price required"); return false; }
      if (!form.stock || Number(form.stock) < 0) { toast.error("Valid stock required"); return false; }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length)); };
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = (status: "DRAFT" | "PENDING") => {
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("name", form.name.trim());
        fd.append("shortDescription", form.shortDescription.trim());
        fd.append("description", form.description.trim());
        fd.append("price", form.price);
        if (form.discountPrice) fd.append("discountPrice", form.discountPrice);
        if (form.sku) fd.append("sku", form.sku.trim());
        fd.append("stock", form.stock);
        fd.append("status", status);
        if (form.categoryId) fd.append("categoryId", form.categoryId);
        if (form.subCategoryId) fd.append("subCategoryId", form.subCategoryId);
        if (form.childCategoryId) fd.append("childCategoryId", form.childCategoryId);
        if (form.brandId) fd.append("brandId", form.brandId);
        if (form.seoTitle) fd.append("seoTitle", form.seoTitle.trim());
        if (form.seoDescription) fd.append("seoDescription", form.seoDescription.trim());
        if (form.seoKeywords) {
          fd.append(
            "seoKeywords",
            JSON.stringify(form.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean))
          );
        }
        files.forEach((f) => fd.append("images", f));

        const res = await clientFetch("/products", {
          method: "POST",
          body: fd,
        });

        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to create product");

        const productId: string | undefined = data.data?.id;

        if (variants.length > 0 && productId) {
          await Promise.all(
            variants.map((v) =>
              clientFetch(`/products/${productId}/variants`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  size: v.size || undefined,
                  color: v.color || undefined,
                  stock: Number(v.stock) || 0,
                  price: v.price ? Number(v.price) : undefined,
                }),
              })
            )
          );
        }

        toast.success(status === "DRAFT" ? "Saved as draft!" : "Submitted for approval!");
        router.push("/seller/products");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className="flex items-center flex-shrink-0">
              <button
                type="button"
                onClick={() => done && setStep(s.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-indigo-600 text-white shadow-md"
                    : done
                    ? "bg-emerald-50 text-emerald-700 cursor-pointer hover:bg-emerald-100"
                    : "bg-zinc-100 text-zinc-400 cursor-default"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <ChevronRight
                  className={`w-4 h-4 mx-1 flex-shrink-0 ${done ? "text-emerald-400" : "text-zinc-300"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 min-h-96">

        {/* STEP 1 — Category */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Select Main Category</h2>
              <p className="text-sm text-zinc-400">Choose the primary category for your product.</p>
            </div>

            {rootCategories.length === 0 ? (
              <div className="p-8 text-center bg-amber-50 rounded-xl border border-amber-200">
                <Tag className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="font-semibold text-amber-700">No categories available</p>
                <p className="text-sm text-amber-600 mt-1">Ask your admin to create categories first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {rootCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, categoryId: cat.id }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                      form.categoryId === cat.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <Tag
                      className={`w-5 h-5 mb-2 ${form.categoryId === cat.id ? "text-indigo-500" : "text-zinc-400"}`}
                    />
                    <p
                      className={`font-semibold text-sm ${
                        form.categoryId === cat.id ? "text-indigo-700" : "text-zinc-700"
                      }`}
                    >
                      {cat.name}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {form.categoryId && (
              <div className="space-y-3">
                <Label>
                  Subcategory <span className="text-zinc-400 font-normal">(optional)</span>
                </Label>
                {loadingSubs ? (
                  <p className="text-sm text-zinc-400">Loading subcategories…</p>
                ) : subCategories.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {subCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, subCategoryId: cat.id }))}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          form.subCategoryId === cat.id
                            ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                            : "border-zinc-200 hover:border-zinc-300 text-zinc-600"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 italic">No subcategories for this category</p>
                )}
              </div>
            )}

            {form.subCategoryId && childCategories.length > 0 && (
              <div className="space-y-3">
                <Label>
                  Child Category <span className="text-zinc-400 font-normal">(optional)</span>
                </Label>
                {loadingChildren ? (
                  <p className="text-sm text-zinc-400">Loading…</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {childCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, childCategoryId: cat.id }))}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          form.childCategoryId === cat.id
                            ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                            : "border-zinc-200 hover:border-zinc-300 text-zinc-600"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — Details */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Product Details</h2>

            <div className="space-y-2">
              <Label htmlFor="name">Product Title *</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Premium Wireless Headphones"
              />
              {form.name && (
                <p className="text-xs text-zinc-400">
                  Slug:{" "}
                  <span className="font-mono text-zinc-500">{slugify(form.name)}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                placeholder="One-line summary shown in listings"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Detailed product description..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandId">
                Brand <span className="text-zinc-400 text-xs font-normal">(optional)</span>
              </Label>
              <select
                id="brandId"
                name="brandId"
                value={form.brandId}
                onChange={handleChange}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* STEP 3 — Pricing */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Pricing &amp; Inventory</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Regular Price ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPrice">
                  Discount Price ($){" "}
                  <span className="text-zinc-400 text-xs">optional</span>
                </Label>
                <Input
                  id="discountPrice"
                  name="discountPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discountPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>

            {form.price && form.discountPrice && Number(form.discountPrice) < Number(form.price) && (
              <div className="p-3 bg-emerald-50 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Saving{" "}
                <strong>${(Number(form.price) - Number(form.discountPrice)).toFixed(2)}</strong>
                &nbsp;({Math.round((1 - Number(form.discountPrice) / Number(form.price)) * 100)}% off)
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">
                  SKU <span className="text-zinc-400 text-xs">auto-generated if empty</span>
                </Label>
                <Input
                  id="sku"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="e.g. WH-PRO-BLK-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — Images */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold">Product Images</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Upload up to 10 images. First image is the main cover.
              </p>
            </div>

            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-200 rounded-2xl cursor-pointer hover:bg-zinc-50 transition-colors">
              <ImagePlus className="w-8 h-8 text-zinc-300 mb-2" />
              <span className="text-sm text-zinc-400">Click to upload images</span>
              <span className="text-xs text-zinc-300 mt-1">{files.length}/10 uploaded</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={files.length >= 10}
              />
            </label>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/80 text-white text-xs text-center py-1">
                        Cover
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 5 — Variants */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold">Product Variants</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Add size/color variants with their own stock and optional price.
              </p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl space-y-3">
              <p className="text-sm font-semibold text-zinc-600">Add Variant</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Input
                  placeholder="Size (e.g. XL)"
                  value={newVariant.size}
                  onChange={(e) => setNewVariant((v) => ({ ...v, size: e.target.value }))}
                />
                <Input
                  placeholder="Color (e.g. Black)"
                  value={newVariant.color}
                  onChange={(e) => setNewVariant((v) => ({ ...v, color: e.target.value }))}
                />
                <Input
                  placeholder="Stock"
                  type="number"
                  min="0"
                  value={newVariant.stock}
                  onChange={(e) => setNewVariant((v) => ({ ...v, stock: e.target.value }))}
                />
                <Input
                  placeholder="Price (optional)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newVariant.price}
                  onChange={(e) => setNewVariant((v) => ({ ...v, price: e.target.value }))}
                />
              </div>
              <Button type="button" onClick={addVariant} variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Variant
              </Button>
            </div>

            {variants.length > 0 ? (
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50">
                    <tr>
                      {["Size", "Color", "Stock", "Price", ""].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {variants.map((v, i) => (
                      <tr key={i} className="hover:bg-zinc-50">
                        <td className="px-4 py-3">{v.size || "—"}</td>
                        <td className="px-4 py-3">{v.color || "—"}</td>
                        <td className="px-4 py-3">{v.stock}</td>
                        <td className="px-4 py-3">{v.price ? `$${v.price}` : "—"}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-zinc-400 italic text-center py-6">No variants added yet</p>
            )}
          </div>
        )}

        {/* STEP 6 — SEO & Publish */}
        {step === 6 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">SEO &amp; Publish</h2>

            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                name="seoTitle"
                value={form.seoTitle}
                onChange={handleChange}
                placeholder="Page title for search engines"
              />
              <p className="text-xs text-zinc-400">{form.seoTitle.length}/60 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription">Meta Description</Label>
              <Textarea
                id="seoDescription"
                name="seoDescription"
                value={form.seoDescription}
                onChange={handleChange}
                placeholder="Brief description for search results…"
                rows={3}
              />
              <p className="text-xs text-zinc-400">{form.seoDescription.length}/160 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoKeywords">
                Keywords{" "}
                <span className="text-zinc-400 text-xs font-normal">(comma-separated)</span>
              </Label>
              <Input
                id="seoKeywords"
                name="seoKeywords"
                value={form.seoKeywords}
                onChange={handleChange}
                placeholder="wireless, headphones, noise-cancelling"
              />
            </div>

            {(form.seoTitle || form.name) && (
              <div className="p-4 bg-white border rounded-xl space-y-1">
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">
                  Search Preview
                </p>
                <p className="text-blue-600 text-base font-medium">
                  {form.seoTitle || form.name}
                </p>
                <p className="text-green-700 text-xs">
                  https://example.com/products/{slugify(form.name)}
                </p>
                <p className="text-sm text-zinc-500">
                  {form.seoDescription || form.shortDescription || form.description.slice(0, 120)}
                </p>
              </div>
            )}

            <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 gap-2"
                disabled={isPending}
                onClick={() => handleSubmit("DRAFT")}
              >
                {isPending ? "Saving…" : "Save as Draft"}
              </Button>
              <Button
                type="button"
                className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-500"
                disabled={isPending}
                onClick={() => handleSubmit("PENDING")}
              >
                {isPending ? "Submitting…" : "Submit for Approval"}
              </Button>
            </div>
            <p className="text-xs text-zinc-400 text-center">
              Products require admin approval before they are published to the marketplace.
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={step === 1 ? () => router.back() : prev}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> {step === 1 ? "Cancel" : "Back"}
        </Button>

        {step < STEPS.length && (
          <Button type="button" onClick={next} className="gap-2">
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
