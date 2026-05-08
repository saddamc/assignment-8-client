"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthUser } from "@/hooks/useAuthStore";
import { Camera } from "lucide-react";
import Image from "next/image";

interface Props {
  user: AuthUser;
}

export default function SettingsForm({ user }: Props) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user.profilePhoto || null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name is required"); return; }

    startTransition(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1";
        const fd = new FormData();
        fd.append("data", JSON.stringify({ name: name.trim(), email: email.trim(), ...(phone ? { contactNumber: phone } : {}) }));
        if (file) fd.append("file", file);

        const res = await fetch(`${apiUrl}/user/update-my-profile`, {
          method: "PATCH",
          credentials: "include",
          body: fd,
        });

        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Update failed");

        toast.success("Profile updated!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-2xl overflow-hidden">
            {preview ? (
              <Image src={preview} alt="Profile" 
              sizes="(max-width: 640px) 50vw,
              (max-width: 1024px) 33vw, 25vw" className=" object-cover" />
            ) : (
              user.name[0]?.toUpperCase()
            )}
          </div>
          <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center cursor-pointer hover:bg-indigo-500 transition-colors">
            <Camera className="w-3.5 h-3.5 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
        </div>
        <div>
          <p className="font-bold">{user.name}</p>
          <p className="text-sm text-zinc-400">{user.email}</p>
          <p className="text-xs text-indigo-600 font-bold mt-1">{user.role}</p>
        </div>
      </div>

      {/* Form fields */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-5">
        <h2 className="font-bold text-lg">Personal Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="rounded-xl px-8">
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
