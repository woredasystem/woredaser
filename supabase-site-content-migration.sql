-- Site content: mission, vision, values, about + community projects
-- Run after supabase-admin-content-migration.sql

CREATE TABLE IF NOT EXISTS site_content_sections (
  id SERIAL PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  title_am TEXT NOT NULL DEFAULT '',
  title_en TEXT NOT NULL DEFAULT '',
  title_om TEXT,
  body_am TEXT NOT NULL DEFAULT '',
  body_en TEXT NOT NULL DEFAULT '',
  body_om TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title_am TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_om TEXT,
  description_am TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  description_om TEXT,
  cover_image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_site_content_sort ON site_content_sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects(sort_order, is_active);

INSERT INTO site_content_sections (section_key, title_am, title_en, title_om, body_am, body_en, body_om, sort_order)
VALUES
  ('mission', 'ተልዕኮ', 'Mission', 'Ergama', 'የወረዳችን ተልዕኮ ህዝቡን በቅርብ እና በታማኝ አገልግሎት ማገልገል ነው።', 'Our mission is to serve citizens with accessible and accountable public service.', 'Ergamni keenya tajaajila ummataaf dhiyaatuu fi amanamaa kennuu dha.', 1),
  ('vision', 'ራዕይ', 'Vision', 'Mul''ata', 'ዘመናዊ፣ ዲጂታል እና ለህዝብ ተገቢ የሆነ ወረዳ መፍጠር።', 'A modern, digital, and citizen-centered woreda administration.', 'Bulchiinsa woredaa ammayyaa, dijitaalaa fi ummataaf mijataa uumuuf.', 2),
  ('values', 'እሴቶች', 'Core Values', 'Gatiilee', 'ግልጽነት፣ ተጠያቂነት፣ እኩልነት እና ተሳትፎ።', 'Transparency, accountability, equity, and public participation.', 'Iftummaa, itti gaafatamummaa, walqixxummaa fi hirmaannaa uummataa.', 3)
ON CONFLICT (section_key) DO NOTHING;

ALTER TABLE site_content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site_content_sections" ON site_content_sections
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins manage site_content_sections" ON site_content_sections
  FOR ALL USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  ) WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Public read active projects" ON projects
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins manage projects" ON projects
  FOR ALL USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  ) WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  );

GRANT SELECT ON site_content_sections, projects TO anon, authenticated;
GRANT ALL ON site_content_sections, projects TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-photos',
  'project-photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public read project photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-photos');

CREATE POLICY "Admins upload project photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-photos'
    AND auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins update project photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project-photos'
    AND auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins delete project photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project-photos'
    AND auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE)
  );
