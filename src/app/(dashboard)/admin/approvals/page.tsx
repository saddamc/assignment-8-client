import { serverFetch } from "@/lib/server-fetch";
import { ClipboardCheck, Store, Tag } from "lucide-react";
import Image from "next/image";
import ApprovalActions from "./ApprovalActions";

type ApprovalRecord = {
  id: string;
  status: string;
  reviewNote?: string;
  submittedAt?: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    status: string;
    description: string;
    stock: number;
    sku?: string;
    category?: { name: string };
    brand?: { name: string };
    seller: {
      name: string;
      email: string;
      storeName: string;
      isApproved: boolean;
      autoApproveProducts: boolean;
      trustScore: number;
    };
    variants: { id: string; size?: string; color?: string; stock: number; price?: number }[];
    approvalHistory: { id: string; status: string; reviewNote?: string; createdAt: string }[];
  };
};

const STATUS_FILTER_TABS = ["PENDING", "APPROVED", "REJECTED"];

export default async function AdminProductApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page } = await searchParams;
  const activeStatus = (status || "PENDING").toUpperCase();
  const currentPage = page || "1";

  let approvals: ApprovalRecord[] = [];
  let total = 0;

  try {
    const res = await serverFetch.get(
      `/product-approval/pending?status=${activeStatus}&page=${currentPage}&limit=10`
    );
    const data = await res.json();
    if (data.success) {
      approvals = data.data || [];
      total = data.meta?.total || 0;
    }
  } catch { /* empty */ }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Admin</p>
        <h1 className="text-3xl font-serif font-bold">Product Approvals</h1>
        <p className="text-zinc-400 text-sm mt-1">{total} product{total !== 1 ? "s" : ""} in queue</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2">
        {STATUS_FILTER_TABS.map((tab) => (
          <a
            key={tab}
            href={`/admin/approvals?status=${tab}`}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              activeStatus === tab
                ? "bg-indigo-600 text-white border-indigo-600"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </a>
        ))}
      </div>

      {/* Empty state */}
      {approvals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
          <ClipboardCheck className="w-12 h-12 text-zinc-200 mb-4" />
          <h3 className="text-lg font-bold mb-2">No {activeStatus.toLowerCase()} products</h3>
          <p className="text-zinc-400 text-sm">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {approvals.map((record) => {
            const p = record.product;
            return (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden"
              >
                <div className="p-6 flex gap-5">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    {p.images?.[0] ? (
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-zinc-100 flex items-center justify-center">
                        <Tag className="w-8 h-8 text-zinc-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
                        <p className="text-zinc-500 text-sm mt-0.5">
                          ${p.price?.toFixed(2)} &bull; Stock: {p.stock}
                          {p.sku && <> &bull; SKU: <span className="font-mono">{p.sku}</span></>}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                          {p.category && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" /> {p.category.name}
                            </span>
                          )}
                          {p.brand && <span>&bull; {p.brand.name}</span>}
                        </div>
                      </div>
                      <span
                        className={`flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full ${
                          record.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700"
                            : record.status === "REJECTED"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>

                    {/* Seller */}
                    <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                      <Store className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{p.seller.storeName}</p>
                        <p className="text-xs text-zinc-400">{p.seller.email}</p>
                      </div>
                      <div className="ml-auto flex gap-2 text-xs">
                        {p.seller.isApproved && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">Verified</span>
                        )}
                        {p.seller.autoApproveProducts && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">Auto-Approve ON</span>
                        )}
                        {p.seller.trustScore > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold">
                            Trust: {p.seller.trustScore}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rejection note */}
                    {record.reviewNote && (
                      <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        <span className="font-semibold">Note:</span> {record.reviewNote}
                      </p>
                    )}

                    {/* Variants */}
                    {p.variants.length > 0 && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {p.variants.slice(0, 6).map((v) => (
                          <span key={v.id} className="text-xs px-2 py-0.5 rounded-full border border-zinc-200 text-zinc-600">
                            {[v.size, v.color].filter(Boolean).join(" / ")} — {v.stock} pcs
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Submission time */}
                    {record.submittedAt && (
                      <p className="mt-2 text-xs text-zinc-400">
                        Submitted {new Date(record.submittedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <ApprovalActions
                  productId={p.id}
                  currentStatus={record.status}
                  sellerEmail={p.seller.email}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

