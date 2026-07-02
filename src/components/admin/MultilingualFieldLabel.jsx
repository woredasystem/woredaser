import { getLangFieldLabel, getLangRequiredBadge } from '../../utils/multilingualForm'

export default function MultilingualFieldLabel({ lang, code, fieldName, required: requiredProp }) {
  const required = requiredProp !== undefined ? requiredProp : code === 'am'

  return (
    <label className="block text-xs font-medium text-mayor-navy/70 mb-1">
      <span className="uppercase tracking-wide">{getLangFieldLabel(lang, code)}</span>
      {fieldName && <span className="normal-case font-amharic"> — {fieldName}</span>}
      <span className={`ml-1 font-semibold ${required ? 'text-mayor-royal-blue' : 'text-mayor-navy/40'}`}>
        ({getLangRequiredBadge(lang, code)})
      </span>
    </label>
  )
}
