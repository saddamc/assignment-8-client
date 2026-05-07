"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clientFetch } from "@/lib/client-fetch";
import { CheckCircle, XCircle, Ban, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  productId: string;
  currentStatus: string;
  sellerEmail: string;
}

export default function ApprovalActions({ productId, currentStatus, sellerEmail }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectNote, setRejectNote] = useState("");
  const [disableReason, setDisableReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [showTrust, setShowTrust] = useState(false);
  const [trustScore, setTrustScore] = useState("");
  const [autoApprove, setAutoApprove] = useState(false);

  const approve = () => {
    startTransition(async () => {
      const res = await clientFetch(`/product-approval/${productId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { toast.error(data.message || "Approval failed"); return; }
      toast.success("Product approved and published");
      router.refresh();
    });
  };

  const reject = () => {
    if (!rejectNote.trim()) { toast.error("Please enter a rejection reason"); return; }
    startTransition(async () => {
      const res = await clientFetch(`/product-approval/${productId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", reviewNote: rejectNote.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { toast.error(data.message || "Rejection failed"); return; }
      toast.success("Product rejected");
      setShowReject(false);
      setRejectNote("");
      router.refresh();
    });
  };

  const disable = () => {
    startTransition(async () => {
      const res = await clientFetch(`/product-approval/${productId}/disable`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: disableReason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { toast.error(data.message || "Disable failed"); return; }
      toast.success("Product disabled");
      setShowDisable(false);
      setDisableReason("");
      router.refresh();
    });
  };

  const updateTrust = () => {
    startTransition(async () => {
      const res = await clientFetch(`/product-approval/trust/${sellerEmail}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoApproveProducts: autoApprove,
          trustScore: trustScore ? Number(trustScore) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { toast.error(data.message || "Update failed"); return; }
      toast.success("Seller trust settings updated");
      setShowTrust(false);
      router.refresh();
    });
  };

  return (
    <div className="border-t border-zinc-100 bg-zinc-50 px-6 py-4 space-y-3">
      {/* Primary actions row */}
      <div className="flex flex-wrap gap-2">
        {currentStatus === "PENDING" && (
          <>
            <button
              onClick={approve}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
            <button
              onClick={() => { setShowReject(!showReject); setShowDisable(false); }}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 disabled:opacity-50 transition-colors"
            >
              <XCircle className="w-4 h-4" /> Reject
              {showReject ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </>
        )}

        {(currentStatus === "APPROVED" || currentStatus === "PUBLISHED") && (
          <button
            onClick={() => { setShowDisable(!showDisable); setShowReject(false); }}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-700 text-white text-sm font-semibold hover:bg-zinc-600 disabled:opacity-50 transition-colors"
          >
            <Ban className="w-4 h-4" /> Disable
            {showDisable ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}

        {/* Trust settings toggle */}
        <button
          onClick={() => setShowTrust(!showTrust)}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 text-zinc-600 text-xs font-semibold hover:border-zinc-400 transition-colors"
        >
          Seller Trust
          {showTrust ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Reject input */}
      {showReject && (
        <div className="flex gap-2">
          <input
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Rejection reason (required)..."
            className="flex-1 text-sm border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <button
            onClick={reject}
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 disabled:opacity-50"
          >
            Confirm Reject
          </button>
        </div>
      )}

      {/* Disable input */}
      {showDisable && (
        <div className="flex gap-2">
          <input
            value={disableReason}
            onChange={(e) => setDisableReason(e.target.value)}
            placeholder="Reason for disabling (optional)..."
            className="flex-1 text-sm border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
          <button
            onClick={disable}
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-zinc-700 text-white text-sm font-semibold hover:bg-zinc-600 disabled:opacity-50"
          >
            Confirm Disable
          </button>
        </div>
      )}

      {/* Trust settings */}
      {showTrust && (
        <div className="flex flex-wrap gap-3 items-end p-3 rounded-xl border border-zinc-200 bg-white">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1">Trust Score (0–100)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={trustScore}
              onChange={(e) => setTrustScore(e.target.value)}
              className="w-28 text-sm border border-zinc-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g. 85"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
              className="rounded"
            />
            Auto-approve products
          </label>
          <button
            onClick={updateTrust}
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50"
          >
            Save Settings
          </button>
        </div>
      )}
    </div>
  );
}
