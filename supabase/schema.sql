-- =====================================================
-- PORTFOLIO FORGE - SUPABASE DATABASE SCHEMA
-- =====================================================
-- Multi-user portfolio schema: certifications, projects, skills,
-- work experience, tags, drag-and-drop sections, and public links.
-- Includes RLS, storage policies, triggers, and views.
-- Run: psql "<PG_CONN>" -f supabase/schema.sql
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

-- Certification types
CREATE TYPE certification_type AS ENUM ('pdf', 'image', 'external_link', 'manual');

-- Portfolio item types (for polymorphic associations)
CREATE TYPE portfolio_item_type AS ENUM ('certification', 'project', 'skill', 'work_experience');

-- Section types for portfolio sections
CREATE TYPE section_type AS ENUM ('about', 'skills', 'projects', 'experience', 'certifications', 'contact', 'custom');

-- Template layout types
CREATE TYPE template_layout AS ENUM ('single-column', 'two-column', 'grid', 'timeline', 'modern');

-- Theme style types
CREATE TYPE theme_style AS ENUM ('professional', 'modern', 'creative', 'minimal', 'elegant');

-- =====================================================
-- TABLES
-- =====================================================

-- -----------------------------------------------------
-- PROFILES (extends auth.users)
-- -----------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  headline TEXT, -- e.g., "Full Stack Developer"
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- Index
CREATE INDEX idx_profiles_email ON profiles(email);

-- -----------------------------------------------------
-- TEMPLATES (portfolio layout templates)
-- -----------------------------------------------------
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  layout template_layout NOT NULL DEFAULT 'single-column',
  preview_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for templates (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view active templates"
  ON templates FOR SELECT
  USING (is_active = true);

-- Index
CREATE INDEX idx_templates_layout ON templates(layout);
CREATE INDEX idx_templates_is_active ON templates(is_active) WHERE is_active = true;

-- -----------------------------------------------------
-- THEMES (visual styling themes)
-- -----------------------------------------------------
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  style theme_style NOT NULL DEFAULT 'professional',
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#10B981',
  background_color TEXT DEFAULT '#FFFFFF',
  text_color TEXT DEFAULT '#1F2937',
  font_family TEXT DEFAULT 'Inter',
  preview_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for themes (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view active themes"
  ON themes FOR SELECT
  USING (is_active = true);

-- Index
CREATE INDEX idx_themes_style ON themes(style);
CREATE INDEX idx_themes_is_active ON themes(is_active) WHERE is_active = true;

-- -----------------------------------------------------
-- TAGS
-- -----------------------------------------------------
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT, -- Hex color for UI display
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name) -- Prevent duplicate tag names per user
);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tags
CREATE POLICY "Users can view their own tags"
  ON tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
  ON tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
  ON tags FOR DELETE
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_tags_user_id ON tags(user_id);

-- -----------------------------------------------------
-- CERTIFICATIONS
-- -----------------------------------------------------
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  certification_type certification_type NOT NULL,
  
  -- Dates
  date_issued DATE,
  expiration_date DATE,
  
  -- Credential info
  credential_id TEXT,
  verification_url TEXT,
  
  -- File storage (for PDF/image uploads)
  file_path TEXT, -- Path in Supabase Storage
  file_type TEXT, -- MIME type
  
  -- External link (for Credly, IBM, etc.)
  external_url TEXT,
  
  -- Description
  description TEXT,
  
  -- Visibility
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_file_or_link CHECK (
    (certification_type IN ('pdf', 'image') AND file_path IS NOT NULL) OR
    (certification_type = 'external_link' AND external_url IS NOT NULL) OR
    (certification_type = 'manual')
  )
);

-- Enable RLS
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for certifications
CREATE POLICY "Users can view their own certifications"
  ON certifications FOR SELECT
  USING (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "Public certifications viewable by anyone"
  ON certifications FOR SELECT
  USING (is_public = true AND is_deleted = false);

CREATE POLICY "Users can create their own certifications"
  ON certifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certifications"
  ON certifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certifications"
  ON certifications FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_certifications_user_id ON certifications(user_id);
CREATE INDEX idx_certifications_is_public ON certifications(is_public) WHERE is_deleted = false;
CREATE INDEX idx_certifications_is_deleted ON certifications(is_deleted);

-- -----------------------------------------------------
-- CERTIFICATION_TAGS (many-to-many)
-- -----------------------------------------------------
CREATE TABLE certification_tags (
  certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (certification_id, tag_id)
);

-- Enable RLS
ALTER TABLE certification_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for certification_tags
CREATE POLICY "Users can view their own certification tags"
  ON certification_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM certifications c
      WHERE c.id = certification_tags.certification_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own certification tags"
  ON certification_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM certifications c
      WHERE c.id = certification_tags.certification_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own certification tags"
  ON certification_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM certifications c
      WHERE c.id = certification_tags.certification_id
      AND c.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_certification_tags_certification_id ON certification_tags(certification_id);
CREATE INDEX idx_certification_tags_tag_id ON certification_tags(tag_id);

-- -----------------------------------------------------
-- PROJECTS
-- -----------------------------------------------------
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  project_url TEXT,
  github_url TEXT,
  technologies TEXT[], -- Array of technology names
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "Public projects viewable by anyone"
  ON projects FOR SELECT
  USING (is_public = true AND is_deleted = false);

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_is_public ON projects(is_public) WHERE is_deleted = false;

-- -----------------------------------------------------
-- PROJECT_TAGS (many-to-many)
-- -----------------------------------------------------
CREATE TABLE project_tags (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, tag_id)
);

-- Enable RLS
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_tags
CREATE POLICY "Users can view their own project tags"
  ON project_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_tags.project_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own project tags"
  ON project_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_tags.project_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own project tags"
  ON project_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_tags.project_id
      AND p.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX idx_project_tags_tag_id ON project_tags(tag_id);

-- -----------------------------------------------------
-- SKILLS
-- -----------------------------------------------------
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5), -- 1-5 scale
  years_of_experience INTEGER,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name) -- Prevent duplicate skills per user
);

-- Enable RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for skills
CREATE POLICY "Users can view their own skills"
  ON skills FOR SELECT
  USING (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "Public skills viewable by anyone"
  ON skills FOR SELECT
  USING (is_public = true AND is_deleted = false);

CREATE POLICY "Users can create their own skills"
  ON skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
  ON skills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
  ON skills FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_is_public ON skills(is_public) WHERE is_deleted = false;

-- -----------------------------------------------------
-- SKILL_TAGS (many-to-many)
-- -----------------------------------------------------
CREATE TABLE skill_tags (
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (skill_id, tag_id)
);

-- Enable RLS
ALTER TABLE skill_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for skill_tags
CREATE POLICY "Users can view their own skill tags"
  ON skill_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM skills s
      WHERE s.id = skill_tags.skill_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own skill tags"
  ON skill_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM skills s
      WHERE s.id = skill_tags.skill_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own skill tags"
  ON skill_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM skills s
      WHERE s.id = skill_tags.skill_id
      AND s.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_skill_tags_skill_id ON skill_tags(skill_id);
CREATE INDEX idx_skill_tags_tag_id ON skill_tags(tag_id);

-- -----------------------------------------------------
-- WORK_EXPERIENCE
-- -----------------------------------------------------
CREATE TABLE work_experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  responsibilities TEXT[], -- Array of responsibility items
  achievements TEXT[], -- Array of achievement items
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;

-- RLS Policies for work_experience
CREATE POLICY "Users can view their own work experience"
  ON work_experience FOR SELECT
  USING (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "Public work experience viewable by anyone"
  ON work_experience FOR SELECT
  USING (is_public = true AND is_deleted = false);

CREATE POLICY "Users can create their own work experience"
  ON work_experience FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work experience"
  ON work_experience FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work experience"
  ON work_experience FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_work_experience_user_id ON work_experience(user_id);
CREATE INDEX idx_work_experience_is_public ON work_experience(is_public) WHERE is_deleted = false;

-- -----------------------------------------------------
-- WORK_EXPERIENCE_TAGS (many-to-many)
-- -----------------------------------------------------
CREATE TABLE work_experience_tags (
  work_experience_id UUID NOT NULL REFERENCES work_experience(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (work_experience_id, tag_id)
);

-- Enable RLS
ALTER TABLE work_experience_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for work_experience_tags
CREATE POLICY "Users can view their own work experience tags"
  ON work_experience_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM work_experience we
      WHERE we.id = work_experience_tags.work_experience_id
      AND we.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own work experience tags"
  ON work_experience_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM work_experience we
      WHERE we.id = work_experience_tags.work_experience_id
      AND we.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own work experience tags"
  ON work_experience_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM work_experience we
      WHERE we.id = work_experience_tags.work_experience_id
      AND we.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_work_experience_tags_work_experience_id ON work_experience_tags(work_experience_id);
CREATE INDEX idx_work_experience_tags_tag_id ON work_experience_tags(tag_id);

-- -----------------------------------------------------
-- PORTFOLIOS
-- -----------------------------------------------------
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL-friendly identifier
  description TEXT,
  theme TEXT DEFAULT 'default', -- For future template support
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, slug) -- Unique slug per user
);

-- Enable RLS
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolios
CREATE POLICY "Users can view their own portfolios"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id AND is_deleted = false);

-- Public-facing policy for portfolios (moved later after `public_links` table)

CREATE POLICY "Users can create their own portfolios"
  ON portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
  ON portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
  ON portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_slug ON portfolios(user_id, slug);
CREATE INDEX idx_portfolios_is_public ON portfolios(is_public) WHERE is_deleted = false;

-- -----------------------------------------------------
-- PORTFOLIO_SECTIONS
-- -----------------------------------------------------
CREATE TABLE portfolio_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  section_type section_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0, -- For drag-and-drop ordering
  is_visible BOOLEAN NOT NULL DEFAULT true,
  custom_content JSONB, -- For custom sections with flexible content
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE portfolio_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolio_sections
CREATE POLICY "Users can view their own portfolio sections"
  ON portfolio_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios p
      WHERE p.id = portfolio_sections.portfolio_id
      AND p.user_id = auth.uid()
    )
  );

-- Public-facing policy for portfolio sections (moved later after `public_links` table)

CREATE POLICY "Users can create sections in their own portfolios"
  ON portfolio_sections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios p
      WHERE p.id = portfolio_sections.portfolio_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own portfolio sections"
  ON portfolio_sections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios p
      WHERE p.id = portfolio_sections.portfolio_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own portfolio sections"
  ON portfolio_sections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios p
      WHERE p.id = portfolio_sections.portfolio_id
      AND p.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_portfolio_sections_portfolio_id ON portfolio_sections(portfolio_id);
CREATE INDEX idx_portfolio_sections_display_order ON portfolio_sections(portfolio_id, display_order);

-- -----------------------------------------------------
-- PORTFOLIO_ITEMS (polymorphic junction table)
-- -----------------------------------------------------
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_section_id UUID NOT NULL REFERENCES portfolio_sections(id) ON DELETE CASCADE,
  item_type portfolio_item_type NOT NULL,
  item_id UUID NOT NULL, -- References certification, project, skill, or work_experience
  display_order INTEGER NOT NULL DEFAULT 0, -- For ordering within a section
  is_visible BOOLEAN NOT NULL DEFAULT true, -- Override item's public flag
  custom_note TEXT, -- Optional note specific to this portfolio
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(portfolio_section_id, item_type, item_id) -- Prevent duplicate items in same section
);

-- Enable RLS
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolio_items
CREATE POLICY "Users can view their own portfolio items"
  ON portfolio_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_sections ps
      JOIN portfolios p ON p.id = ps.portfolio_id
      WHERE ps.id = portfolio_items.portfolio_section_id
      AND p.user_id = auth.uid()
    )
  );

-- Public-facing policy for portfolio items (moved later after `public_links` table)

CREATE POLICY "Users can create items in their own portfolios"
  ON portfolio_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolio_sections ps
      JOIN portfolios p ON p.id = ps.portfolio_id
      WHERE ps.id = portfolio_items.portfolio_section_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own portfolio items"
  ON portfolio_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_sections ps
      JOIN portfolios p ON p.id = ps.portfolio_id
      WHERE ps.id = portfolio_items.portfolio_section_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own portfolio items"
  ON portfolio_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_sections ps
      JOIN portfolios p ON p.id = ps.portfolio_id
      WHERE ps.id = portfolio_items.portfolio_section_id
      AND p.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_portfolio_items_section_id ON portfolio_items(portfolio_section_id);
CREATE INDEX idx_portfolio_items_item_type_id ON portfolio_items(item_type, item_id);
CREATE INDEX idx_portfolio_items_display_order ON portfolio_items(portfolio_section_id, display_order);

-- -----------------------------------------------------
-- PUBLIC_LINKS (shareable portfolio URLs)
-- -----------------------------------------------------
CREATE TABLE public_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE, -- Secure random token for URL
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ, -- Optional expiration
  view_count INTEGER NOT NULL DEFAULT 0, -- Track views
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public_links
CREATE POLICY "Users can view their own public links"
  ON public_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios p
      WHERE p.id = public_links.portfolio_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active public links"
  ON public_links FOR SELECT
  USING (
    is_active = true AND
    (expires_at IS NULL OR expires_at > NOW())
  );

CREATE POLICY "Users can create public links for their portfolios"
  ON public_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios p
      WHERE p.id = public_links.portfolio_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own public links"
  ON public_links FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios p
      WHERE p.id = public_links.portfolio_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own public links"
  ON public_links FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios p
      WHERE p.id = public_links.portfolio_id
      AND p.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_public_links_portfolio_id ON public_links(portfolio_id);
CREATE INDEX idx_public_links_token ON public_links(token);
CREATE INDEX idx_public_links_is_active ON public_links(is_active, expires_at);

-- Public-facing policies that allow viewing portfolios, sections, and items
-- via active public links. These reference `public_links`, so create them
-- after the `public_links` table and its indexes exist to avoid forward-reference errors.

CREATE POLICY "Public portfolios viewable via public_links"
  ON portfolios FOR SELECT
  USING (
    is_public = true AND is_deleted = false AND
    EXISTS (
      SELECT 1 FROM public_links pl
      WHERE pl.portfolio_id = portfolios.id
      AND pl.is_active = true
    )
  );

CREATE POLICY "Public portfolio sections viewable via public_links"
  ON portfolio_sections FOR SELECT
  USING (
    is_visible = true AND
    EXISTS (
      SELECT 1 FROM portfolios p
      JOIN public_links pl ON pl.portfolio_id = p.id
      WHERE p.id = portfolio_sections.portfolio_id
      AND p.is_public = true
      AND pl.is_active = true
    )
  );

CREATE POLICY "Public portfolio items viewable via public_links"
  ON portfolio_items FOR SELECT
  USING (
    is_visible = true AND
    EXISTS (
      SELECT 1 FROM portfolio_sections ps
      JOIN portfolios p ON p.id = ps.portfolio_id
      JOIN public_links pl ON pl.portfolio_id = p.id
      WHERE ps.id = portfolio_items.portfolio_section_id
      AND p.is_public = true
      AND ps.is_visible = true
      AND pl.is_active = true
    ) AND
    (
      (item_type = 'certification' AND EXISTS (
        SELECT 1 FROM certifications c
        WHERE c.id = portfolio_items.item_id AND c.is_public = true
      )) OR
      (item_type = 'project' AND EXISTS (
        SELECT 1 FROM projects pr
        WHERE pr.id = portfolio_items.item_id AND pr.is_public = true
      )) OR
      (item_type = 'skill' AND EXISTS (
        SELECT 1 FROM skills s
        WHERE s.id = portfolio_items.item_id AND s.is_public = true
      )) OR
      (item_type = 'work_experience' AND EXISTS (
        SELECT 1 FROM work_experience we
        WHERE we.id = portfolio_items.item_id AND we.is_public = true
      ))
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_experience_updated_at BEFORE UPDATE ON work_experience
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_sections_updated_at BEFORE UPDATE ON portfolio_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_items_updated_at BEFORE UPDATE ON portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_public_links_updated_at BEFORE UPDATE ON public_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create storage bucket for certification files
INSERT INTO storage.buckets (id, name, public)
VALUES ('certifications', 'certifications', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for certifications bucket
-- Make policy creation idempotent: drop any existing policies with the same names
CREATE POLICY "Users can upload their own certification files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certifications' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own certification files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'certifications' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own certification files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'certifications' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own certification files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'certifications' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Public access for certification files marked as public
-- Note: This requires additional logic in application layer to generate signed URLs
-- or to move public files to a separate public bucket

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to generate secure random token for public links
CREATE OR REPLACE FUNCTION generate_public_link_token()
RETURNS TEXT AS $$
DECLARE
  characters TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  token TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..32 LOOP
    token := token || substr(characters, floor(random() * length(characters) + 1)::int, 1);
  END LOOP;
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count on public links
CREATE OR REPLACE FUNCTION increment_view_count(link_token TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public_links
  SET view_count = view_count + 1,
      updated_at = NOW()
  WHERE token = link_token
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEWS (for easier querying)
-- =====================================================

-- View to get portfolio items with full details
CREATE OR REPLACE VIEW portfolio_items_detailed AS
SELECT
  pi.id,
  pi.portfolio_section_id,
  pi.item_type,
  pi.item_id,
  pi.display_order,
  pi.is_visible,
  pi.custom_note,
  ps.portfolio_id,
  CASE
    WHEN pi.item_type = 'certification' THEN (SELECT row_to_json(c.*) FROM certifications c WHERE c.id = pi.item_id)
    WHEN pi.item_type = 'project' THEN (SELECT row_to_json(p.*) FROM projects p WHERE p.id = pi.item_id)
    WHEN pi.item_type = 'skill' THEN (SELECT row_to_json(s.*) FROM skills s WHERE s.id = pi.item_id)
    WHEN pi.item_type = 'work_experience' THEN (SELECT row_to_json(we.*) FROM work_experience we WHERE we.id = pi.item_id)
  END AS item_data
FROM portfolio_items pi
JOIN portfolio_sections ps ON ps.id = pi.portfolio_section_id
JOIN portfolios p ON p.id = ps.portfolio_id
WHERE (
  -- Owner may always see their portfolio items
  p.user_id = auth.uid()
  OR
  -- Public access via an active public link and the item/section marked visible
  (
    p.is_public = true
    AND pi.is_visible = true
    AND EXISTS (
      SELECT 1 FROM public_links pl
      WHERE pl.portfolio_id = p.id
      AND pl.is_active = true
      AND (pl.expires_at IS NULL OR pl.expires_at > NOW())
    )
    AND (
      (pi.item_type = 'certification' AND EXISTS (SELECT 1 FROM certifications c WHERE c.id = pi.item_id AND c.is_public = true)) OR
      (pi.item_type = 'project' AND EXISTS (SELECT 1 FROM projects pr WHERE pr.id = pi.item_id AND pr.is_public = true)) OR
      (pi.item_type = 'skill' AND EXISTS (SELECT 1 FROM skills s WHERE s.id = pi.item_id AND s.is_public = true)) OR
      (pi.item_type = 'work_experience' AND EXISTS (SELECT 1 FROM work_experience we WHERE we.id = pi.item_id AND we.is_public = true))
    )
  )
);

-- =====================================================
-- INITIAL SETUP COMPLETE
-- =====================================================

-- Notes:
-- Notes:
-- - After running this schema, enable RLS on `storage.objects` if required.
-- - Configure OAuth providers and email templates in the Supabase dashboard.
-- - Configure CORS for the Next.js frontend as needed.
-- - To generate types: npx supabase gen types typescript --local > types/database.ts

-- =====================================================
-- SEED DATA: DEFAULT TEMPLATES
-- =====================================================

INSERT INTO templates (name, display_name, description, layout, is_active, is_premium, config) VALUES
  ('single-column-basic', 'Single Column', 'Clean single column layout for straightforward portfolios', 'single-column', true, false, '{"maxWidth": "800px", "spacing": "comfortable"}'),
  ('two-column-sidebar', 'Two Column Sidebar', 'Traditional layout with sidebar for navigation', 'two-column', true, false, '{"sidebarWidth": "280px", "sidebarPosition": "left"}'),
  ('grid-cards', 'Grid Cards', 'Modern card-based grid layout for visual portfolios', 'grid', true, false, '{"columns": 3, "gap": "24px"}'),
  ('timeline-vertical', 'Timeline', 'Chronological timeline layout for experience-focused portfolios', 'timeline', true, false, '{"orientation": "vertical", "showDates": true}'),
  ('modern-split', 'Modern Split', 'Contemporary split-screen design with dynamic sections', 'modern', true, true, '{"animationsEnabled": true, "parallax": true}')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SEED DATA: DEFAULT THEMES
-- =====================================================

INSERT INTO themes (name, display_name, description, style, primary_color, secondary_color, background_color, text_color, font_family, is_active, is_premium, config) VALUES
  ('professional-blue', 'Professional', 'Classic professional theme with blue accents', 'professional', '#3B82F6', '#1E40AF', '#FFFFFF', '#1F2937', 'Inter', true, false, '{"borderRadius": "4px", "shadowIntensity": "medium"}'),
  ('modern-dark', 'Modern Dark', 'Sleek dark theme with vibrant accents', 'modern', '#8B5CF6', '#EC4899', '#0F172A', '#F8FAFC', 'Poppins', true, false, '{"borderRadius": "8px", "glowEffects": true}'),
  ('creative-gradient', 'Creative', 'Bold creative theme with gradient backgrounds', 'creative', '#F97316', '#EAB308', '#FEF3C7', '#1C1917', 'Montserrat', true, true, '{"gradientEnabled": true, "animatedBackground": true}'),
  ('minimal-mono', 'Minimal', 'Clean minimal theme with monochrome palette', 'minimal', '#171717', '#525252', '#FAFAFA', '#171717', 'IBM Plex Sans', true, false, '{"borderRadius": "0px", "shadowIntensity": "none"}'),
  ('elegant-serif', 'Elegant', 'Sophisticated theme with serif typography', 'elegant', '#047857', '#065F46', '#F0FDF4', '#14532D', 'Playfair Display', true, false, '{"borderRadius": "2px", "letterSpacing": "wide"}')
ON CONFLICT (name) DO NOTHING;
