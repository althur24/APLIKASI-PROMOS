import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { CategoryManagement } from "@/components/settings/category-management";
import { requireUser } from "@/lib/dal";
import { getCategories } from "@/lib/data/requests";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kategori - Promotion Tracker",
};

export default async function CategoriesSettingsPage() {
  await requireUser();
  const categories = await getCategories();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kategori"
        description="Semua pengguna dapat mengelola kategori pengajuan."
      />
      <CategoryManagement categories={categories} />
    </div>
  );
}
