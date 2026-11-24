import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { RequestForm } from "@/components/requests/request-form";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/dal";
import { getCategories } from "@/lib/data/requests";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tambah Pengajuan - Promotion Tracker",
};

export default async function NewRequestPage() {
  const profile = await requireUser();
  const categories = await getCategories();
  const activeCategories = categories.filter((category) => category.is_active);

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/requests">
          <ArrowLeft className="size-4" />
          Kembali
        </Link>
      </Button>

      <PageHeader
        title="Tambah Pengajuan"
        description={`Pengaju: ${profile.full_name}. Status awal otomatis Sudah Diajukan.`}
      />

      <RequestForm mode="create" categories={activeCategories} />
    </div>
  );
}
