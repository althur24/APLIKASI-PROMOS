export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "user";
export type RequestType = "pengajuan" | "reimbursement";
export type RequestStatus = "submitted" | "partial" | "paid" | "realized";
export type ItemStatus = "submitted" | "paid" | "realized";
export type AttachmentPurpose = "general" | "receipt" | "realization";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
          is_active: boolean;
          must_change_password: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: UserRole;
          is_active?: boolean;
          must_change_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: UserRole;
          is_active?: boolean;
          must_change_password?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      expense_requests: {
        Row: {
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
        };
        Insert: {
          id?: string;
          request_number?: string;
          title: string;
          type?: RequestType;
          project_id?: string | null;
          category_id?: string | null;
          amount?: number;
          item_count?: number;
          submission_date: string;
          disbursement_date?: string | null;
          status?: RequestStatus;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          title?: string;
          type?: RequestType;
          project_id?: string | null;
          category_id?: string | null;
          amount?: number;
          item_count?: number;
          submission_date?: string;
          disbursement_date?: string | null;
          status?: RequestStatus;
          notes?: string | null;
          deleted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      expense_request_items: {
        Row: {
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
        };
        Insert: {
          id?: string;
          request_id: string;
          name: string;
          category_id?: string | null;
          amount: number;
          status?: ItemStatus;
          disbursement_date?: string | null;
          realized_date?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          category_id?: string | null;
          amount?: number;
          status?: ItemStatus;
          disbursement_date?: string | null;
          realized_date?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      request_attachments: {
        Row: {
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
        };
        Insert: {
          id?: string;
          request_id: string;
          item_id?: string | null;
          purpose?: AttachmentPurpose;
          file_name: string;
          storage_path: string;
          file_size?: number | null;
          mime_type?: string | null;
          uploaded_by?: string;
          created_at?: string;
        };
        Update: {
          file_name?: string;
          purpose?: AttachmentPurpose;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          request_id: string | null;
          item_id: string | null;
          actor_id: string;
          action: string;
          description: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id?: string | null;
          item_id?: string | null;
          actor_id?: string;
          action: string;
          description: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          description?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      log_activity: {
        Args: {
          p_request_id: string | null;
          p_action: string;
          p_description: string;
          p_metadata?: Json;
        };
        Returns: string;
      };
      generate_request_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      recompute_request_totals: {
        Args: { p_request_id: string };
        Returns: null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
