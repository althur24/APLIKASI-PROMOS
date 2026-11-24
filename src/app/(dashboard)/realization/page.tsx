import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/requests/pagination";
import { ProcessingList } from "@/components/processing/processing-list";
import { ProcessingSearch } from "@/components/processing/processing-search";
import { requireUser } from "@/lib/dal";
import { listProcessingItems } from "@/lib/data/requests";
import { parseProcessingFilters, type SearchParamsInput } from "@/lib/filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proses Realisasi - Promotion Tracker",
};

export default async function RealizationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  await requireUser();
  const params = await searchParams;
  const filters = parseProcessingFilters(params);
  const data = await listProcessingItems("realization", filters);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Proses Realisasi"
        description="Item pengajuan yang sudah cair dan menunggu realisasi (upload foto)."
      />

      <ProcessingSearch />

      <ProcessingList rows={data.rows} kind="realization" />

      {data.rows.length > 0 ? (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          totalItems={data.count}
          pageSize={data.pageSize}
        />
      ) : null}
    </div>
  );
}
