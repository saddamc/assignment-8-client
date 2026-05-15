"use client";

import { useState, useTransition, useEffect, useCallback, useRef } from "react";
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
import Image from "next/image";

interface Category { id: string; name: string }
interface Brand    { id: string; name: string }

interface Variant {
  id?: string;
  size: string;
  color: string;
  stock: string;
  price: string;
}

interface SellerSettings {
  autoApproveProducts?: boolean;
  isApproved?: boolean;
}

interface ProductData {
  id: string;
  name?: string;
  shortDescription?: string;
  description?: string;
  price?: number;
  discountPrice?: number | null;
  sku?: string | null;
  slug?: string | null;
  stock?: number;
  categoryId?: string | null;
  subCategoryId?: string | null;
  childCategoryId?: string | null;
  brandId?: string | null;
  status?: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" | "DISABLED";
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[] | string | null;
  images?: string[];
  variants?: Array<{
    id: string;
    size?: string | null;
    color?: string | null;
    stock?: number;
    price?: number | null;
  }>;
  seller?: SellerSettings;
}

interface FormState {
  name: string;
  slug: string;
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
  status: "DRAFT" | "PENDING" | "PUBLISHED";
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

const STEPS = [
  { id: 1, label: "Category",      icon: Tag },
  { id: 2, label: "Details",       icon: Package },
  { id: 3, label: "Pricing",       icon: DollarSign },
  { id: 4, label: "Images",        icon: ImageIcon },
  { id: 5, label: "Variants",      icon: Settings },
  { id: 6, label: "SEO & Publish", icon: Search },
];

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function EditProductForm({
  product,
  rootCategories,
  brands,
}: {
  product: ProductData;
  rootCategories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>({
    name:             product.name             || "",
    slug:             product.slug             || "",
    shortDescription: product.shortDescription || "",
    description:      product.description      || "",
    price:            product.price?.toString() || "",
    discountPrice:    product.discountPrice?.toString() || "",
    sku:              product.sku              || "",
    stock:            product.stock?.toString() || "0",
    categoryId:       product.categoryId       || "",
    subCategoryId:    product.subCategoryId    || "",
    childCategoryId:  product.childCategoryId  || "",
    brandId:          product.brandId          || "",
    status:           product.status           || "DRAFT",
    seoTitle:         product.seoTitle         || "",
    seoDescription:   product.seoDescription   || "",
    seoKeywords:      Array.isArray(product.seoKeywords)
                        ? product.seoKeywords.join(", ")
                        : (product.seoKeywords || ""),
  });

  // Existing images from Cloudinary — can be individually removed
  const [existingImages, setExistingImages] = useState<string[]>(product.images || []);
  // New files to upload
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  // Variants (existing + any new ones)
  const [variants, setVariants] = useState<Variant[]>(
    (product.variants || []).map((v) => ({
      id:    v.id,
      size:  v.size  || "",
      color: v.color || "",
      stock: v.stock?.toString() || "0",
      price: v.price?.toString() || "",
    }))
  );
  const initialVariantsRef = useRef<Variant[]>(
    (product.variants || []).map((v) => ({
      id:    v.id,
      size:  v.size  || "",
      color: v.color || "",
      stock: v.stock?.toString() || "0",
      price: v.price?.toString() || "",
    }))
  );
  const [newVariant, setNewVariant] = useState<Variant>({ size: "", color: "", stock: "1", price: "" });

  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(false);

  const loadSubcategories = useCallback(async (parentId: string) => {
    setLoadingSubs(true);
    setSubCategories([]);
    setChildCategories([]);
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
    try {
      const res = await clientFetch(`/products/categories/${parentId}/subcategories`);
      const data = await res.json();
      if (data.success) setChildCategories(data.data || []);
    } finally {
      setLoadingChildren(false);
    }
  }, []);

  // Load initial subcategories based on product's existing category
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
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const totalAllowed = 10 - existingImages.length;
    const selected = Array.from(e.target.files || []).slice(0, totalAllowed - newFiles.length);
    const updated = [...newFiles, ...selected].slice(0, totalAllowed);
    setNewFiles(updated);
    setNewPreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages((imgs) => imgs.filter((_, i) => i !== idx));
  };

  const removeNewFile = (idx: number) => {
    const updated = newFiles.filter((_, i) => i !== idx);
    setNewFiles(updated);
    setNewPreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const addVariant = () => {
    if (!newVariant.size && !newVariant.color) { toast.error("Enter size or color"); return; }
    setVariants((v) => [...v, { ...newVariant }]);
    setNewVariant({ size: "", color: "", stock: "1", price: "" });
  };

  const updateVariantField = (index: number, field: keyof Variant, value: string) => {
    setVariants((current) => current.map((variant, variantIndex) => (
      variantIndex === index ? { ...variant, [field]: value } : variant
    )));
  };

  const syncVariants = async () => {
    const initialVariants = initialVariantsRef.current;
    const removedVariants = initialVariants.filter(
      (initialVariant) => initialVariant.id && !variants.some((variant) => variant.id === initialVariant.id)
    );

    const responses = await Promise.all([
      ...removedVariants.map((variant) =>
        clientFetch(`/products/${product.id}/variants/${variant.id}`, {
          method: "DELETE",
        })
      ),
      ...variants.map((variant) => {
        const payload = {
          size: variant.size || undefined,
          color: variant.color || undefined,
          stock: Number(variant.stock) || 0,
          price: variant.price ? Number(variant.price) : undefined,
        };

        if (variant.id) {
          return clientFetch(`/products/${product.id}/variants/${variant.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }

        return clientFetch(`/products/${product.id}/variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }),
    ]);

    const failedResponse = responses.find((response) => !response.ok);
    if (failedResponse) {
      const errorData = await failedResponse.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to sync product variants");
    }
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
        if (form.slug) fd.append("slug", slugify(form.slug));
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

        // Pass existing image URLs to keep
        fd.append("existingImages", JSON.stringify(existingImages));

        // Upload any new image files
        newFiles.forEach((f) => fd.append("images", f));

        const res = await clientFetch(`/products/${product.id}`, {
          method: "PATCH",
          body: fd,
        });

        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to update product");

        await syncVariants();

        const savedStatus = data.data?.status;

        toast.success(
          status === "DRAFT"
            ? "Saved as draft!"
            : savedStatus === "PUBLISHED"
              ? "Product published successfully!"
              : "Submitted for approval!"
        );
        router.push("/seller/products");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  const totalImages = existingImages.length + newFiles.length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className="flex items-center shrink-0">
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
                  className={`w-4 h-4 mx-1 shrink-0 ${done ? "text-emerald-400" : "text-zinc-300"}`}
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
              <h2 className="text-xl font-bold mb-1">Main Category</h2>
              <p className="text-sm text-zinc-400">Change or keep the product category.</p>
            </div>
            {rootCategories.length === 0 ? (
              <p className="text-sm text-amber-600">No categories available.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {rootCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, categoryId: cat.id, subCategoryId: "", childCategoryId: "" }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                      form.categoryId === cat.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <Tag className={`w-5 h-5 mb-2 ${form.categoryId === cat.id ? "text-indigo-500" : "text-zinc-400"}`} />
                    <p className={`font-semibold text-sm ${form.categoryId === cat.id ? "text-indigo-700" : "text-zinc-700"}`}>
                      {cat.name}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {form.categoryId && (
              <div className="space-y-3">
                <Label>Subcategory <span className="text-zinc-400 font-normal text-xs">(optional)</span></Label>
                {loadingSubs ? (
                  <p className="text-sm text-zinc-400">Loading…</p>
                ) : subCategories.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {subCategories.map((cat) => (
                      <button key={cat.id} type="button"
                        onClick={() => setForm((f) => ({ ...f, subCategoryId: cat.id, childCategoryId: "" }))}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          form.subCategoryId === cat.id
                            ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                            : "border-zinc-200 hover:border-zinc-300 text-zinc-600"
                        }`}
                      >{cat.name}</button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 italic">No subcategories for this category</p>
                )}
              </div>
            )}

            {form.subCategoryId && childCategories.length > 0 && (
              <div className="space-y-3">
                <Label>Child Category <span className="text-zinc-400 font-normal text-xs">(optional)</span></Label>
                {loadingChildren ? (
                  <p className="text-sm text-zinc-400">Loading…</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {childCategories.map((cat) => (
                      <button key={cat.id} type="button"
                        onClick={() => setForm((f) => ({ ...f, childCategoryId: cat.id }))}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          form.childCategoryId === cat.id
                            ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                            : "border-zinc-200 hover:border-zinc-300 text-zinc-600"
                        }`}
                      >{cat.name}</button>
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
              <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Premium Wireless Headphones" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                Custom URL Slug <span className="text-zinc-400 text-xs font-normal">(leave blank to auto-generate)</span>
              </Label>
              <Input
                id="slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder={form.name ? slugify(form.name) : "e.g. premium-wireless-headphones"}
              />
              {form.slug && (
                <p className="text-xs text-zinc-400">
                  Will be saved as: <span className="font-mono text-zinc-500">{slugify(form.slug)}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input id="shortDescription" name="shortDescription" value={form.shortDescription} onChange={handleChange} placeholder="One-line summary" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description *</Label>
              <Textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Detailed product description..." rows={6} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandId">Brand <span className="text-zinc-400 text-xs font-normal">(optional)</span></Label>
              <select id="brandId" name="brandId" value={form.brandId} onChange={handleChange}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
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
                <Input id="price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPrice">Discount Price ($) <span className="text-zinc-400 text-xs">optional</span></Label>
                <Input id="discountPrice" name="discountPrice" type="number" min="0" step="0.01" value={form.discountPrice} onChange={handleChange} placeholder="0.00" />
              </div>
            </div>

            {form.price && form.discountPrice && Number(form.discountPrice) < Number(form.price) && (
              <div className="p-3 bg-emerald-50 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Saving <strong>${(Number(form.price) - Number(form.discountPrice)).toFixed(2)}</strong>
                &nbsp;({Math.round((1 - Number(form.discountPrice) / Number(form.price)) * 100)}% off)
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU <span className="text-zinc-400 text-xs">auto-generated if empty</span></Label>
                <Input id="sku" name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. WH-PRO-BLK-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input id="stock" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} />
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
                Manage existing images and upload new ones. First image is the cover. Max 10 total.
              </p>
            </div>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Current Images</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {existingImages.map((src, i) => (
                    <div key={src} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 group">
                      <Image
                        src={src}
                        alt={`Image ${i + 1}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                      />
                      {i === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/80 text-white text-xs text-center py-1">Cover</div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload new images */}
            {totalImages < 10 && (
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Add New Images</p>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-200 rounded-2xl cursor-pointer hover:bg-zinc-50 transition-colors">
                  <ImagePlus className="w-6 h-6 text-zinc-300 mb-2" />
                  <span className="text-sm text-zinc-400">Click to upload</span>
                  <span className="text-xs text-zinc-300 mt-1">{totalImages}/10 total</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={totalImages >= 10}
                  />
                </label>

                {newPreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
                    {newPreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 group">
                        <Image src={src} alt={`New ${i + 1}`} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-amber-500/80 text-white text-xs text-center py-1">New</div>
                        <button
                          type="button"
                          onClick={() => removeNewFile(i)}
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

            {existingImages.length === 0 && newFiles.length === 0 && (
              <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-700 text-center">
                No images — upload at least one product image.
              </div>
            )}
          </div>
        )}

        {/* STEP 5 — Variants */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold">Product Variants</h2>
              <p className="text-sm text-zinc-400 mt-1">Manage size/color variants with individual stock and price.</p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl space-y-3">
              <p className="text-sm font-semibold text-zinc-600">Add Variant</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Input placeholder="Size (e.g. XL)" value={newVariant.size} onChange={(e) => setNewVariant((v) => ({ ...v, size: e.target.value }))} />
                <Input placeholder="Color (e.g. Black)" value={newVariant.color} onChange={(e) => setNewVariant((v) => ({ ...v, color: e.target.value }))} />
                <Input placeholder="Stock" type="number" min="0" value={newVariant.stock} onChange={(e) => setNewVariant((v) => ({ ...v, stock: e.target.value }))} />
                <Input placeholder="Price (optional)" type="number" min="0" step="0.01" value={newVariant.price} onChange={(e) => setNewVariant((v) => ({ ...v, price: e.target.value }))} />
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
                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {variants.map((v, i) => (
                      <tr key={v.id || i} className="hover:bg-zinc-50">
                        <td className="px-4 py-3 min-w-32">
                          <Input value={v.size} onChange={(e) => updateVariantField(i, "size", e.target.value)} placeholder="Size" />
                        </td>
                        <td className="px-4 py-3 min-w-32">
                          <Input value={v.color} onChange={(e) => updateVariantField(i, "color", e.target.value)} placeholder="Color" />
                        </td>
                        <td className="px-4 py-3 min-w-24">
                          <Input value={v.stock} onChange={(e) => updateVariantField(i, "stock", e.target.value)} placeholder="Stock" type="number" min="0" />
                        </td>
                        <td className="px-4 py-3 min-w-28">
                          <Input value={v.price} onChange={(e) => updateVariantField(i, "price", e.target.value)} placeholder="Price" type="number" min="0" step="0.01" />
                        </td>
                        <td className="px-4 py-3">
                          <button type="button" onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 transition-colors">
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
              <Input id="seoTitle" name="seoTitle" value={form.seoTitle} onChange={handleChange} placeholder="Page title for search engines" />
              <p className="text-xs text-zinc-400">{form.seoTitle.length}/60 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription">Meta Description</Label>
              <Textarea id="seoDescription" name="seoDescription" value={form.seoDescription} onChange={handleChange} placeholder="Brief description for search results…" rows={3} />
              <p className="text-xs text-zinc-400">{form.seoDescription.length}/160 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoKeywords">Keywords <span className="text-zinc-400 text-xs font-normal">(comma-separated)</span></Label>
              <Input id="seoKeywords" name="seoKeywords" value={form.seoKeywords} onChange={handleChange} placeholder="wireless, headphones, noise-cancelling" />
            </div>

            {(form.seoTitle || form.name) && (
              <div className="p-4 bg-white border rounded-xl space-y-1">
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">Search Preview</p>
                <p className="text-blue-600 text-base font-medium">{form.seoTitle || form.name}</p>
                <p className="text-green-700 text-xs">https://example.com/products/{form.slug ? slugify(form.slug) : slugify(form.name)}</p>
                <p className="text-sm text-zinc-500">{form.seoDescription || form.shortDescription || form.description.slice(0, 120)}</p>
              </div>
            )}

            <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
              <Button type="button" variant="outline" className="flex-1 gap-2" disabled={isPending} onClick={() => handleSubmit("DRAFT")}>
                {isPending ? "Saving…" : "Save as Draft"}
              </Button>
              <Button type="button" className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-500" disabled={isPending} onClick={() => handleSubmit("PENDING")}>
                {isPending ? "Submitting…" : product.seller?.autoApproveProducts && product.seller?.isApproved ? "Publish Product" : "Submit for Approval"}
              </Button>
            </div>
            <p className="text-xs text-zinc-400 text-center">
              {product.seller?.autoApproveProducts && product.seller?.isApproved
                ? "Trusted seller mode is enabled. Publishing will make changes live immediately."
                : "Edited products require re-approval before changes are live in the marketplace."}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button type="button" variant="outline" onClick={step === 1 ? () => router.back() : prev} className="gap-2">
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
