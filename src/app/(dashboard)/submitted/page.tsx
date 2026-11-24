import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { RequestsSection } from "@/components/requests/requests-section";
import {
  getProfiles,
  getProjects,
  listRequests,
} from "@/lib/data/requests";
import { parseRequestFilters, type SearchParamsInput } from "@/lib/filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Belum Cair - Promotion Tracker",
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

  const [data, projects, profiles] = await Promise.all([
    listRequests(filters),
    getProjects(),
    getProfiles(),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Belum Cair"
        description="Pengajuan/item yang belum dicairkan oleh Keuangan."
      />
      <RequestsSection
        data={data}
        projects={projects}
        profiles={profiles}
        showStatus={false}
        emptyHint="Tidak ada pengajuan berstatus Belum Cair pada filter ini."
      />
    </div>
  );
}
