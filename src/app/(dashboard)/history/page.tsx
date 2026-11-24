import type { Metadata } from "next";

import { ActivityFeed } from "@/components/history/activity-feed";
import { ActivityFilters } from "@/components/history/activity-filters";
import { Pagination } from "@/components/requests/pagination";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/dal";
import { listActivity } from "@/lib/data/activity";
import { getProfiles } from "@/lib/data/requests";
import { parseActivityFilters, type SearchParamsInput } from "@/lib/filters";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Riwayat Aktivitas - Promotion Tracker",
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  await requireUser();
  const params = await searchParams;
  const filters = parseActivityFilters(params);

  const [data, profiles] = await Promise.all([
    listActivity(filters),
    getProfiles(),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Riwayat Aktivitas"
        description={`${formatNumber(data.count)} catatan. Lihat siapa mengubah apa pada pengajuan, lengkap dengan nilai lama dan barunya.`}
      />

      <ActivityFilters profiles={profiles} />

      <ActivityFeed rows={data.rows} />

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
