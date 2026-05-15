"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clientFetch } from "@/lib/client-fetch";
import { SendHorizonal } from "lucide-react";

export default function SubmitForReview({ productId }: { productId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      const res = await clientFetch(`/product-approval/${productId}/submit`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to submit for review");
        return;
      }
      toast.success(data.data?.status === "APPROVED" ? "Product published successfully" : "Submitted for admin review");
      router.refresh();
    });
  };

  return (
    <button
      onClick={submit}
      disabled={isPending}
      title="Submit for review"
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
    >
      <SendHorizonal className="w-3 h-3" />
      {isPending ? "Submitting..." : "Submit"}
    </button>
  );
}
