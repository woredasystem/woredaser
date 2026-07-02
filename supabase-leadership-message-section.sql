-- Homepage leadership message section headings (content body comes from featured official bio)
INSERT INTO site_content_sections (section_key, title_am, title_en, title_om, body_am, body_en, body_om, sort_order)
VALUES (
  'leadership_message',
  'ከአመራር ዘንድ',
  'From Our Leadership',
  'Ergaa Hogganaa',
  'የወረዳ አመራር ለህዝቡ የሚሰጠው መልእክት',
  'A message from woreda leadership to the community',
  'Ergaa hoggantoonni woredaa ummataaf kennan',
  0
)
ON CONFLICT (section_key) DO NOTHING;
