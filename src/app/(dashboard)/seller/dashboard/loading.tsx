import { Skeleton } from "@/components/ui/skeleton";

export default function SellerDashboardLoading() {
  return (
    <div className="space-y-8 lg:space-y-10">
      <div className="rounded-4xl border border-slate-200 bg-slate-950 px-6 py-7 shadow-sm sm:px-8 lg:px-10 lg:py-9">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div className="space-y-5">
            <Skeleton className="h-7 w-40 rounded-full bg-white/10" />
            <div className="space-y-3">
              <Skeleton className="h-11 w-full max-w-2xl bg-white/10" />
              <Skeleton className="h-5 w-full max-w-xl bg-white/10" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-12 w-40 rounded-2xl bg-white/10" />
              <Skeleton className="h-12 w-36 rounded-2xl bg-white/10" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-3xl border border-white/10 bg-white/10 p-5">
                <Skeleton className="h-4 w-28 bg-white/10" />
                <Skeleton className="mt-4 h-10 w-32 bg-white/10" />
                <Skeleton className="mt-3 h-4 w-40 bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <Skeleton className="mt-4 h-4 w-20" />
            <Skeleton className="mt-2 h-9 w-28" />
            <Skeleton className="mt-3 h-4 w-36" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_0.95fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-44" />
            </div>
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="mt-6 h-75 w-full rounded-3xl" />
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-8 w-44" />
          <div className="mt-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-44" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[...Array(4)].map((__, j) => (
                <div key={j} className="rounded-3xl border border-slate-200 p-5">
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                  <Skeleton className="mt-4 h-4 w-28" />
                  <Skeleton className="mt-2 h-8 w-24" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5 lg:px-7">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-3 h-8 w-44" />
          </div>
          <div className="divide-y divide-slate-100 px-6 lg:px-7">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-44" />
              <div className="mt-6 space-y-3">
                {[...Array(3)].map((__, j) => (
                  <div key={j} className="rounded-2xl border border-slate-200 p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-2 h-3 w-20" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
