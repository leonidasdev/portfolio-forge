/**
 * Mock for @/lib/supabase/types module
 */

export interface Database {
  public: {
    Tables: {
      portfolios: {
        Row: any
        Insert: any
        Update: any
      }
      certifications: {
        Row: any
        Insert: any
        Update: any
      }
    }
  }
}
