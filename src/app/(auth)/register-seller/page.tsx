"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import Image from "next/image";
import { registerSeller } from "@/services/auth/registerSeller";
import { Store } from "lucide-react";

export default function RegisterSellerPage() {
  const [state, formAction, isPending] = useActionState(registerSeller, null);

  useEffect(() => {
    if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-lg space-y-8 bg-white p-8 rounded-3xl shadow-xl border">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image
              src="/logo.png"
              alt="Cabro"
              width={40}
              height={40}
              className="h-10 w-10 object-contain rounded-full"
            />
            <h1 className="text-[#FF6600] font-bold text-2xl">ABRO</h1>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Store className="h-5 w-5 text-[#FF6600]" />
            <h2 className="text-3xl font-bold tracking-tight">Become a Seller</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Open your store and start selling today.
          </p>
        </div>

        <form action={formAction} className="space-y-5 mt-6">
          {/* Account Info */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Account Info
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 6 characters"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat password"
                required
              />
            </div>
          </div>

          {/* Store Info */}
          <div className="space-y-1 pt-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Store Info
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name <span className="text-red-500">*</span></Label>
              <Input id="storeName" name="storeName" placeholder="My Awesome Store" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number <span className="text-red-500">*</span></Label>
              <Input id="contactNumber" name="contactNumber" placeholder="+1 555 000 0000" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeDescription">Store Description</Label>
            <Textarea
              id="storeDescription"
              name="storeDescription"
              placeholder="Tell customers what your store is about..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <Input id="address" name="address" placeholder="123 Main St, City, Country" />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#FF6600] hover:bg-[#e55a00] text-white font-semibold rounded-xl py-5"
            disabled={isPending}
          >
            {isPending ? "Creating your store..." : "Open My Store"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-[#FF6600] hover:underline font-medium">
            Sign in
          </Link>
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Want a customer account instead?{" "}
          <Link href="/register" className="text-[#FF6600] hover:underline font-medium">
            Register as customer
          </Link>
        </p>
      </div>
    </div>
  );
}
