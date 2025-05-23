export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rfp_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          id: string
          question_id: string
          user_avatar_initials: string | null
          user_display_name: string
          user_id: string | null
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          id?: string
          question_id: string
          user_avatar_initials?: string | null
          user_display_name: string
          user_id?: string | null
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          id?: string
          question_id?: string
          user_avatar_initials?: string | null
          user_display_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfp_comments_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "rfp_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      rfp_projects: {
        Row: {
          client_name: string | null
          completed_at: string | null
          customer_name: string | null
          description: string | null
          display_rfp_id: string | null
          due_date: string | null
          id: string
          n8n_job_id: string | null
          original_filename: string | null
          project_lead_id: string | null
          status: string | null
          tags: string[] | null
          uploaded_at: string | null
          user_id: string | null
          value_range: string | null
        }
        Insert: {
          client_name?: string | null
          completed_at?: string | null
          customer_name?: string | null
          description?: string | null
          display_rfp_id?: string | null
          due_date?: string | null
          id?: string
          n8n_job_id?: string | null
          original_filename?: string | null
          project_lead_id?: string | null
          status?: string | null
          tags?: string[] | null
          uploaded_at?: string | null
          user_id?: string | null
          value_range?: string | null
        }
        Update: {
          client_name?: string | null
          completed_at?: string | null
          customer_name?: string | null
          description?: string | null
          display_rfp_id?: string | null
          due_date?: string | null
          id?: string
          n8n_job_id?: string | null
          original_filename?: string | null
          project_lead_id?: string | null
          status?: string | null
          tags?: string[] | null
          uploaded_at?: string | null
          user_id?: string | null
          value_range?: string | null
        }
        Relationships: []
      }
      rfp_questions: {
        Row: {
          ai_generated_answer: string | null
          assignee_ids: string[] | null
          confidence_score_calculated: number | null
          confidence_text: string | null
          edited_answer: string | null
          editor_id: string | null
          id: string
          identified_question_text: string
          justification: string | null
          last_edited_at: string | null
          last_edited_by: string | null
          last_status_change_at: string | null
          original_row_number: number | null
          original_sheet_name: string | null
          project_id: string
          review_required_text: string | null
          reviewer_id: string | null
          section_header: string | null
          sources_text: string | null
          status: string | null
          trust_score: number | null
        }
        Insert: {
          ai_generated_answer?: string | null
          assignee_ids?: string[] | null
          confidence_score_calculated?: number | null
          confidence_text?: string | null
          edited_answer?: string | null
          editor_id?: string | null
          id?: string
          identified_question_text: string
          justification?: string | null
          last_edited_at?: string | null
          last_edited_by?: string | null
          last_status_change_at?: string | null
          original_row_number?: number | null
          original_sheet_name?: string | null
          project_id: string
          review_required_text?: string | null
          reviewer_id?: string | null
          section_header?: string | null
          sources_text?: string | null
          status?: string | null
          trust_score?: number | null
        }
        Update: {
          ai_generated_answer?: string | null
          assignee_ids?: string[] | null
          confidence_score_calculated?: number | null
          confidence_text?: string | null
          edited_answer?: string | null
          editor_id?: string | null
          id?: string
          identified_question_text?: string
          justification?: string | null
          last_edited_at?: string | null
          last_edited_by?: string | null
          last_status_change_at?: string | null
          original_row_number?: number | null
          original_sheet_name?: string | null
          project_id?: string
          review_required_text?: string | null
          reviewer_id?: string | null
          section_header?: string | null
          sources_text?: string | null
          status?: string | null
          trust_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rfp_questions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rfp_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_update_user_role: {
        Args: { user_id_param: string; new_role_param: string }
        Returns: Json
      }
      create_update_user_role_function_if_not_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_all_user_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          first_name: string
          last_name: string
        }[]
      }
      get_my_app_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_profile: {
        Args: { user_id_param: string }
        Returns: {
          id: string
          first_name: string
          last_name: string
          email: string
          app_role: string
          updated_at: string
        }[]
      }
      get_users_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          app_role: string
          created_at: string
        }[]
      }
      insert_rfp_project: {
        Args: {
          p_original_filename: string
          p_status?: string
          p_n8n_job_id?: string
        }
        Returns: Json
      }
      insert_rfp_question: {
        Args:
          | {
              p_project_id: string
              p_identified_question_text: string
              p_original_sheet_name?: string
              p_original_row_number?: number
              p_section_header?: string
              p_ai_generated_answer?: string
              p_confidence_text?: string
              p_confidence_score_calculated?: number
              p_review_required_text?: string
              p_sources_text?: string
              p_justification?: string
              p_status?: string
            }
          | {
              p_project_id: string
              p_identified_question_text: string
              p_original_sheet_name?: string
              p_original_row_number?: number
              p_section_header?: string
              p_ai_generated_answer?: string
              p_confidence_text?: string
              p_confidence_score_calculated?: number
              p_review_required_text?: string
              p_sources_text?: string
              p_status?: string
            }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_user_profile: {
        Args: {
          user_id_param: string
          first_name_param: string
          last_name_param: string
        }
        Returns: {
          id: string
          first_name: string
          last_name: string
          email: string
          app_role: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const 