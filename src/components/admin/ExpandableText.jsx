const TRUNCATE_AT = 56

export default function ExpandableText({
  text,
  onExpand,
  lang = 'en',
  className = '',
  lineClamp = 2,
}) {
  if (!text) return <span className="text-mayor-navy/40">—</span>

  const isLong = text.length > TRUNCATE_AT

  const clampClass = lineClamp === 1 ? 'line-clamp-1' : 'line-clamp-2'

  return (
    <div className={className}>
      <p
        className={`font-amharic text-sm text-mayor-navy break-words ${isLong ? clampClass : ''}`}
      >
        {text}
      </p>
      {isLong && onExpand && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onExpand()
          }}
          className="text-mayor-royal-blue text-xs font-semibold mt-1 font-amharic hover:underline text-left"
        >
          {lang === 'am' ? 'ሙሉውን ይመልከቱ' : lang === 'om' ? 'Guutuu ilaali' : 'View full'}
        </button>
      )}
    </div>
  )
}
