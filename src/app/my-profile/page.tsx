import { getProfile } from "@/services/profile/updateProfile";
import { logoutUser } from "@/services/auth/logoutUser";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Mail, Phone, MapPin, User, Store } from "lucide-react";

export default async function MyProfilePage() {
  const profileResponse = await getProfile();

  if (!profileResponse.success || !profileResponse.data) {
    redirect("/login?redirect=/my-profile");
  }

  const user = profileResponse.data;

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
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-sm border p-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-full overflow-hidden bg-zinc-800 text-white flex items-center justify-center text-4xl font-bold shrink-0">
              {user.profilePhoto ? (
                <Image
                  src={user.profilePhoto}
                  alt={user.name || "User"}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                initial
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold truncate">{user.name || "User"}</h1>
              <p className="text-muted-foreground text-lg truncate">{user.email}</p>
              <span className={`inline-block mt-2 text-sm font-medium px-3 py-1 rounded-full ${roleColor}`}>
                {roleLabel[user.role] || user.role}
              </span>
              {user.storeName && (
                <div className="flex items-center gap-2 mt-2">
                  <Store className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{user.storeName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-3xl shadow-sm border p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Details
          </h2>
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between py-3 border-b">
              <dt className="text-muted-foreground font-medium">Full Name</dt>
              <dd className="font-medium">{user.name || "—"}</dd>
            </div>
            <div className="flex justify-between py-3 border-b">
              <dt className="text-muted-foreground font-medium">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div className="flex justify-between py-3 border-b">
              <dt className="text-muted-foreground font-medium">Role</dt>
              <dd className="font-medium">{roleLabel[user.role] || user.role}</dd>
            </div>
            {user.contactNumber && (
              <div className="flex justify-between py-3 border-b">
                <dt className="text-muted-foreground font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </dt>
                <dd className="font-medium">{user.contactNumber}</dd>
              </div>
            )}
            {user.address && (
              <div className="flex justify-between py-3 border-b">
                <dt className="text-muted-foreground font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </dt>
                <dd className="font-medium">{user.address}</dd>
              </div>
            )}
            {user.storeName && (
              <div className="flex justify-between py-3 border-b">
                <dt className="text-muted-foreground font-medium flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Store Name
                </dt>
                <dd className="font-medium">{user.storeName}</dd>
              </div>
            )}
            <div className="flex justify-between py-3">
              <dt className="text-muted-foreground font-medium">Account ID</dt>
              <dd className="font-mono text-xs text-muted-foreground">{user.id}</dd>
            </div>
          </dl>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="bg-white rounded-3xl shadow-sm border p-8">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-3xl shadow-sm border p-8">
          <h2 className="text-xl font-semibold mb-6">Account Actions</h2>
          <div className="space-y-4">
            <Link href="/dashboard/my-profile">
              <Button variant="outline" className="w-full justify-start rounded-xl h-12">
                ✏️ Edit Profile
              </Button>
            </Link>

            <Link href="/change-password">
              <Button variant="outline" className="w-full justify-start rounded-xl h-12">
                🔒 Change Password
              </Button>
            </Link>

            {user.role === "CUSTOMER" && (
              <Link href="/dashboard">
                <Button variant="outline" className="w-full justify-start rounded-xl h-12">
                  📦 My Orders
                </Button>
              </Link>
            )}

            {user.role === "SELLER" && (
              <Link href="/seller/dashboard">
                <Button variant="outline" className="w-full justify-start rounded-xl h-12">
                  🏪 Seller Dashboard
                </Button>
              </Link>
            )}

            {user.role === "ADMIN" && (
              <Link href="/admin/dashboard">
                <Button variant="outline" className="w-full justify-start rounded-xl h-12">
                  ⚙️ Admin Dashboard
                </Button>
              </Link>
            )}

            <form action={logoutUser}>
              <Button
                type="submit"
                variant="destructive"
                className="w-full justify-start rounded-xl h-12"
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
