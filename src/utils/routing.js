// Routing utilities for complaints and appointments

import { officials } from '../data/officials'
import { services } from '../data/services'

// Map role keys to departments
export const roleToDepartment = {
  'trade_head': 'Trade Office',
  'labor_head': 'Labor & Skills',
  'civil_head': 'Civil Registration',
  'ceo': 'Chief Executive',
  'ceo_office_head': 'Chief Executive Office',
  'council_speaker': 'Woreda Council'
}

// Map service types to departments
export function getDepartmentFromService(serviceType, lang = 'am') {
  if (!serviceType) {
    return 'Chief Executive Office'
  }

  // Check all services in each department to find a match
  // This handles the full service names that are actually stored

  // Check Civil Registration services
  for (const service of services.civilRegistration.items) {
    if (service.name[lang] === serviceType) {
      return 'Civil Registration'
    }
  }

  // Check Trade Office services
  for (const service of services.tradeOffice.items) {
    if (service.name[lang] === serviceType) {
      return 'Trade Office'
    }
  }

  // Check Labor & Skills services
  for (const service of services.laborSkills.items) {
    if (service.name[lang] === serviceType) {
      return 'Labor & Skills'
    }
  }

  // Check Chief Executive Office services
  for (const service of services.chiefExecutiveOffice.items) {
    if (service.name[lang] === serviceType) {
      return 'Chief Executive Office'
    }
  }

  // Fallback: Check if service name contains keywords (for backwards compatibility)
  const serviceTypeLower = serviceType.toLowerCase()

  // Civil Registration keywords
  if (serviceTypeLower.includes('ልደት') || serviceTypeLower.includes('birth') ||
    serviceTypeLower.includes('ጋብቻ') || serviceTypeLower.includes('marriage') ||
    serviceTypeLower.includes('ፍች') || serviceTypeLower.includes('divorce') ||
    serviceTypeLower.includes('ሞት') || serviceTypeLower.includes('death') ||
    serviceTypeLower.includes('ነዋሪ') || serviceTypeLower.includes('resident') ||
    serviceTypeLower.includes('ኩነት') || serviceTypeLower.includes('vital')) {
    return 'Civil Registration'
  }

  // Trade Office keywords
  if (serviceTypeLower.includes('ንግድ') || serviceTypeLower.includes('trade') ||
    serviceTypeLower.includes('business') || serviceTypeLower.includes('license')) {
    return 'Trade Office'
  }

  // Labor & Skills keywords
  if (serviceTypeLower.includes('ስራ') || serviceTypeLower.includes('labor') ||
    serviceTypeLower.includes('ክህሎት') || serviceTypeLower.includes('skill') ||
    serviceTypeLower.includes('ኢንተርፕራይዝ') || serviceTypeLower.includes('enterprise') ||
    serviceTypeLower.includes('ስምሪት') || serviceTypeLower.includes('employment')) {
    return 'Labor & Skills'
  }

  // Default to CEO Office
  return 'Chief Executive Office'
}

// Get department from official name
export function getDepartmentFromOfficial(officialName, lang = 'am') {
  const official = officials.find(o =>
    (lang === 'am' ? o.full_name_am : o.full_name_en) === officialName
  )

  if (!official) {
    return 'Chief Executive Office' // Default
  }

  return roleToDepartment[official.role_key] || 'Chief Executive Office'
}

// Get role key from official name
export function getRoleKeyFromOfficial(officialName, lang = 'am') {
  const official = officials.find(o =>
    (lang === 'am' ? o.full_name_am : o.full_name_en) === officialName
  )

  return official?.role_key || 'ceo_office_head'
}

// Get escalation role key based on level and department
export function getEscalationRoleKey(escalationLevel, department) {
  switch (escalationLevel) {
    case 1:
      // Level 1: Assigned to department staff (same as initial assignment)
      return getRoleKeyFromDepartment(department)
    case 2:
      // Level 2: Department Head
      if (department === 'Trade Office') return 'trade_head'
      if (department === 'Civil Registration') return 'civil_head'
      if (department === 'Labor & Skills') return 'labor_head'
      return 'ceo_office_head'
    case 3:
      // Level 3: CEO Office
      return 'ceo_office_head'
    case 4:
      // Level 4: Council
      return 'council_speaker'
    default:
      return 'ceo_office_head'
  }
}

// Get role key from department
export function getRoleKeyFromDepartment(department) {
  if (department === 'Trade Office') return 'trade_head'
  if (department === 'Civil Registration') return 'civil_head'
  if (department === 'Labor & Skills') return 'labor_head'
  if (department === 'Chief Executive Office') return 'ceo_office_head'
  if (department === 'Chief Executive') return 'ceo'
  if (department === 'Woreda Council') return 'council_speaker'
  return 'ceo_office_head'
}

// Get department display name
export function getDepartmentDisplayName(department, lang = 'am') {
  const names = {
    'Trade Office': {
      am: 'ንግድ ጽ/ቤት',
      om: 'Waajjira Daldaalaa',
      en: 'Trade Office'
    },
    'Civil Registration': {
      am: 'ሲቪል ምዝገባ',
      om: 'Galmee Siviilii',
      en: 'Civil Registration'
    },
    'Labor & Skills': {
      am: 'ስራና ክህሎት',
      om: 'Hojii fi Ogummaa',
      en: 'Labor & Skills'
    },
    'Chief Executive Office': {
      am: 'ዋና ሥራ አስፈፃሚ ጽ/ቤት',
      om: 'Waajjira Hojii Raawwachiiftuu Olaanaa',
      en: 'Chief Executive Office'
    },
    'Chief Executive': {
      am: 'ዋና ሥራ አስፈፃሚ',
      om: 'Hojii Raawwachiiftuu Olaanaa',
      en: 'Chief Executive'
    },
    'Woreda Council': {
      am: 'ወረዳ ምክር ቤት',
      om: 'Mana Maree Aanaa',
      en: 'Woreda Council'
    }
  }

  return names[department]?.[lang] || department
}

