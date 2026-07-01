-- One-time fix: create missing Supabase Auth users for portal logins
-- Run in Supabase SQL Editor if department logins return "invalid credentials"
-- Passwords match CREDENTIALS.md / scripts/create-portal-users.js

DO $$
DECLARE
  u RECORD;
  new_id uuid;
BEGIN
  FOR u IN
    SELECT * FROM (VALUES
      ('trade@woreda.gov.et', 'Trade2025!'),
      ('civil@woreda.gov.et', 'Civil2025!'),
      ('labor@woreda.gov.et', 'Labor2025!'),
      ('ceo@woreda.gov.et', 'CEO2025!'),
      ('chief.executive@woreda.gov.et', 'Chief2025!'),
      ('council.speaker@woreda.gov.et', 'Council2025!')
    ) AS t(email, pwd)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = lower(u.email)) THEN
      new_id := gen_random_uuid();

      INSERT INTO auth.users (
        instance_id, id, aud, role, email,
        encrypted_password, email_confirmed_at,
        confirmation_token, recovery_token, email_change, email_change_token_new,
        created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_id,
        'authenticated',
        'authenticated',
        u.email,
        crypt(u.pwd, gen_salt('bf')),
        now(),
        '', '', '', '',
        now(),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb
      );

      INSERT INTO auth.identities (
        id, user_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at, provider_id
      ) VALUES (
        gen_random_uuid(),
        new_id,
        jsonb_build_object(
          'sub', new_id::text,
          'email', u.email,
          'email_verified', true,
          'phone_verified', false
        ),
        'email',
        now(),
        now(),
        now(),
        new_id::text
      );

      UPDATE portal_users SET user_id = new_id WHERE lower(email) = lower(u.email);
    ELSE
      UPDATE portal_users pu
      SET user_id = au.id
      FROM auth.users au
      WHERE lower(pu.email) = lower(u.email)
        AND lower(au.email) = lower(u.email)
        AND pu.user_id IS NULL;
    END IF;
  END LOOP;
END $$;

-- Fix NULL token columns (required by Supabase Auth API)
UPDATE auth.users SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, '')
WHERE confirmation_token IS NULL
   OR recovery_token IS NULL
   OR email_change IS NULL
   OR email_change_token_new IS NULL;
