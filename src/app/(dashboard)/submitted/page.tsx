import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { RequestsSection } from "@/components/requests/requests-section";
import {
  getCategories,
  getProfiles,
  listRequests,
} from "@/lib/data/requests";
import { parseRequestFilters, type SearchParamsInput } from "@/lib/filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sudah Diajukan - Promotion Tracker",
};

export default async function SubmittedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const params = await searchParams;
  const filters = {
    ...parseRequestFilters(params, { status: "submitted" }),
    status: "submitted" as const,
  };

  const [data, categories, profiles] = await Promise.all([
    listRequests(filters),
    getCategories(),
    getProfiles(),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sudah Diajukan"
        description="Pengajuan yang sudah diserahkan ke Keuangan dan menunggu pencairan."
      />
      <RequestsSection
        data={data}
        categories={categories}
        profiles={profiles}
        showStatus={false}
        emptyHint="Tidak ada pengajuan berstatus Sudah Diajukan pada filter ini."
      />
    </div>
  );
}
