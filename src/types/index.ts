export type UserRole = "admin" | "user";

export type RequestStatus = "submitted" | "paid";

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

export interface Category {
  id: string;
  name: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface ExpenseRequest {
  id: string;
  request_number: string;
  title: string;
  category_id: string;
  amount: number;
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
  creator: Pick<Profile, "id" | "full_name" | "email"> | null;
  attachment_count?: number;
}

export interface RequestAttachment {
  id: string;
  request_id: string;
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
}

export interface ActivityLog {
  id: string;
  request_id: string | null;
  actor_id: string;
  action: ActivityAction | string;
  description: string;
  metadata: ActivityMetadata | null;
  created_at: string;
  actor?: Pick<Profile, "id" | "full_name"> | null;
}

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

export const STATUS_LABELS: Record<RequestStatus, string> = {
  submitted: "Sudah Diajukan",
  paid: "Sudah Cair",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  user: "User",
};
