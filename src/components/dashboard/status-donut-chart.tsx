"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatCurrency } from "@/lib/format";

export function StatusDonutChart({
  pendingAmount,
  paidAmount,
  realizedAmount,
  pendingCount,
  paidCount,
  realizedCount,
}: {
  pendingAmount: number;
  paidAmount: number;
  realizedAmount: number;
  pendingCount: number;
  paidCount: number;
  realizedCount: number;
}) {
  const data = [
    { name: "Belum Cair", value: pendingAmount, color: "#e99a32" },
    { name: "Sudah Cair", value: paidAmount, color: "#16a36a" },
    { name: "Sudah Realisasi", value: realizedAmount, color: "#7c3aed" },
  ];

  const isEmpty =
    pendingAmount === 0 && paidAmount === 0 && realizedAmount === 0;

  return (
    <div className="relative h-[190px] w-full sm:h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={isEmpty ? [{ name: "Kosong", value: 1, color: "#e2e8f0" }] : data}
            dataKey="value"
            nameKey="name"
            innerRadius={64}
            outerRadius={92}
            paddingAngle={isEmpty ? 0 : 3}
            stroke="none"
          >
            {(isEmpty ? [{ color: "#e2e8f0" }] : data).map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          {!isEmpty ? (
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(Number(value)),
                String(name),
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e8edf3",
                fontSize: 12,
              }}
            />
          ) : null}
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-muted-foreground">Total</span>
        <span className="text-base font-semibold tabular-nums text-foreground sm:text-lg">
          {pendingCount + paidCount + realizedCount}
        </span>
        <span className="text-xs text-muted-foreground">item</span>
      </div>
    </div>
  );
}
