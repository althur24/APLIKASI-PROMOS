import "server-only";

import { createClient } from "@/lib/supabase/server";
import { ATTACHMENTS_BUCKET, isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  ActivityLog,
  Category,
  ExpenseRequestWithRelations,
  Profile,
  RequestAttachment,
  RequestStatus,
  UserRole,
} from "@/types";

export interface RequestFilters {
  search?: string;
  status?: RequestStatus;
  categoryId?: string;
  createdBy?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedRequests {
  rows: ExpenseRequestWithRelations[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  totalCount: number;
  totalAmount: number;
  pendingCount: number;
  pendingAmount: number;
  paidCount: number;
  paidAmount: number;
}

type ProfileLite = Pick<Profile, "id" | "full_name" | "email">;

export type RequestAttachmentWithUrl = RequestAttachment & {
  signedUrl: string | null;
};

async function getLookups() {
  const supabase = await createClient();
  const [categoriesResult, profilesResult] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("profiles").select("id, full_name, email"),
  ]);

  const categoryMap = new Map<string, Pick<Category, "id" | "name">>();
  (categoriesResult.data ?? []).forEach((category) => {
    categoryMap.set(category.id, { id: category.id, name: category.name });
  });

  const profileMap = new Map<string, ProfileLite>();
  (profilesResult.data ?? []).forEach((profile) => {
    profileMap.set(profile.id, profile);
  });

  return { categoryMap, profileMap };
}

function attachRelations(
  rows: ExpenseRequestWithRelations[],
  categoryMap: Map<string, Pick<Category, "id" | "name">>,
  profileMap: Map<string, ProfileLite>,
) {
  return rows.map((row) => ({
    ...row,
    category: categoryMap.get(row.category_id) ?? null,
    creator: profileMap.get(row.created_by) ?? null,
  }));
}

export async function getCategories(options?: { activeOnly?: boolean }) {
  if (!isSupabaseConfigured) return [] as Category[];
  const supabase = await createClient();
  let query = supabase.from("categories").select("*").order("name");
  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }
  const { data } = await query;
  return (data ?? []) as Category[];
}

export async function getProfiles() {
  if (!isSupabaseConfigured) return [] as Profile[];
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");
  return (data ?? []) as Profile[];
}

export async function listRequests(
  filters: RequestFilters,
): Promise<PagedRequests> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(1000, Math.max(5, filters.pageSize ?? 10));

  if (!isSupabaseConfigured) {
    return { rows: [], count: 0, page, pageSize, totalPages: 1 };
  }

  const supabase = await createClient();
  const [sortColumn, sortDirection] = (filters.sort ?? "submission_date.desc").split(
    ".",
  );
  const ascending = sortDirection === "asc";

  let query = supabase
    .from("expense_requests")
    .select("*", { count: "exact" })
    .is("deleted_at", null);

  if (filters.search) {
    const term = `%${filters.search}%`;
    query = query.or(`title.ilike.${term},request_number.ilike.${term}`);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.createdBy) {
    query = query.eq("created_by", filters.createdBy);
  }
  if (filters.from) {
    query = query.gte("submission_date", filters.from);
  }
  if (filters.to) {
    query = query.lte("submission_date", filters.to);
  }

  const { data, count, error } = await query
    .order(sortColumn, { ascending })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    return { rows: [], count: 0, page, pageSize, totalPages: 1 };
  }

  const typedRows = (data ?? []) as unknown as ExpenseRequestWithRelations[];
  const { categoryMap, profileMap } = await getLookups();
  const rows = attachRelations(typedRows, categoryMap, profileMap);
  const total = count ?? 0;

  return {
    rows,
    count: total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getRequestDetail(id: string) {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data: request } = await supabase
    .from("expense_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!request) return null;

  const [categoryResult, creatorResult, attachmentsResult, logsResult] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, name")
        .eq("id", request.category_id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", request.created_by)
        .maybeSingle(),
      supabase
        .from("request_attachments")
        .select("*")
        .eq("request_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("activity_logs")
        .select("*")
        .eq("request_id", id)
        .order("created_at", { ascending: false }),
    ]);

  const actorIds = Array.from(
    new Set((logsResult.data ?? []).map((log) => log.actor_id)),
  );

  const actorMap = new Map<string, ProfileLite>();
  if (actorIds.length > 0) {
    const { data: actors } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", actorIds);
    (actors ?? []).forEach((actor) => actorMap.set(actor.id, actor));
  }

  const logs: ActivityLog[] = (logsResult.data ?? []).map((log) => ({
    ...(log as unknown as ActivityLog),
    actor: actorMap.get(log.actor_id) ?? null,
  }));

  const decorated: ExpenseRequestWithRelations = {
    ...(request as unknown as ExpenseRequestWithRelations),
    category: categoryResult.data ?? null,
    creator: creatorResult.data ?? null,
  };

  const rawAttachments = (attachmentsResult.data ??
    []) as unknown as RequestAttachment[];

  const attachments: RequestAttachmentWithUrl[] = await Promise.all(
    rawAttachments.map(async (attachment) => {
      const { data: signed } = await supabase.storage
        .from(ATTACHMENTS_BUCKET)
        .createSignedUrl(attachment.storage_path, 3600);
      return { ...attachment, signedUrl: signed?.signedUrl ?? null };
    }),
  );

  return {
    request: decorated,
    attachments,
    logs,
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const empty: DashboardStats = {
    totalCount: 0,
    totalAmount: 0,
    pendingCount: 0,
    pendingAmount: 0,
    paidCount: 0,
    paidAmount: 0,
  };

  if (!isSupabaseConfigured) return empty;

  const supabase = await createClient();
  const { data } = await supabase
    .from("expense_requests")
    .select("amount, status")
    .is("deleted_at", null);

  const rows = (data ?? []) as { amount: number; status: RequestStatus }[];

  return rows.reduce<DashboardStats>(
    (acc, row) => {
      const amount = Number(row.amount);
      acc.totalCount += 1;
      acc.totalAmount += amount;
      if (row.status === "paid") {
        acc.paidCount += 1;
        acc.paidAmount += amount;
      } else {
        acc.pendingCount += 1;
        acc.pendingAmount += amount;
      }
      return acc;
    },
    { ...empty },
  );
}

export interface MonthlyPoint {
  month: string;
  label: string;
  diajukan: number;
  cair: number;
}

export async function getMonthlySeries(months = 6): Promise<MonthlyPoint[]> {
  const now = new Date();
  const points: MonthlyPoint[] = [];

  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    points.push({
      month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("id-ID", {
        month: "short",
        year: "2-digit",
      }),
      diajukan: 0,
      cair: 0,
    });
  }

  if (!isSupabaseConfigured) return points;

  const start = `${points[0].month}-01`;
  const supabase = await createClient();
  const { data } = await supabase
    .from("expense_requests")
    .select("amount, submission_date, disbursement_date, status")
    .is("deleted_at", null)
    .gte("submission_date", start);

  const map = new Map(points.map((point) => [point.month, point]));

  (data ?? []).forEach((row) => {
    const submissionKey = String(row.submission_date).slice(0, 7);
    const submissionPoint = map.get(submissionKey);
    if (submissionPoint) {
      submissionPoint.diajukan += Number(row.amount);
    }
    if (row.status === "paid" && row.disbursement_date) {
      const paidKey = String(row.disbursement_date).slice(0, 7);
      const paidPoint = map.get(paidKey);
      if (paidPoint) {
        paidPoint.cair += Number(row.amount);
      }
    }
  });

  return points;
}

export async function getRecentRequests(limit = 5) {
  const result = await listRequests({
    page: 1,
    pageSize: limit,
    sort: "created_at.desc",
  });
  return result.rows;
}

export async function getPendingRequests(limit = 5) {
  const result = await listRequests({
    page: 1,
    pageSize: limit,
    status: "submitted",
    sort: "submission_date.asc",
  });
  return result.rows;
}

export async function getCategoryBreakdown() {
  if (!isSupabaseConfigured) {
    return [] as { category: string; count: number; amount: number }[];
  }
  const supabase = await createClient();
  const [requestsResult, categories] = await Promise.all([
    supabase
      .from("expense_requests")
      .select("amount, category_id")
      .is("deleted_at", null),
    getCategories(),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const map = new Map<string, { count: number; amount: number }>();

  (requestsResult.data ?? []).forEach((row) => {
    const name = categoryMap.get(row.category_id) ?? "Tanpa Kategori";
    const current = map.get(name) ?? { count: 0, amount: 0 };
    current.count += 1;
    current.amount += Number(row.amount);
    map.set(name, current);
  });

  return Array.from(map.entries())
    .map(([category, value]) => ({ category, ...value }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getReportRows(filters: RequestFilters) {
  return listRequests({
    ...filters,
    page: 1,
    pageSize: 1000,
    sort: filters.sort ?? "submission_date.desc",
  });
}

export async function getUserRoles(): Promise<
  { id: string; role: UserRole }[]
> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, role");
  return (data ?? []) as { id: string; role: UserRole }[];
}
