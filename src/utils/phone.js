/** Ethiopian mobile: 09XXXXXXXX (10 digits) */
const LOCAL_MOBILE_RE = /^09\d{8}$/

export function isValidEthiopianMobile(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (LOCAL_MOBILE_RE.test(digits)) return true
  if (digits.startsWith('2519') && digits.length === 12) return true
  if (digits.startsWith('2517') && digits.length === 12) return true
  return false
}

/** Normalize to E.164 for TextBee (+2519XXXXXXXX) */
export function normalizeEthiopianPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (LOCAL_MOBILE_RE.test(digits)) {
    return `+251${digits.slice(1)}`
  }
  if (digits.startsWith('251') && digits.length === 12) {
    return `+${digits}`
  }
  return null
}

export function formatPhoneHint(lang = 'am') {
  if (lang === 'om') return '09XXXXXXXX'
  if (lang === 'en') return '09XXXXXXXX'
  return '09XXXXXXXX'
}
