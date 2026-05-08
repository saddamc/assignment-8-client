import Link from "next/link";
import { ArrowDownRight, Shield, Sparkles, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const TRUST_STATS = [
  {
    label: "4.9/5",
    caption: "Premium reviews",
    icon: Star,
  },
  {
    label: "2.4M+",
    caption: "Luxury orders fulfilled",
    icon: Truck,
  },
  {
    label: "99.98%",
    caption: "On-time delivery",
    icon: Shield,
  },
  {
    label: "24/7",
    caption: "White-glove support",
    icon: Sparkles,
  },
];

const FLOAT_CARDS = [
  {
    title: "Dedicated drop-shipping",
    value: "Instant fulfillment",
  },
  {
    title: "Curated for impact",
    value: "Designer-grade edit",
  },
  {
    title: "Sustainable craft",
    value: "Eco-premium quality",
  },
];

export default function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-slate-950 text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(255,179,48,0.24),transparent_40%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-32 -z-10 h-72 w-72 rounded-full bg-white/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-20 -z-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16 sm:px-8 lg:flex-row lg:items-center lg:gap-16 lg:py-24 xl:px-12">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 shadow-[0_18px_70px_-40px_rgba(255,255,255,0.45)]">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_0_10px_rgba(255,179,48,0.18)] animate-pulse" />
            2026 limited launch
          </p>

          <div className="mt-10 space-y-6">
            <h1
              id="hero-heading"
              className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Cabro turns every purchase into a premium statement.
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Discover expertly curated essentials designed for luxury, speed, and confidence. Shop with the ease of modern commerce, backed by elite delivery and white-glove service.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild className="w-full rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_24px_80px_-42px_rgba(255,179,48,0.85)] transition duration-300 hover:bg-amber-300 sm:w-auto">
                <Link href="/products">Shop Now</Link>
              </Button>

              <Button asChild variant="outline" className="w-full rounded-full px-6 py-3 text-sm text-white transition duration-300 hover:bg-white/10 sm:w-auto">
                <Link href="/collections">Explore Collection</Link>
              </Button>
            </div>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2">
            {TRUST_STATS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_70px_-60px_rgba(255,255,255,0.5)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/70 text-amber-300 shadow-[0_10px_30px_-20px_rgba(255,179,48,0.5)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-lg font-semibold text-white">{item.label}</p>
                      <p className="text-sm text-slate-400">{item.caption}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative lg:w-[560px]">
          <div className="absolute inset-0 rounded-[2.5rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),transparent_30%)] opacity-80" />
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_120px_-60px_rgba(0,0,0,0.75)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),transparent_30%)]" />
            <div className="relative rounded-[2.25rem] border border-white/10 bg-slate-900/95 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
              <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-950 to-black px-6 py-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.75)]">
                <div className="absolute -left-4 top-6 h-28 w-28 rounded-full bg-amber-400/10 blur-3xl" aria-hidden="true" />
                <div className="absolute right-6 top-10 h-16 w-16 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />

                <div className="relative z-10 flex flex-col gap-6">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.22em] text-white/70">
                      Limited run
                    </span>
                    <span className="text-white/60">Cabro Obsidian</span>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Ultra-premium device accessories</p>
                    <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                      Obsidian Smart Case
                    </h2>
                    <p className="max-w-xs text-sm leading-6 text-slate-300">
                      A bold fusion of matte glass, satin alloy, and intelligence built for every high-end lifestyle.
                    </p>
                  </div>

                  <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-[0_18px_60px_-50px_rgba(0,0,0,0.65)] backdrop-blur-xl">
                    <div className="flex items-center justify-between text-slate-100">
                      <span>Adaptive edge comfort</span>
                      <span className="font-semibold text-white">12h+ hold</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-100">
                      <span>Pure ceramic finish</span>
                      <span className="font-semibold text-white">Zero glare</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-12 left-6 grid w-[calc(100%-4rem)] gap-4 sm:w-[calc(100%-3rem)] sm:grid-cols-3">
                {FLOAT_CARDS.map((card) => (
                  <div
                    key={card.title}
                    className="hero-float rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-4 text-sm text-slate-100 shadow-[0_20px_70px_-50px_rgba(0,0,0,0.6)] backdrop-blur-xl"
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{card.title}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
        <Link
          href="#featured"
          className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
        >
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-[pulse_1.6s_ease-in-out_infinite]" />
          Discover the collection
          <ArrowDownRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1" />
        </Link>
      </div>

      <style>{`
        .hero-float { animation: float 8s ease-in-out infinite; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
}
