"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/services/auth/loginUser";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, null);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";

  useEffect(() => {
    if (state && !state.success && state.message) {
      toast.error(state.message);
    }
    // Show success toasts from redirects
    if (searchParams.get("reset") === "true") {
      toast.success("Password reset successfully! Please sign in.");
    }
    if (searchParams.get("loggedOut") === "true") {
      toast.success("You have been signed out.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-xl border">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/logo.png" alt="Cabro" width={40} height={40} className="h-10 w-10 object-contain rounded-full" />
            <h1 className="text-[#FF6600] font-bold text-2xl">ABRO</h1>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your credentials to access your account.
          </p>
        </div>

        <form action={formAction} className="space-y-6 mt-8">
          {redirect && <input type="hidden" name="redirect" value={redirect} />}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full rounded-full" disabled={isPending}>
            {isPending ? "Logging in..." : "Sign in"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
