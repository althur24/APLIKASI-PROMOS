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
  title: "Proses Pencairan - Promotion Tracker",
};

export default async function DisbursementPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  await requireUser();
  const params = await searchParams;
  const filters = parseProcessingFilters(params);
  const data = await listProcessingItems("disbursement", filters);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Proses Pencairan"
        description="Item yang belum cair. Cari pengajuan lalu tandai item sebagai Sudah Cair."
      />

      <ProcessingSearch />

      <ProcessingList rows={data.rows} kind="disbursement" />

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
