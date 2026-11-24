import Link from "next/link";
import { Inbox } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PayItemDialog } from "@/components/requests/pay-item-dialog";
import { RealizeItemDialog } from "@/components/requests/realize-item-dialog";
import { StatusBadge } from "@/components/requests/status-badge";
import { TypeBadge } from "@/components/requests/type-badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ProcessingItemRow } from "@/lib/data/requests";
import { formatCurrency, formatDate } from "@/lib/format";

export function ProcessingList({
  rows,
  kind,
}: {
  rows: ProcessingItemRow[];
  kind: "disbursement" | "realization";
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title={
          kind === "disbursement"
            ? "Tidak ada item yang perlu dicairkan"
            : "Tidak ada item yang perlu direalisasikan"
        }
        description="Semua item sudah diproses atau tidak cocok dengan pencarian."
      />
    );
  }

  return (
    <Card>
      <CardContent className="divide-y divide-border p-0">
        {rows.map((row) => (
          <div key={row.item_id} className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Link
                    href={`/requests/${row.request_id}`}
                    className="font-mono text-xs text-muted-foreground hover:text-primary"
                  >
                    {row.request_number}
                  </Link>
                  <TypeBadge type={row.type} />
                  <StatusBadge status={row.status} />
                </div>
                <p className="mt-1 break-words text-sm font-medium text-foreground">
                  {row.item_name}
                </p>
                <p className="mt-0.5 break-words text-xs text-muted-foreground">
                  {row.request_title} · {row.project ?? "Tanpa proyek"}
                  {row.category ? ` · ${row.category}` : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrency(row.amount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(row.submission_date)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Pengaju: {row.creator ?? "-"}
              </p>
              {kind === "disbursement" ? (
                <PayItemDialog
                  itemId={row.item_id}
                  itemName={row.item_name}
                  submissionDate={row.submission_date}
                />
              ) : (
                <RealizeItemDialog
                  itemId={row.item_id}
                  itemName={row.item_name}
                />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
