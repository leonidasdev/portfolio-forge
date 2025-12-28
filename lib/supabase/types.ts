/**
 * Database types for Portfolio Forge
 * 
 * Generate updated types by running:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
 * 
 * Or if using local Supabase:
 * npx supabase gen types typescript --local > lib/supabase/types.ts
 */

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
      certifications: {
        Row: {
          id: string
          user_id: string
          title: string
          issuing_organization: string
          certification_type: 'pdf' | 'image' | 'external_link' | 'manual'
          date_issued: string | null
          expiration_date: string | null
          credential_id: string | null
          verification_url: string | null
          file_path: string | null
          file_type: string | null
          external_url: string | null
          description: string | null
          is_public: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          issuing_organization: string
          certification_type: 'pdf' | 'image' | 'external_link' | 'manual'
          date_issued?: string | null
          expiration_date?: string | null
          credential_id?: string | null
          verification_url?: string | null
          file_path?: string | null
          file_type?: string | null
          external_url?: string | null
          description?: string | null
          is_public?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          issuing_organization?: string
          certification_type?: 'pdf' | 'image' | 'external_link' | 'manual'
          date_issued?: string | null
          expiration_date?: string | null
          credential_id?: string | null
          verification_url?: string | null
          file_path?: string | null
          file_type?: string | null
          external_url?: string | null
          description?: string | null
          is_public?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      certification_tags: {
        Row: {
          certification_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          certification_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          certification_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      portfolios: {
        Row: {
          id: string
          user_id: string
          title: string
          slug: string
          description: string | null
          theme: string
          is_public: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          slug: string
          description?: string | null
          theme?: string
          is_public?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          slug?: string
          description?: string | null
          theme?: string
          is_public?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_items: {
        Row: {
          id: string
          portfolio_section_id: string
          item_type: 'certification' | 'project' | 'skill' | 'work_experience'
          item_id: string
          display_order: number
          is_visible: boolean
          custom_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          portfolio_section_id: string
          item_type: 'certification' | 'project' | 'skill' | 'work_experience'
          item_id: string
          display_order?: number
          is_visible?: boolean
          custom_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          portfolio_section_id?: string
          item_type?: 'certification' | 'project' | 'skill' | 'work_experience'
          item_id?: string
          display_order?: number
          is_visible?: boolean
          custom_note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_sections: {
        Row: {
          id: string
          portfolio_id: string
          section_type: 'about' | 'skills' | 'projects' | 'experience' | 'certifications' | 'contact' | 'custom'
          title: string
          description: string | null
          display_order: number
          is_visible: boolean
          custom_content: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          section_type: 'about' | 'skills' | 'projects' | 'experience' | 'certifications' | 'contact' | 'custom'
          title: string
          description?: string | null
          display_order?: number
          is_visible?: boolean
          custom_content?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          section_type?: 'about' | 'skills' | 'projects' | 'experience' | 'certifications' | 'contact' | 'custom'
          title?: string
          description?: string | null
          display_order?: number
          is_visible?: boolean
          custom_content?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          headline: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          headline?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          headline?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          start_date: string | null
          end_date: string | null
          is_current: boolean
          project_url: string | null
          github_url: string | null
          technologies: string[] | null
          is_public: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean
          project_url?: string | null
          github_url?: string | null
          technologies?: string[] | null
          is_public?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean
          project_url?: string | null
          github_url?: string | null
          technologies?: string[] | null
          is_public?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      project_tags: {
        Row: {
          project_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          project_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          project_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      public_links: {
        Row: {
          id: string
          portfolio_id: string
          token: string
          is_active: boolean
          expires_at: string | null
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          token: string
          is_active?: boolean
          expires_at?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          token?: string
          is_active?: boolean
          expires_at?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          user_id: string
          name: string
          proficiency_level: number | null
          years_of_experience: number | null
          is_public: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          proficiency_level?: number | null
          years_of_experience?: number | null
          is_public?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          proficiency_level?: number | null
          years_of_experience?: number | null
          is_public?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      skill_tags: {
        Row: {
          skill_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          skill_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          skill_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string | null
          created_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          layout: 'single-column' | 'two-column' | 'grid' | 'timeline' | 'modern'
          preview_url: string | null
          is_active: boolean
          is_premium: boolean
          config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          layout?: 'single-column' | 'two-column' | 'grid' | 'timeline' | 'modern'
          preview_url?: string | null
          is_active?: boolean
          is_premium?: boolean
          config?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          layout?: 'single-column' | 'two-column' | 'grid' | 'timeline' | 'modern'
          preview_url?: string | null
          is_active?: boolean
          is_premium?: boolean
          config?: Json
          created_at?: string
          updated_at?: string
        }
      }
      themes: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          style: 'professional' | 'modern' | 'creative' | 'minimal' | 'elegant'
          primary_color: string
          secondary_color: string
          background_color: string
          text_color: string
          font_family: string
          preview_url: string | null
          is_active: boolean
          is_premium: boolean
          config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          style?: 'professional' | 'modern' | 'creative' | 'minimal' | 'elegant'
          primary_color?: string
          secondary_color?: string
          background_color?: string
          text_color?: string
          font_family?: string
          preview_url?: string | null
          is_active?: boolean
          is_premium?: boolean
          config?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          style?: 'professional' | 'modern' | 'creative' | 'minimal' | 'elegant'
          primary_color?: string
          secondary_color?: string
          background_color?: string
          text_color?: string
          font_family?: string
          preview_url?: string | null
          is_active?: boolean
          is_premium?: boolean
          config?: Json
          created_at?: string
          updated_at?: string
        }
      }
      work_experience: {
        Row: {
          id: string
          user_id: string
          company: string
          position: string
          location: string | null
          start_date: string
          end_date: string | null
          is_current: boolean
          description: string | null
          responsibilities: string[] | null
          achievements: string[] | null
          is_public: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company: string
          position: string
          location?: string | null
          start_date: string
          end_date?: string | null
          is_current?: boolean
          description?: string | null
          responsibilities?: string[] | null
          achievements?: string[] | null
          is_public?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company?: string
          position?: string
          location?: string | null
          start_date?: string
          end_date?: string | null
          is_current?: boolean
          description?: string | null
          responsibilities?: string[] | null
          achievements?: string[] | null
          is_public?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      work_experience_tags: {
        Row: {
          work_experience_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          work_experience_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          work_experience_id?: string
          tag_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      portfolio_items_detailed: {
        Row: {
          id: string | null
          portfolio_section_id: string | null
          item_type: 'certification' | 'project' | 'skill' | 'work_experience' | null
          item_id: string | null
          display_order: number | null
          is_visible: boolean | null
          custom_note: string | null
          portfolio_id: string | null
          item_data: Json | null
        }
      }
    }
    Functions: {
      generate_public_link_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      increment_view_count: {
        Args: { link_token: string }
        Returns: void
      }
    }
    Enums: {
      certification_type: 'pdf' | 'image' | 'external_link' | 'manual'
      portfolio_item_type: 'certification' | 'project' | 'skill' | 'work_experience'
      section_type: 'about' | 'skills' | 'projects' | 'experience' | 'certifications' | 'contact' | 'custom'
      template_layout: 'single-column' | 'two-column' | 'grid' | 'timeline' | 'modern'
      theme_style: 'professional' | 'modern' | 'creative' | 'minimal' | 'elegant'
    }
  }
}
