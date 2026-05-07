import { serverFetch } from "@/lib/server-fetch";
import { AlertTriangle } from "lucide-react";

type Dispute = {
  id: string;
  reason: string;
  description: string;
  status: string;
  resolution?: string;
  raisedBy: string;
  createdAt: string;
  order?: { id: string };
};

const statusColor: Record<string, string> = {
  OPEN: "bg-red-50 text-red-700",
  UNDER_REVIEW: "bg-amber-50 text-amber-700",
  RESOLVED: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-zinc-100 text-zinc-500",
};

export default async function AdminDisputesPage() {
  let disputes: Dispute[] = [];

  try {
    const res = await serverFetch.get("/admin/disputes?limit=50");
    const data = await res.json();
    if (data.success) disputes = data.data?.data || data.data || [];
  } catch { /* empty */ }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Admin</p>
        <h1 className="text-3xl font-serif font-bold">Dispute Management</h1>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
          <AlertTriangle className="w-12 h-12 text-zinc-200 mb-4" />
          <h3 className="text-lg font-bold mb-2">No disputes</h3>
          <p className="text-zinc-400 text-sm">All disputes will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor[d.status] || "bg-zinc-100 text-zinc-500"}`}>{d.status.replace("_", " ")}</span>
                    <span className="text-xs text-zinc-400 font-mono">Order #{d.order?.id?.slice(-8)}</span>
                  </div>
                  <p className="font-semibold">{d.reason}</p>
                  <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{d.description}</p>
                  {d.resolution && <p className="text-sm text-emerald-700 mt-2 font-medium">Resolution: {d.resolution}</p>}
                  <p className="text-xs text-zinc-400 mt-2">Raised by: {d.raisedBy} · {new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
