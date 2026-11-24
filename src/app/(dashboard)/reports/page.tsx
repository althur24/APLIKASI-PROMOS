import type { Metadata } from "next";
import { BadgeCheck, Banknote, Clock, Coins, ListChecks } from "lucide-react";

import { ExportButtons } from "@/components/reports/export-buttons";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { RequestFilters } from "@/components/requests/request-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/dal";
import {
  getProfiles,
  getProjects,
  getReportRows,
} from "@/lib/data/requests";
import { formatCurrency, formatNumber } from "@/lib/format";
import { parseRequestFilters, type SearchParamsInput } from "@/lib/filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Laporan - Promotion Tracker",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  await requireUser();
  const params = await searchParams;
  const filters = parseRequestFilters(params);

  const [{ rows }, projects, profiles] = await Promise.all([
    getReportRows(filters),
    getProjects(),
    getProfiles(),
  ]);

  const summary = rows.reduce(
    (acc, row) => {
      const amount = Number(row.amount);
      acc.count += 1;
      acc.total += amount;
      if (row.status === "realized") {
        acc.realizedCount += 1;
        acc.realized += amount;
      } else if (row.status === "paid") {
        acc.paidCount += 1;
        acc.paid += amount;
      } else {
        acc.pendingCount += 1;
        acc.pending += amount;
      }
      return acc;
    },
    {
      count: 0,
      total: 0,
      pending: 0,
      paid: 0,
      realized: 0,
      pendingCount: 0,
      paidCount: 0,
      realizedCount: 0,
    },
  );

  function recap(selector: (row: (typeof rows)[number]) => string) {
    const map = new Map<string, { count: number; amount: number }>();
    rows.forEach((row) => {
      const key = selector(row) || "—";
      const entry = map.get(key) ?? { count: 0, amount: 0 };
      entry.count += 1;
      entry.amount += Number(row.amount);
      map.set(key, entry);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].amount - a[1].amount);
  }

  const byProject = recap((row) => row.project ?? "Tanpa proyek");
  const byCategory = recap((row) => row.category ?? "Tanpa kategori");
  const byPengaju = recap((row) => row.creator ?? "-");

  const recapTables = [
    { title: "Rekap per Proyek", first: "Proyek", data: byProject },
    { title: "Rekap per Kategori", first: "Kategori", data: byCategory },
    { title: "Rekap per Pengaju", first: "Pengaju", data: byPengaju },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Laporan"
        description="Rekap item pengajuan berdasarkan filter yang aktif."
        action={<ExportButtons rows={rows} />}
      />

      <RequestFilters projects={projects} profiles={profiles} hidePartial />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        <SummaryCard
          label="Jumlah Item"
          value={formatNumber(summary.count)}
          icon={ListChecks}
          tone="primary"
        />
        <SummaryCard
          label="Total Nominal"
          value={formatCurrency(summary.total)}
          icon={Coins}
        />
        <SummaryCard
          label="Belum Cair"
          value={formatCurrency(summary.pending)}
          hint={`${formatNumber(summary.pendingCount)} item`}
          icon={Clock}
          tone="warning"
        />
        <SummaryCard
          label="Sudah Cair"
          value={formatCurrency(summary.paid)}
          hint={`${formatNumber(summary.paidCount)} item`}
          icon={BadgeCheck}
          tone="success"
        />
        <SummaryCard
          label="Sudah Realisasi"
          value={formatCurrency(summary.realized)}
          hint={`${formatNumber(summary.realizedCount)} item`}
          icon={Banknote}
          tone="primary"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Tidak ada data"
          description="Ubah filter periode, jenis, proyek, status, atau pengaju."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recapTables.map((table) => (
            <Card key={table.title}>
              <CardHeader>
                <CardTitle>{table.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>{table.first}</TableHead>
                      <TableHead className="text-right">Item</TableHead>
                      <TableHead className="text-right">Nominal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.data.map(([name, value]) => (
                      <TableRow key={name}>
                        <TableCell className="break-words font-medium">
                          {name}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(value.count)}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatCurrency(value.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
