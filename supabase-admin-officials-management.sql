-- Admin management for officials and portal_users
-- Run on existing projects after initial schema

-- Officials admin policies
DROP POLICY IF EXISTS "Admins can insert officials" ON officials;
DROP POLICY IF EXISTS "Admins can update officials" ON officials;
DROP POLICY IF EXISTS "Admins can delete officials" ON officials;

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

-- Portal users admin policies
DROP POLICY IF EXISTS "Admins can insert portal_users" ON portal_users;
DROP POLICY IF EXISTS "Admins can update portal_users" ON portal_users;
DROP POLICY IF EXISTS "Admins can delete portal_users" ON portal_users;

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

GRANT SELECT, INSERT, UPDATE, DELETE ON officials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON portal_users TO authenticated;
