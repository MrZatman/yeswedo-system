export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string
          name: string
          slug: string
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          phone: string | null
          email: string | null
          logo_url: string | null
          timezone: string
          is_active: boolean
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          timezone?: string
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          timezone?: string
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_stores: {
        Row: {
          id: string
          user_id: string
          store_id: string
          role: 'super_admin' | 'store_manager' | 'staff'
          is_active: boolean
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          store_id: string
          role: 'super_admin' | 'store_manager' | 'staff'
          is_active?: boolean
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          store_id?: string
          role?: 'super_admin' | 'store_manager' | 'staff'
          is_active?: boolean
          is_default?: boolean
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          store_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          avatar_url: string | null
          notes: string | null
          tags: string[]
          last_visit_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          avatar_url?: string | null
          notes?: string | null
          tags?: string[]
          last_visit_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          avatar_url?: string | null
          notes?: string | null
          tags?: string[]
          last_visit_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      services: {
        Row: {
          id: string
          store_id: string
          name: string
          description: string | null
          price: number
          duration_minutes: number
          category: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          description?: string | null
          price: number
          duration_minutes?: number
          category?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          description?: string | null
          price?: number
          duration_minutes?: number
          category?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          store_id: string
          name: string
          description: string | null
          sku: string | null
          price: number
          cost: number | null
          quantity_in_stock: number
          low_stock_threshold: number
          category: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          description?: string | null
          sku?: string | null
          price: number
          cost?: number | null
          quantity_in_stock?: number
          low_stock_threshold?: number
          category?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          description?: string | null
          sku?: string | null
          price?: number
          cost?: number | null
          quantity_in_stock?: number
          low_stock_threshold?: number
          category?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      membership_plans: {
        Row: {
          id: string
          store_id: string
          name: string
          shortcode: string
          description: string | null
          price: number
          currency: string
          billing_period: 'monthly' | 'yearly'
          haircuts_included: number
          services_included: string[]
          discount_percentage: number
          is_active: boolean
          sort_order: number
          stripe_price_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          shortcode: string
          description?: string | null
          price: number
          currency?: string
          billing_period?: 'monthly' | 'yearly'
          haircuts_included?: number
          services_included?: string[]
          discount_percentage?: number
          is_active?: boolean
          sort_order?: number
          stripe_price_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          shortcode?: string
          description?: string | null
          price?: number
          currency?: string
          billing_period?: 'monthly' | 'yearly'
          haircuts_included?: number
          services_included?: string[]
          discount_percentage?: number
          is_active?: boolean
          sort_order?: number
          stripe_price_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          store_id: string
          client_id: string
          staff_id: string
          date: string
          start_time: string
          end_time: string
          duration_minutes: number
          services: Json
          products: Json
          subtotal: number
          discount: number
          total: number
          status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          client_id: string
          staff_id: string
          date: string
          start_time: string
          end_time: string
          duration_minutes: number
          services?: Json
          products?: Json
          subtotal?: number
          discount?: number
          total?: number
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          client_id?: string
          staff_id?: string
          date?: string
          start_time?: string
          end_time?: string
          duration_minutes?: number
          services?: Json
          products?: Json
          subtotal?: number
          discount?: number
          total?: number
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clock_records: {
        Row: {
          id: string
          store_id: string
          user_id: string
          clock_in: string
          clock_out: string | null
          hours_worked: number | null
          break_minutes: number
          off_clock_amount: number
          status: 'active' | 'completed' | 'edited'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          user_id: string
          clock_in: string
          clock_out?: string | null
          hours_worked?: number | null
          break_minutes?: number
          off_clock_amount?: number
          status?: 'active' | 'completed' | 'edited'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          user_id?: string
          clock_in?: string
          clock_out?: string | null
          hours_worked?: number | null
          break_minutes?: number
          off_clock_amount?: number
          status?: 'active' | 'completed' | 'edited'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper types
export type Store = Database['public']['Tables']['stores']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type UserStore = Database['public']['Tables']['user_stores']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type MembershipPlan = Database['public']['Tables']['membership_plans']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type ClockRecord = Database['public']['Tables']['clock_records']['Row']
