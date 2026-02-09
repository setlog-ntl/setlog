-- SetLog Initial Schema
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tech_stack JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_projects_user_id ON public.projects(user_id);

-- ============================================
-- SERVICES (system catalog)
-- ============================================
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('auth', 'database', 'deploy', 'email', 'payment', 'storage', 'monitoring', 'ai', 'other')),
  description TEXT,
  description_ko TEXT,
  icon_url TEXT,
  website_url TEXT,
  docs_url TEXT,
  pricing_info JSONB DEFAULT '{}',
  required_env_vars JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_slug ON public.services(slug);

-- ============================================
-- PROJECT_SERVICES (many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'connected', 'error')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, service_id)
);

CREATE INDEX idx_project_services_project ON public.project_services(project_id);

-- ============================================
-- CHECKLIST_ITEMS (per service)
-- ============================================
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_ko TEXT,
  description TEXT,
  description_ko TEXT,
  guide_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_checklist_items_service ON public.checklist_items(service_id);

-- ============================================
-- USER_CHECKLIST_PROGRESS
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_checklist_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_service_id UUID NOT NULL REFERENCES public.project_services(id) ON DELETE CASCADE,
  checklist_item_id UUID NOT NULL REFERENCES public.checklist_items(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(project_service_id, checklist_item_id)
);

CREATE INDEX idx_checklist_progress_ps ON public.user_checklist_progress(project_service_id);

-- ============================================
-- ENVIRONMENT_VARIABLES
-- ============================================
CREATE TABLE IF NOT EXISTS public.environment_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id),
  key_name TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'development' CHECK (environment IN ('development', 'staging', 'production')),
  is_secret BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_env_vars_project ON public.environment_variables(project_id);
CREATE INDEX idx_env_vars_project_env ON public.environment_variables(project_id, environment);

-- ============================================
-- PROJECT_TEMPLATES
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ko TEXT,
  description TEXT,
  description_ko TEXT,
  services JSONB NOT NULL DEFAULT '[]',
  tech_stack JSONB DEFAULT '{}',
  is_community BOOLEAN DEFAULT false,
  author_id UUID REFERENCES auth.users(id),
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Function to increment template downloads
CREATE OR REPLACE FUNCTION increment_template_downloads(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.project_templates
  SET downloads_count = downloads_count + 1
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_checklist_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environment_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Projects: users can CRUD their own projects
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Services: all authenticated users can read
CREATE POLICY "Authenticated users can view services" ON public.services
  FOR SELECT USING (auth.role() = 'authenticated');

-- Project Services: project owner can CRUD
CREATE POLICY "Project owners can view project services" ON public.project_services
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );
CREATE POLICY "Project owners can add services" ON public.project_services
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );
CREATE POLICY "Project owners can update services" ON public.project_services
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );
CREATE POLICY "Project owners can remove services" ON public.project_services
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );

-- Checklist Items: all authenticated users can read
CREATE POLICY "Authenticated users can view checklist items" ON public.checklist_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- User Checklist Progress: project owner can CRUD
CREATE POLICY "Project owners can view progress" ON public.user_checklist_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_services ps
      JOIN public.projects p ON p.id = ps.project_id
      WHERE ps.id = project_service_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Project owners can insert progress" ON public.user_checklist_progress
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_services ps
      JOIN public.projects p ON p.id = ps.project_id
      WHERE ps.id = project_service_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Project owners can update progress" ON public.user_checklist_progress
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_services ps
      JOIN public.projects p ON p.id = ps.project_id
      WHERE ps.id = project_service_id AND p.user_id = auth.uid()
    )
  );

-- Environment Variables: project owner can CRUD
CREATE POLICY "Project owners can view env vars" ON public.environment_variables
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );
CREATE POLICY "Project owners can create env vars" ON public.environment_variables
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );
CREATE POLICY "Project owners can update env vars" ON public.environment_variables
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );
CREATE POLICY "Project owners can delete env vars" ON public.environment_variables
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );

-- Project Templates: all authenticated users can read
CREATE POLICY "Authenticated users can view templates" ON public.project_templates
  FOR SELECT USING (auth.role() = 'authenticated');
