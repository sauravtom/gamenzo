import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mlixugscitavyqxigtes.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Server-side Supabase client with service role key (for admin operations)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Database types
export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          author: string | null
          code: string
          user_id: string | null // Privy DID format like "did:privy:..."
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          author?: string | null
          code: string
          user_id?: string | null // Privy DID format like "did:privy:..."
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          author?: string | null
          code?: string
          user_id?: string | null // Privy DID format like "did:privy:..."
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string // Privy DID format like "did:privy:..."
          email: string | null
          wallet_address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string // Privy DID format like "did:privy:..."
          email?: string | null
          wallet_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          wallet_address?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}

export type Game = Database['public']['Tables']['games']['Row']
export type GameInsert = Database['public']['Tables']['games']['Insert']
export type GameUpdate = Database['public']['Tables']['games']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
