-- Homepage stats: population, blocks, services (singleton, admin-editable)
CREATE TABLE IF NOT EXISTS site_stats (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  population BIGINT NOT NULL DEFAULT 0,
  blocks INT NOT NULL DEFAULT 0,
  services_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_stats (id, population, blocks, services_count)
VALUES (1, 125000, 12, 58)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site_stats" ON site_stats
  FOR SELECT USING (true);

CREATE POLICY "Admins manage site_stats" ON site_stats
  FOR ALL USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  ) WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM portal_users WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  );

GRANT SELECT ON site_stats TO anon, authenticated;
GRANT ALL ON site_stats TO authenticated;
