"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/services/auth/changePassword";
import Link from "next/link";
import Image from "next/image";

export default function ChangePasswordPage() {
  const [state, formAction, isPending] = useActionState(changePassword, null);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(state.message || "Password changed successfully!");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-xl border">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/logo.png" alt="Cabro" width={40} height={40} className="h-10 w-10 object-contain rounded-full" />
            <Image src="/name.jpeg" alt="Cabro" width={100} height={32} className="h-8 w-auto object-contain" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Change Password</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Update your account password.
          </p>
        </div>

        {state?.success ? (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center text-sm text-green-700">
            <p className="font-medium">Password Updated!</p>
            <p className="mt-1">Your password has been changed successfully.</p>
            <Link
              href="/my-profile"
              className="mt-3 inline-block font-semibold text-primary hover:underline"
            >
              Go to Profile
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-5 mt-8">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <Input
                id="oldPassword"
                name="oldPassword"
                type="password"
                placeholder="Enter current password"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Min. 6 characters"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                placeholder="Repeat new password"
                required
              />
            </div>

            {state && !state.success && state.message && (
              <p className="text-sm text-red-600 rounded-lg bg-red-50 border border-red-200 p-3">
                {state.message}
              </p>
            )}

            <Button type="submit" className="w-full rounded-full" disabled={isPending}>
              {isPending ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/my-profile" className="font-semibold text-primary hover:underline">
            Back to Profile
          </Link>
        </p>
      </div>
    </div>
  );
}
