import { serverFetch } from "@/lib/server-fetch";
import CustomerSettingsClient from "./CustomerSettingsClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Profile = any;

export default async function CustomerSettingsPage() {
  let profile: Profile = null;

  try {
    const res = await serverFetch.get("/user/me");
    const data = await res.json();
    if (data.success) profile = data.data;
  } catch { /* show empty form */ }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">My Account</p>
        <h1 className="text-3xl font-serif font-bold">Account Settings</h1>
      </div>
      <CustomerSettingsClient profile={profile} />
    </div>
  );
}
