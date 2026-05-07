import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Home/Navbar";
import Footer from "@/components/Home/Footer";

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12 md:px-8">
          <Skeleton className="h-5 w-36 mb-10" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
            {/* Left: Gallery skeleton */}
            <div className="flex flex-row gap-4">
              <div className="flex flex-col gap-3 w-16">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square w-16 rounded-xl" />
                ))}
              </div>
              <Skeleton className="flex-1 aspect-[4/5] rounded-3xl" />
            </div>

            {/* Right: Info skeleton */}
            <div className="space-y-5">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-10 w-2/4" />
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-36 rounded-2xl" />
                <Skeleton className="h-12 w-48 rounded-2xl" />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
