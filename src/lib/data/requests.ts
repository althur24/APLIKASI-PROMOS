import "server-only";

import { createClient } from "@/lib/supabase/server";
import { ATTACHMENTS_BUCKET, isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  ActivityLog,
  Category,
  ExpenseRequestItem,
  ExpenseRequestWithRelations,
  Profile,
  Project,
  RequestAttachment,
  RequestStatus,
  RequestType,
  UserRole,
} from "@/types";

export interface RequestFilters {
  search?: string;
  type?: RequestType;
  status?: RequestStatus;
  projectId?: string;
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
  realizedCount: number;
  realizedAmount: number;
}

export type RequestAttachmentWithUrl = RequestAttachment & {
  signedUrl: string | null;
};

export interface ReportItemRow {
  id: string;
  request_id: string;
  request_number: string;
  request_title: string;
  type: RequestType;
  submission_date: string;
  project: string | null;
  category: string | null;
  creator: string | null;
  item_name: string;
  amount: number;
  status: string;
  status_label: string;
  disbursement_date: string | null;
  realized_date: string | null;
}

export interface ProcessingItemRow {
  item_id: string;
  request_id: string;
  request_number: string;
  request_title: string;
  type: RequestType;
  project: string | null;
  creator: string | null;
  item_name: string;
  category: string | null;
  amount: number;
  status: string;
  submission_date: string;
  disbursement_date: string | null;
  realized_date: string | null;
}

type ProfileLite = Pick<Profile, "id" | "full_name" | "email">;

const ITEM_STATUS_LABEL: Record<string, string> = {
  submitted: "Belum Cair",
  paid: "Sudah Cair",
  realized: "Sudah Realisasi",
};

async function getLookups() {
  const supabase = await createClient();
  const [categoriesResult, profilesResult, projectsResult] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("profiles").select("id, full_name, email"),
    supabase.from("projects").select("id, name").order("name"),
  ]);

  const categoryMap = new Map<string, Pick<Category, "id" | "name">>();
  (categoriesResult.data ?? []).forEach((category) => {
    categoryMap.set(category.id, { id: category.id, name: category.name });
  });

  const profileMap = new Map<string, ProfileLite>();
  (profilesResult.data ?? []).forEach((profile) => {
    profileMap.set(profile.id, profile);
  });

  const projectMap = new Map<string, Pick<Project, "id" | "name">>();
  (projectsResult.data ?? []).forEach((project) => {
    projectMap.set(project.id, { id: project.id, name: project.name });
  });

  return { categoryMap, profileMap, projectMap };
}

function attachRelations(
  rows: ExpenseRequestWithRelations[],
  maps: Awaited<ReturnType<typeof getLookups>>,
) {
  return rows.map((row) => ({
    ...row,
    category: row.category_id ? maps.categoryMap.get(row.category_id) ?? null : null,
    project: row.project_id ? maps.projectMap.get(row.project_id) ?? null : null,
    creator: maps.profileMap.get(row.created_by) ?? null,
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

export async function getProjects(options?: { activeOnly?: boolean }) {
  if (!isSupabaseConfigured) return [] as Project[];
  const supabase = await createClient();
  let query = supabase.from("projects").select("*").order("name");
  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }
  const { data } = await query;
  return (data ?? []) as Project[];
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
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  if (filters.createdBy) query = query.eq("created_by", filters.createdBy);
  if (filters.from) query = query.gte("submission_date", filters.from);
  if (filters.to) query = query.lte("submission_date", filters.to);

  const { data, count, error } = await query
    .order(sortColumn, { ascending })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    return { rows: [], count: 0, page, pageSize, totalPages: 1 };
  }

  const typedRows = (data ?? []) as unknown as ExpenseRequestWithRelations[];
  const maps = await getLookups();
  const rows = attachRelations(typedRows, maps);
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

  const [projectResult, creatorResult, itemsResult, attachmentsResult, logsResult] =
    await Promise.all([
      request.project_id
        ? supabase
            .from("projects")
            .select("id, name")
            .eq("id", request.project_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", request.created_by)
        .maybeSingle(),
      supabase
        .from("expense_request_items")
        .select("*")
        .eq("request_id", id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
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

  const rawItems = (itemsResult.data ?? []) as unknown as ExpenseRequestItem[];
  const categoryIds = Array.from(
    new Set(
      rawItems
        .map((item) => item.category_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const categoryMap = new Map<string, Pick<Category, "id" | "name">>();
  if (categoryIds.length > 0) {
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name")
      .in("id", categoryIds);
    (categories ?? []).forEach((category) =>
      categoryMap.set(category.id, category),
    );
  }

  const items: ExpenseRequestItem[] = rawItems.map((item) => ({
    ...item,
    category: item.category_id
      ? categoryMap.get(item.category_id) ?? null
      : null,
  }));

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
    category: request.category_id
      ? categoryMap.get(request.category_id) ?? null
      : null,
    project: projectResult.data ?? null,
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
    items,
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
    realizedCount: 0,
    realizedAmount: 0,
  };

  if (!isSupabaseConfigured) return empty;

  const supabase = await createClient();
  const { data } = await supabase
    .from("expense_requests")
    .select("id, deleted_at")
    .is("deleted_at", null);
  const requestIds = (data ?? []).map((row) => row.id);
  if (requestIds.length === 0) return empty;

  const { data: items } = await supabase
    .from("expense_request_items")
    .select("amount, status")
    .in("request_id", requestIds);

  return (items ?? []).reduce<DashboardStats>((acc, item) => {
    const amount = Number(item.amount);
    acc.totalCount += 1;
    acc.totalAmount += amount;
    if (item.status === "realized") {
      acc.realizedCount += 1;
      acc.realizedAmount += amount;
    } else if (item.status === "paid") {
      acc.paidCount += 1;
      acc.paidAmount += amount;
    } else {
      acc.pendingCount += 1;
      acc.pendingAmount += amount;
    }
    return acc;
  }, { ...empty });
}

export interface MonthlyPoint {
  month: string;
  label: string;
  diajukan: number;
  cair: number;
  realisasi: number;
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
      realisasi: 0,
    });
  }

  if (!isSupabaseConfigured) return points;

  const start = `${points[0].month}-01`;
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("expense_requests")
    .select("id, submission_date")
    .is("deleted_at", null)
    .gte("submission_date", start);

  const requestIds = (requests ?? []).map((row) => row.id);
  if (requestIds.length === 0) return points;

  const submissionMap = new Map(
    (requests ?? []).map((row) => [row.id, String(row.submission_date)]),
  );

  const { data: items } = await supabase
    .from("expense_request_items")
    .select("request_id, amount, status, disbursement_date, realized_date")
    .in("request_id", requestIds);

  const map = new Map(points.map((point) => [point.month, point]));

  (items ?? []).forEach((item) => {
    const amount = Number(item.amount);
    const requestId = item.request_id as string;
    const submission = submissionMap.get(requestId);
    if (submission) {
      const point = map.get(submission.slice(0, 7));
      if (point) point.diajukan += amount;
    }
    if (item.disbursement_date) {
      const point = map.get(String(item.disbursement_date).slice(0, 7));
      if (point) point.cair += amount;
    }
    if (item.realized_date) {
      const point = map.get(String(item.realized_date).slice(0, 7));
      if (point) point.realisasi += amount;
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
    pageSize: 50,
    sort: "submission_date.asc",
  });
  return result.rows
    .filter((row) => row.status === "submitted" || row.status === "partial")
    .slice(0, limit);
}

export async function getCategoryBreakdown() {
  if (!isSupabaseConfigured) {
    return [] as { category: string; count: number; amount: number }[];
  }
  const supabase = await createClient();
  const [itemsResult, categories] = await Promise.all([
    supabase.from("expense_request_items").select("amount, category_id"),
    getCategories(),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const map = new Map<string, { count: number; amount: number }>();

  (itemsResult.data ?? []).forEach((item) => {
    const name = item.category_id
      ? categoryMap.get(item.category_id) ?? "Tanpa Kategori"
      : "Tanpa Kategori";
    const current = map.get(name) ?? { count: 0, amount: 0 };
    current.count += 1;
    current.amount += Number(item.amount);
    map.set(name, current);
  });

  return Array.from(map.entries())
    .map(([category, value]) => ({ category, ...value }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getReportRows(
  filters: RequestFilters,
): Promise<{ rows: ReportItemRow[] }> {
  if (!isSupabaseConfigured) return { rows: [] };

  const supabase = await createClient();
  let requestQuery = supabase
    .from("expense_requests")
    .select("id, request_number, title, type, project_id, submission_date, created_by")
    .is("deleted_at", null)
    .limit(1000);

  if (filters.search) {
    const term = `%${filters.search}%`;
    requestQuery = requestQuery.or(
      `title.ilike.${term},request_number.ilike.${term}`,
    );
  }
  if (filters.type) requestQuery = requestQuery.eq("type", filters.type);
  if (filters.projectId) requestQuery = requestQuery.eq("project_id", filters.projectId);
  if (filters.createdBy) requestQuery = requestQuery.eq("created_by", filters.createdBy);
  if (filters.from) requestQuery = requestQuery.gte("submission_date", filters.from);
  if (filters.to) requestQuery = requestQuery.lte("submission_date", filters.to);

  const { data: requests } = await requestQuery.order("submission_date", {
    ascending: false,
  });

  if (!requests || requests.length === 0) return { rows: [] };

  const requestIds = requests.map((row) => row.id);
  const { data: items } = await supabase
    .from("expense_request_items")
    .select("*")
    .in("request_id", requestIds)
    .order("sort_order", { ascending: true });

  const maps = await getLookups();
  const requestMap = new Map(requests.map((row) => [row.id, row]));

  const rows: ReportItemRow[] = (items ?? []).map((item) => {
    const request = requestMap.get(item.request_id);
    return {
      id: item.id,
      request_id: item.request_id,
      request_number: request?.request_number ?? "-",
      request_title: request?.title ?? "-",
      type: (request?.type ?? "pengajuan") as RequestType,
      submission_date: request?.submission_date ?? "",
      project: request?.project_id
        ? maps.projectMap.get(request.project_id)?.name ?? null
        : null,
      category: item.category_id
        ? maps.categoryMap.get(item.category_id)?.name ?? null
        : null,
      creator: request?.created_by
        ? maps.profileMap.get(request.created_by)?.full_name ?? null
        : null,
      item_name: item.name,
      amount: Number(item.amount),
      status: item.status,
      status_label: ITEM_STATUS_LABEL[item.status] ?? item.status,
      disbursement_date: item.disbursement_date,
      realized_date: item.realized_date,
    };
  });

  const filtered =
    filters.status && ["submitted", "paid", "realized"].includes(filters.status)
      ? rows.filter((row) => row.status === filters.status)
      : rows;

  return { rows: filtered };
}

export async function listProcessingItems(
  kind: "disbursement" | "realization",
  options: { search?: string; page?: number; pageSize?: number } = {},
): Promise<{ rows: ProcessingItemRow[]; count: number; page: number; pageSize: number; totalPages: number }> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(5, options.pageSize ?? 10));

  if (!isSupabaseConfigured) {
    return { rows: [], count: 0, page, pageSize, totalPages: 1 };
  }

  const supabase = await createClient();
  const targetStatus = kind === "disbursement" ? "submitted" : "paid";

  const { data: items } = await supabase
    .from("expense_request_items")
    .select("*")
    .eq("status", targetStatus)
    .limit(2000);

  if (!items || items.length === 0) {
    return { rows: [], count: 0, page, pageSize, totalPages: 1 };
  }

  const requestIds = Array.from(new Set(items.map((item) => item.request_id)));
  let requestQuery = supabase
    .from("expense_requests")
    .select("id, request_number, title, type, project_id, submission_date, created_by")
    .is("deleted_at", null)
    .in("id", requestIds);

  if (kind === "realization") {
    requestQuery = requestQuery.eq("type", "pengajuan");
  }

  const { data: requests } = await requestQuery;
  const maps = await getLookups();
  const requestMap = new Map((requests ?? []).map((row) => [row.id, row]));

  const term = options.search?.toLowerCase().trim();

  const composed: ProcessingItemRow[] = items
    .filter((item) => requestMap.has(item.request_id))
    .map((item) => {
      const request = requestMap.get(item.request_id)!;
      return {
        item_id: item.id,
        request_id: item.request_id,
        request_number: request.request_number,
        request_title: request.title,
        type: request.type as RequestType,
        project: request.project_id
          ? maps.projectMap.get(request.project_id)?.name ?? null
          : null,
        creator: request.created_by
          ? maps.profileMap.get(request.created_by)?.full_name ?? null
          : null,
        item_name: item.name,
        category: item.category_id
          ? maps.categoryMap.get(item.category_id)?.name ?? null
          : null,
        amount: Number(item.amount),
        status: item.status,
        submission_date: request.submission_date,
        disbursement_date: item.disbursement_date,
        realized_date: item.realized_date,
      };
    })
    .filter((row) => {
      if (!term) return true;
      return [row.request_number, row.request_title, row.item_name, row.project, row.creator]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    })
    .sort((a, b) => (a.submission_date < b.submission_date ? -1 : 1));

  const total = composed.length;
  const start = (page - 1) * pageSize;

  return {
    rows: composed.slice(start, start + pageSize),
    count: total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getUserRoles(): Promise<
  { id: string; role: UserRole }[]
> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, role");
  return (data ?? []) as { id: string; role: UserRole }[];
}
