import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/requests/status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate, daysSince } from "@/lib/format";
import type { ExpenseRequestWithRelations } from "@/types";

export function RecentRequests({
  rows,
}: {
  rows: ExpenseRequestWithRelations[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pengajuan Terbaru</CardTitle>
        <Link
          href="/requests"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Lihat semua
          <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada pengajuan.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Link
                    href={`/requests/${row.id}`}
                    className="line-clamp-1 text-sm font-medium text-foreground hover:text-primary"
                  >
                    {row.title}
                  </Link>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{row.request_number}</span>
                    <span>·</span>
                    <span>{formatDate(row.submission_date)}</span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-sm font-medium tabular-nums sm:block">
                    {formatCurrency(row.amount)}
                  </span>
                  <StatusBadge status={row.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function PendingRequests({
  rows,
}: {
  rows: ExpenseRequestWithRelations[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-4 text-warning" />
          Belum Cair
        </CardTitle>
        <Link
          href="/submitted"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Lihat
          <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Semua pengajuan sudah cair.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {rows.map((row) => {
              const days = daysSince(row.submission_date);
              return (
                <li key={row.id}>
                  <Link
                    href={`/requests/${row.id}`}
                    className="block rounded-xl border border-border px-3 py-2.5 transition-colors hover:bg-secondary/60"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-medium text-foreground">
                        {row.title}
                      </p>
                      <span className="shrink-0 rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-[#a86414]">
                        {days} hari
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{row.creator?.full_name ?? "-"}</span>
                      <span className="font-medium tabular-nums text-foreground">
                        {formatCurrency(row.amount)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
