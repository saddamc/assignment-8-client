import { serverFetch } from "@/lib/server-fetch";
import { Activity } from "lucide-react";

type Log = {
  id: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  ipAddress?: string;
  createdAt: string;
};

export default async function AdminLogsPage() {
  let logs: Log[] = [];

  try {
    const res = await serverFetch.get("/admin/logs?limit=100");
    const data = await res.json();
    if (data.success) logs = data.data?.data || data.data || [];
  } catch { /* empty */ }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Admin</p>
        <h1 className="text-3xl font-serif font-bold">Activity Logs</h1>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
          <Activity className="w-12 h-12 text-zinc-200 mb-4" />
          <h3 className="text-lg font-bold mb-2">No activity yet</h3>
          <p className="text-zinc-400 text-sm">Admin actions will be logged here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="text-left px-6 py-4 font-semibold text-zinc-500">Admin</th>
                <th className="text-left px-6 py-4 font-semibold text-zinc-500">Action</th>
                <th className="text-left px-6 py-4 font-semibold text-zinc-500">Target</th>
                <th className="text-left px-6 py-4 font-semibold text-zinc-500">IP</th>
                <th className="text-left px-6 py-4 font-semibold text-zinc-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50/50">
                  <td className="px-6 py-3 text-zinc-600">{log.adminEmail}</td>
                  <td className="px-6 py-3 font-mono text-indigo-700 text-xs font-semibold">{log.action}</td>
                  <td className="px-6 py-3 text-zinc-500">{log.targetType} <span className="font-mono text-xs text-zinc-400">#{log.targetId?.slice(-8)}</span></td>
                  <td className="px-6 py-3 text-zinc-400 font-mono text-xs">{log.ipAddress || "—"}</td>
                  <td className="px-6 py-3 text-zinc-400 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
