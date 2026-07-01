-- Add Rescheduled appointment status
-- Run in Supabase SQL Editor if reschedule fails with status constraint violation

ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE appointments
ADD CONSTRAINT appointments_status_check
CHECK (status IN ('Confirmed', 'Rescheduled', 'Completed', 'Missed'));
