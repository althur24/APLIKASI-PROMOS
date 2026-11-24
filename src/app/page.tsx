import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const profile = await getCurrentProfile();

  if (profile) {
    if (profile.must_change_password) redirect("/change-password");
    redirect("/dashboard");
  }

  redirect("/login");
}
