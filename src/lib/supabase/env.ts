export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY,
);

export const PLACEHOLDER_URL = "https://placeholder.supabase.co";
export const PLACEHOLDER_KEY = "placeholder-anon-key";

export const resolvedSupabaseUrl = SUPABASE_URL || PLACEHOLDER_URL;
export const resolvedSupabaseKey = SUPABASE_ANON_KEY || PLACEHOLDER_KEY;

export const ATTACHMENTS_BUCKET = "request-attachments";
