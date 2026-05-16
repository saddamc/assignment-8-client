"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SpendPoint {
  period: string;
  spend: number;
  orders: number;
}

interface Props {
  data: SpendPoint[];
  title: string;
  subtitle: string;
}

export default function CustomerSpendChart({ data, title, subtitle }: Props) {
  return (
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">{subtitle}</p>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
        </div>
      </div>
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 24, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
            />
            <Tooltip
              formatter={(value) => {
                if (value == null) return ["", "Spend"];
                return [`$${Number(value).toLocaleString()}`, "Spend"];
              }}
            />
            <Line type="monotone" dataKey="spend" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
