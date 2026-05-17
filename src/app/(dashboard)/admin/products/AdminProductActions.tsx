"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clientFetch } from "@/lib/client-fetch";
import { toast } from "sonner";
import { Eye, Settings2, X, CheckCircle, XCircle, EyeOff, Trash2 } from "lucide-react";

interface Props {
  productId: string;
  productStatus: string;
}

export default function AdminProductActions({ productId, productStatus }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [disableReason, setDisableReason] = useState("");
  const [activeAction, setActiveAction] = useState<"reject" | "disable" | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const isPending = productStatus === "PENDING";
  const isPublished = productStatus === "PUBLISHED";
  const canApprove = productStatus === "PENDING" || productStatus === "DISABLED" || productStatus === "REJECTED";

  const close = () => {
    setOpen(false);
    setActiveAction(null);
    setRejectNote("");
    setDisableReason("");
  };

  const approve = async () => {
    setLoading("approve");
    try {
      const res = await clientFetch(`/product-approval/${productId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      const data = await res.json();
      if (data.success) { toast.success("Product approved and published"); close(); router.refresh(); }
      else toast.error(data.message || "Failed to approve");
    } catch { toast.error("Request failed"); }
    finally { setLoading(null); }
  };

  const reject = async () => {
    if (!rejectNote.trim()) { toast.error("Rejection reason is required"); return; }
    setLoading("reject");
    try {
      const res = await clientFetch(`/product-approval/${productId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", reviewNote: rejectNote }),
      });
      const data = await res.json();
      if (data.success) { toast.success("Product rejected"); close(); router.refresh(); }
      else toast.error(data.message || "Failed to reject");
    } catch { toast.error("Request failed"); }
    finally { setLoading(null); }
  };

  const disable = async () => {
    setLoading("disable");
    try {
      const res = await clientFetch(`/product-approval/${productId}/disable`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: disableReason || undefined }),
      });
      const data = await res.json();
      if (data.success) { toast.success("Product disabled"); close(); router.refresh(); }
      else toast.error(data.message || "Failed to disable");
    } catch { toast.error("Request failed"); }
    finally { setLoading(null); }
  };

  const deleteProduct = async () => {
    setLoading("delete");
    try {
      const res = await clientFetch(`/products/${productId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { toast.success("Product deleted"); close(); router.refresh(); }
      else toast.error(data.message || "Failed to delete");
    } catch { toast.error("Request failed"); }
    finally { setLoading(null); }
  };

  return (
    <>
      {/* Two buttons */}
      <div className="flex items-center gap-1.5">
        <Link
          href={`/products/${productId}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <Settings2 className="w-3.5 h-3.5" />
          Actions
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />

          {/* Panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Product Actions</h2>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">#{productId.slice(-8)}</p>
              </div>
              <button onClick={close} className="p-1.5 rounded-xl hover:bg-zinc-100 transition-colors">
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="text-xs text-zinc-500">Current status:</span>
              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                productStatus === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" :
                productStatus === "PENDING"   ? "bg-amber-100 text-amber-700" :
                productStatus === "REJECTED"  ? "bg-red-100 text-red-700" :
                productStatus === "DISABLED"  ? "bg-zinc-700 text-white" :
                "bg-zinc-100 text-zinc-500"
              }`}>{productStatus}</span>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {/* APPROVE — only for PENDING, DISABLED, REJECTED */}
              {canApprove && activeAction !== "reject" && (
                <button
                  onClick={approve}
                  disabled={loading === "approve"}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  {loading === "approve" ? "Approving…" : "Approve & Publish"}
                </button>
              )}

              {/* REJECT — only for PENDING */}
              {isPending && (
                activeAction === "reject" ? (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-600">Rejection reason (required)</label>
                    <textarea
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="Explain why this product is rejected…"
                      rows={3}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={reject}
                        disabled={loading === "reject"}
                        className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 disabled:opacity-50 transition-colors"
                      >
                        {loading === "reject" ? "Rejecting…" : "Confirm Reject"}
                      </button>
                      <button onClick={() => setActiveAction(null)} className="px-4 py-2.5 rounded-xl border text-sm font-medium hover:bg-zinc-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveAction("reject")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold text-sm hover:bg-red-100 transition-colors"
                  >
                    <XCircle className="w-4 h-4 shrink-0" />
                    Reject Product
                  </button>
                )
              )}

              {/* DISABLE — only for PUBLISHED */}
              {isPublished && (
                activeAction === "disable" ? (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-600">Reason for disabling (optional)</label>
                    <input
                      value={disableReason}
                      onChange={(e) => setDisableReason(e.target.value)}
                      placeholder="e.g. Policy violation, duplicate listing…"
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={disable}
                        disabled={loading === "disable"}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-400 disabled:opacity-50 transition-colors"
                      >
                        {loading === "disable" ? "Disabling…" : "Confirm Disable"}
                      </button>
                      <button onClick={() => setActiveAction(null)} className="px-4 py-2.5 rounded-xl border text-sm font-medium hover:bg-zinc-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveAction("disable")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-sm hover:bg-amber-100 transition-colors"
                  >
                    <EyeOff className="w-4 h-4 shrink-0" />
                    Disable Product
                  </button>
                )
              )}

              {/* DELETE — always shown */}
              {activeAction !== "reject" && activeAction !== "disable" && (
                <button
                  onClick={deleteProduct}
                  disabled={loading === "delete"}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-red-600 font-semibold text-sm hover:bg-red-50 hover:border-red-200 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  {loading === "delete" ? "Deleting…" : "Delete Product"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


