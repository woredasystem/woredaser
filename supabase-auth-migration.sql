-- Authentication System Migration
-- Run this AFTER running supabase-schema.sql
-- This adds missing tables, fields, functions, and RLS policies for authentication

-- ============================================================================
-- Table 4: portal_users (Portal User Management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS portal_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  full_name TEXT NOT NULL,
  department TEXT NOT NULL,
  department_am TEXT,
  role_key TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for portal_users
CREATE INDEX IF NOT EXISTS idx_portal_users_email ON portal_users(email);
CREATE INDEX IF NOT EXISTS idx_portal_users_user_id ON portal_users(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_users_role_key ON portal_users(role_key);
CREATE INDEX IF NOT EXISTS idx_portal_users_department ON portal_users(department);

-- ============================================================================
-- Add Missing Fields to Existing Tables
-- ============================================================================

-- Add assigned_department to complaints table
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS assigned_department TEXT;

-- Add assigned_department to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS assigned_department TEXT;

-- Add unique_code to appointments if it doesn't exist (for tracking)
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS unique_code TEXT;

-- Create index for assigned_department lookups
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_department ON complaints(assigned_department);
CREATE INDEX IF NOT EXISTS idx_appointments_assigned_department ON appointments(assigned_department);

-- ============================================================================
-- Function: check_portal_user_access()
-- Bypasses RLS to check portal user access without recursion
-- ============================================================================
CREATE OR REPLACE FUNCTION check_portal_user_access(check_department TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  portal_user_record RECORD;
BEGIN
  -- Get current authenticated user
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user exists in portal_users
  SELECT * INTO portal_user_record
  FROM portal_users
  WHERE user_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Admin has access to everything
  IF portal_user_record.is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- If checking specific department, verify match
  IF check_department IS NOT NULL THEN
    RETURN portal_user_record.department = check_department;
  END IF;
  
  -- Otherwise, user is authenticated portal user
  RETURN TRUE;
END;
$$;

-- ============================================================================
-- Row Level Security (RLS) for portal_users
-- ============================================================================
ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read portal_users for login" ON portal_users;
DROP POLICY IF EXISTS "Users can read own portal_user" ON portal_users;

-- Allow public read for login (needed for email lookup during login)
CREATE POLICY "Public can read portal_users for login" ON portal_users
  FOR SELECT USING (true);

-- Allow users to read their own record
CREATE POLICY "Users can read own portal_user" ON portal_users
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- Update RLS Policies for complaints
-- ============================================================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Public can view complaints" ON complaints;

-- Portal users can view complaints for their department (or all if admin)
CREATE POLICY "Portal users can view department complaints" ON complaints
  FOR SELECT USING (
    -- Public can still view (for follow-up by ticket number)
    true
    OR
    -- Portal users can view their department's complaints
    (auth.uid() IS NOT NULL AND check_portal_user_access(assigned_department))
  );

-- Portal users can update complaints for their department
CREATE POLICY "Portal users can update department complaints" ON complaints
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND check_portal_user_access(assigned_department)
  );

-- Portal users can insert complaints (for reassignment)
CREATE POLICY "Portal users can insert complaints" ON complaints
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND check_portal_user_access()
  );

-- ============================================================================
-- Update RLS Policies for appointments
-- ============================================================================

-- Portal users can view appointments for their department
CREATE POLICY "Portal users can view department appointments" ON appointments
  FOR SELECT USING (
    -- Public can still view (for follow-up)
    true
    OR
    -- Portal users can view their department's appointments
    (auth.uid() IS NOT NULL AND check_portal_user_access(assigned_department))
  );

-- Portal users can update appointments for their department
CREATE POLICY "Portal users can update department appointments" ON appointments
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND check_portal_user_access(assigned_department)
  );

-- Portal users are created by admin via the Admin Portal (no seed data).

-- ============================================================================
-- Grant Permissions
-- ============================================================================
-- Ensure authenticated users can access portal_users for login
GRANT SELECT ON portal_users TO anon, authenticated;
GRANT SELECT, UPDATE ON portal_users TO authenticated;

-- ============================================================================
-- Verification Queries (Run these to verify setup)
-- ============================================================================

-- Check portal_users table exists and has data
-- SELECT COUNT(*) as portal_user_count FROM portal_users;

-- Check if users are linked to auth.users
-- SELECT 
--   pu.email,
--   pu.department,
--   pu.role_key,
--   pu.is_admin,
--   CASE WHEN au.id IS NOT NULL THEN '✅ Linked' ELSE '❌ Not Linked' END as status
-- FROM portal_users pu
-- LEFT JOIN auth.users au ON pu.user_id = au.id;

-- Check function exists
-- SELECT proname FROM pg_proc WHERE proname = 'check_portal_user_access';

-- Check RLS policies
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;









