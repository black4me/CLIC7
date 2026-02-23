-- SUPABASE STORAGE BUCKET SETUP: receipts
-- Execute in Supabase SQL Editor or via psql
-- Target: Production Database (tcwtqkklmhlucoirnogq.supabase.co)

-- ============================================================
-- STEP 1: CREATE STORAGE BUCKET
-- ============================================================

-- Note: Buckets are created via Supabase Dashboard or Storage API
-- SQL Alternative (if using storage schema):
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'receipts',
    'receipts',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- ============================================================
-- STEP 2: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on the bucket
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to INSERT receipts
CREATE POLICY "Allow authenticated users to upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'receipts' AND
    (storage.foldername(name))[1] = 'receipts'
);

-- Policy: Allow admin/staff to SELECT all receipts
CREATE POLICY "Allow admin and staff to view receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'receipts' AND
    EXISTS (
        SELECT 1 FROM public.staff
        WHERE staff.email = auth.email()
        AND staff.role IN ('owner', 'admin', 'staff')
        AND staff.is_active = true
    )
);

-- Policy: Allow authenticated users to SELECT their own receipts
CREATE POLICY "Allow users to view their own receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'receipts' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow admin to DELETE receipts
CREATE POLICY "Allow admin to delete receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'receipts' AND
    EXISTS (
        SELECT 1 FROM public.staff
        WHERE staff.email = auth.email()
        AND staff.role IN ('owner', 'admin')
        AND staff.is_active = true
    )
);

-- ============================================================
-- STEP 3: VERIFICATION QUERIES
-- ============================================================

-- Verify bucket exists
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'receipts';

-- Verify RLS policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';

-- ============================================================
-- PUBLIC URL FORMAT
-- ============================================================
-- https://tcwtqkklmhlucoirnogq.supabase.co/storage/v1/object/public/receipts/{filename}

-- TEST OBJECT URL (after uploading a file):
-- https://tcwtqkklmhlmhlucoirnogq.supabase.co/storage/v1/object/public/receipts/test-receipt.jpg
