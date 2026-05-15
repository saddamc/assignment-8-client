"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Star, Trash2 } from "lucide-react";
import { clientFetch } from "@/lib/client-fetch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AddressActionsProps {
  id: string;
  isDefault: boolean;
}

export default function AddressActions({ id, isDefault }: AddressActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"default" | "delete" | null>(null);

  const handleSetDefault = async () => {
    setLoading("default");
    try {
      const res = await clientFetch(`/address/${id}/set-default`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        toast.success("Default address updated");
        router.refresh();
      } else {
        toast.error(data.message || "Failed to set default");
      }
    } catch {
      toast.error("Failed to set default");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this address? This cannot be undone.")) return;
    setLoading("delete");
    try {
      const res = await clientFetch(`/address/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Address deleted");
        router.refresh();
      } else {
        toast.error(data.message || "Failed to delete address");
      }
    } catch {
      toast.error("Failed to delete address");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-100">
      <Link
        href={`/dashboard/addresses/${id}/edit`}
        className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
      >
        <Pencil className="w-3 h-3" /> Edit
      </Link>

      {!isDefault && (
        <button
          onClick={handleSetDefault}
          disabled={loading === "default"}
          className="flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-indigo-600 disabled:opacity-50"
        >
          <Star className="w-3 h-3" />
          {loading === "default" ? "Updating..." : "Set as Default"}
        </button>
      )}

      <button
        onClick={handleDelete}
        disabled={loading === "delete"}
        className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 disabled:opacity-50 ml-auto"
      >
        <Trash2 className="w-3 h-3" />
        {loading === "delete" ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
