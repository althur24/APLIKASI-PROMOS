"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(target: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (target <= 1) params.delete("page");
    else params.set("page", String(target));
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pages: number[] = [];
  const windowStart = Math.max(1, page - 1);
  const windowEnd = Math.min(totalPages, windowStart + 2);
  for (let i = windowStart; i <= windowEnd; i += 1) pages.push(i);

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Menampilkan <span className="font-medium text-foreground">{start}</span>–
        <span className="font-medium text-foreground">{end}</span> dari{" "}
        <span className="font-medium text-foreground">{totalItems}</span>{" "}
        pengajuan
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="iconSm"
          asChild={page > 1}
          disabled={page <= 1}
          aria-label="Sebelumnya"
        >
          {page > 1 ? (
            <Link href={hrefFor(page - 1)}>
              <ChevronLeft className="size-4" />
            </Link>
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
        {pages.map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={pageNumber === page ? "default" : "outline"}
            size="iconSm"
            asChild={pageNumber !== page}
          >
            {pageNumber === page ? (
              <span>{pageNumber}</span>
            ) : (
              <Link href={hrefFor(pageNumber)}>{pageNumber}</Link>
            )}
          </Button>
        ))}
        <Button
          variant="outline"
          size="iconSm"
          asChild={page < totalPages}
          disabled={page >= totalPages}
          aria-label="Berikutnya"
        >
          {page < totalPages ? (
            <Link href={hrefFor(page + 1)}>
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <ChevronRight className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
