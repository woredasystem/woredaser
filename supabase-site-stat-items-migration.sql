-- Dynamic homepage stat metrics (admin-managed, multilingual labels)
CREATE TABLE IF NOT EXISTS site_stat_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_am TEXT NOT NULL,
  label_en TEXT,
  label_om TEXT,
  value BIGINT NOT NULL DEFAULT 0,
  suffix TEXT DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'chart',
  theme TEXT NOT NULL DEFAULT 'blue',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_stat_items_sort ON site_stat_items (sort_order);

ALTER TABLE site_stat_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site_stat_items" ON site_stat_items;
CREATE POLICY "Public read site_stat_items" ON site_stat_items
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins manage site_stat_items" ON site_stat_items;
CREATE POLICY "Admins manage site_stat_items" ON site_stat_items
  FOR ALL USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  ) WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  );

GRANT SELECT ON site_stat_items TO anon, authenticated;
GRANT ALL ON site_stat_items TO authenticated;

-- Seed from legacy singleton if table is empty
INSERT INTO site_stat_items (label_am, label_en, label_om, value, suffix, icon, theme, sort_order)
SELECT 'ህዝብ', 'Population', 'Ummata', COALESCE(s.population, 128450), '+', 'users', 'blue', 0
FROM site_stats s WHERE s.id = 1
  AND NOT EXISTS (SELECT 1 FROM site_stat_items LIMIT 1);

INSERT INTO site_stat_items (label_am, label_en, label_om, value, suffix, icon, theme, sort_order)
SELECT 'ብሎኮች', 'Blocks', 'Blookii', COALESCE(s.blocks, 14), '', 'building', 'indigo', 1
FROM site_stats s WHERE s.id = 1
  AND (SELECT COUNT(*) FROM site_stat_items) = 1;

INSERT INTO site_stat_items (label_am, label_en, label_om, value, suffix, icon, theme, sort_order)
SELECT 'አገልግሎቶች', 'Services', 'Tajaajiloota', COALESCE(s.services_count, 58), '+', 'briefcase', 'emerald', 2
FROM site_stats s WHERE s.id = 1
  AND (SELECT COUNT(*) FROM site_stat_items) = 2;
