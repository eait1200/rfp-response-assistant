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
      rfp_projects: {
        Row: {
          client_name: string | null
          completed_at: string | null
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
          editor_info: string | null
          id: string
          identified_question_text: string
          last_edited_at: string | null
          last_edited_by: string | null
          original_row_number: number | null
          original_sheet_name: string | null
          project_id: string
          review_required_text: string | null
          reviewer_info: string | null
          section_header: string | null
          sources_text: string | null
          status: string | null
        }
        Insert: {
          ai_generated_answer?: string | null
          assignee_ids?: string[] | null
          confidence_score_calculated?: number | null
          confidence_text?: string | null
          edited_answer?: string | null
          editor_info?: string | null
          id?: string
          identified_question_text: string
          last_edited_at?: string | null
          last_edited_by?: string | null
          original_row_number?: number | null
          original_sheet_name?: string | null
          project_id: string
          review_required_text?: string | null
          reviewer_info?: string | null
          section_header?: string | null
          sources_text?: string | null
          status?: string | null
        }
        Update: {
          ai_generated_answer?: string | null
          assignee_ids?: string[] | null
          confidence_score_calculated?: number | null
          confidence_text?: string | null
          edited_answer?: string | null
          editor_info?: string | null
          id?: string
          identified_question_text?: string
          last_edited_at?: string | null
          last_edited_by?: string | null
          original_row_number?: number | null
          original_sheet_name?: string | null
          project_id?: string
          review_required_text?: string | null
          reviewer_info?: string | null
          section_header?: string | null
          sources_text?: string | null
          status?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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