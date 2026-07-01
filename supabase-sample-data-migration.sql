-- Sample demo data (excludes services, officials, departments/offices)
-- Safe to re-run: clears sample rows tagged by ticket prefix GRV-2026-S

ALTER TABLE complaints ADD COLUMN IF NOT EXISTS unique_code TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS citizen_phone TEXT;

CREATE INDEX IF NOT EXISTS idx_complaints_unique_code ON complaints(unique_code);
CREATE INDEX IF NOT EXISTS idx_appointments_unique_code ON appointments(unique_code);

INSERT INTO site_stats (id, population, blocks, services_count)
VALUES (1, 128450, 14, 58)
ON CONFLICT (id) DO UPDATE SET
  population = EXCLUDED.population,
  blocks = EXCLUDED.blocks,
  services_count = EXCLUDED.services_count,
  updated_at = NOW();

UPDATE site_content_sections SET
  body_am = 'የወረዳችን ተልዕኮ ህዝቡን በቅርብ፣ በግልጽ እና በታማኝ ዲጂታል አገልግሎት ማገልገል ነው።',
  body_en = 'Our mission is to deliver accessible, transparent, and accountable digital public service to every resident.',
  updated_at = NOW()
WHERE section_key = 'mission';

UPDATE site_content_sections SET
  body_am = 'ዘመናዊ፣ ዲጂታል እና ለህዝብ ተገቢ የሆነ ወረዳ መፍጠር — የአገልግሎት ሁሉ በአንድ ቦታ።',
  body_en = 'A modern, digital, citizen-centered woreda where every service is within reach.',
  updated_at = NOW()
WHERE section_key = 'vision';

UPDATE site_content_sections SET
  body_am = 'ግልጽነት · ተጠያቂነት · እኩልነት · ተሳትፎ · ለአካባቢ ጥበቃ',
  body_en = 'Transparency · Accountability · Equity · Participation · Environmental care',
  updated_at = NOW()
WHERE section_key = 'values';

INSERT INTO projects (title_am, title_en, title_om, description_am, description_en, sort_order, is_active)
SELECT v.title_am, v.title_en, v.title_om, v.description_am, v.description_en, v.sort_order, true
FROM (VALUES
  ('የወጣቶች ክህሎት ማዕከል', 'Youth Skills Center', 'Giddugala Dandeettii Dargaggootaa',
   'ለወጣቶች የኮምፒውተር እና የክህሎት ስልጠና ማዕከል በመገንባት ላይ።', 'Computer and vocational training hub for youth.', 4),
  ('የጥበቃ ማሻሻያ', 'Sanitation Upgrade', 'Fooyya''iinsa Qulqullina',
   'በዋና መንገዶች ላይ የጥበቃ መሳሪያዎች እና የአረንጓዴ ቦታ መስፋት።', 'Public sanitation and green-space expansion along main roads.', 5)
) AS v(title_am, title_en, title_om, description_am, description_en, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.title_am = v.title_am);

DELETE FROM complaints WHERE ticket_number LIKE 'GRV-2026-S%';
DELETE FROM appointments WHERE unique_code IN (
  'TUVW8901','XYAB2345','ZCDE6789','FGHK0123','IJLM4567','NOPR8901','QRSU2345',
  'TVWX6789','YZAC0123','BDEF4567','GHJK8901','LMNP2345','QRST6789','UVWX0123',
  'YZAB4567','CDEF8901','GHIJ2345','KLMN6789','OPQT0123','RSTV4567'
);

INSERT INTO complaints (
  ticket_number, unique_code, complainant_name, complainant_phone,
  target_official, department, assigned_department, details,
  status, escalation_level, resolution_note, created_at
) VALUES
('GRV-2026-S001','ABCD1234','አበበ ከበደ','0910112233','አቶ ተመስገን በላይ','Civil Registration','Civil Registration','የልደት ምዝገባ ሂደት ረጅም እንደሆነ ተገልጾልኝ።','Pending',1,NULL,NOW()-INTERVAL '2 days'),
('GRV-2026-S002','EFGH5678','ደረጀ ሙሉጌታ','0911223344','የንግድ ጽ/ቤት ሀላፊ','Trade Office','Trade Office','የንግድ ፈቃድ ማዘጋጀት ተዘግይቷል።','Pending',1,NULL,NOW()-INTERVAL '3 days'),
('GRV-2026-S003','IJKL9012','ሀና አማረ','0912334455','የሲቪል ምዝገባ ሀላፊ','Labor & Skills','Labor & Skills','በክፍል ውስጥ አገልግሎት ለማግኘት ተደጋጋሚ ጉዞ አድርጌያለሁ።','Pending',1,NULL,NOW()-INTERVAL '4 days'),
('GRV-2026-S004','MNOP3456','ገብረ ሥላሴ','0913445566','የስራና ክህሎት ሀላፊ','Chief Executive Office','Chief Executive Office','የሰራተኞች አክብሮት ጉዳይ ተጠቅሶልኝ።','Pending',1,NULL,NOW()-INTERVAL '5 days'),
('GRV-2026-S005','QRST7890','ሰናይት ተስፋዬ','0914556677','አቶ ተመስገን በላይ','Civil Registration','Civil Registration','የአገልግሎት ሰዓት መረጃ በድረ-ገጽ ላይ የተሳሳተ ነው።','Pending',1,NULL,NOW()-INTERVAL '6 days'),
('GRV-2026-S006','UVWX2345','ብርሃኑ ወልደ','0915667788','የንግድ ጽ/ቤት ሀላፊ','Trade Office','Trade Office','የጉዲፍቻ ማረጋገጫ ሰነድ ተዘግይቷል።','Pending',1,NULL,NOW()-INTERVAL '7 days'),
('GRV-2026-S007','YZAB6789','ሚሊዮን አሰፋ','0916778899','የሲቪል ምዝገባ ሀላፊ','Labor & Skills','Labor & Skills','የስራ ፈቃድ ማዘጋጀት ሂደት ግልጽ አይደለም።','Pending',1,NULL,NOW()-INTERVAL '8 days'),
('GRV-2026-S008','CDEF0123','ሳራ ተክለ','0917889900','የስራና ክህሎት ሀላፊ','Chief Executive Office','Chief Executive Office','በቢሮ ውስጥ ያለው ወረቀት ስራ ተጨማሪ ጊዜ ይዞኛል።','Pending',1,NULL,NOW()-INTERVAL '9 days'),
('GRV-2026-S009','GHIJ4567','ዮሴፍ አሊ','0918990011','አቶ ተመስገን በላይ','Civil Registration','Civil Registration','የልደት ምዝገባ ሂደት ረጅም እንደሆነ ተገልጾልኝ።','In Progress',1,NULL,NOW()-INTERVAL '10 days'),
('GRV-2026-S010','KLMN8901','ማርያም ገብረ','0919001122','የንግድ ጽ/ቤት ሀላፊ','Trade Office','Trade Office','የንግድ ፈቃድ ማዘጋጀት ተዘግይቷል።','In Progress',1,NULL,NOW()-INTERVAL '11 days'),
('GRV-2026-S011','OPQR2345','ተክለ ሃይማኖት','0910112234','የሲቪል ምዝገባ ሀላፊ','Labor & Skills','Labor & Skills','በክፍል ውስጥ አገልግሎት ለማግኘት ተደጋጋሚ ጉዞ አድርጌያለሁ።','In Progress',1,NULL,NOW()-INTERVAL '12 days'),
('GRV-2026-S012','STUV6789','ፍቅረብርሀን ደስታ','0911223345','የስራና ክህሎት ሀላፊ','Chief Executive Office','Chief Executive Office','የሰራተኞች አክብሮት ጉዳይ ተጠቅሶልኝ።','In Progress',1,NULL,NOW()-INTERVAL '13 days'),
('GRV-2026-S013','WXYZ0123','ሀረጌ ገብረ','0912334456','አቶ ተመስገን በላይ','Civil Registration','Civil Registration','የአገልግሎት ሰዓት መረጃ በድረ-ገጽ ላይ የተሳሳተ ነው።','In Progress',1,NULL,NOW()-INTERVAL '14 days'),
('GRV-2026-S014','BCDE4567','አስናቀ መንግስት','0913445567','የንግድ ጽ/ቤት ሀላፊ','Trade Office','Trade Office','የጉዲፍቻ ማረጋገጫ ሰነድ ተዘግይቷል።','Resolved',1,'ጉዳዩ ተፈትቷል።',NOW()-INTERVAL '15 days'),
('GRV-2026-S015','FGHI8901','ዳዊት አበበ','0914556678','የሲቪል ምዝገባ ሀላፊ','Labor & Skills','Labor & Skills','የስራ ፈቃድ ማዘጋጀት ሂደት ግልጽ አይደለም።','Resolved',1,'ጉዳዩ ተፈትቷል።',NOW()-INTERVAL '16 days'),
('GRV-2026-S016','JKLM2345','አማኑኤል ተሰማ','0915667789','የስራና ክህሎት ሀላፊ','Chief Executive Office','Chief Executive Office','በቢሮ ውስጥ ያለው ወረቀት ስራ ተጨማሪ ጊዜ ይዞኛል።','Resolved',1,'ጉዳዩ ተፈትቷል።',NOW()-INTERVAL '17 days'),
('GRV-2026-S017','NOPQ6789','ሰላማዊት ገብረ','0916778900','አቶ ተመስገን በላይ','Civil Registration','Civil Registration','የልደት ምዝገባ ሂደት ረጅም እንደሆነ ተገልጾልኝ።','Resolved',1,'ጉዳዩ ተፈትቷል።',NOW()-INTERVAL '18 days'),
('GRV-2026-S018','RSTU0123','በላይነሽ ፀጋዬ','0917889011','የንግድ ጽ/ቤት ሀላፊ','Trade Office','Trade Office','የንግድ ፈቃድ ማዘጋጀት ተዘግይቷል።','Resolved',1,'ጉዳዩ ተፈትቷል።',NOW()-INTERVAL '19 days'),
('GRV-2026-S019','VWXY4567','አብርሃም ሀይሉ','0918990122','የሲቪል ምዝገባ ሀላፊ','Labor & Skills','Labor & Skills','በክፍል ውስጥ አገልግሎት ለማግኘት ተደጋጋሚ ጉዞ አድርጌያለሁ።','Resolved',1,'ጉዳዩ ተፈትቷል።',NOW()-INTERVAL '20 days'),
('GRV-2026-S020','ZABC8901','ሰይፈ መንግስቱ','0919001233','የስራና ክህሎት ሀላፊ','Chief Executive Office','Chief Executive Office','የሰራተኞች አክብሮት ጉዳይ ተጠቅሶልኝ።','Resolved',1,'ጉዳዩ ተፈትቷል።',NOW()-INTERVAL '21 days'),
('GRV-2026-S021','DEFG2345','ሄሊን ገብረ','0910112344','አቶ ተመስገን በላይ','Civil Registration','Civil Registration','የአገልግሎት ሰዓት መረጃ በድረ-ገጽ ላይ የተሳሳተ ነው።','Escalated',2,NULL,NOW()-INTERVAL '22 days'),
('GRV-2026-S022','HIJK6789','አዳነ ተፈሪ','0911223455','የንግድ ጽ/ቤት ሀላፊ','Trade Office','Trade Office','የጉዲፍቻ ማረጋገጫ ሰነድ ተዘግይቷል።','Escalated',2,NULL,NOW()-INTERVAL '23 days'),
('GRV-2026-S023','LMNO0123','ሙሉነሽ አሰፋ','0912334566','የሲቪል ምዝገባ ሀላፊ','Labor & Skills','Labor & Skills','የስራ ፈቃድ ማዘጋጀት ሂደት ግልጽ አይደለም።','Escalated',2,NULL,NOW()-INTERVAL '24 days'),
('GRV-2026-S024','PQRS4567','ጌታቸው ተስፋ','0913445677','የስራና ክህሎት ሀላፊ','Chief Executive Office','Chief Executive Office','በቢሮ ውስጥ ያለው ወረቀት ስራ ተጨማሪ ጊዜ ይዞኛል።','Resolved',1,'ጉዳዩ ተፈትቷል።',NOW()-INTERVAL '25 days');

INSERT INTO appointments (
  unique_code, citizen_name, citizen_phone, service_type,
  appointment_date, status, assigned_department, created_at
) VALUES
('TUVW8901','ሰለሞን ተወልደ','0920112233','የልደት ምዝገባ እና ማስረጃ አገልግሎት',NOW()+INTERVAL '2 days','Confirmed','Civil Registration',NOW()-INTERVAL '3 days'),
('XYAB2345','ሀና መንግስት','0921223344','የጋብቻ ምዝገባ እና ማስረጃ አገልግሎት',NOW()+INTERVAL '3 days','Confirmed','Civil Registration',NOW()-INTERVAL '4 days'),
('ZCDE6789','አብርሃም ገብረ','0922334455','ዲጂታል የነዋሪነት ምዝገባ አገልግሎት',NOW()+INTERVAL '4 days','Confirmed','Civil Registration',NOW()-INTERVAL '5 days'),
('FGHK0123','ደሀኔ መሀመድ','0923445566','የንግድ ፈቃድ ማዘጋጀት',NOW()+INTERVAL '5 days','Confirmed','Trade Office',NOW()-INTERVAL '6 days'),
('IJLM4567','ሰናይት አሰፋ','0924556677','የስራ ፈቃድ ማዘጋጀት',NOW()+INTERVAL '6 days','Confirmed','Labor & Skills',NOW()-INTERVAL '7 days'),
('NOPR8901','ብርሃኑ ተክለ','0925667788','የክህሎት ስልጠና ምዝገባ',NOW()+INTERVAL '7 days','Confirmed','Labor & Skills',NOW()-INTERVAL '8 days'),
('QRSU2345','ማርያም ደስታ','0926778899','የሞት ምዝገባ እና ማስረጃ አገልግሎት',NOW()+INTERVAL '8 days','Confirmed','Civil Registration',NOW()-INTERVAL '9 days'),
('TVWX6789','ገብረ ሥላሴ','0927889900','የፍች ምዝገባ እና ማስረጃ አገልግሎት',NOW()+INTERVAL '9 days','Confirmed','Civil Registration',NOW()-INTERVAL '10 days'),
('YZAC0123','ተክለ መንግስት','0928990011','የልደት ምዝገባ እና ማስረጃ አገልግሎት',NOW()+INTERVAL '10 days','Confirmed','Civil Registration',NOW()-INTERVAL '11 days'),
('BDEF4567','ፍቅረብርሀን አማረ','0929001122','የጋብቻ ምዝገባ እና ማስረጃ አገልግሎት',NOW()+INTERVAL '11 days','Confirmed','Trade Office',NOW()-INTERVAL '12 days'),
('GHJK8901','ዮሴፍ ሀሰን','0920113344','ዲጂታል የነዋሪነት ምዝገባ አገልግሎት',NOW()-INTERVAL '3 days','Completed','Civil Registration',NOW()-INTERVAL '13 days'),
('LMNP2345','ሀረጌ ተስፋ','0921224455','የንግድ ፈቃድ ማዘጋጀት',NOW()-INTERVAL '5 days','Completed','Trade Office',NOW()-INTERVAL '14 days'),
('QRST6789','አስናቀ ገብረ','0922335566','የስራ ፈቃድ ማዘጋጀት',NOW()-INTERVAL '7 days','Completed','Labor & Skills',NOW()-INTERVAL '15 days'),
('UVWX0123','ዳዊት መንግስት','0923446677','የክህሎት ስልጠና ምዝገባ',NOW()-INTERVAL '9 days','Completed','Chief Executive Office',NOW()-INTERVAL '16 days'),
('YZAB4567','ሙሉነሽ ተሰማ','0924557788','የሞት ምዝገባ እና ማስረጃ አገልግሎት',NOW()-INTERVAL '11 days','Completed','Civil Registration',NOW()-INTERVAL '17 days'),
('CDEF8901','ጌታቸው ገብረ','0925668899','የፍች ምዝገባ እና ማስረጃ አገልግሎት',NOW()-INTERVAL '13 days','Completed','Civil Registration',NOW()-INTERVAL '18 days'),
('GHIJ2345','ሄሊን አሰፋ','0926779900','የልደት ምዝገባ እና ማስረጃ አገልግሎት',NOW()-INTERVAL '4 days','Missed','Civil Registration',NOW()-INTERVAL '19 days'),
('KLMN6789','አዳነ ተከለ','0927880011','የጋብቻ ምዝገባ እና ማስረጃ አገልግሎት',NOW()-INTERVAL '6 days','Missed','Trade Office',NOW()-INTERVAL '20 days'),
('OPQT0123','ሰላማዊት ተሰማ','0928991122','የንግድ ፈቃድ ማዘጋጀት',NOW()-INTERVAL '8 days','Missed','Trade Office',NOW()-INTERVAL '21 days'),
('RSTV4567','በላይ መንግስት','0929002233','የስራ ፈቃድ ማዘጋጀት',NOW()-INTERVAL '10 days','Missed','Labor & Skills',NOW()-INTERVAL '22 days');
