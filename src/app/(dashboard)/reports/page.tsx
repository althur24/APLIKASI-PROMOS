import type { Metadata } from "next";
import { BadgeCheck, Clock, Coins, ListChecks } from "lucide-react";

import { ExportButtons } from "@/components/reports/export-buttons";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { RequestFilters } from "@/components/requests/request-filters";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  getCategories,
  getProfiles,
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

  const [{ rows }, categories, profiles] = await Promise.all([
    getReportRows(filters),
    getCategories(),
    getProfiles(),
  ]);

  const summary = rows.reduce(
    (acc, row) => {
      const amount = Number(row.amount);
      acc.count += 1;
      acc.total += amount;
      if (row.status === "paid") {
        acc.paidCount += 1;
        acc.paid += amount;
      } else {
        acc.pendingCount += 1;
        acc.pending += amount;
      }
      return acc;
    },
    { count: 0, total: 0, pending: 0, paid: 0, pendingCount: 0, paidCount: 0 },
  );

  const byCategory = new Map<string, { count: number; amount: number }>();
  const byPengaju = new Map<string, { count: number; amount: number }>();

  rows.forEach((row) => {
    const categoryName = row.category?.name ?? "Tanpa Kategori";
    const pengajuName = row.creator?.full_name ?? "-";

    const categoryEntry = byCategory.get(categoryName) ?? {
      count: 0,
      amount: 0,
    };
    categoryEntry.count += 1;
    categoryEntry.amount += Number(row.amount);
    byCategory.set(categoryName, categoryEntry);

    const pengajuEntry = byPengaju.get(pengajuName) ?? { count: 0, amount: 0 };
    pengajuEntry.count += 1;
    pengajuEntry.amount += Number(row.amount);
    byPengaju.set(pengajuName, pengajuEntry);
  });

  const categoryRows = Array.from(byCategory.entries()).sort(
    (a, b) => b[1].amount - a[1].amount,
  );
  const pengajuRows = Array.from(byPengaju.entries()).sort(
    (a, b) => b[1].amount - a[1].amount,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Laporan"
        description="Rekap pengajuan dana promosi berdasarkan filter yang aktif."
        action={<ExportButtons rows={rows} />}
      />

      <RequestFilters categories={categories} profiles={profiles} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          label="Jumlah Pengajuan"
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
          hint={`${formatNumber(summary.pendingCount)} transaksi`}
          icon={Clock}
          tone="warning"
        />
        <SummaryCard
          label="Sudah Cair"
          value={formatCurrency(summary.paid)}
          hint={`${formatNumber(summary.paidCount)} transaksi`}
          icon={BadgeCheck}
          tone="success"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Tidak ada data"
          description="Ubah filter periode, kategori, status, atau pengaju untuk melihat data lain."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Rekap per Kategori</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-5 sm:pl-6">Kategori</TableHead>
                    <TableHead className="text-right">Transaksi</TableHead>
                    <TableHead className="pr-5 text-right sm:pr-6">
                      Nominal
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryRows.map(([name, value]) => (
                    <TableRow key={name}>
                      <TableCell className="pl-5 font-medium sm:pl-6">
                        {name}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(value.count)}
                      </TableCell>
                      <TableCell className="pr-5 text-right font-medium tabular-nums sm:pr-6">
                        {formatCurrency(value.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rekap per Pengaju</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-5 sm:pl-6">Pengaju</TableHead>
                    <TableHead className="text-right">Transaksi</TableHead>
                    <TableHead className="pr-5 text-right sm:pr-6">
                      Nominal
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pengajuRows.map(([name, value]) => (
                    <TableRow key={name}>
                      <TableCell className="pl-5 font-medium sm:pl-6">
                        {name}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(value.count)}
                      </TableCell>
                      <TableCell className="pr-5 text-right font-medium tabular-nums sm:pr-6">
                        {formatCurrency(value.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
