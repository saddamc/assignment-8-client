"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { clientFetch } from "@/lib/client-fetch";
import { Truck, Plus, Trash2, Pencil, Check, X } from "lucide-react";

interface Category { id: string; name: string }
interface ShippingRule {
    id: string;
    categoryId: string | null;
    charge: number;
    label: string | null;
    category?: { id: string; name: string } | null;
}

interface Props {
    initialRules: ShippingRule[];
    categories: Category[];
}

export default function SellerShippingClient({ initialRules, categories }: Props) {
    const [rules, setRules] = useState<ShippingRule[]>(initialRules);
    const [isPending, startTransition] = useTransition();

    // Add/edit form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formCategoryId, setFormCategoryId] = useState<string>("");
    const [formCharge, setFormCharge] = useState("");
    const [formLabel, setFormLabel] = useState("");

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormCategoryId("");
        setFormCharge("");
        setFormLabel("");
    };

    const openAdd = () => {
        resetForm();
        setShowForm(true);
    };

    const openEdit = (rule: ShippingRule) => {
        setEditingId(rule.id);
        setFormCategoryId(rule.categoryId ?? "");
        setFormCharge(String(rule.charge));
        setFormLabel(rule.label ?? "");
        setShowForm(true);
    };

    const handleSave = () => {
        const charge = Number(formCharge);
        if (!formCharge || isNaN(charge) || charge < 0) {
            toast.error("Enter a valid charge amount");
            return;
        }

        startTransition(async () => {
            try {
                const res = await clientFetch("/seller-shipping", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        categoryId: formCategoryId || null,
                        charge,
                        label: formLabel || null,
                    }),
                });
                const data = await res.json();
                if (!res.ok || !data.success) throw new Error(data.message || "Failed to save rule");

                // Upsert in local list
                setRules((prev) => {
                    const exists = prev.find(
                        (r) => r.categoryId === (formCategoryId || null)
                    );
                    if (exists) {
                        return prev.map((r) =>
                            r.categoryId === (formCategoryId || null) ? data.data : r
                        );
                    }
                    return [...prev, data.data];
                });
                toast.success("Shipping rule saved");
                resetForm();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Error");
            }
        });
    };

    const handleDelete = (id: string) => {
        startTransition(async () => {
            try {
                const res = await clientFetch(`/seller-shipping/${id}`, { method: "DELETE" });
                const data = await res.json();
                if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete");
                setRules((prev) => prev.filter((r) => r.id !== id));
                toast.success("Rule deleted");
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Error");
            }
        });
    };

    // Available categories: exclude ones already configured (except the one being edited)
    const usedCategoryIds = rules
        .filter((r) => r.id !== editingId)
        .map((r) => r.categoryId);
    const availableCategories = categories.filter((c) => !usedCategoryIds.includes(c.id));
    const sellerDefaultExists = rules.some((r) => r.categoryId === null && r.id !== editingId);

    const formatRule = (rule: ShippingRule) =>
        rule.categoryId === null
            ? "All Categories (Seller Default)"
            : (rule.category?.name ?? "Unknown Category");

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Truck className="w-6 h-6 text-indigo-600" />
                        Shipping Rules
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Set shipping charges by category. Product-level overrides take priority.
                        If no rule matches, global location pricing applies.
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-500 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Rule
                </button>
            </div>

            {/* Priority note */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-sm text-indigo-700">
                <strong>Priority order:</strong> Product-level shipping &gt; Category rule &gt; Seller default &gt; Global location rules
            </div>

            {/* Form */}
            {showForm && (
                <div className="border border-zinc-200 rounded-2xl p-5 space-y-4 bg-zinc-50">
                    <h3 className="font-semibold text-zinc-800">
                        {editingId ? "Edit Rule" : "Add New Rule"}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-zinc-700">Category</label>
                            <select
                                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                value={formCategoryId}
                                onChange={(e) => setFormCategoryId(e.target.value)}
                            >
                                {!sellerDefaultExists && <option value="">All Categories (Seller Default)</option>}
                                {sellerDefaultExists && formCategoryId === "" && <option value="">All Categories (Seller Default)</option>}
                                {availableCategories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-zinc-700">Charge (৳) *</label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                value={formCharge}
                                onChange={(e) => setFormCharge(e.target.value)}
                                placeholder="e.g. 60"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-zinc-700">Label <span className="text-zinc-400">(optional)</span></label>
                            <input
                                type="text"
                                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                value={formLabel}
                                onChange={(e) => setFormLabel(e.target.value)}
                                placeholder="e.g. Standard Delivery"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            disabled={isPending}
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            <Check className="w-4 h-4" /> {isPending ? "Saving..." : "Save Rule"}
                        </button>
                        <button
                            onClick={resetForm}
                            className="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-600 rounded-xl text-sm font-semibold hover:bg-zinc-100 transition-colors"
                        >
                            <X className="w-4 h-4" /> Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Rules list */}
            {rules.length === 0 ? (
                <div className="text-center py-16 text-zinc-400">
                    <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No custom shipping rules yet</p>
                    <p className="text-sm mt-1">Global location-based pricing will be used</p>
                </div>
            ) : (
                <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200">
                                <th className="text-left px-4 py-3 font-semibold text-zinc-600">Scope</th>
                                <th className="text-left px-4 py-3 font-semibold text-zinc-600">Label</th>
                                <th className="text-right px-4 py-3 font-semibold text-zinc-600">Charge</th>
                                <th className="px-4 py-3 w-20"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {[...rules]
                                .sort((a, b) => {
                                    if (a.categoryId === null) return -1;
                                    if (b.categoryId === null) return 1;
                                    return (a.category?.name ?? "").localeCompare(b.category?.name ?? "");
                                })
                                .map((rule) => (
                                    <tr key={rule.id} className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-4 py-3 font-medium">
                                            {rule.categoryId === null ? (
                                                <span className="inline-flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full text-xs font-semibold">
                                                    Seller Default
                                                </span>
                                            ) : (
                                                formatRule(rule)
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-500">{rule.label || "—"}</td>
                                        <td className="px-4 py-3 text-right font-bold text-zinc-800">৳{rule.charge}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(rule)}
                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    disabled={isPending}
                                                    onClick={() => handleDelete(rule.id)}
                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
