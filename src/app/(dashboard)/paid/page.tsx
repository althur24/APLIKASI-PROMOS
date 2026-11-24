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
  title: "Sudah Cair - Promotion Tracker",
};

export default async function PaidPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const params = await searchParams;
  const filters = {
    ...parseRequestFilters(params, { status: "paid" }),
    status: "paid" as const,
  };

  const [data, projects, profiles] = await Promise.all([
    listRequests(filters),
    getProjects(),
    getProfiles(),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sudah Cair"
        description="Pengajuan yang dananya sudah dicairkan oleh Keuangan."
      />
      <RequestsSection
        data={data}
        projects={projects}
        profiles={profiles}
        showStatus={false}
        emptyHint="Belum ada pengajuan yang sudah cair pada filter ini."
      />
    </div>
  );
}
