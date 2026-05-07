"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="text-center max-w-md">
        <p className="text-5xl font-black text-zinc-200 mb-4">Oops</p>
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-zinc-400 text-sm mb-8">
          We encountered an unexpected error. Please try again or return to the
          store.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-700 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-zinc-200 text-sm font-bold hover:bg-zinc-100 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
