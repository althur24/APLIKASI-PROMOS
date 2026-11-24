"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/actions/types";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { ATTACHMENTS_BUCKET } from "@/lib/supabase/env";
import { formatCurrency } from "@/lib/format";
import { ITEM_STATUS_LABELS } from "@/types";
import {
  payItemSchema,
  realizeItemSchema,
  requestFormSchema,
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

function revalidateRequests() {
  revalidatePath("/dashboard");
  revalidatePath("/requests");
  revalidatePath("/submitted");
  revalidatePath("/paid");
  revalidatePath("/reports");
  revalidatePath("/history");
  revalidatePath("/disbursement");
  revalidatePath("/realization");
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

function parseItems(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || raw.length === 0) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function validateFiles(files: File[]) {
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return { error: `File ${file.name} melebihi batas 8 MB.` };
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { error: `Tipe file ${file.name} tidak diizinkan.` };
    }
  }
  return null;
}

async function uploadFiles(
  requestId: string,
  itemId: string | null,
  purpose: "receipt" | "realization" | "general",
  files: File[],
) {
  const supabase = await createClient();
  for (const file of files) {
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${requestId}/${itemId ?? "general"}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from(ATTACHMENTS_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) return uploadError.message;

    const { error: insertError } = await supabase
      .from("request_attachments")
      .insert({
        request_id: requestId,
        item_id: itemId,
        purpose,
        file_name: file.name,
        storage_path: path,
        file_size: file.size,
        mime_type: file.type,
      });
    if (insertError) return insertError.message;
  }
  return null;
}

export async function createRequest(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireUser();

  const parsed = requestFormSchema.safeParse({
    type: formData.get("type") || "pengajuan",
    title: formData.get("title"),
    project_id: formData.get("project_id"),
    submission_date: formData.get("submission_date"),
    notes: formData.get("notes") || null,
    items: parseItems(formData.get("items")),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Periksa kembali data pengajuan.",
    };
  }

  const supabase = await createClient();
  const { data: request, error } = await supabase
    .from("expense_requests")
    .insert({
      type: parsed.data.type,
      title: parsed.data.title,
      project_id: parsed.data.project_id,
      submission_date: parsed.data.submission_date,
      notes: parsed.data.notes ?? null,
      created_by: profile.id,
    })
    .select("id, request_number")
    .single();

  if (error || !request) {
    return { error: error?.message ?? "Gagal menyimpan pengajuan." };
  }

  const { data: insertedItems, error: itemsError } = await supabase
    .from("expense_request_items")
    .insert(
      parsed.data.items.map((item, index) => ({
        request_id: request.id,
        name: item.name,
        category_id: item.category_id,
        amount: item.amount,
        sort_order: index,
      })),
    )
    .select("id, name, amount, sort_order");

  if (itemsError || !insertedItems) {
    return { error: itemsError?.message ?? "Gagal menyimpan item." };
  }

  if (parsed.data.type === "reimbursement") {
    for (const item of insertedItems) {
      const files = formData
        .getAll(`receipt_${item.sort_order}`)
        .filter((file): file is File => file instanceof File && file.size > 0);
      const invalid = validateFiles(files);
      if (invalid) return invalid;
      if (files.length > 0) {
        const uploadError = await uploadFiles(
          request.id,
          item.id,
          "receipt",
          files,
        );
        if (uploadError) return { error: uploadError };
      }
    }
  }

  const total = parsed.data.items.reduce((sum, item) => sum + item.amount, 0);

  await logActivity(
    request.id,
    "created",
    `Pengajuan ${request.request_number} dibuat (${parsed.data.items.length} item)`,
    {
      request_number: request.request_number,
      item_count: parsed.data.items.length,
      total,
      snapshot: parsed.data.items.map((item) => ({
        label: item.name,
        value: formatCurrency(item.amount),
      })),
    },
  );

  revalidateRequests();
  redirect(`/requests/${request.id}`);
}

export async function updateRequest(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const id = String(formData.get("id") ?? "");

  const parsed = requestFormSchema.safeParse({
    type: formData.get("type") || "pengajuan",
    title: formData.get("title"),
    project_id: formData.get("project_id"),
    submission_date: formData.get("submission_date"),
    notes: formData.get("notes") || null,
    items: parseItems(formData.get("items")),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Periksa kembali data pengajuan.",
    };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("expense_requests")
    .select("id, request_number, title, project_id, submission_date, notes")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return { error: "Pengajuan tidak ditemukan." };
  }

  const { data: existingItems } = await supabase
    .from("expense_request_items")
    .select("id, status, name, category_id, amount")
    .eq("request_id", id);

  const { count: attachmentCount } = await supabase
    .from("request_attachments")
    .select("id", { count: "exact", head: true })
    .eq("request_id", id);

  const hasProgress =
    (existingItems ?? []).some((item) => item.status !== "submitted") ||
    (attachmentCount ?? 0) > 0;

  const { error } = await supabase
    .from("expense_requests")
    .update({
      title: parsed.data.title,
      project_id: parsed.data.project_id,
      submission_date: parsed.data.submission_date,
      notes: parsed.data.notes ?? null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  if (!hasProgress) {
    await supabase.from("expense_request_items").delete().eq("request_id", id);
    const { error: itemsError } = await supabase
      .from("expense_request_items")
      .insert(
        parsed.data.items.map((item, index) => ({
          request_id: id,
          name: item.name,
          category_id: item.category_id,
          amount: item.amount,
          sort_order: index,
        })),
      );
    if (itemsError) return { error: itemsError.message };
  }

  await logActivity(
    id,
    "updated",
    `Pengajuan ${existing.request_number} diperbarui`,
    {
      request_number: existing.request_number,
      item_count: parsed.data.items.length,
      items_locked: hasProgress,
    },
  );

  revalidateRequests();
  revalidatePath(`/requests/${id}`);
  redirect(`/requests/${id}`);
}

export async function payItem(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = payItemSchema.safeParse({
    item_id: formData.get("item_id"),
    disbursement_date: formData.get("disbursement_date"),
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Periksa kembali data pencairan.",
    };
  }

  const supabase = await createClient();
  const { data: item } = await supabase
    .from("expense_request_items")
    .select("id, name, status, request_id")
    .eq("id", parsed.data.item_id)
    .maybeSingle();

  if (!item) return { error: "Item tidak ditemukan." };
  if (item.status !== "submitted") {
    return { error: "Item ini sudah diproses." };
  }

  const { data: request } = await supabase
    .from("expense_requests")
    .select("request_number, submission_date")
    .eq("id", item.request_id)
    .maybeSingle();

  if (
    request &&
    parsed.data.disbursement_date < request.submission_date
  ) {
    return {
      fieldErrors: {
        disbursement_date: [
          "Tanggal pencairan tidak boleh sebelum tanggal pengajuan",
        ],
      },
      error: "Tanggal pencairan tidak valid.",
    };
  }

  const { error } = await supabase
    .from("expense_request_items")
    .update({
      status: "paid",
      disbursement_date: parsed.data.disbursement_date,
    })
    .eq("id", item.id);

  if (error) return { error: error.message };

  await logActivity(
    item.request_id,
    "status_changed",
    `Item ${item.name} pada ${request?.request_number ?? ""} sudah cair`,
    {
      request_number: request?.request_number,
      item_name: item.name,
      changes: [
        {
          field: "status",
          label: "Status",
          from: ITEM_STATUS_LABELS.submitted,
          to: ITEM_STATUS_LABELS.paid,
        },
        {
          field: "disbursement_date",
          label: "Tanggal Pencairan",
          from: null,
          to: parsed.data.disbursement_date,
        },
      ],
      ...(parsed.data.notes ? { note: parsed.data.notes } : {}),
    },
  );

  revalidateRequests();
  revalidatePath(`/requests/${item.request_id}`);
  return { success: `Item ${item.name} ditandai sudah cair.` };
}

export async function realizeItem(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = realizeItemSchema.safeParse({
    item_id: formData.get("item_id"),
    realized_date: formData.get("realized_date"),
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Periksa kembali data realisasi.",
    };
  }

  const files = formData
    .getAll("files")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length === 0) {
    return { error: "Unggah minimal satu foto realisasi." };
  }

  const invalid = validateFiles(files);
  if (invalid) return invalid;

  const supabase = await createClient();
  const { data: item } = await supabase
    .from("expense_request_items")
    .select("id, name, status, request_id")
    .eq("id", parsed.data.item_id)
    .maybeSingle();

  if (!item) return { error: "Item tidak ditemukan." };
  if (item.status !== "paid") {
    return { error: "Item harus sudah cair sebelum direalisasikan." };
  }

  const { data: request } = await supabase
    .from("expense_requests")
    .select("request_number, type")
    .eq("id", item.request_id)
    .maybeSingle();

  if (request?.type === "reimbursement") {
    return { error: "Reimbursement tidak memerlukan realisasi." };
  }

  const uploadError = await uploadFiles(
    item.request_id,
    item.id,
    "realization",
    files,
  );
  if (uploadError) return { error: uploadError };

  const { error } = await supabase
    .from("expense_request_items")
    .update({
      status: "realized",
      realized_date: parsed.data.realized_date,
    })
    .eq("id", item.id);

  if (error) return { error: error.message };

  await logActivity(
    item.request_id,
    "status_changed",
    `Item ${item.name} pada ${request?.request_number ?? ""} sudah realisasi`,
    {
      request_number: request?.request_number,
      item_name: item.name,
      files: files.map((file) => file.name),
      changes: [
        {
          field: "status",
          label: "Status",
          from: ITEM_STATUS_LABELS.paid,
          to: ITEM_STATUS_LABELS.realized,
        },
        {
          field: "realized_date",
          label: "Tanggal Realisasi",
          from: null,
          to: parsed.data.realized_date,
        },
      ],
    },
  );

  revalidateRequests();
  revalidatePath(`/requests/${item.request_id}`);
  return { success: `Item ${item.name} ditandai sudah realisasi.` };
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
  await requireUser();
  const requestId = String(formData.get("request_id") ?? "");
  const itemIdRaw = String(formData.get("item_id") ?? "");
  const itemId = itemIdRaw.length > 0 ? itemIdRaw : null;
  const purposeRaw = String(formData.get("purpose") ?? "general");
  const purpose =
    purposeRaw === "receipt" || purposeRaw === "realization"
      ? purposeRaw
      : "general";

  const files = formData
    .getAll("files")
    .filter((file): file is File => file instanceof File);

  if (!requestId) return { error: "Pengajuan tidak ditemukan." };

  const validFiles = files.filter((file) => file.size > 0);
  if (validFiles.length === 0) return { error: "Pilih minimal satu file." };

  const invalid = validateFiles(validFiles);
  if (invalid) return invalid;

  const uploadError = await uploadFiles(
    requestId,
    itemId,
    purpose,
    validFiles,
  );
  if (uploadError) return { error: uploadError };

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
