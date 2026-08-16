-- ============================================================
-- qret.et · Local Remix Mobile Banking Directory
-- Row-Level Security (RLS) + Private Storage Bucket setup
--
-- Apply in the Supabase SQL editor (Dashboard → SQL Editor).
-- The Node server keeps using SUPABASE_ANON_KEY; all data is
-- unreachable without these policies because Public access is
-- revoked and only service_role / authenticated app users pass.
-- ============================================================

-- 1) menu_items: strictly owner-scoped
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- 1a) Block every default role (public reads/writes)
DROP POLICY IF EXISTS "menu_items_public_read" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_public_write" ON public.menu_items;
REVOKE ALL ON public.menu_items FROM anon, authenticated;

-- 1b) Server-side writes (runs with the service-role key from the Node backend)
CREATE POLICY "menu_items_service_role_all"
ON public.menu_items
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 1c) OPTIONAL: direct client access via Supabase Auth — merchant owns rows only.
--     Enable only if the frontend ever signs users in with supabase.auth.
--     merchant_id must equal the Supabase Auth uid of the merchant.
-- CREATE POLICY "menu_items_owner_select"
--   ON public.menu_items FOR SELECT TO authenticated
--   USING (merchant_id = auth.uid()::text);
-- CREATE POLICY "menu_items_owner_insert"
--   ON public.menu_items FOR INSERT TO authenticated
--   WITH CHECK (merchant_id = auth.uid()::text);
-- CREATE POLICY "menu_items_owner_update"
--   ON public.menu_items FOR UPDATE TO authenticated
--   USING (merchant_id = auth.uid()::text)
--   WITH CHECK (merchant_id = auth.uid()::text);

-- 2) Private storage: scanned receipts, identity docs, merchant files
--    Never expose via public bucket URLs; access only with short-lived signed URLs.
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts-private', 'receipts-private', false)
ON CONFLICT (id) DO NOTHING;

-- 2a) Only the backend (service_role) can read/write the private bucket
DROP POLICY IF EXISTS "receipts_private_service_all" ON storage.objects;
CREATE POLICY "receipts_private_service_all"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'receipts-private');

REVOKE ALL ON storage.objects FROM anon, authenticated;

-- 3) Backend usage (Node / server.ts) — signed URLs only:
--
--   const { data } = await supabase.storage
--     .from("receipts-private")
--     .createSignedUrl(filePath, 60 * 15); // 15 min expiry
--
--   Never: supabase.storage.from(...).getPublicUrl(...) for private files.
--   The app currently stores receipt images inline (db.json, base64);
--   when migrating to cloud storage, upload them here and persist only
--   the signed URL + path.

-- 4) Recommended guard: full audit of every auth login
-- CREATE TABLE IF NOT EXISTS public.audit_logs (...);