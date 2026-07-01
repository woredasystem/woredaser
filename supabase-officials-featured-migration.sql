-- Featured leader on homepage (show_on_home flag + sample chief executive)
ALTER TABLE officials ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_officials_show_on_home ON officials(show_on_home) WHERE show_on_home = TRUE;

INSERT INTO officials (
  full_name_am,
  full_name_en,
  title_am,
  title_en,
  role_key,
  image_url,
  bio_am,
  bio_en,
  bio_om,
  show_on_home
)
VALUES (
  'አቶ ተመስገን በላይ',
  'Mr. Temesgen Belachew',
  'ዋና ሥራ አስፈፃሚ',
  'Chief Executive',
  'ceo',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=480&h=560&fit=crop',
  'የወረዳችን ተልዕኮ ህዝቡን በቅርብ እና በታማኝ አገልግሎት ማገልገል ነው። በዚህ የዲጂታል ፖርታል በኩል፣ ነዋሪዎች አገልግሎቶችን በቀላሉ፣ በፍጥነት እና በብቃት ማግኘት ይችላሉ።',
  'Our mission is to serve citizens with accessible and accountable public service. Through this digital portal, residents can access services easily, quickly, and efficiently.',
  'Ergamni keenya tajaajila ummataaf dhiyaatuu fi amanamaa kennuu dha. Karaa paanelii dijitaalaa kanaan tajaajila salphaatti argachuu danda''u.',
  TRUE
)
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
