import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { resolvedSupabaseUrl } from "./env";

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY belum diatur. Operasi admin tidak tersedia.",
    );
  }

  return createSupabaseClient<Database>(resolvedSupabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function isAdminApiAvailable() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
