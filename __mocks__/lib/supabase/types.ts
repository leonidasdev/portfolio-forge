/**
 * Mock for @/lib/supabase/types module
 */

/** Mock row type for database tables */
export interface MockRow {
  id: string
  created_at: string
  updated_at: string
  [key: string]: unknown
}

/** Mock insert type for database tables */
export interface MockInsert {
  [key: string]: unknown
}

/** Mock update type for database tables */
export interface MockUpdate {
  [key: string]: unknown
}

export interface Database {
  public: {
    Tables: {
      portfolios: {
        Row: MockRow
        Insert: MockInsert
        Update: MockUpdate
      }
      certifications: {
        Row: MockRow
        Insert: MockInsert
        Update: MockUpdate
      }
    }
  }
}
