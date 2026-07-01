-- Migration: Add new fields for Form 01 (Complaint Submission) and Form 02 (Complaint Response)
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- Add Form 01 (Complaint Submission) fields to complaints table
-- ============================================================================

-- Complainant personal information
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS complainant_age INTEGER,
ADD COLUMN IF NOT EXISTS complainant_gender TEXT,
ADD COLUMN IF NOT EXISTS submission_type TEXT CHECK (submission_type IN ('individual', 'group')),
ADD COLUMN IF NOT EXISTS group_member_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS group_members_info TEXT,
ADD COLUMN IF NOT EXISTS complainant_subcity TEXT,
ADD COLUMN IF NOT EXISTS complainant_woreda TEXT,
ADD COLUMN IF NOT EXISTS complainant_house_number TEXT,
ADD COLUMN IF NOT EXISTS complainant_email TEXT,
ADD COLUMN IF NOT EXISTS submission_institution TEXT,
ADD COLUMN IF NOT EXISTS previous_written_response TEXT,
ADD COLUMN IF NOT EXISTS complaint_main_content TEXT,
ADD COLUMN IF NOT EXISTS requested_solution TEXT,
ADD COLUMN IF NOT EXISTS complainant_signature TEXT,
ADD COLUMN IF NOT EXISTS assigned_to_role_key TEXT;

-- Office acknowledgment section (Form 01)
ALTER TABLE complaints
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS acknowledgment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS referred_department TEXT,
ADD COLUMN IF NOT EXISTS referred_by_employee TEXT,
ADD COLUMN IF NOT EXISTS referred_by_signature TEXT,
ADD COLUMN IF NOT EXISTS referred_date TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- Add Form 02 (Complaint Response) fields to complaints table
-- ============================================================================

-- Investigation and response fields
ALTER TABLE complaints
ADD COLUMN IF NOT EXISTS complaint_submission_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS complaint_submission_institution TEXT,
ADD COLUMN IF NOT EXISTS appeal_content TEXT,
ADD COLUMN IF NOT EXISTS properly_investigated BOOLEAN,
ADD COLUMN IF NOT EXISTS investigation_failure_reason TEXT,
ADD COLUMN IF NOT EXISTS investigation_findings TEXT,
ADD COLUMN IF NOT EXISTS summary_response TEXT CHECK (summary_response IN ('correct', 'incorrect')),
ADD COLUMN IF NOT EXISTS action_to_be_taken TEXT,
ADD COLUMN IF NOT EXISTS investigated_by_expert TEXT,
ADD COLUMN IF NOT EXISTS expert_signature TEXT,
ADD COLUMN IF NOT EXISTS expert_investigation_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS final_decision_by TEXT,
ADD COLUMN IF NOT EXISTS final_decision_signature TEXT,
ADD COLUMN IF NOT EXISTS final_decision_date TIMESTAMP WITH TIME ZONE;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_complaints_submission_type ON complaints(submission_type);
CREATE INDEX IF NOT EXISTS idx_complaints_properly_investigated ON complaints(properly_investigated);
CREATE INDEX IF NOT EXISTS idx_complaints_summary_response ON complaints(summary_response);
CREATE INDEX IF NOT EXISTS idx_complaints_submission_date ON complaints(complaint_submission_date);

