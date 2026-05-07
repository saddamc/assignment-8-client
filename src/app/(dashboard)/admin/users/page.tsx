import { serverFetch } from "@/lib/server-fetch";
import { Users, ShieldCheck, ShieldOff } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type User = any;

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-purple-50 text-purple-700",
  SELLER: "bg-indigo-50 text-indigo-700",
  CUSTOMER: "bg-zinc-100 text-zinc-600",
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  INACTIVE: "bg-red-50 text-red-700",
  BLOCKED: "bg-red-100 text-red-800",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; role?: string }>;
}) {
  const params = await searchParams;
  const page = params.page || "1";
  const role = params.role || "";

  let users: User[] = [];
  let total = 0;

  const qs = [`page=${page}`, "limit=20"];
  if (role) qs.push(`role=${role}`);

  try {
    const res = await serverFetch.get(`/user?${qs.join("&")}`);
    const data = await res.json();
    if (data.success) {
      users = data.data?.data || data.data || [];
      total = data.data?.meta?.total || users.length;
    }
  } catch { /* empty state */ }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">
            User Management
          </p>
          <h1 className="text-3xl font-serif font-bold">Users</h1>
          <p className="text-zinc-500 text-sm mt-1">{total} total users</p>
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          {["", "ADMIN", "SELLER", "CUSTOMER"].map((r) => (
            <a
              key={r}
              href={`/admin/users?role=${r}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                role === r
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:border-indigo-300"
              }`}
            >
              {r || "All"}
            </a>
          ))}
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
          <Users className="w-12 h-12 text-zinc-200 mb-4" />
          <h3 className="text-lg font-bold mb-2">No users found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-zinc-50 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {users.map((user: User) => {
                  const roleKey = (user.role || "CUSTOMER").toUpperCase();
                  const statusKey = (user.status || "ACTIVE").toUpperCase();
                  const name =
                    user.customer?.name ||
                    user.seller?.name ||
                    user.name ||
                    "Unknown";
                  const email =
                    user.email ||
                    user.customer?.email ||
                    user.seller?.email ||
                    "";

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                            {name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{name}</p>
                            <p className="text-xs text-zinc-400">{email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            ROLE_STYLES[roleKey] || "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {roleKey}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            STATUS_STYLES[statusKey] || "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {statusKey}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-xs">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "numeric" }
                            )
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                            title="Activate"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            title="Block"
                          >
                            <ShieldOff className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t bg-zinc-50 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Showing {users.length} of {total}
            </p>
            <div className="flex gap-2">
              {Number(page) > 1 && (
                <a
                  href={`/admin/users?page=${Number(page) - 1}&role=${role}`}
                  className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-white transition-colors"
                >
                  Previous
                </a>
              )}
              {users.length === 20 && (
                <a
                  href={`/admin/users?page=${Number(page) + 1}&role=${role}`}
                  className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-white transition-colors"
                >
                  Next
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
