export type UserRole = "admin" | "user";

export type RequestType = "pengajuan" | "reimbursement";

export type RequestStatus = "submitted" | "partial" | "paid" | "realized";

export type ItemStatus = "submitted" | "paid" | "realized";

export type AttachmentPurpose = "general" | "receipt" | "realization";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface ExpenseRequestItem {
  id: string;
  request_id: string;
  name: string;
  category_id: string | null;
  amount: number;
  status: ItemStatus;
  disbursement_date: string | null;
  realized_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Pick<Category, "id" | "name"> | null;
}

export interface ExpenseRequest {
  id: string;
  request_number: string;
  title: string;
  type: RequestType;
  project_id: string | null;
  category_id: string | null;
  amount: number;
  item_count: number;
  submission_date: string;
  disbursement_date: string | null;
  status: RequestStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ExpenseRequestWithRelations extends ExpenseRequest {
  category: Pick<Category, "id" | "name"> | null;
  project: Pick<Project, "id" | "name"> | null;
  creator: Pick<Profile, "id" | "full_name" | "email"> | null;
}

export interface RequestAttachment {
  id: string;
  request_id: string;
  item_id: string | null;
  purpose: AttachmentPurpose;
  file_name: string;
  storage_path: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string;
  created_at: string;
}

export type ActivityAction =
  | "created"
  | "updated"
  | "status_changed"
  | "attachment_added"
  | "attachment_removed"
  | "deleted";

export interface ActivityChange {
  field: string;
  label: string;
  from: string | null;
  to: string | null;
}

export interface ActivitySnapshotItem {
  label: string;
  value: string;
}

export interface ActivityMetadata {
  request_number?: string;
  changes?: ActivityChange[];
  snapshot?: ActivitySnapshotItem[];
  files?: string[];
  file_name?: string;
  item_name?: string;
}

export interface ActivityLog {
  id: string;
  request_id: string | null;
  item_id: string | null;
  actor_id: string;
  action: ActivityAction | string;
  description: string;
  metadata: ActivityMetadata | null;
  created_at: string;
  actor?: Pick<Profile, "id" | "full_name"> | null;
}

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  pengajuan: "Pengajuan",
  reimbursement: "Reimbursement",
};

export const STATUS_LABELS: Record<RequestStatus, string> = {
  submitted: "Belum Cair",
  partial: "Sebagian Cair",
  paid: "Sudah Cair",
  realized: "Sudah Realisasi",
};

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  submitted: "Belum Cair",
  paid: "Sudah Cair",
  realized: "Sudah Realisasi",
};

export const ATTACHMENT_PURPOSE_LABELS: Record<AttachmentPurpose, string> = {
  general: "Umum",
  receipt: "Struk",
  realization: "Foto Realisasi",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  user: "User",
};

export const ACTIVITY_ACTION_LABELS: Record<string, string> = {
  created: "Dibuat",
  updated: "Diedit",
  status_changed: "Status berubah",
  attachment_added: "Lampiran ditambah",
  attachment_removed: "Lampiran dihapus",
  deleted: "Diarsipkan",
};

export const ACTIVITY_ACTION_PHRASES: Record<string, string> = {
  created: "membuat pengajuan",
  updated: "memperbarui pengajuan",
  status_changed: "mengubah status",
  attachment_added: "menambah lampiran",
  attachment_removed: "menghapus lampiran",
  deleted: "mengarsipkan pengajuan",
};
