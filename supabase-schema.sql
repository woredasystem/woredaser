-- Woreda Digital Portal Database Schema
-- Run this in your Supabase SQL Editor

-- Table 1: complaints (Grievance Tracking)
CREATE TABLE IF NOT EXISTS complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ticket_number TEXT UNIQUE NOT NULL,
  complainant_name TEXT NOT NULL,
  complainant_phone TEXT NOT NULL,
  target_official TEXT NOT NULL,
  department TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved', 'Escalated')),
  escalation_level INTEGER NOT NULL DEFAULT 1 CHECK (escalation_level BETWEEN 1 AND 4),
  resolution_note TEXT
);

-- Table 2: appointments (Booking System)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  citizen_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Rescheduled', 'Completed', 'Missed'))
);

-- Table 3: officials (Leadership Directory)
CREATE TABLE IF NOT EXISTS officials (
  id SERIAL PRIMARY KEY,
  full_name_am TEXT NOT NULL,
  full_name_en TEXT NOT NULL,
  title_am TEXT NOT NULL,
  title_en TEXT NOT NULL,
  role_key TEXT UNIQUE NOT NULL,
  image_url TEXT
);

-- Officials are managed by admin via the Admin Portal (no seed data).
-- Bootstrap: create the first admin in Supabase Auth, then insert one row in portal_users with is_admin = true.

-- Create function for 5-day escalation (to be called by cron job)
CREATE OR REPLACE FUNCTION escalate_complaints()
RETURNS void AS $$
BEGIN
  UPDATE complaints
  SET 
    escalation_level = escalation_level + 1,
    status = 'Escalated'
  WHERE 
    status != 'Resolved'
    AND created_at < NOW() - INTERVAL '5 days'
    AND escalation_level < 4;
END;
$$ LANGUAGE plpgsql;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- Enable Row Level Security (RLS) - adjust policies as needed
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE officials ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to officials
CREATE POLICY "Public can view officials" ON officials
  FOR SELECT USING (true);

-- Policy: Allow public to insert complaints
CREATE POLICY "Public can insert complaints" ON complaints
  FOR INSERT WITH CHECK (true);

-- Policy: Allow public to view their own complaints (by phone number)
-- Note: In production, you'd want proper authentication
CREATE POLICY "Public can view complaints" ON complaints
  FOR SELECT USING (true);

-- Policy: Allow public to insert appointments
CREATE POLICY "Public can insert appointments" ON appointments
  FOR INSERT WITH CHECK (true);

-- Policy: Allow public to view appointments
CREATE POLICY "Public can view appointments" ON appointments
  FOR SELECT USING (true);

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

-- Allow public read for login (needed for email lookup during login)
CREATE POLICY "Public can read portal_users for login" ON portal_users
  FOR SELECT USING (true);

-- Allow users to read their own record
CREATE POLICY "Users can read own portal_user" ON portal_users
  FOR SELECT USING (user_id = auth.uid());

-- Admins can manage portal users
CREATE POLICY "Admins can insert portal_users" ON portal_users
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update portal_users" ON portal_users
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can delete portal_users" ON portal_users
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admins can manage officials
CREATE POLICY "Admins can insert officials" ON officials
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update officials" ON officials
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can delete officials" ON officials
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  );

-- ============================================================================
-- Update RLS Policies for complaints
-- ============================================================================

-- Portal users can view complaints for their department (or all if admin)
-- Note: Public can still view for follow-up by ticket number
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
GRANT SELECT, INSERT, UPDATE, DELETE ON portal_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON officials TO authenticated;

