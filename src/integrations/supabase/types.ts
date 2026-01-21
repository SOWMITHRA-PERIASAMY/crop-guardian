export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: string
          created_at: string
          crop_type: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          message: string
          region: string
          severity: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          crop_type?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          region: string
          severity: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          crop_type?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          region?: string
          severity?: string
        }
        Relationships: []
      }
      crop_disease_info: {
        Row: {
          best_practices: string[] | null
          chemical_treatment: string[] | null
          created_at: string
          crop_type: string
          description: string | null
          disease_name: string
          id: string
          organic_treatment: string[] | null
          preventive_measures: string[] | null
          symptoms: string[] | null
        }
        Insert: {
          best_practices?: string[] | null
          chemical_treatment?: string[] | null
          created_at?: string
          crop_type: string
          description?: string | null
          disease_name: string
          id?: string
          organic_treatment?: string[] | null
          preventive_measures?: string[] | null
          symptoms?: string[] | null
        }
        Update: {
          best_practices?: string[] | null
          chemical_treatment?: string[] | null
          created_at?: string
          crop_type?: string
          description?: string | null
          disease_name?: string
          id?: string
          organic_treatment?: string[] | null
          preventive_measures?: string[] | null
          symptoms?: string[] | null
        }
        Relationships: []
      }
      predictions: {
        Row: {
          confidence: number
          created_at: string
          crop_type: string
          disease_name: string
          humidity: number | null
          id: string
          image_url: string | null
          rainfall: number | null
          recommendations: Json | null
          severity: string
          soil_moisture: number | null
          soil_type: string | null
          temperature: number | null
          user_id: string
        }
        Insert: {
          confidence: number
          created_at?: string
          crop_type: string
          disease_name: string
          humidity?: number | null
          id?: string
          image_url?: string | null
          rainfall?: number | null
          recommendations?: Json | null
          severity: string
          soil_moisture?: number | null
          soil_type?: string | null
          temperature?: number | null
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          crop_type?: string
          disease_name?: string
          humidity?: number | null
          id?: string
          image_url?: string | null
          rainfall?: number | null
          recommendations?: Json | null
          severity?: string
          soil_moisture?: number | null
          soil_type?: string | null
          temperature?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          farm_size: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          primary_crop: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          farm_size?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          primary_crop?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          farm_size?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          primary_crop?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
