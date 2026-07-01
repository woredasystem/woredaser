-- SMS notifications (TextBee) — run in Supabase SQL Editor
-- Requires: notify-sms edge function deployed + secrets set

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Preferred language for SMS (am | en | om)
ALTER TABLE complaints
ADD COLUMN IF NOT EXISTS preferred_lang TEXT DEFAULT 'am';

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS preferred_lang TEXT DEFAULT 'am';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'complaints_preferred_lang_check'
  ) THEN
    ALTER TABLE complaints ADD CONSTRAINT complaints_preferred_lang_check
      CHECK (preferred_lang IN ('am', 'en', 'om'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'appointments_preferred_lang_check'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_preferred_lang_check
      CHECK (preferred_lang IN ('am', 'en', 'om'));
  END IF;
END $$;

-- Ensure appointment phone is required for new bookings (skip if legacy nulls exist)
-- ALTER TABLE appointments ALTER COLUMN citizen_phone SET NOT NULL;

-- SMS delivery log
CREATE TABLE IF NOT EXISTS sms_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  event_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  error_message TEXT,
  provider_response JSONB
);

ALTER TABLE sms_log ENABLE ROW LEVEL SECURITY;

-- Only service role / admins should read logs (no public policies)

-- Webhook secret for trigger → edge function (must match SMS_WEBHOOK_SECRET env)
CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.sms_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  webhook_secret TEXT NOT NULL,
  functions_base_url TEXT NOT NULL,
  textbee_api_key TEXT,
  textbee_device_id TEXT,
  public_site_url TEXT DEFAULT 'https://woreda-portal.vercel.app'
);

INSERT INTO private.sms_settings (id, webhook_secret, functions_base_url)
VALUES (
  1,
  'woreda-portal-sms-wh-k9m2x7p4',
  'https://rbbyniuqdukfehbacgyo.supabase.co/functions/v1/notify-sms'
)
ON CONFLICT (id) DO UPDATE SET
  webhook_secret = EXCLUDED.webhook_secret,
  functions_base_url = EXCLUDED.functions_base_url;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
REVOKE ALL ON private.sms_settings FROM PUBLIC;

CREATE OR REPLACE FUNCTION private.queue_citizen_sms(
  p_event TEXT,
  p_table TEXT,
  p_record JSONB,
  p_old_record JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, extensions
AS $$
DECLARE
  v_secret TEXT;
  v_url TEXT;
  v_payload JSONB;
BEGIN
  SELECT webhook_secret, functions_base_url
  INTO v_secret, v_url
  FROM private.sms_settings
  WHERE id = 1;

  IF v_secret IS NULL OR v_url IS NULL THEN
    RETURN;
  END IF;

  v_payload := jsonb_build_object(
    'event', p_event,
    'table', p_table,
    'record', p_record,
    'old_record', p_old_record
  );

  PERFORM net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-sms-secret', v_secret
    ),
    body := v_payload
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_complaint_sms()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, extensions
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM private.queue_citizen_sms(
      'complaint_created',
      'complaints',
      to_jsonb(NEW),
      NULL
    );
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM private.queue_citizen_sms(
      'complaint_status_changed',
      'complaints',
      to_jsonb(NEW),
      to_jsonb(OLD)
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_appointment_sms()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, extensions
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM private.queue_citizen_sms(
      'appointment_created',
      'appointments',
      to_jsonb(NEW),
      NULL
    );
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM private.queue_citizen_sms(
      'appointment_status_changed',
      'appointments',
      to_jsonb(NEW),
      to_jsonb(OLD)
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.appointment_date IS DISTINCT FROM OLD.appointment_date THEN
    PERFORM private.queue_citizen_sms(
      'appointment_rescheduled',
      'appointments',
      to_jsonb(NEW),
      to_jsonb(OLD)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_complaint_sms ON complaints;
CREATE TRIGGER trg_complaint_sms
  AFTER INSERT OR UPDATE OF status ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_complaint_sms();

DROP TRIGGER IF EXISTS trg_appointment_sms ON appointments;
CREATE TRIGGER trg_appointment_sms
  AFTER INSERT OR UPDATE OF status, appointment_date ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_appointment_sms();

-- Edge function reads config when env secrets are unavailable
CREATE OR REPLACE FUNCTION public.get_sms_config_internal()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = private, public
AS $$
  SELECT jsonb_build_object(
    'webhook_secret', s.webhook_secret,
    'textbee_api_key', s.textbee_api_key,
    'textbee_device_id', s.textbee_device_id,
    'public_site_url', s.public_site_url
  )
  FROM private.sms_settings s
  WHERE s.id = 1;
$$;

REVOKE ALL ON FUNCTION public.get_sms_config_internal() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_sms_config_internal() TO service_role;
