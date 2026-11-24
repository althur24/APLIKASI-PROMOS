import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { UserManagementTable } from "@/components/users/user-management";
import { requireAdmin } from "@/lib/dal";
import { getProfiles } from "@/lib/data/requests";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pengguna - Promotion Tracker",
};

export default async function UsersSettingsPage() {
  const currentAdmin = await requireAdmin();
  const profiles = await getProfiles();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pengguna"
        description="Kelola akun tim. Hanya Admin yang dapat mengakses halaman ini."
      />
      <UserManagementTable
        profiles={profiles}
        currentAdminId={currentAdmin.id}
      />
    </div>
  );
}
