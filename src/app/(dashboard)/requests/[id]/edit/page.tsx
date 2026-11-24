import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { RequestForm } from "@/components/requests/request-form";
import { StatusBadge } from "@/components/requests/status-badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/dal";
import {
  getCategories,
  getProjects,
  getRequestDetail,
} from "@/lib/data/requests";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Pengajuan - Promotion Tracker",
};

export default async function EditRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const [detail, categories, projects] = await Promise.all([
    getRequestDetail(id),
    getCategories(),
    getProjects(),
  ]);

  if (!detail) notFound();

  const itemsLocked =
    detail.items.some((item) => item.status !== "submitted") ||
    detail.attachments.length > 0;

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href={`/requests/${id}`}>
          <ArrowLeft className="size-4" />
          Kembali ke detail
        </Link>
      </Button>

      <PageHeader
        title="Edit Pengajuan"
        description={`Perbarui data ${detail.request.request_number}.`}
        action={<StatusBadge status={detail.request.status} />}
      />

      <RequestForm
        mode="edit"
        categories={categories}
        projects={projects}
        request={detail.request}
        items={detail.items}
        itemsLocked={itemsLocked}
      />
    </div>
  );
}
