import type { ActivityFilters } from "@/lib/data/activity";
import type { RequestFilters } from "@/lib/data/requests";
import type { RequestStatus } from "@/types";

export type SearchParamsInput = Record<
  string,
  string | string[] | undefined
>;

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseRequestFilters(
  searchParams: SearchParamsInput,
  defaults?: Partial<RequestFilters>,
): RequestFilters {
  const status = firstValue(searchParams.status);
  const page = Number(firstValue(searchParams.page) ?? "1");

  return {
    search: firstValue(searchParams.q) || undefined,
    status:
      status === "submitted" || status === "paid"
        ? (status as RequestStatus)
        : defaults?.status,
    categoryId: firstValue(searchParams.category) || undefined,
    createdBy: firstValue(searchParams.pengaju) || undefined,
    from: firstValue(searchParams.from) || undefined,
    to: firstValue(searchParams.to) || undefined,
    sort: firstValue(searchParams.sort) || defaults?.sort,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: defaults?.pageSize ?? 10,
  };
}

export function parseActivityFilters(
  searchParams: SearchParamsInput,
  defaults?: Partial<ActivityFilters>,
): ActivityFilters {
  const page = Number(firstValue(searchParams.page) ?? "1");

  return {
    actorId: firstValue(searchParams.actor) || undefined,
    action: firstValue(searchParams.action) || undefined,
    from: firstValue(searchParams.from) || undefined,
    to: firstValue(searchParams.to) || undefined,
    search: firstValue(searchParams.q) || undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: defaults?.pageSize ?? 15,
  };
}

export function buildQueryString(
  params: Record<string, string | number | undefined | null>,
) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const result = search.toString();
  return result ? `?${result}` : "";
}
