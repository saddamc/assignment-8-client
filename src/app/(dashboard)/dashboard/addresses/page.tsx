import { serverFetch } from "@/lib/server-fetch";
import { MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/services/auth/getCurrentUser";
import { redirect } from "next/navigation";
import AddressActions from "./AddressActions";

type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export default async function AddressesPage() {
  const user = await getCurrentUser();

  // Only customers can have addresses
  if (!user || user.role !== "CUSTOMER") {
    redirect("/dashboard");
  }

  let addresses: Address[] = [];

  try {
    const res = await serverFetch.get("/address");
    const data = await res.json();
    if (data.success) addresses = data.data || [];
  } catch { /* empty */ }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">My Account</p>
          <h1 className="text-3xl font-serif font-bold">Saved Addresses</h1>
        </div>
        <Link
          href="/dashboard/addresses/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Address
        </Link>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
          <MapPin className="w-12 h-12 text-zinc-200 mb-4" />
          <h3 className="text-lg font-bold mb-2">No addresses saved</h3>
          <p className="text-zinc-400 text-sm mb-6">Add a delivery address for faster checkout.</p>
          <Link
            href="/dashboard/addresses/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add First Address
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className={`bg-white rounded-2xl border shadow-sm p-6 relative ${addr.isDefault ? "border-indigo-300 ring-1 ring-indigo-200" : "border-zinc-100"}`}>
              {addr.isDefault && (
                <span className="absolute top-4 right-4 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Default</span>
              )}
              <p className="font-bold text-sm text-zinc-400 uppercase tracking-wide mb-2">{addr.label}</p>
              <p className="font-semibold">{addr.fullName}</p>
              <p className="text-sm text-zinc-500">{addr.phone}</p>
              <p className="text-sm text-zinc-500 mt-1">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
              <p className="text-sm text-zinc-500">{addr.city}, {addr.state} {addr.postalCode}</p>
              <p className="text-sm text-zinc-500">{addr.country}</p>
              <AddressActions id={addr.id} isDefault={addr.isDefault} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
