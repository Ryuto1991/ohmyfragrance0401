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
      cart_items: {
        Row: {
          created_at: string
          id: string
          image: string | null
          metadata: Json | null
          name: string
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string
          id: string
          image?: string | null
          metadata?: Json | null
          name: string
          price: number
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string
          price?: number
          quantity?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          session_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          session_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_perfume_images: {
        Row: {
          created_at: string
          id: string
          label_key: string
          label_size: Json
          order_id: string
          original_key: string
          transform: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label_key: string
          label_size: Json
          order_id: string
          original_key: string
          transform: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label_key?: string
          label_size?: Json
          order_id?: string
          original_key?: string
          transform?: Json
          updated_at?: string
        }
        Relationships: []
      }
      custom_perfume_orders: {
        Row: {
          amount_total: number | null
          bottle_id: string
          bottle_name: string
          created_at: string
          cropped_image_url: string | null
          customer_email: string | null
          customer_name: string | null
          fragrance_id: string
          fragrance_name: string
          id: string
          label_image_url: string | null
          label_size: string
          label_type: string
          order_status: string
          original_image_url: string | null
          payment_status: string
          shipping_address: Json | null
          stripe_session_id: string
          updated_at: string
        }
        Insert: {
          amount_total?: number | null
          bottle_id: string
          bottle_name: string
          created_at?: string
          cropped_image_url?: string | null
          customer_email?: string | null
          customer_name?: string | null
          fragrance_id: string
          fragrance_name: string
          id?: string
          label_image_url?: string | null
          label_size: string
          label_type: string
          order_status?: string
          original_image_url?: string | null
          payment_status: string
          shipping_address?: Json | null
          stripe_session_id: string
          updated_at?: string
        }
        Update: {
          amount_total?: number | null
          bottle_id?: string
          bottle_name?: string
          created_at?: string
          cropped_image_url?: string | null
          customer_email?: string | null
          customer_name?: string | null
          fragrance_id?: string
          fragrance_name?: string
          id?: string
          label_image_url?: string | null
          label_size?: string
          label_type?: string
          order_status?: string
          original_image_url?: string | null
          payment_status?: string
          shipping_address?: Json | null
          stripe_session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      fragrance_sessions: {
        Row: {
          character_name: string | null
          created_at: string | null
          fragrance_recipe: Json | null
          id: string
          inappropriate_count: number | null
          message_history: Json | null
          phase: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          character_name?: string | null
          created_at?: string | null
          fragrance_recipe?: Json | null
          id?: string
          inappropriate_count?: number | null
          message_history?: Json | null
          phase?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          character_name?: string | null
          created_at?: string | null
          fragrance_recipe?: Json | null
          id?: string
          inappropriate_count?: number | null
          message_history?: Json | null
          phase?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fragrances: {
        Row: {
          base_note: string | null
          bottle_shape: string | null
          concept: string | null
          created_at: string | null
          label_image_url: string | null
          middle_note: string | null
          name: string
          top_note: string | null
        }
        Insert: {
          base_note?: string | null
          bottle_shape?: string | null
          concept?: string | null
          created_at?: string | null
          label_image_url?: string | null
          middle_note?: string | null
          name: string
          top_note?: string | null
        }
        Update: {
          base_note?: string | null
          bottle_shape?: string | null
          concept?: string | null
          created_at?: string | null
          label_image_url?: string | null
          middle_note?: string | null
          name?: string
          top_note?: string | null
        }
        Relationships: []
      }
      label_temp: {
        Row: {
          after_url: string | null
          before_url: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          after_url?: string | null
          before_url: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          after_url?: string | null
          before_url?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      login_history: {
        Row: {
          created_at: string
          device: string | null
          email: string
          id: string
          ip_address: string | null
          location: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device?: string | null
          email: string
          id?: string
          ip_address?: string | null
          location?: string | null
          status: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          location?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string | null
          bottle_type: string
          created_at: string
          email: string | null
          id: string
          image_after_url: string
          image_before_url: string
          label_id: string
          label_size: string
          name: string | null
          phone: string | null
          scent: string
          status: string
          stripe_session_id: string | null
        }
        Insert: {
          address?: string | null
          bottle_type: string
          created_at?: string
          email?: string | null
          id: string
          image_after_url: string
          image_before_url: string
          label_id: string
          label_size: string
          name?: string | null
          phone?: string | null
          scent: string
          status?: string
          stripe_session_id?: string | null
        }
        Update: {
          address?: string | null
          bottle_type?: string
          created_at?: string
          email?: string | null
          id?: string
          image_after_url?: string
          image_before_url?: string
          label_id?: string
          label_size?: string
          name?: string | null
          phone?: string | null
          scent?: string
          status?: string
          stripe_session_id?: string | null
        }
        Relationships: []
      }
      perfume_recommendations: {
        Row: {
          created_at: string | null
          id: string
          perfume_data: Json
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          perfume_data: Json
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          perfume_data?: Json
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfume_recommendations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfume_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          recommendation_id: string | null
          status: string
          stripe_checkout_id: string | null
          stripe_payment_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          id?: string
          recommendation_id?: string | null
          status?: string
          stripe_checkout_id?: string | null
          stripe_payment_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          recommendation_id?: string | null
          status?: string
          stripe_checkout_id?: string | null
          stripe_payment_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "perfume_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          base_notes: string[]
          created_at: string | null
          description: string | null
          id: string
          middle_notes: string[]
          mode: string
          name: string
          top_notes: string[]
          user_id: string | null
        }
        Insert: {
          base_notes: string[]
          created_at?: string | null
          description?: string | null
          id?: string
          middle_notes: string[]
          mode: string
          name: string
          top_notes: string[]
          user_id?: string | null
        }
        Update: {
          base_notes?: string[]
          created_at?: string | null
          description?: string | null
          id?: string
          middle_notes?: string[]
          mode?: string
          name?: string
          top_notes?: string[]
          user_id?: string | null
        }
        Relationships: []
      }
      temp_custom_perfume_images: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          image_key: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          image_key: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          image_key?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          preferences: Json
          session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          preferences: Json
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          preferences?: Json
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_temp_images: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
