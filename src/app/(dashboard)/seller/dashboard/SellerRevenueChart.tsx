"use client";

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SellerRevenueChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400 dark:text-slate-600">
        No revenue data available
      </div>
    );
  }

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(174 83% 26%)", // teal-700 — same in light + dark
    },
  } satisfies ChartConfig;

  const maxVal = Math.max(...data.map((d) => d.revenue ?? 0));
  const yMax = maxVal > 0 ? Math.ceil(maxVal / 500) * 500 : 1000;

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="sellerRevenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(174 83% 26%)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="hsl(174 83% 26%)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-slate-400 dark:text-slate-600"
            axisLine={false}
            tickLine={false}
            dy={6}
          />

          <YAxis
            domain={[0, yMax]}
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-slate-400 dark:text-slate-600"
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(v) =>
              v >= 1000
                ? `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
                : `$${v}`
            }
          />

          <ChartTooltip
            cursor={{ stroke: "hsl(174 83% 26%)", strokeWidth: 1, strokeDasharray: "3 3" }}
            content={
              <ChartTooltipContent
                formatter={(value) =>
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(Number(value ?? 0))
                }
              />
            }
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(174 83% 26%)"
            strokeWidth={2.5}
            fill="url(#sellerRevenueFill)"
            dot={false}
            activeDot={{ r: 4, fill: "hsl(174 83% 26%)", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}