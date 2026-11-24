import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ProjectManagement } from "@/components/settings/project-management";
import { requireUser } from "@/lib/dal";
import { getProjects } from "@/lib/data/requests";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proyek - Promotion Tracker",
};

export default async function ProjectsSettingsPage() {
  await requireUser();
  const projects = await getProjects();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Proyek"
        description="Master data proyek yang dipakai pada pengajuan."
      />
      <ProjectManagement projects={projects} />
    </div>
  );
}
