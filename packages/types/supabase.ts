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
  // __InternalSupabase: {
  //   PostgrestVersion: "13.0.5"
  // }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          customer_id: string
          id: string
          message: string
          sender_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          customer_id: string
          id?: string
          message: string
          sender_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          customer_id?: string
          id?: string
          message?: string
          sender_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          contract_url: string | null
          created_at: string | null
          customer_product_id: string
          end_date: string
          id: string
          interval_months: number
          notes: string | null
          price: number | null
          services_used: number | null
          start_date: string
          status: Database["public"]["Enums"]["contract_status"] | null
          total_service: number
        }
        Insert: {
          contract_url?: string | null
          created_at?: string | null
          customer_product_id: string
          end_date: string
          id?: string
          interval_months: number
          notes?: string | null
          price?: number | null
          services_used?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"] | null
          total_service: number
        }
        Update: {
          contract_url?: string | null
          created_at?: string | null
          customer_product_id?: string
          end_date?: string
          id?: string
          interval_months?: number
          notes?: string | null
          price?: number | null
          services_used?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"] | null
          total_service?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_customer_product_id_fkey"
            columns: ["customer_product_id"]
            isOneToOne: false
            referencedRelation: "customer_products"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_products: {
        Row: {
          created_at: string | null
          customer_id: string
          description: string | null
          id: string
          installation_address_id: string | null
          installation_date: string
          installation_location: string
          installation_technician_id: string | null
          notes: string | null
          order_product_id: string | null
          photo_url: string | null
          product_catalog_id: string
          quantity_owned: number | null
          status: Database["public"]["Enums"]["product_status"] | null
          cust_product_price: number | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          description?: string | null
          id?: string
          installation_address_id?: string | null
          installation_date: string
          installation_location: string
          installation_technician_id?: string | null
          notes?: string | null
          order_product_id?: string | null
          photo_url?: string | null
          product_catalog_id: string
          quantity_owned?: number | null
          status?: Database["public"]["Enums"]["product_status"] | null
          cust_product_price?: number | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          description?: string | null
          id?: string
          installation_address_id?: string | null
          installation_date?: string
          installation_location?: string
          installation_technician_id?: string | null
          notes?: string | null
          order_product_id?: string | null
          photo_url?: string | null
          product_catalog_id?: string
          quantity_owned?: number | null
          status?: Database["public"]["Enums"]["product_status"] | null
          cust_product_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_products_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_products_installation_address_id_fkey"
            columns: ["installation_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_products_installation_technician_id_fkey"
            columns: ["installation_technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_products_order_product_id_fkey"
            columns: ["order_product_id"]
            isOneToOne: false
            referencedRelation: "order_product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_products_product_catalog_id_fkey"
            columns: ["product_catalog_id"]
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address_id: string | null
          created_at: string | null
          id: string
          phone: string | null
          status: Database["public"]["Enums"]["customer_status"] | null
        }
        Insert: {
          address_id?: string | null
          created_at?: string | null
          id: string
          phone?: string | null
          status?: Database["public"]["Enums"]["customer_status"] | null
        }
        Update: {
          address_id?: string | null
          created_at?: string | null
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["customer_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number | null
          created_at: string | null
          customer_id: string
          id: string
          invoice_number: string | null
          pdf_url: string | null
          related_id: string | null
          related_type: Database["public"]["Enums"]["invoice_related_type"] | null
          status: Database["public"]["Enums"]["invoice_status"] | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          customer_id: string
          id?: string
          invoice_number?: string | null
          pdf_url?: string | null
          related_id?: string | null
          related_type?: Database["public"]["Enums"]["invoice_related_type"] | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          customer_id?: string
          id?: string
          invoice_number?: string | null
          pdf_url?: string | null
          related_id?: string | null
          related_type?: Database["public"]["Enums"]["invoice_related_type"] | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string | null
          default_price: number | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          default_price?: number | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          default_price?: number | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          payload: Json | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          payload?: Json | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          payload?: Json | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_product: {
        Row: {
          id: string
          order_id: string
          price: number | null
          product_catalog_id: string
          qty: number | null
          subtotal: number | null
        }
        Insert: {
          id?: string
          order_id: string
          price?: number | null
          product_catalog_id: string
          qty?: number | null
          subtotal?: number | null
        }
        Update: {
          id?: string
          order_id?: string
          price?: number | null
          product_catalog_id?: string
          qty?: number | null
          subtotal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_product_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_product_product_catalog_id_fkey"
            columns: ["product_catalog_id"]
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          order_date: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          order_date?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          order_date?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_catalog: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          model: string | null
          name: string
          price: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          model?: string | null
          name: string
          price?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          model?: string | null
          name?: string
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_catalog_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_category"
            referencedColumns: ["id"]
          },
        ]
      }
      product_category: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      schedule_expected: {
        Row: {
          contract_id: string | null
          created_at: string | null
          customer_product_id: string
          expected_date: string | null
          id: string
          interval_months: number | null
          job_id: string | null
          notes: string | null
          source_type: Database["public"]["Enums"]["service_type"] | null
          status: Database["public"]["Enums"]["schedule_status"] | null
        }
        Insert: {
          contract_id?: string | null
          created_at?: string | null
          customer_product_id: string
          expected_date?: string | null
          id?: string
          interval_months?: number | null
          job_id?: string | null
          notes?: string | null
          source_type?: Database["public"]["Enums"]["service_type"] | null
          status?: Database["public"]["Enums"]["schedule_status"] | null
        }
        Update: {
          contract_id?: string | null
          created_at?: string | null
          customer_product_id?: string
          expected_date?: string | null
          id?: string
          interval_months?: number | null
          job_id?: string | null
          notes?: string | null
          source_type?: Database["public"]["Enums"]["service_type"] | null
          status?: Database["public"]["Enums"]["schedule_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_expected_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_expected_customer_product_id_fkey"
            columns: ["customer_product_id"]
            isOneToOne: false
            referencedRelation: "customer_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_expected_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      service_log: {
        Row: {
          created_at: string | null
          customer_product_id: string
          expected_id: string | null
          harga_service: number | null
          id: string
          job_evidence: Json | null
          job_id: string | null
          notes: string | null
          pekerjaan: string | null
          service_date: string | null
          service_type: Database["public"]["Enums"]["service_type"] | null
          task_id: string | null
          technician_id: string
          teknisi_fee: number | null
        }
        Insert: {
          created_at?: string | null
          customer_product_id: string
          expected_id?: string | null
          harga_service?: number | null
          id?: string
          job_evidence?: Json | null
          job_id?: string | null
          notes?: string | null
          pekerjaan?: string | null
          service_date?: string | null
          service_type?: Database["public"]["Enums"]["service_type"] | null
          task_id?: string | null
          technician_id: string
          teknisi_fee?: number | null
        }
        Update: {
          created_at?: string | null
          customer_product_id?: string
          expected_id?: string | null
          harga_service?: number | null
          id?: string
          job_evidence?: Json | null
          job_id?: string | null
          notes?: string | null
          pekerjaan?: string | null
          service_date?: string | null
          service_type?: Database["public"]["Enums"]["service_type"] | null
          task_id?: string | null
          technician_id?: string
          teknisi_fee?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_log_customer_product_id_fkey"
            columns: ["customer_product_id"]
            isOneToOne: false
            referencedRelation: "customer_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_log_expected_id_fkey"
            columns: ["expected_id"]
            isOneToOne: false
            referencedRelation: "schedule_expected"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_log_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_log_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_log_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string | null
          customer_id: string | null
          customer_product_id: string | null
          description: string | null
          expected_id: string | null
          id: string
          job_id: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          task_date: string | null
          task_type: Database["public"]["Enums"]["task_type"] | null
          technician_id: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          customer_product_id?: string | null
          description?: string | null
          expected_id?: string | null
          id?: string
          job_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_date?: string | null
          task_type?: Database["public"]["Enums"]["task_type"] | null
          technician_id?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          customer_product_id?: string | null
          description?: string | null
          expected_id?: string | null
          id?: string
          job_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_date?: string | null
          task_type?: Database["public"]["Enums"]["task_type"] | null
          technician_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_customer_product_id_fkey"
            columns: ["customer_product_id"]
            isOneToOne: false
            referencedRelation: "customer_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_expected_id_fkey"
            columns: ["expected_id"]
            isOneToOne: false
            referencedRelation: "schedule_expected"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          notes: string | null
          phone: string | null
          photo_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
        }
        Relationships: []
      }
      addresses: {
        Row: {
          address_type: Database["public"]["Enums"]["address_type"] | null
          created_at: string | null
          cust_address: string
          customer_id: string
          id: string
          is_primary: boolean | null
        }
        Insert: {
          address_type?: Database["public"]["Enums"]["address_type"] | null
          created_at?: string | null
          cust_address: string
          customer_id: string
          id?: string
          is_primary?: boolean | null
        }
        Update: {
          address_type?: Database["public"]["Enums"]["address_type"] | null
          created_at?: string | null
          cust_address?: string
          customer_id?: string
          id?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      service_log_customer_view: {
        Row: {
          created_at: string | null
          customer_product_id: string | null
          expected_id: string | null
          harga_service: number | null
          id: string | null
          job_evidence: Json | null
          notes: string | null
          pekerjaan: string | null
          service_date: string | null
          service_type: Database["public"]["Enums"]["service_type"] | null
          technician_id: string | null
          technician_name: string | null
          technician_photo: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_log_customer_product_id_fkey"
            columns: ["customer_product_id"]
            isOneToOne: false
            referencedRelation: "customer_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_log_expected_id_fkey"
            columns: ["expected_id"]
            isOneToOne: false
            referencedRelation: "schedule_expected"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      address_type: "apartment" | "rumah" | "company"
      contract_status: "active" | "expired" | "not used"
      customer_status: "active" | "inactive" | "blacklisted"
      invoice_related_type: "order" | "contract" | "service" | "other"
      invoice_status: "draft" | "sent" | "paid" | "cancelled"
      notification_type:
        | "service_reminder"
        | "invoice_created"
        | "payment_received"
        | "contract_expiring"
        | "contract_activated"
        | "service_completed"
        | "general"
      order_status: "pending" | "paid" | "cancelled"
      product_status: "active" | "inactive" | "tradeIn"
      schedule_status: "pending" | "done" | "canceled" | "scheduled"
      service_type: "contract" | "perpanggil"
      task_status: "pending" | "completed" | "canceled"
      task_type: "general" | "service"
      user_role: "admin" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof Database
}
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      address_type: ["apartment", "rumah", "company"],
      contract_status: ["active", "expired", "not used"],
      customer_status: ["active", "inactive", "blacklisted"],
      invoice_related_type: ["order", "contract", "service", "other"],
      invoice_status: ["draft", "sent", "paid", "cancelled"],
      notification_type: [
        "service_reminder",
        "invoice_created",
        "payment_received",
        "contract_expiring",
        "contract_activated",
        "service_completed",
        "general",
      ],
      order_status: ["pending", "paid", "cancelled"],
      product_status: ["active", "inactive", "tradeIn"],
      schedule_status: ["pending", "done", "canceled", "scheduled"],
      service_type: ["contract", "perpanggil"],
      task_status: ["pending", "completed", "canceled"],
      task_type: ["general", "service"],
      user_role: ["admin", "customer"],
    },
  },
} as const
