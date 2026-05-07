import { getCurrentUser } from "@/services/auth/getCurrentUser";
import { logoutUser } from "@/services/auth/logoutUser";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function MyProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/my-profile");
  }

  const roleLabel: Record<string, string> = {
    ADMIN: "Administrator",
    SELLER: "Seller",
    CUSTOMER: "Customer",
  };

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700",
    SELLER: "bg-blue-100 text-blue-700",
    CUSTOMER: "bg-green-100 text-green-700",
  };

  const initial = user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase();
  const roleColor = roleColors[user.role] || "bg-zinc-100 text-zinc-700";

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-sm border p-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-full bg-zinc-800 text-white flex items-center justify-center text-3xl font-bold shrink-0">
              {initial}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{user.name || "User"}</h1>
              <p className="text-muted-foreground text-sm truncate">{user.email}</p>
              <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${roleColor}`}>
                {roleLabel[user.role] || user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-3xl shadow-sm border p-8">
          <h2 className="text-lg font-semibold mb-4">Account Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <dt className="text-muted-foreground">Full Name</dt>
              <dd className="font-medium">{user.name || "—"}</dd>
            </div>
            <div className="flex justify-between py-2 border-b">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div className="flex justify-between py-2 border-b">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="font-medium">{roleLabel[user.role] || user.role}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-muted-foreground">Account ID</dt>
              <dd className="font-mono text-xs text-muted-foreground">{user.id}</dd>
            </div>
          </dl>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-3xl shadow-sm border p-8">
          <h2 className="text-lg font-semibold mb-4">Account Actions</h2>
          <div className="space-y-3">
            <Link href="/change-password">
              <Button variant="outline" className="w-full justify-start rounded-xl">
                🔒 Change Password
              </Button>
            </Link>

            {user.role === "CUSTOMER" && (
              <Link href="/dashboard">
                <Button variant="outline" className="w-full justify-start rounded-xl">
                  📦 My Orders
                </Button>
              </Link>
            )}

            {user.role === "SELLER" && (
              <Link href="/seller/dashboard">
                <Button variant="outline" className="w-full justify-start rounded-xl">
                  🏪 Seller Dashboard
                </Button>
              </Link>
            )}

            {user.role === "ADMIN" && (
              <Link href="/admin/dashboard">
                <Button variant="outline" className="w-full justify-start rounded-xl">
                  ⚙️ Admin Dashboard
                </Button>
              </Link>
            )}

            <form action={logoutUser}>
              <Button
                type="submit"
                variant="destructive"
                className="w-full justify-start rounded-xl"
              >
                👋 Sign Out
              </Button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
