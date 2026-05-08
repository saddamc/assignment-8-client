"use client";

import { useActionState, useEffect, Suspense } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAndRedirect } from "@/services/auth/resetPassword";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "";
  const token = searchParams.get("token") || "";

  const [state, formAction, isPending] = useActionState(resetPasswordAndRedirect, null);

  useEffect(() => {
    if (!state) return;
    if (!state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  if (!userId || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-600">Invalid Reset Link</h2>
          <p className="text-muted-foreground">
            This password reset link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block mt-4 text-primary font-semibold hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-xl border">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Link href="/" >
              <Image src="/logo.png" alt="Cabro" width={120} height={120}  priority className="object-contain" />
            </Link>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Reset Password</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your new password below.
          </p>
        </div>

        <form action={formAction} className="space-y-6 mt-8">
          {/* Hidden fields for server action */}
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="token" value={token} />

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your new password"
              required
            />
          </div>

          {state && !state.success && state.message && (
            <p className="text-sm text-red-600 rounded-lg bg-red-50 border border-red-200 p-3">
              {state.message}
            </p>
          )}

          <Button type="submit" className="w-full rounded-full" disabled={isPending}>
            {isPending ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Back to Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
