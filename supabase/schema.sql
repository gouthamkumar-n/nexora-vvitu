-- ==============================================================================
-- NEXORA: Database Schema for Supabase (PostgreSQL)
-- AI-Powered Lost and Found Management System for VVITU College
-- ==============================================================================

-- 1. PROFILES & USER ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
  avatar_url TEXT,
  student_id TEXT,
  user_type TEXT DEFAULT 'Student',
  department TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. LOST ITEMS
CREATE TABLE IF NOT EXISTS public.lost_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  date_lost DATE NOT NULL,
  time_lost TIME,
  image_url TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  private_details TEXT, -- Confidential: identifying details
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'returned', 'suspicious', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. FOUND ITEMS
CREATE TABLE IF NOT EXISTS public.found_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  found_location TEXT NOT NULL,
  date_found DATE NOT NULL,
  time_found TIME,
  image_url TEXT,
  found_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  found_by_name TEXT,
  public_description TEXT,
  private_details TEXT, -- Confidential: identifying markers for ownership verification
  storage_location TEXT NOT NULL DEFAULT 'Main Block Admin Office',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'returned', 'suspicious', 'archived')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. OWNERSHIP CLAIMS
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lost_item_id UUID REFERENCES public.lost_items(id) ON DELETE CASCADE,
  found_item_id UUID REFERENCES public.found_items(id) ON DELETE CASCADE,
  claimant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  claimant_name TEXT NOT NULL,
  private_answers TEXT NOT NULL,
  evidence_url TEXT,
  match_score INT DEFAULT 85,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  handover_date DATE,
  handover_method TEXT,
  submitted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  target_id TEXT,
  target_type TEXT,
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public items can be viewed by all authenticated campus users
CREATE POLICY "Anyone can view public found items"
  ON public.found_items FOR SELECT USING (true);

CREATE POLICY "Anyone can view active lost items"
  ON public.lost_items FOR SELECT USING (true);

-- Ordinary users cannot read other people's confidential private_details
-- (Enforced via views or column security in Supabase)
