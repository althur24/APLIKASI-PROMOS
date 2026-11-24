import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Clock, Coins, ListChecks, Plus } from "lucide-react";

import { ExpenseOverviewChart } from "@/components/dashboard/expense-overview-chart";
import {
  PendingRequests,
  RecentRequests,
} from "@/components/dashboard/monitoring-lists";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatusDonutChart } from "@/components/dashboard/status-donut-chart";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/dal";
import { getRecentActivity } from "@/lib/data/activity";
import {
  getDashboardStats,
  getMonthlySeries,
  getPendingRequests,
  getRecentRequests,
} from "@/lib/data/requests";
import { formatCurrency, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard - Promotion Tracker",
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

export default async function DashboardPage() {
  const profile = await requireUser();
  const [stats, monthly, recent, pending, activity] = await Promise.all([
    getDashboardStats(),
    getMonthlySeries(6),
    getRecentRequests(5),
    getPendingRequests(5),
    getRecentActivity(6),
  ]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {greeting()}, {profile.full_name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan item pengajuan dana promosi tim.
          </p>
        </div>
        <Button asChild>
          <Link href="/requests/new">
            <Plus className="size-4" />
            Tambah Pengajuan
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <SummaryCard
          label="Total Item"
          value={formatNumber(stats.totalCount)}
          hint="Item aktif"
          icon={ListChecks}
          tone="primary"
        />
        <SummaryCard
          label="Total Nominal"
          value={formatCurrency(stats.totalAmount)}
          hint="Seluruh item"
          icon={Coins}
        />
        <SummaryCard
          label="Belum Cair"
          value={formatCurrency(stats.pendingAmount)}
          hint={`${formatNumber(stats.pendingCount)} item`}
          icon={Clock}
          tone="warning"
        />
        <SummaryCard
          label="Sudah Cair"
          value={formatCurrency(stats.paidAmount)}
          hint={`${formatNumber(stats.paidCount)} item`}
          icon={BadgeCheck}
          tone="success"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Nominal Pengajuan, Pencairan & Realisasi</CardTitle>
            <CardDescription>
              6 bulan terakhir, dihitung dari seluruh item.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseOverviewChart data={monthly} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Komposisi Status</CardTitle>
            <CardDescription>Berbasis item.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusDonutChart
              pendingAmount={stats.pendingAmount}
              paidAmount={stats.paidAmount}
              realizedAmount={stats.realizedAmount}
              pendingCount={stats.pendingCount}
              paidCount={stats.paidCount}
              realizedCount={stats.realizedCount}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2.5 rounded-full bg-warning" />
                  Belum Cair
                </span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(stats.pendingAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2.5 rounded-full bg-success" />
                  Sudah Cair
                </span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(stats.paidAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2.5 rounded-full bg-[#7c3aed]" />
                  Sudah Realisasi
                </span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(stats.realizedAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <RecentRequests rows={recent} />
        <PendingRequests rows={pending} />
        <div className="lg:col-span-2">
          <RecentActivity rows={activity} />
        </div>
      </div>
    </div>
  );
}
