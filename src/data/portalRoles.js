// Fallback seed data only — runtime uses `departments` table from Supabase.
// Kept for offline fallback and scripts/seed-catalog.js
export const portalRoles = [  { roleKey: 'trade_head', department: 'Trade Office', departmentAm: 'ንግድ ጽ/ቤት' },
  { roleKey: 'civil_head', department: 'Civil Registration', departmentAm: 'ሲቪል ምዝገባ' },
  { roleKey: 'labor_head', department: 'Labor & Skills', departmentAm: 'ስራና ክህሎት' },
  { roleKey: 'ceo_office_head', department: 'Chief Executive Office', departmentAm: 'ዋና ሥራ አስፈፃሚ ጽ/ቤት' },
  { roleKey: 'ceo', department: 'Chief Executive', departmentAm: 'ዋና ሥራ አስፈፃሚ' },
  { roleKey: 'council_speaker', department: 'Woreda Council', departmentAm: 'ወረዳ ምክር ቤት' },
  { roleKey: 'admin', department: 'Admin', departmentAm: 'አስተዳደር', isAdmin: true },
]

export function getPortalRole(roleKey) {
  return portalRoles.find((r) => r.roleKey === roleKey)
}
