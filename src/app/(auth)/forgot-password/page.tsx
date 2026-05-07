"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/services/auth/forgotPassword";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, null);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(state.message || "Reset link sent! Check your email.");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-xl border">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
           <Link href="/" >
              <Image src="/logo.png" alt="Cabro" width={120} height={120}  priority className="object-contain" />
            </Link>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Forgot Password</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {state?.success ? (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center text-sm text-green-700">
            <p className="font-medium">Check your email</p>
            <p className="mt-1">
              If an account exists for that email, we&apos;ve sent a password reset link. It expires in 15 minutes.
            </p>
          </div>
        ) : (
          <form action={formAction} className="space-y-6 mt-8">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full rounded-full" disabled={isPending}>
              {isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
