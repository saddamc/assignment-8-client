import { serverFetch } from "@/lib/server-fetch";
import { Star, MessageSquare } from "lucide-react";
import Image from "next/image";

type Review = {
  id: string;
  rating: number;
  comment?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
  product: { name: string; images: string[] };
};

export default async function MyReviewsPage() {
  let reviews: Review[] = [];

  try {
    const res = await serverFetch.get("/reviews/my-reviews");
    const data = await res.json();
    if (data.success) reviews = data.data?.data || data.data || [];
  } catch { /* empty */ }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">My Account</p>
        <h1 className="text-3xl font-serif font-bold">My Reviews</h1>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
          <MessageSquare className="w-12 h-12 text-zinc-200 mb-4" />
          <h3 className="text-lg font-bold mb-2">No reviews yet</h3>
          <p className="text-zinc-400 text-sm">Reviews you write will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
              <div className="flex items-start gap-4">
                {review.product?.images?.[0] && (
                  <Image src={review.product.images[0]} alt={review.product.name} width={64} height={64} className="rounded-xl object-cover flex-shrink-0"  />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{review.product?.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
                    ))}
                    {review.isVerifiedPurchase && (
                      <span className="ml-2 text-xs text-emerald-600 font-semibold">Verified Purchase</span>
                    )}
                  </div>
                  {review.comment && <p className="text-sm text-zinc-500 mt-2">{review.comment}</p>}
                  <p className="text-xs text-zinc-400 mt-2">{new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
