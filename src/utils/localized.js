export function pickLocalized(row, field, lang) {
  if (!row) return ''
  const omKey = `${field}_om`
  const amKey = `${field}_am`
  const enKey = `${field}_en`
  if (lang === 'am') return row[amKey] || row[enKey] || ''
  if (lang === 'om') return row[omKey] || row[enKey] || row[amKey] || ''
  return row[enKey] || row[amKey] || ''
}
