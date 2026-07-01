// Routing utilities for complaints and appointments

import { services as fallbackServices } from '../data/services'

let departmentsCache = []
let servicesCache = fallbackServices
let sectorsListCache = []

export function setDepartmentsCache(departments) {
  departmentsCache = departments || []
}

export function setServicesCache(catalog, sectorsList) {
  if (catalog) servicesCache = catalog
  if (sectorsList) sectorsListCache = sectorsList
}

function getRoleToDepartmentMap() {
  const map = {}
  for (const d of departmentsCache) {
    map[d.roleKey] = d.department
  }
  if (Object.keys(map).length === 0) {
    return {
      trade_head: 'Trade Office',
      labor_head: 'Labor & Skills',
      civil_head: 'Civil Registration',
      ceo: 'Chief Executive',
      ceo_office_head: 'Chief Executive Office',
      council_speaker: 'Woreda Council',
    }
  }
  return map
}

function getDepartmentFromSectorKey(sectorKey) {
  const sector = servicesCache[sectorKey]
  if (!sector?.departmentRoleKey) return null
  const roleToDept = getRoleToDepartmentMap()
  return roleToDept[sector.departmentRoleKey] || null
}

export const roleToDepartment = new Proxy({}, {
  get(_, prop) {
    return getRoleToDepartmentMap()[prop]
  },
})

export function getDepartmentFromService(serviceType, lang = 'am', catalog = servicesCache) {
  if (!serviceType) {
    return 'Chief Executive Office'
  }

  for (const [sectorKey, sector] of Object.entries(catalog)) {
    for (const service of sector.items || []) {
      if (service.name[lang] === serviceType || service.name.en === serviceType || service.name.am === serviceType) {
        const fromSector = getDepartmentFromSectorKey(sectorKey)
        if (fromSector) return fromSector
      }
    }
  }

  const serviceTypeLower = serviceType.toLowerCase()

  if (serviceTypeLower.includes('ልደት') || serviceTypeLower.includes('birth') ||
    serviceTypeLower.includes('ጋብቻ') || serviceTypeLower.includes('marriage') ||
    serviceTypeLower.includes('ፍች') || serviceTypeLower.includes('divorce') ||
    serviceTypeLower.includes('ሞት') || serviceTypeLower.includes('death') ||
    serviceTypeLower.includes('ነዋሪ') || serviceTypeLower.includes('resident') ||
    serviceTypeLower.includes('ኩነት') || serviceTypeLower.includes('vital')) {
    return 'Civil Registration'
  }

  if (serviceTypeLower.includes('ንግድ') || serviceTypeLower.includes('trade') ||
    serviceTypeLower.includes('business') || serviceTypeLower.includes('license')) {
    return 'Trade Office'
  }

  if (serviceTypeLower.includes('ስራ') || serviceTypeLower.includes('labor') ||
    serviceTypeLower.includes('ክህሎት') || serviceTypeLower.includes('skill') ||
    serviceTypeLower.includes('ኢንተርፕራይዝ') || serviceTypeLower.includes('enterprise') ||
    serviceTypeLower.includes('ስምሪት') || serviceTypeLower.includes('employment')) {
    return 'Labor & Skills'
  }

  return 'Chief Executive Office'
}

export function getDepartmentFromOfficial(officialName, lang = 'am', officialsList = []) {
  const official = officialsList.find(o =>
    (lang === 'am' ? o.full_name_am : o.full_name_en) === officialName
  )

  if (!official) {
    return 'Chief Executive Office'
  }

  const roleToDept = getRoleToDepartmentMap()
  return roleToDept[official.role_key] || 'Chief Executive Office'
}

export function getRoleKeyFromOfficial(officialName, lang = 'am', officialsList = []) {
  const official = officialsList.find(o =>
    (lang === 'am' ? o.full_name_am : o.full_name_en) === officialName
  )

  return official?.role_key || 'ceo_office_head'
}

export function getEscalationRoleKey(escalationLevel, department) {
  switch (escalationLevel) {
    case 1:
      return getRoleKeyFromDepartment(department)
    case 2:
      if (department === 'Trade Office') return 'trade_head'
      if (department === 'Civil Registration') return 'civil_head'
      if (department === 'Labor & Skills') return 'labor_head'
      return 'ceo_office_head'
    case 3:
      return 'ceo_office_head'
    case 4:
      return 'council_speaker'
    default:
      return 'ceo_office_head'
  }
}

export function getRoleKeyFromDepartment(department) {
  const match = departmentsCache.find((d) => d.department === department)
  if (match) return match.roleKey

  if (department === 'Trade Office') return 'trade_head'
  if (department === 'Civil Registration') return 'civil_head'
  if (department === 'Labor & Skills') return 'labor_head'
  if (department === 'Chief Executive Office') return 'ceo_office_head'
  if (department === 'Chief Executive') return 'ceo'
  if (department === 'Woreda Council') return 'council_speaker'
  return 'ceo_office_head'
}

export function getDepartmentDisplayName(department, lang = 'am') {
  const match = departmentsCache.find(
    (d) => d.department === department || d.roleKey === department
  )

  if (match) {
    if (lang === 'am') return match.departmentAm
    if (lang === 'om') return match.departmentOm || match.department
    return match.department
  }

  const fallback = {
    'Trade Office': { am: 'ንግድ ጽ/ቤት', om: 'Waajjira Daldaalaa', en: 'Trade Office' },
    'Civil Registration': { am: 'ሲቪል ምዝገባ', om: 'Galmee Siviilii', en: 'Civil Registration' },
    'Labor & Skills': { am: 'ስራና ክህሎት', om: 'Hojii fi Ogummaa', en: 'Labor & Skills' },
    'Chief Executive Office': { am: 'ዋና ሥራ አስፈፃሚ ጽ/ቤት', om: 'Waajjira Hojii Raawwachiiftuu Olaanaa', en: 'Chief Executive Office' },
    'Chief Executive': { am: 'ዋና ሥራ አስፈፃሚ', om: 'Hojii Raawwachiiftuu Olaanaa', en: 'Chief Executive' },
    'Woreda Council': { am: 'ወረዳ ምክር ቤት', om: 'Mana Maree Aanaa', en: 'Woreda Council' },
    'Admin': { am: 'አስተዳደር', om: 'Bulchiinsa', en: 'Admin' },
  }

  return fallback[department]?.[lang] || department
}

export function getBookableServices(catalog, settings, lang = 'am') {
  const keys = settings?.bookableSectorKeys || ['civilRegistration', 'tradeOffice', 'laborSkills']
  const items = []

  for (const key of keys) {
    const sector = catalog[key]
    if (!sector) continue
    for (const item of sector.items || []) {
      if (item.isBookable === false) continue
      items.push(item)
    }
  }

  return items
}

export { sectorsListCache }
