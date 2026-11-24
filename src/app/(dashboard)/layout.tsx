import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireUser } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireUser();

  return (
    <DashboardShell
      profile={{
        full_name: profile.full_name,
        email: profile.email,
        role: profile.role,
      }}
    >
      {children}
    </DashboardShell>
  );
}
