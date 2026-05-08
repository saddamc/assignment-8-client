import { serverFetch } from "@/lib/server-fetch";
import { Image as ImageIcon, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Banner = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  position: string;
  isActive: boolean;
  sortOrder: number;
};

export default async function AdminBannersPage() {
  let banners: Banner[] = [];

  try {
    const res = await serverFetch.get("/banners");
    const data = await res.json();
    if (data.success) banners = data.data?.data || data.data || [];
  } catch { /* empty */ }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Admin</p>
          <h1 className="text-3xl font-serif font-bold">Banner Management</h1>
        </div>
        <Link href="/admin/banners/new" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-colors">
          <Plus className="w-4 h-4" /> New Banner
        </Link>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-16 flex flex-col items-center text-center">
          <ImageIcon className="w-12 h-12 text-zinc-200 mb-4" />
          <h3 className="text-lg font-bold mb-2">No banners</h3>
          <p className="text-zinc-400 text-sm">Create site banners to promote products and sales.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden flex items-center gap-6 p-4">
              {banner.imageUrl && (
                <Image src={banner.imageUrl} alt={banner.title} width={128} height={80} className="object-cover rounded-xl shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${banner.isActive ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold uppercase">{banner.position}</span>
                </div>
                <p className="font-semibold">{banner.title}</p>
                {banner.subtitle && <p className="text-sm text-zinc-500">{banner.subtitle}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
