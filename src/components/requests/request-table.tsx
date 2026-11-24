"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Eye,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DeleteRequestButton } from "@/components/requests/delete-request-button";
import { StatusBadge } from "@/components/requests/status-badge";
import { TypeBadge } from "@/components/requests/type-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import type { ExpenseRequestWithRelations } from "@/types";

function SortHeader({
  column,
  children,
  className,
}: {
  column: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "submission_date.desc";
  const [activeColumn, direction] = current.split(".");
  const isActive = activeColumn === column;

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    const nextDirection =
      isActive && direction === "asc" ? "desc" : isActive ? "asc" : "asc";
    params.set("sort", `${column}.${nextDirection}`);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {children}
        {isActive ? (
          direction === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ChevronDown className="size-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  );
}

function RowActions({ row }: { row: ExpenseRequestWithRelations }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="iconSm" aria-label="Aksi">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/requests/${row.id}`}>
            <Eye className="size-4" />
            Lihat detail
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/requests/${row.id}/edit`}>
            <Pencil className="size-4" />
            Edit
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RequestTable({ rows }: { rows: ExpenseRequestWithRelations[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortHeader column="request_number">Nomor</SortHeader>
              <SortHeader column="title">Nama Pengajuan</SortHeader>
              <TableHead>Jenis</TableHead>
              <TableHead>Item</TableHead>
              <SortHeader column="submission_date">Tgl Pengajuan</SortHeader>
              <SortHeader column="amount" className="text-right">
                Nominal
              </SortHeader>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {row.request_number}
                </TableCell>
                <TableCell className="max-w-[260px]">
                  <Link
                    href={`/requests/${row.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    <span className="line-clamp-1">{row.title}</span>
                  </Link>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {row.project?.name ?? "Tanpa proyek"}
                  </p>
                </TableCell>
                <TableCell>
                  <TypeBadge type={row.type} />
                </TableCell>
                <TableCell className="text-sm tabular-nums text-muted-foreground">
                  {row.item_count}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(row.submission_date)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right font-medium tabular-nums">
                  {formatCurrency(row.amount)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <RowActions row={row} />
                    <DeleteRequestButton
                      id={row.id}
                      requestNumber={row.request_number}
                      label=""
                      variant="ghost"
                      className="px-2 text-destructive hover:bg-destructive/10"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">
                  {row.request_number}
                </p>
                <Link
                  href={`/requests/${row.id}`}
                  className="line-clamp-2 font-medium text-foreground"
                >
                  {row.title}
                </Link>
              </div>
              <StatusBadge status={row.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <TypeBadge type={row.type} />
              <span className="text-xs text-muted-foreground">
                {row.project?.name ?? "Tanpa proyek"}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Nominal</p>
                <p className="font-medium tabular-nums">
                  {formatCurrency(row.amount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jumlah Item</p>
                <p className="tabular-nums">
                  {formatNumber(row.item_count)} item
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pengaju</p>
                <p className="truncate">{row.creator?.full_name ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tgl Pengajuan</p>
                <p>{formatDate(row.submission_date)}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href={`/requests/${row.id}`}>
                  <Eye className="size-4" />
                  Detail
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href={`/requests/${row.id}/edit`}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
              <DeleteRequestButton
                id={row.id}
                requestNumber={row.request_number}
                label=""
                variant="outline"
                className="w-full px-2"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
