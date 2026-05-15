"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = {
    [key: string]: {
        label?: React.ReactNode;
        color?: string;
    };
};

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
    const context = React.useContext(ChartContext);

    if (!context) {
        throw new Error("useChart must be used inside a <ChartContainer />");
    }

    return context;
}

const ChartContainer = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
        config: ChartConfig;
    }
>(({ className, config, style, children, ...props }, ref) => {
    const chartStyle = Object.entries(config).reduce((acc, [key, value]) => {
        if (value.color) {
            acc[`--color-${key}` as keyof React.CSSProperties] = value.color;
        }

        return acc;
    }, {} as React.CSSProperties);

    return (
        <ChartContext.Provider value={{ config }}>
            <div
                ref={ref}
                className={cn(
                    "flex w-full items-center justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-zinc-500 [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-zinc-200 [&_.recharts-reference-line_[stroke='#ccc']]:stroke-zinc-200 [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-tooltip-cursor]:stroke-zinc-200 [&_.recharts-text]:fill-zinc-700",
                    className
                )}
                style={{ ...chartStyle, ...style }}
                {...props}
            >
                {children}
            </div>
        </ChartContext.Provider>
    );
});
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
        active?: boolean;
        payload?: Array<{
            dataKey?: string;
            name?: string;
            value?: number | string;
            color?: string;
            payload?: Record<string, unknown>;
        }>;
        label?: string;
        hideLabel?: boolean;
        hideIndicator?: boolean;
        formatter?: (value: number | string, name: string) => React.ReactNode;
    }
>(({ active, payload, label, className, hideLabel = false, hideIndicator = false, formatter }, ref) => {
    const { config } = useChart();

    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div
            ref={ref}
            className={cn("min-w-36 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs shadow-xl", className)}
        >
            {!hideLabel && label ? <div className="mb-2 font-semibold text-zinc-900">{label}</div> : null}
            <div className="space-y-1.5">
                {payload.map((item, index) => {
                    const key = (item.dataKey || item.name || "value") as string;
                    const itemConfig = config[key];
                    const displayLabel = itemConfig?.label || item.name || key;
                    const displayValue = formatter ? formatter(item.value ?? 0, key) : item.value;

                    return (
                        <div key={`${key}-${index}`} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-zinc-500">
                                {!hideIndicator ? (
                                    <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: item.color || itemConfig?.color || "#0f766e" }}
                                    />
                                ) : null}
                                <span>{displayLabel}</span>
                            </div>
                            <span className="font-semibold text-zinc-900">{displayValue}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

export { ChartContainer, ChartTooltip, ChartTooltipContent };