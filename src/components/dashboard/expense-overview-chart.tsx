"use client";

import { formatCurrency } from "@/lib/format";
import type { MonthlyPoint } from "@/lib/data/requests";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function compact(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} M`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} rb`;
  return String(value);
}

export function ExpenseOverviewChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <div className="h-[240px] w-full sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickFormatter={(value: number) => compact(value)}
            width={48}
          />
          <Tooltip
            cursor={{ fill: "rgba(148,163,184,0.12)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e8edf3",
              fontSize: 12,
              boxShadow: "0 8px 24px rgba(16,24,40,0.08)",
            }}
            formatter={(value) => formatCurrency(Number(value))}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <Bar
            dataKey="diajukan"
            name="Diajukan"
            fill="#2563eb"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="cair"
            name="Cair"
            fill="#16a36a"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="realisasi"
            name="Realisasi"
            fill="#7c3aed"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
