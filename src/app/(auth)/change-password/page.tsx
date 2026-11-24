import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { getCurrentProfile } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Ganti Password - Promotion Tracker",
};

export default async function ChangePasswordPage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (!profile.is_active) redirect("/login?error=inactive");

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Ganti Password
        </h2>
        <p className="text-sm text-muted-foreground">
          Halo {profile.full_name}, atur password baru Anda.
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
