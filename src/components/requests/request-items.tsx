import { Paperclip } from "lucide-react";

import { PayItemDialog } from "@/components/requests/pay-item-dialog";
import { RealizeItemDialog } from "@/components/requests/realize-item-dialog";
import { ReceiptUploader } from "@/components/requests/receipt-uploader";
import { StatusBadge } from "@/components/requests/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RequestAttachmentWithUrl } from "@/lib/data/requests";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ExpenseRequestItem, RequestType } from "@/types";

function AttachmentChips({
  attachments,
  label,
}: {
  attachments: RequestAttachmentWithUrl[];
  label: string;
}) {
  if (attachments.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {attachments.map((attachment) => (
        <a
          key={attachment.id}
          href={attachment.signedUrl ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-full items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
          title={`${label}: ${attachment.file_name}`}
        >
          <Paperclip className="size-3 shrink-0" />
          <span className="truncate">{attachment.file_name}</span>
        </a>
      ))}
    </div>
  );
}

export function RequestItems({
  requestId,
  requestType,
  submissionDate,
  items,
  attachments,
}: {
  requestId: string;
  requestType: RequestType;
  submissionDate: string;
  items: ExpenseRequestItem[];
  attachments: RequestAttachmentWithUrl[];
}) {
  const total = items.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Pengajuan</CardTitle>
        <CardDescription>
          {items.length} item · Total {formatCurrency(total)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => {
          const itemAttachments = attachments.filter(
            (attachment) => attachment.item_id === item.id,
          );
          const receipts = itemAttachments.filter(
            (attachment) => attachment.purpose === "receipt",
          );
          const realizations = itemAttachments.filter(
            (attachment) => attachment.purpose === "realization",
          );

          return (
            <div
              key={item.id}
              className="rounded-xl border border-border p-3 sm:p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.category?.name ?? "Tanpa kategori"}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrency(item.amount)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.status === "submitted" ? (
                    <PayItemDialog
                      itemId={item.id}
                      itemName={item.name}
                      submissionDate={submissionDate}
                    />
                  ) : null}
                  {item.status === "paid" && requestType === "pengajuan" ? (
                    <RealizeItemDialog itemId={item.id} itemName={item.name} />
                  ) : null}
                </div>
              </div>

              {item.disbursement_date || item.realized_date ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {item.disbursement_date
                    ? `Cair: ${formatDate(item.disbursement_date)}`
                    : ""}
                  {item.realized_date
                    ? `${item.disbursement_date ? " · " : ""}Realisasi: ${formatDate(item.realized_date)}`
                    : ""}
                </p>
              ) : null}

              {receipts.length > 0 || realizations.length > 0 ? (
                <div className="mt-2 space-y-1.5">
                  <AttachmentChips attachments={receipts} label="Struk" />
                  <AttachmentChips
                    attachments={realizations}
                    label="Foto Realisasi"
                  />
                </div>
              ) : null}

              {requestType === "reimbursement" && item.status === "submitted" ? (
                <ReceiptUploader requestId={requestId} itemId={item.id} />
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
