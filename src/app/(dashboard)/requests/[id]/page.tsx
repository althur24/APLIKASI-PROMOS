import type { Metadata } from "next";
import {
  ArrowLeft,
  CalendarDays,
  CalendarCheck2,
  FolderKanban,
  UserRound,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ActivityTimeline } from "@/components/requests/activity-timeline";
import { AttachmentManager } from "@/components/requests/attachment-manager";
import { DeleteRequestButton } from "@/components/requests/delete-request-button";
import { RequestItems } from "@/components/requests/request-items";
import { StatusBadge } from "@/components/requests/status-badge";
import { TypeBadge } from "@/components/requests/type-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/dal";
import { getRequestDetail } from "@/lib/data/requests";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Pengajuan - Promotion Tracker",
};

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const detail = await getRequestDetail(id);

  if (!detail) notFound();

  const { request, items, attachments, logs } = detail;
  const generalAttachments = attachments.filter(
    (attachment) => attachment.purpose === "general",
  );

  const meta = [
    { label: "Proyek", value: request.project?.name ?? "-", icon: FolderKanban },
    { label: "Pengaju", value: request.creator?.full_name ?? "-", icon: UserRound },
    {
      label: "Tanggal Pengajuan",
      value: formatDate(request.submission_date),
      icon: CalendarDays,
    },
    {
      label: "Tgl Cair / Realisasi",
      value:
        [...items]
          .filter((item) => item.disbursement_date || item.realized_date)
          .slice(0, 1)
          .map((item) =>
            [
              item.disbursement_date ? formatDate(item.disbursement_date) : null,
              item.realized_date ? formatDate(item.realized_date) : null,
            ]
              .filter(Boolean)
              .join(" / "),
          )[0] ?? "Belum ada",
      icon: CalendarCheck2,
    },
  ];

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/requests">
          <ArrowLeft className="size-4" />
          Semua Pengajuan
        </Link>
      </Button>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {request.request_number}
            </span>
            <TypeBadge type={request.type} />
            <StatusBadge status={request.status} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {request.title}
          </h1>
          <div className="flex items-center gap-2 text-foreground">
            <Wallet className="size-5 text-primary" />
            <span className="break-words text-xl font-semibold tabular-nums sm:text-2xl">
              {formatCurrency(request.amount)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {request.item_count} item
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
            <Link href={`/requests/${request.id}/edit`}>Edit</Link>
          </Button>
          <DeleteRequestButton
            id={request.id}
            requestNumber={request.request_number}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <RequestItems
            requestId={request.id}
            requestType={request.type}
            submissionDate={request.submission_date}
            items={items}
            attachments={attachments}
          />

          <Card>
            <CardHeader>
              <CardTitle>Informasi Pengajuan</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {meta.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 rounded-xl bg-secondary/50 p-3"
                    >
                      <span className="flex size-9 items-center justify-center rounded-lg bg-card text-muted-foreground">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">
                          {item.label}
                        </dt>
                        <dd className="break-words text-sm font-medium text-foreground">
                          {item.value}
                        </dd>
                      </div>
                    </div>
                  );
                })}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line break-words text-sm text-muted-foreground">
                {request.notes?.trim() ? request.notes : "Tidak ada catatan."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lampiran Umum</CardTitle>
            </CardHeader>
            <CardContent>
              <AttachmentManager
                requestId={request.id}
                attachments={generalAttachments}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Riwayat Aktivitas</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline logs={logs} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
