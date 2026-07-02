export const MULTILINGUAL_LANGS = ['am', 'en', 'om']

export function isAmharicRequired(langCode) {
  return langCode === 'am'
}

export function getLangFieldLabel(lang, code) {
  const labels = {
    am: { am: 'አማርኛ', en: 'Amharic', om: 'Afaan Oromoo' },
    en: { am: 'እንግሊዝኛ', en: 'English', om: 'Oromo' },
    om: { am: 'ኦሮምኛ', en: 'English', om: 'Afaan Oromoo' },
  }
  return labels[lang]?.[code] || labels.en[code] || code
}

export function getLangRequiredBadge(lang, code) {
  if (code === 'am') return lang === 'am' ? 'ያስፈልጋል' : 'Required'
  return lang === 'am' ? 'አማራጭ' : 'Optional'
}

const HINT_BENEFIT = {
  am: 'እንግሊዝኛ እና ኦሮምኛ ሲሞሉ ጎብኝቶች በመረጡት ቋንቋ ይዘቱን በትክክል ያዩታል።',
  en: 'When English and Oromo are filled in, visitors see content in their selected language.',
  om: 'Ingliffa fi Afaan Oromoo yoo guutaman, daawwattoonni afaan filataman irratti qabiyyee ni argu.',
}

const HINT_REQUIRED = {
  am: 'አማርኛ መሙላት የሚያስፈልግ ነው።',
  en: 'Amharic is required.',
  om: 'Afaan Amaaraa guutuun barbaachisaadha.',
}

export function getMultilingualFormHint(lang, variant = 'site') {
  const benefit = HINT_BENEFIT[lang] || HINT_BENEFIT.en
  const required = HINT_REQUIRED[lang] || HINT_REQUIRED.en

  const contexts = {
    site: {
      am: 'በመነሻ ገጽ ላይ',
      en: 'on the public homepage',
      om: 'fuula jalqabaa irratti',
    },
    leadership: {
      am: 'በመነሻ ገጽ የአመራር ክፍል ላይ',
      en: 'in the homepage leadership section',
      om: 'fuula jalqabaa qooda hogganoota irratti',
    },
    departments: {
      am: 'በቅሬታ ምደባ እና የፖርታል ስሞች ላይ',
      en: 'for complaint routing and portal labels',
      om: 'ramaddii komii fi mallattoolee poortaalii irratti',
    },
    services: {
      am: 'በአገልግሎቶች ካታሎግ እና ቀጠሮ ላይ',
      en: 'in the services catalog and booking flow',
      om: 'kaataalooogii tajaajilaa fi qabsiisuu irratti',
    },
  }

  const where = contexts[variant]?.[lang] || contexts[variant]?.en || contexts.site.en

  if (lang === 'am') {
    return `${required} እንግሊዝኛ እና ኦሮምኛ አማራጭ ነው — ${benefit.replace('።', '')} ${where}።`
  }
  if (lang === 'om') {
    return `${required} Ingliffi fi Afaan Oromoo filannoo dha — ${benefit} ${where}.`
  }
  return `${required} English and Oromo are optional — ${benefit} ${where}.`
}

export function validateAmharicFields(values, lang, labels = {}) {
  for (const [key, label] of Object.entries(labels)) {
    const value = values[key]
    if (!value || !String(value).trim()) {
      const name = label[lang] || label.en || key
      if (lang === 'am') throw new Error(`${name} መሙላት ያስፈልጋል`)
      throw new Error(`${name} is required`)
    }
  }
}

export function trimOptional(value) {
  const trimmed = String(value ?? '').trim()
  return trimmed || null
}
