import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./database.types";
import { resolvedSupabaseKey, resolvedSupabaseUrl } from "./env";

export function createClient() {
  return createBrowserClient<Database>(
    resolvedSupabaseUrl,
    resolvedSupabaseKey,
  );
}
