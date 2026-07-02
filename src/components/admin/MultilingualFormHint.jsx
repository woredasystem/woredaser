import { getMultilingualFormHint } from '../../utils/multilingualForm'

export default function MultilingualFormHint({ lang, variant = 'site', className = '' }) {
  return (
    <p
      className={`text-sm text-mayor-royal-blue bg-mayor-royal-blue/5 border border-mayor-royal-blue/20 rounded-lg px-4 py-3 font-amharic leading-relaxed ${className}`}
    >
      {getMultilingualFormHint(lang, variant)}
    </p>
  )
}
