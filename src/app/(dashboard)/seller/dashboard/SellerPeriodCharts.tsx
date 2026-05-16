"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PolarAngleAxis, PolarGrid, RadialBar, RadialBarChart } from "recharts";

type PeriodCard = {
  title: string;
  subtitle: string;
  orders: number;
  revenue: number;
  progress: number;
  color: string;
};

interface SellerPeriodChartsProps {
  cards: PeriodCard[];
}

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function SellerPeriodCharts({ cards }: SellerPeriodChartsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {cards.map((card) => {
        const chartConfig = {
          progress: {
            label: card.title,
            color: card.color,
          },
        } satisfies ChartConfig;

        // Clamp progress so the arc never renders past the track
        const clampedProgress = Math.min(Math.max(card.progress, 0), 100);

        return (
          <Card
            key={card.title}
            className="overflow-hidden rounded-[28px] border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <CardHeader className="pb-0 pt-5 px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                {card.subtitle}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                {card.title}
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-6 pt-4">
              <div className="flex items-center gap-6 sm:gap-8">
                {/* Radial chart */}
                <div className="shrink-0">
                  <ChartContainer config={chartConfig} className="h-36 w-36">
                    <RadialBarChart
                      data={[
                        {
                          name: card.title,
                          progress: clampedProgress,
                          fill: "var(--color-progress)",
                        },
                      ]}
                      startAngle={90}
                      endAngle={90 - 360 * (clampedProgress / 100)}
                      innerRadius={44}
                      outerRadius={66}
                    >
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            hideLabel
                            formatter={(value) => `${Number(value ?? 0).toFixed(0)}% of all orders`}
                          />
                        }
                      />
                      <PolarAngleAxis domain={[0, 100]} tick={false} type="number" />
                      <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="currentColor"
                        className="text-slate-100 dark:text-slate-800"
                        polarRadius={[50, 38]}
                      />
                      <RadialBar
                        background={{ fill: "currentColor", className: "text-slate-100 dark:text-slate-800" }}
                        dataKey="progress"
                        cornerRadius={12}
                      />
                    </RadialBarChart>
                  </ChartContainer>
                </div>

                {/* Stats */}
                <div className="min-w-0 flex-1 space-y-4">
                  <div>
                    <p className="text-4xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-slate-50">
                      {card.orders.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {card.title === "All Time" ? "All-time orders" : "Orders this period"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                      {card.title === "All Time" ? "Total revenue" : "Revenue"}
                    </p>
                    <p className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      {currency(card.revenue)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Share of all orders</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50">
                      {clampedProgress.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}