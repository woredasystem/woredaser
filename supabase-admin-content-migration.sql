-- Admin-managed catalog: departments, services, appointment settings, official bios, photo storage
-- Run after supabase-schema.sql on each project

-- Officials: per-person bios
ALTER TABLE officials ADD COLUMN IF NOT EXISTS bio_am TEXT;
ALTER TABLE officials ADD COLUMN IF NOT EXISTS bio_en TEXT;
ALTER TABLE officials ADD COLUMN IF NOT EXISTS bio_om TEXT;

-- Departments (replaces portalRoles.js)
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  role_key TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  department_am TEXT NOT NULL,
  department_om TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_departments_sort ON departments(sort_order);

-- Service sectors
CREATE TABLE IF NOT EXISTS service_sectors (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sector_key TEXT UNIQUE NOT NULL,
  name_am TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_om TEXT,
  department_role_key TEXT,
  sort_order INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_service_sectors_sort ON service_sectors(sort_order);

-- Service items
CREATE TABLE IF NOT EXISTS service_items (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sector_id INT NOT NULL REFERENCES service_sectors(id) ON DELETE CASCADE,
  name_am TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_om TEXT,
  requirements_am TEXT,
  requirements_en TEXT,
  requirements_om TEXT,
  fee NUMERIC,
  standard_time TEXT,
  payment_method_am TEXT,
  payment_method_en TEXT,
  service_group_am TEXT,
  service_group_en TEXT,
  sort_order INT DEFAULT 0,
  is_bookable BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_service_items_sector ON service_items(sector_id, sort_order);

-- Appointment booking rules (singleton)
CREATE TABLE IF NOT EXISTS appointment_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  start_hour INT NOT NULL DEFAULT 3,
  end_hour INT NOT NULL DEFAULT 11,
  slot_minutes INT NOT NULL DEFAULT 15,
  bookable_sector_keys TEXT[] NOT NULL DEFAULT ARRAY['civilRegistration', 'tradeOffice', 'laborSkills']
);

INSERT INTO appointment_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Public read service_sectors" ON service_sectors FOR SELECT USING (true);
CREATE POLICY "Public read service_items" ON service_items FOR SELECT USING (true);
CREATE POLICY "Public read appointment_settings" ON appointment_settings FOR SELECT USING (true);

CREATE POLICY "Admins manage departments" ON departments FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
  )
) WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
  )
);

CREATE POLICY "Admins manage service_sectors" ON service_sectors FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
  )
) WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
  )
);

CREATE POLICY "Admins manage service_items" ON service_items FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
  )
) WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
  )
);

CREATE POLICY "Admins manage appointment_settings" ON appointment_settings FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
  )
) WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
  )
);

GRANT SELECT ON departments, service_sectors, service_items, appointment_settings TO anon, authenticated;
GRANT ALL ON departments, service_sectors, service_items, appointment_settings TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Storage bucket for official photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'official-photos',
  'official-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public read official photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'official-photos');

CREATE POLICY "Admins upload official photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'official-photos'
    AND auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins update official photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'official-photos'
    AND auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins delete official photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'official-photos'
    AND auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE)
  );
