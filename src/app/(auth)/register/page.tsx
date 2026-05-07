"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { registerUser } from "@/services/auth/registerUser";
import Image from "next/image";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, null);

  useEffect(() => {
    if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-xl border">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Link href="/" >
              <Image src="/logo.png" alt="Cabro" width={120} height={120}  priority className="object-contain" />
            </Link>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Join Cabro for exclusive access.
          </p>
        </div>

        <form action={formAction} className="space-y-5 mt-8">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              required
              autoFocus
            />
          </div>

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
              placeholder="Repeat your password"
              required
            />
          </div>

          <input type="hidden" name="role" value="CUSTOMER" />

          {state && !state.success && state.message && (
            <p className="text-sm text-red-600 rounded-lg bg-red-50 border border-red-200 p-3">
              {state.message}
            </p>
          )}

          <Button type="submit" className="w-full rounded-full" disabled={isPending}>
            {isPending ? "Creating account..." : "Sign up"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Want to sell on Cabro?{" "}
            <Link href="/register-seller" className="font-semibold text-[#FF6600] hover:underline">
              Open a seller account →
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
