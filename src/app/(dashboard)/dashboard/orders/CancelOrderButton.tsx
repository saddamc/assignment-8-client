"use client";

import { useState } from "react";
import { clientFetch } from "@/lib/client-fetch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel this order?")) return;
        setLoading(true);
        try {
            const res = await clientFetch(`/orders/${orderId}/cancel`, { method: "PATCH" });
            const data = await res.json();
            if (data.success) {
                toast.success("Order cancelled");
                router.refresh();
            } else {
                toast.error(data.message || "Could not cancel order");
            }
        } catch {
            toast.error("Failed to cancel order");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCancel}
            disabled={loading}
            className="text-xs font-bold text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
        >
            {loading ? "Cancelling..." : "Cancel Order"}
        </button>
    );
}
