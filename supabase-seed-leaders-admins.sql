-- Seed 7 public leaders + 6 additional portal admins (7 total with existing admin@)
-- Auth users for new admins: run scripts/seed-leaders-and-admins.js or the DO block at bottom

INSERT INTO officials (
  full_name_am, full_name_en, title_am, title_en, role_key,
  image_url, bio_am, bio_en, bio_om, show_on_home
) VALUES
  ('ወ/ሮ ሀና መንግስት', 'Ms. Hana Mengistu', 'የወረዳ ምክር ቤት ስፒከር', 'Woreda Council Speaker', 'council_speaker',
   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=480&h=560&fit=crop',
   'የህዝብ ውክልናን በግልጽነት እና በተጠያቂነት ወክሎ ለማገልገል ቁርጠኛ ነኝ።',
   'Committed to representing citizens with transparency and accountability.',
   'Ummata bakka bu''uun ifa ta''een fi itti gaafatamummaadhaan tajaajiluuf.', false),
  ('አቶ ደሳለኝ አሰፋ', 'Mr. Desalegn Assefa', 'የንግድ ጽ/ቤት ሀላፊ', 'Trade Office Head', 'trade_head',
   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=480&h=560&fit=crop',
   'ንግድ ፈቃድ እና የንግድ አገልግሎቶችን በብቃት ለማስተዳደር።',
   'Overseeing trade licensing and business services for the woreda.',
   'Hayyama daldalaa fi tajaajila daldalaatiif.', false),
  ('ወ/ሮ ሰላማዊት ገብረ', 'Ms. Selamawit Gebre', 'የሲቪል ምዝገባ ሀላፊ', 'Civil Registration Head', 'civil_head',
   'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=480&h=560&fit=crop',
   'የልደት፣ የጋብቻ እና የሞት ምዝገባ አገልግሎቶችን ለማሻሻል።',
   'Improving birth, marriage, and death registration services.',
   'Tajaajila galmeessa dhalootaa, fuudhaa fi du''aa fooyyessuuf.', false),
  ('አቶ ብርሃኑ ተክለ', 'Mr. Birhanu Tekle', 'የስራና ክህሎት ሀላፊ', 'Labor & Skills Head', 'labor_head',
   'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=480&h=560&fit=crop',
   'የስራ ፈቃድ እና የክህሎት ስልጠና አገልግሎቶችን ለማስተዳደር።',
   'Managing work permits and vocational training programs.',
   'Hayyama hojii fi leenjii ogummaa bulchuuf.', false),
  ('አቶ አብርሃም ገብረ', 'Mr. Abraham Gebre', 'የዋና ሥራ አስፈፃሚ ጽ/ቤት ሀላፊ', 'Chief Executive Office Head', 'ceo_office_head',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&h=560&fit=crop',
   'የዋና ሥራ አስፈፃሚ ጽ/ቤት የዕለት ተዕለት ሥራዎችን ማስተባበር።',
   'Coordinating daily operations of the Chief Executive Office.',
   'Hojiiwwan guyyaa guyyaa waajjira hogganaa guddaa qindeessuuf.', false),
  ('ወ/ሮ ማርያም ደስታ', 'Ms. Mariam Desta', 'የፋይናንስ እና ገቢ ሀላፊ', 'Finance & Revenue Head', 'finance_head',
   'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=480&h=560&fit=crop',
   'የወረዳ ገቢ አሰባሰብ እና የፋይናንስ አስተዳደር ለማሻሻል።',
   'Strengthening woreda revenue collection and financial management.',
   'Walitti qabuu galii fi bulchiinsa faayinaansii fooyyessuuf.', false)
ON CONFLICT (role_key) DO UPDATE SET
  full_name_am = EXCLUDED.full_name_am,
  full_name_en = EXCLUDED.full_name_en,
  title_am = EXCLUDED.title_am,
  title_en = EXCLUDED.title_en,
  image_url = EXCLUDED.image_url,
  bio_am = EXCLUDED.bio_am,
  bio_en = EXCLUDED.bio_en,
  bio_om = EXCLUDED.bio_om,
  show_on_home = EXCLUDED.show_on_home;

INSERT INTO portal_users (email, username, full_name, department, department_am, role_key, is_admin) VALUES
  ('admin.ops@woreda.gov.et', 'admin_ops', 'Operations Administrator', 'Admin', 'አስተዳደር', 'admin', true),
  ('admin.content@woreda.gov.et', 'admin_content', 'Content Administrator', 'Admin', 'አስተዳደር', 'admin', true),
  ('admin.portal@woreda.gov.et', 'admin_portal', 'Portal Administrator', 'Admin', 'አስተዳደር', 'admin', true),
  ('admin.data@woreda.gov.et', 'admin_data', 'Data Administrator', 'Admin', 'አስተዳደር', 'admin', true),
  ('admin.support@woreda.gov.et', 'admin_support', 'Support Administrator', 'Admin', 'አስተዳደር', 'admin', true),
  ('admin.audit@woreda.gov.et', 'admin_audit', 'Audit Administrator', 'Admin', 'አስተዳደር', 'admin', true)
ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  department = EXCLUDED.department,
  department_am = EXCLUDED.department_am,
  role_key = EXCLUDED.role_key,
  is_admin = EXCLUDED.is_admin;

-- For auth users, prefer: npm run seed:leaders -- <SERVICE_ROLE_KEY>
