"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/actions/types";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { ATTACHMENTS_BUCKET } from "@/lib/supabase/env";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  STATUS_LABELS,
  type ActivityChange,
  type ActivitySnapshotItem,
  type RequestStatus,
} from "@/types";
import {
  requestFormSchema,
  statusUpdateSchema,
} from "@/lib/validations/request";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.ms-excel",
];

const TRACKED_FIELDS = [
  "title",
  "category_id",
  "amount",
  "submission_date",
  "status",
  "disbursement_date",
  "notes",
] as const;

type TrackedField = (typeof TRACKED_FIELDS)[number];
type CategoryMap = Map<string, string>;

const FIELD_LABELS: Record<TrackedField, string> = {
  title: "Nama Pengajuan",
  category_id: "Kategori",
  amount: "Nominal",
  submission_date: "Tanggal Pengajuan",
  status: "Status",
  disbursement_date: "Tanggal Pencairan",
  notes: "Catatan",
};

function revalidateRequests() {
  revalidatePath("/dashboard");
  revalidatePath("/requests");
  revalidatePath("/submitted");
  revalidatePath("/paid");
  revalidatePath("/reports");
  revalidatePath("/history");
}

async function logActivity(
  requestId: string | null,
  action: string,
  description: string,
  metadata: Record<string, unknown> = {},
) {
  const supabase = await createClient();
  await supabase.rpc("log_activity", {
    p_request_id: requestId,
    p_action: action,
    p_description: description,
    p_metadata: metadata as never,
  });
}

function truncate(value: string, max = 80) {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function formatFieldValue(
  field: TrackedField,
  value: unknown,
  categories: CategoryMap,
): string | null {
  if (value === null || value === undefined || value === "") return null;

  switch (field) {
    case "amount":
      return formatCurrency(Number(value));
    case "category_id":
      return categories.get(String(value)) ?? "—";
    case "status":
      return STATUS_LABELS[value as RequestStatus] ?? String(value);
    case "submission_date":
    case "disbursement_date":
      return formatDate(String(value));
    case "notes":
      return truncate(String(value));
    default:
      return String(value);
  }
}

function buildChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  categories: CategoryMap,
  fields: readonly TrackedField[] = TRACKED_FIELDS,
): ActivityChange[] {
  const changes: ActivityChange[] = [];

  for (const field of fields) {
    const previous = before[field] ?? null;
    const next = after[field] ?? null;

    const same =
      field === "amount"
        ? Number(previous ?? 0) === Number(next ?? 0)
        : String(previous ?? "") === String(next ?? "");

    if (same) continue;

    changes.push({
      field,
      label: FIELD_LABELS[field],
      from: formatFieldValue(field, previous, categories),
      to: formatFieldValue(field, next, categories),
    });
  }

  return changes;
}

function buildSnapshot(
  values: Record<string, unknown>,
  categories: CategoryMap,
): ActivitySnapshotItem[] {
  return TRACKED_FIELDS.map((field) => ({
    label: FIELD_LABELS[field],
    value: formatFieldValue(field, values[field], categories),
  })).filter((item): item is ActivitySnapshotItem => Boolean(item.value));
}

async function getCategoryMap(): Promise<CategoryMap> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("id, name");
  return new Map((data ?? []).map((category) => [category.id, category.name]));
}

export async function createRequest(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireUser();

  const parsed = requestFormSchema.safeParse({
    title: formData.get("title"),
    category_id: formData.get("category_id"),
    amount: formData.get("amount"),
    submission_date: formData.get("submission_date"),
    status: formData.get("status") || "submitted",
    disbursement_date: formData.get("disbursement_date") || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Periksa kembali data pengajuan.",
    };
  }

  const values = {
    title: parsed.data.title,
    category_id: parsed.data.category_id,
    amount: parsed.data.amount,
    submission_date: parsed.data.submission_date,
    status: parsed.data.status,
    disbursement_date:
      parsed.data.status === "paid" ? parsed.data.disbursement_date : null,
    notes: parsed.data.notes ?? null,
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expense_requests")
    .insert({ ...values, created_by: profile.id })
    .select("id, request_number")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Gagal menyimpan pengajuan." };
  }

  const categories = await getCategoryMap();
  const snapshot = buildSnapshot(values, categories);

  await logActivity(data.id, "created", `Pengajuan ${data.request_number} dibuat`, {
    request_number: data.request_number,
    snapshot,
  });

  revalidateRequests();
  redirect(`/requests/${data.id}`);
}

export async function updateRequest(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const id = String(formData.get("id") ?? "");

  const parsed = requestFormSchema.safeParse({
    title: formData.get("title"),
    category_id: formData.get("category_id"),
    amount: formData.get("amount"),
    submission_date: formData.get("submission_date"),
    status: formData.get("status") || "submitted",
    disbursement_date: formData.get("disbursement_date") || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Periksa kembali data pengajuan.",
    };
  }

  const values = {
    title: parsed.data.title,
    category_id: parsed.data.category_id,
    amount: parsed.data.amount,
    submission_date: parsed.data.submission_date,
    status: parsed.data.status,
    disbursement_date:
      parsed.data.status === "paid" ? parsed.data.disbursement_date : null,
    notes: parsed.data.notes ?? null,
  };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("expense_requests")
    .select(
      "request_number, title, category_id, amount, submission_date, status, disbursement_date, notes",
    )
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("expense_requests")
    .update(values)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  const categories = await getCategoryMap();
  const changes = existing
    ? buildChanges(
        existing as unknown as Record<string, unknown>,
        values as unknown as Record<string, unknown>,
        categories,
      )
    : [];

  if (changes.length > 0 || !existing) {
    const statusChanged = existing
      ? existing.status !== values.status
      : false;
    await logActivity(
      id,
      statusChanged ? "status_changed" : "updated",
      statusChanged
        ? `Status ${existing?.request_number ?? ""} diubah menjadi ${STATUS_LABELS[values.status]}`
        : `Pengajuan ${existing?.request_number ?? ""} diperbarui`,
      { request_number: existing?.request_number, changes },
    );
  }

  revalidateRequests();
  revalidatePath(`/requests/${id}`);
  redirect(`/requests/${id}`);
}

export async function updateRequestStatus(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = statusUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    disbursement_date: formData.get("disbursement_date") || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Periksa kembali data status.",
    };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("expense_requests")
    .select(
      "request_number, submission_date, status, disbursement_date, notes",
    )
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (
    existing &&
    parsed.data.status === "paid" &&
    parsed.data.disbursement_date
  ) {
    if (parsed.data.disbursement_date < existing.submission_date) {
      return {
        fieldErrors: {
          disbursement_date: [
            "Tanggal pencairan tidak boleh sebelum tanggal pengajuan",
          ],
        },
        error: "Tanggal pencairan tidak valid.",
      };
    }
  }

  const status = parsed.data.status as RequestStatus;
  const values = {
    status,
    disbursement_date: status === "paid" ? parsed.data.disbursement_date : null,
    notes: parsed.data.notes ?? existing?.notes ?? null,
  };

  const { error } = await supabase
    .from("expense_requests")
    .update(values)
    .eq("id", parsed.data.id);

  if (error) {
    return { error: error.message };
  }

  const changes = existing
    ? buildChanges(
        existing as unknown as Record<string, unknown>,
        values as unknown as Record<string, unknown>,
        new Map(),
        ["status", "disbursement_date", "notes"],
      )
    : [];

  await logActivity(
    parsed.data.id,
    "status_changed",
    `Status ${existing?.request_number ?? ""} diubah menjadi ${STATUS_LABELS[status]}`,
    { request_number: existing?.request_number, changes },
  );

  revalidateRequests();
  revalidatePath(`/requests/${parsed.data.id}`);

  return { success: `Status berhasil diubah menjadi ${STATUS_LABELS[status]}.` };
}

export async function softDeleteRequest(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("expense_requests")
    .select("request_number")
    .eq("id", id)
    .maybeSingle();

  await supabase
    .from("expense_requests")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  await logActivity(
    id,
    "deleted",
    `Pengajuan ${existing?.request_number ?? ""} diarsipkan`,
    { request_number: existing?.request_number },
  );

  revalidateRequests();
  redirect("/requests");
}

export async function uploadAttachments(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireUser();
  const requestId = String(formData.get("request_id") ?? "");
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (!requestId) {
    return { error: "Pengajuan tidak ditemukan." };
  }

  const validFiles = files.filter((file) => file.size > 0);
  if (validFiles.length === 0) {
    return { error: "Pilih minimal satu file." };
  }

  for (const file of validFiles) {
    if (file.size > MAX_FILE_SIZE) {
      return { error: `File ${file.name} melebihi batas 8 MB.` };
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { error: `Tipe file ${file.name} tidak diizinkan.` };
    }
  }

  const supabase = await createClient();

  for (const file of validFiles) {
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${requestId}/${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(ATTACHMENTS_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      return { error: `Gagal mengunggah ${file.name}: ${uploadError.message}` };
    }

    const { error: insertError } = await supabase
      .from("request_attachments")
      .insert({
        request_id: requestId,
        file_name: file.name,
        storage_path: path,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: profile.id,
      });

    if (insertError) {
      return { error: insertError.message };
    }
  }

  await logActivity(
    requestId,
    "attachment_added",
    `${validFiles.length} lampiran ditambahkan`,
    { files: validFiles.map((file) => file.name) },
  );

  revalidatePath(`/requests/${requestId}`);
  return { success: "Lampiran berhasil diunggah." };
}

export async function deleteAttachment(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const requestId = String(formData.get("request_id") ?? "");
  const path = String(formData.get("storage_path") ?? "");

  if (!id || !requestId) return;

  const supabase = await createClient();
  const { data: attachment } = await supabase
    .from("request_attachments")
    .select("file_name")
    .eq("id", id)
    .maybeSingle();

  if (path) {
    await supabase.storage.from(ATTACHMENTS_BUCKET).remove([path]);
  }
  await supabase.from("request_attachments").delete().eq("id", id);

  await logActivity(
    requestId,
    "attachment_removed",
    attachment?.file_name
      ? `Lampiran ${attachment.file_name} dihapus`
      : "Lampiran dihapus",
    { file_name: attachment?.file_name ?? null },
  );
  revalidatePath(`/requests/${requestId}`);
}
