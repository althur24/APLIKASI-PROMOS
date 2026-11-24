export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "user";
export type RequestStatus = "submitted" | "paid";

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
        };
        Insert: {
          id?: string;
          request_number?: string;
          title: string;
          category_id: string;
          amount: number;
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
          category_id?: string;
          amount?: number;
          submission_date?: string;
          disbursement_date?: string | null;
          status?: RequestStatus;
          notes?: string | null;
          deleted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      request_attachments: {
        Row: {
          id: string;
          request_id: string;
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
          file_name: string;
          storage_path: string;
          file_size?: number | null;
          mime_type?: string | null;
          uploaded_by?: string;
          created_at?: string;
        };
        Update: {
          file_name?: string;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          request_id: string | null;
          actor_id: string;
          action: string;
          description: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id?: string | null;
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
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
