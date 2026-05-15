"use client";

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SellerRevenueChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return <div className="flex h-72 items-center justify-center text-sm text-zinc-400">No revenue data available</div>;
    }

    return (
        <ChartContainer
            config={{
                revenue: {
                    label: "Revenue",
                    color: "#0f766e",
                },
            } satisfies ChartConfig}
            className="h-[300px] w-full"
        >
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="sellerRevenueFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0f766e" stopOpacity={0.22} />
                            <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} />
                    <YAxis
                        tick={{ fontSize: 12, fill: "#71717a" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `$${Number(value ?? 0).toLocaleString()}`}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent formatter={(value) => `$${Number(value ?? 0).toLocaleString()}`} />}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={3} fill="url(#sellerRevenueFill)" />
                </AreaChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}