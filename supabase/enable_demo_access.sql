-- ==============================================================================
-- NEXORA: Enable Live Demo Read/Write & Relax Foreign Keys for Demo Accounts
-- Run this in Supabase SQL Editor after running schema.sql
-- ==============================================================================

-- 1. Drop strict auth.users foreign keys so demo accounts ('u1', 'admin1', etc.) work alongside real UUIDs
ALTER TABLE public.claims DROP CONSTRAINT IF EXISTS claims_lost_item_id_fkey;
ALTER TABLE public.claims DROP CONSTRAINT IF EXISTS claims_found_item_id_fkey;
ALTER TABLE public.claims DROP CONSTRAINT IF EXISTS claims_claimant_id_fkey;
ALTER TABLE public.claims DROP CONSTRAINT IF EXISTS claims_verified_by_fkey;
ALTER TABLE public.lost_items DROP CONSTRAINT IF EXISTS lost_items_user_id_fkey;
ALTER TABLE public.found_items DROP CONSTRAINT IF EXISTS found_items_found_by_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Allow TEXT IDs so both human-readable demo IDs ('lost1', 'found1') and UUIDs work seamlessly
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE public.lost_items ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE public.lost_items ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE public.found_items ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE public.found_items ALTER COLUMN found_by TYPE TEXT USING found_by::TEXT;
ALTER TABLE public.claims ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE public.claims ALTER COLUMN lost_item_id TYPE TEXT USING lost_item_id::TEXT;
ALTER TABLE public.claims ALTER COLUMN found_item_id TYPE TEXT USING found_item_id::TEXT;
ALTER TABLE public.claims ALTER COLUMN claimant_id TYPE TEXT USING claimant_id::TEXT;
ALTER TABLE public.claims ALTER COLUMN verified_by TYPE TEXT USING verified_by::TEXT;
ALTER TABLE public.notifications ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE public.notifications ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE public.audit_logs ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE public.audit_logs ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 3. Enable full CRUD policies for the frontend demo
DROP POLICY IF EXISTS "Public full access lost_items" ON public.lost_items;
CREATE POLICY "Public full access lost_items" ON public.lost_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access found_items" ON public.found_items;
CREATE POLICY "Public full access found_items" ON public.found_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access claims" ON public.claims;
CREATE POLICY "Public full access claims" ON public.claims FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access notifications" ON public.notifications;
CREATE POLICY "Public full access notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access audit_logs" ON public.audit_logs;
CREATE POLICY "Public full access audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access profiles" ON public.profiles;
CREATE POLICY "Public full access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
