import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ActivityLog, ActivityMetadata, Profile } from "@/types";

export interface ActivityFilters {
  actorId?: string;
  action?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ActivityRow extends Omit<ActivityLog, "actor"> {
  actor: Pick<Profile, "id" | "full_name"> | null;
  request: { id: string; request_number: string; title: string } | null;
}

export interface PagedActivity {
  rows: ActivityRow[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function emptyPage(page: number, pageSize: number): PagedActivity {
  return { rows: [], count: 0, page, pageSize, totalPages: 1 };
}

function sanitizeSearch(value: string) {
  return value.replace(/[(),]/g, " ").trim();
}

export async function listActivity(
  filters: ActivityFilters,
): Promise<PagedActivity> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(5, filters.pageSize ?? 15));

  if (!isSupabaseConfigured) return emptyPage(page, pageSize);

  const supabase = await createClient();

  let requestIdsFilter: string[] | null = null;
  if (filters.search) {
    const term = sanitizeSearch(filters.search);
    const { data: matches } = await supabase
      .from("expense_requests")
      .select("id")
      .or(`request_number.ilike.%${term}%,title.ilike.%${term}%`)
      .limit(200);
    requestIdsFilter = (matches ?? []).map((match) => match.id);
    if (requestIdsFilter.length === 0) return emptyPage(page, pageSize);
  }

  let query = supabase
    .from("activity_logs")
    .select("*", { count: "exact" });

  if (filters.actorId) query = query.eq("actor_id", filters.actorId);
  if (filters.action) query = query.eq("action", filters.action);
  if (filters.from) query = query.gte("created_at", `${filters.from}T00:00:00`);
  if (filters.to) query = query.lte("created_at", `${filters.to}T23:59:59.999`);
  if (requestIdsFilter) query = query.in("request_id", requestIdsFilter);

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) return emptyPage(page, pageSize);

  const rawRows = data ?? [];
  const actorIds = Array.from(new Set(rawRows.map((row) => row.actor_id)));
  const requestIds = Array.from(
    new Set(
      rawRows
        .map((row) => row.request_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const actorMap = new Map<string, Pick<Profile, "id" | "full_name">>();
  if (actorIds.length > 0) {
    const { data: actors } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", actorIds);
    (actors ?? []).forEach((actor) => actorMap.set(actor.id, actor));
  }

  const requestMap = new Map<
    string,
    { id: string; request_number: string; title: string }
  >();
  if (requestIds.length > 0) {
    const { data: requests } = await supabase
      .from("expense_requests")
      .select("id, request_number, title")
      .in("id", requestIds);
    (requests ?? []).forEach((request) => requestMap.set(request.id, request));
  }

  const rows: ActivityRow[] = rawRows.map((row) => ({
    id: row.id,
    request_id: row.request_id,
    item_id: row.item_id,
    actor_id: row.actor_id,
    action: row.action,
    description: row.description,
    metadata: (row.metadata ?? null) as ActivityMetadata | null,
    created_at: row.created_at,
    actor: actorMap.get(row.actor_id) ?? null,
    request: row.request_id ? requestMap.get(row.request_id) ?? null : null,
  }));

  const total = count ?? 0;

  return {
    rows,
    count: total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getRecentActivity(limit = 6) {
  const result = await listActivity({ page: 1, pageSize: limit });
  return result.rows;
}
