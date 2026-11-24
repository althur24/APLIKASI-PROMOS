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
import { StatusBadge } from "@/components/requests/status-badge";
import { UpdateStatusDialog } from "@/components/requests/update-status-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const { request, attachments, logs } = detail;

  const meta = [
    {
      label: "Kategori",
      value: request.category?.name ?? "-",
      icon: FolderKanban,
    },
    {
      label: "Pengaju",
      value: request.creator?.full_name ?? "-",
      icon: UserRound,
    },
    {
      label: "Tanggal Pengajuan",
      value: formatDate(request.submission_date),
      icon: CalendarDays,
    },
    {
      label: "Tanggal Pencairan",
      value: request.disbursement_date
        ? formatDate(request.disbursement_date)
        : "Belum cair",
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

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {request.request_number}
            </span>
            <StatusBadge status={request.status} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {request.title}
          </h1>
          <div className="flex items-center gap-2 text-foreground">
            <Wallet className="size-5 text-primary" />
            <span className="text-2xl font-semibold tabular-nums">
              {formatCurrency(request.amount)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/requests/${request.id}/edit`}>Edit</Link>
          </Button>
          <UpdateStatusDialog
            requestId={request.id}
            status={request.status}
            disbursementDate={request.disbursement_date}
            notes={request.notes}
          />
          <DeleteRequestButton
            id={request.id}
            requestNumber={request.request_number}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
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
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          {item.label}
                        </dt>
                        <dd className="text-sm font-medium text-foreground">
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
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {request.notes?.trim() ? request.notes : "Tidak ada catatan."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lampiran</CardTitle>
            </CardHeader>
            <CardContent>
              <AttachmentManager
                requestId={request.id}
                attachments={attachments}
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
