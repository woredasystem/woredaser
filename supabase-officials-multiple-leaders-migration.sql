-- Allow multiple homepage leaders (not limited to one per role_key)
ALTER TABLE officials DROP CONSTRAINT IF EXISTS officials_role_key_key;
CREATE INDEX IF NOT EXISTS idx_officials_role_key ON officials(role_key);
