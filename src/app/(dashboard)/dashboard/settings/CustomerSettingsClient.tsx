"use client";

import { useState } from "react";
import { toast } from "sonner";
import { User, Lock, Camera } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CustomerSettingsClient({ profile }: { profile: any }) {
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1"}/user/update-my-profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (data.success) toast.success("Profile updated!");
      else toast.error(data.message || "Update failed");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1"}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) { toast.success("Password changed!"); setCurrentPassword(""); setNewPassword(""); }
      else toast.error(data.message || "Password change failed");
    } catch {
      toast.error("Failed to change password");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Profile Photo */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-black text-indigo-600">
              {name?.slice(0, 2).toUpperCase() || "?"}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-500 transition-colors shadow-md">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="font-bold mt-4 text-center">{name || "Your Name"}</p>
          <p className="text-xs text-zinc-400 mt-1 text-center">{profile?.email || ""}</p>
          <span className="mt-3 text-xs font-bold uppercase tracking-widest px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full">
            {profile?.role || "CUSTOMER"}
          </span>
        </div>
      </div>

      {/* Forms */}
      <div className="lg:col-span-2 space-y-6">
        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="font-bold">Personal Information</h2>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-2">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-2">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border-2 border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-2">Email Address</label>
            <input
              value={profile?.email || ""}
              disabled
              className="w-full border-2 border-zinc-100 rounded-xl px-4 py-3 text-sm bg-zinc-50 text-zinc-400 cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Password Form */}
        <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Lock className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="font-bold">Change Password</h2>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-2">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border-2 border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border-2 border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
