"use client";

import { useState } from "react";
import { clientFetch } from "@/lib/client-fetch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

type Props = {
    orderId: string;
    status: string;
    existingTracking?: string;
};

// Map: current status → next action
const NEXT_ACTION: Record<string, { label: string; nextStatus: string }> = {
    PENDING: { label: "Accept Order", nextStatus: "PROCESSING" },
    PROCESSING: { label: "Mark as Packed", nextStatus: "PACKED" },
    PACKED: { label: "Mark as Shipped", nextStatus: "SHIPPED" },
    SHIPPED: { label: "Mark Delivered", nextStatus: "DELIVERED" },
};

export default function SellerOrderActions({ orderId, status, existingTracking }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showTracking, setShowTracking] = useState(false);
    const [carrier, setCarrier] = useState("");
    const [trackingNumber, setTrackingNumber] = useState(existingTracking ?? "");

    const action = NEXT_ACTION[status];

    const handleAdvance = async () => {
        if (!action) return;

        // If advancing to SHIPPED, require tracking
        if (action.nextStatus === "SHIPPED" && !trackingNumber.trim()) {
            setShowTracking(true);
            return;
        }

        setLoading(true);
        try {
            // Update status
            const statusRes = await clientFetch(`/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: action.nextStatus }),
            });
            const statusData = await statusRes.json();
            if (!statusData.success) {
                toast.error(statusData.message || "Failed to update status");
                return;
            }

            // If tracking info provided, add shipment
            if (trackingNumber.trim()) {
                await clientFetch(`/orders/${orderId}/shipment`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ carrier: carrier.trim() || undefined, trackingNumber: trackingNumber.trim() }),
                });
            }

            toast.success(`Order moved to ${action.nextStatus}`);
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTracking = async () => {
        if (!trackingNumber.trim()) {
            toast.error("Enter a tracking number");
            return;
        }
        setLoading(true);
        try {
            const res = await clientFetch(`/orders/${orderId}/shipment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ carrier: carrier.trim() || undefined, trackingNumber: trackingNumber.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Tracking info saved");
                setShowTracking(false);
                router.refresh();
            } else {
                toast.error(data.message || "Failed to save tracking");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (status === "DELIVERED" || status === "CANCELLED" || status === "REFUNDED") {
        return null;
    }

    return (
        <div className="px-6 py-3 border-t bg-zinc-50/30">
            {showTracking ? (
                <div className="flex flex-wrap items-center gap-3">
                    <Input
                        placeholder="Carrier (e.g. FedEx)"
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        className="h-8 text-xs rounded-lg w-36"
                    />
                    <Input
                        placeholder="Tracking number *"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="h-8 text-xs rounded-lg w-44"
                    />
                    <button
                        onClick={handleSaveTracking}
                        disabled={loading}
                        className="h-8 px-4 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Saving..." : "Save & Ship"}
                    </button>
                    <button
                        onClick={() => setShowTracking(false)}
                        className="h-8 px-3 rounded-lg border text-xs font-medium hover:bg-zinc-100 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    {action && (
                        <button
                            onClick={handleAdvance}
                            disabled={loading}
                            className="h-8 px-4 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            {loading ? "Updating..." : action.label}
                        </button>
                    )}
                    {/* Allow adding / updating tracking at any active stage */}
                    {["PROCESSING", "PACKED", "SHIPPED"].includes(status) && (
                        <button
                            onClick={() => setShowTracking(true)}
                            className="h-8 px-3 rounded-lg border text-xs font-medium hover:bg-zinc-100 transition-colors"
                        >
                            {existingTracking ? "Update Tracking" : "Add Tracking"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
