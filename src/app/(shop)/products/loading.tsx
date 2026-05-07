import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Home/Navbar";
import Footer from "@/components/Home/Footer";

function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  );
}

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-16 md:px-8">
        <div className="mb-10">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-12 w-72 mb-3" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filter sidebar skeleton */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-lg" />
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-lg" />
              ))}
            </div>
          </aside>

          {/* Grid skeleton */}
          <div className="flex-1">
            <div className="flex justify-between mb-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-9 w-40 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
