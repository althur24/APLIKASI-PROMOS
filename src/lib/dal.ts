import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return profile;
});

export const requireUser = cache(async (): Promise<Profile> => {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (!profile.is_active) redirect("/login?error=inactive");
  if (profile.must_change_password) redirect("/change-password");

  return profile;
});

export const requireAdmin = cache(async (): Promise<Profile> => {
  const profile = await requireUser();
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
});
