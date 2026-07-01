-- Appointment reschedule / audit fields
-- Run in Supabase SQL Editor if reschedule returns 400

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS original_appointment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reschedule_note TEXT,
ADD COLUMN IF NOT EXISTS rescheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rescheduled_by TEXT,
ADD COLUMN IF NOT EXISTS update_history JSONB DEFAULT '[]'::jsonb;

-- Allow Rescheduled status
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE appointments
ADD CONSTRAINT appointments_status_check
CHECK (status IN ('Confirmed', 'Rescheduled', 'Completed', 'Missed'));
