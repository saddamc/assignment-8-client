"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

                return (
                    <Card key={card.title} className="overflow-hidden rounded-[28px] border-slate-200 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                {card.subtitle}
                            </CardDescription>
                            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                                {card.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-5 sm:grid-cols-[160px_1fr] sm:items-center">
                            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-40 w-40">
                                <RadialBarChart
                                    data={[{ name: card.title, progress: card.progress, fill: "var(--color-progress)" }]}
                                    endAngle={100}
                                    innerRadius={55}
                                    outerRadius={80}
                                    startAngle={-260}
                                >
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                hideLabel
                                                formatter={(value) => `${Number(value ?? 0).toFixed(0)}%`}
                                            />
                                        }
                                    />
                                    <PolarAngleAxis domain={[0, 100]} tick={false} type="number" />
                                    <PolarGrid gridType="circle" radialLines={false} stroke="#e2e8f0" polarRadius={[61, 49]} />
                                    <RadialBar background dataKey="progress" cornerRadius={18} />
                                </RadialBarChart>
                            </ChartContainer>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-4xl font-semibold tracking-tight text-slate-900">{card.orders}</p>
                                    <p className="mt-1 text-sm text-slate-500">Orders in this period</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Revenue</p>
                                    <p className="mt-1 text-xl font-semibold text-slate-900">${card.revenue.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Share of all orders</span>
                                    <span className="font-semibold text-slate-900">{card.progress.toFixed(0)}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}