import { useState, useEffect } from 'react'
import { Target, Eye, Heart } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { useSiteContent } from '../hooks/useSiteContent'
import { pickLocalized } from '../utils/localized'
import SectionHeading from './layout/SectionHeading'

const SECTION_ORDER = ['mission', 'vision', 'values']

const CARD_META = {
  mission: {
    Icon: Target,
    accent: 'bg-mayor-royal-blue',
    accentBorder: 'border-t-mayor-royal-blue',
    accentLight: 'bg-mayor-royal-blue/10',
    accentText: 'text-mayor-royal-blue',
    border: 'border-mayor-royal-blue/25',
  },
  vision: {
    Icon: Eye,
    accent: 'bg-mayor-deep-blue',
    accentBorder: 'border-t-mayor-deep-blue',
    accentLight: 'bg-mayor-deep-blue/10',
    accentText: 'text-mayor-deep-blue',
    border: 'border-mayor-deep-blue/25',
  },
  values: {
    Icon: Heart,
    accent: 'bg-mayor-navy',
    accentBorder: 'border-t-mayor-navy',
    accentLight: 'bg-mayor-navy/10',
    accentText: 'text-mayor-navy',
    border: 'border-mayor-navy/25',
  },
}

function parseValuesList(text) {
  if (!text) return []
  return text
    .replace(/\s+እና\s+/g, '፣ ')
    .replace(/\s+fi\s+/gi, '፣ ')
    .replace(/\s+and\s+/gi, ', ')
    .split(/[,፣]/)
    .map((s) => s.trim().replace(/[።.]+$/g, ''))
    .filter(Boolean)
}

function ValuesList({ items, meta, compact }) {
  return (
    <ul className={`grid gap-3 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 gap-4'}`}>
      {items.map((item, i) => (
        <li
          key={item}
          className={`flex items-center gap-3 border-2 ${meta.border} bg-white transition-colors ${
            compact ? 'p-4 rounded-xl' : 'p-5 rounded-2xl hover:bg-slate-50'
          }`}
        >
          <span
            className={`flex shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${meta.accent} shadow-sm ${
              compact ? 'h-9 w-9' : 'h-11 w-11'
            }`}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <span
            className={`font-semibold text-mayor-navy font-amharic leading-snug ${
              compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
            }`}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}

function TabContent({ section, lang, compact }) {
  const meta = CARD_META[section.section_key] || CARD_META.mission
  const { Icon } = meta
  const title = pickLocalized(section, 'title', lang)
  const body = pickLocalized(section, 'body', lang)
  const isValues = section.section_key === 'values'
  const valueItems = isValues ? parseValuesList(body) : []

  if (compact) {
    return (
      <div className="p-5 sm:p-6 min-h-[200px]">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-mayor-gray-divider">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 ${meta.border} ${meta.accentLight}`}
          >
            <Icon className={`h-5 w-5 ${meta.accentText}`} strokeWidth={1.75} />
          </div>
          <h3 className="text-lg font-bold text-mayor-navy font-amharic">{title}</h3>
        </div>

        {isValues && valueItems.length > 0 ? (
          <ValuesList items={valueItems} meta={meta} compact />
        ) : (
          <p className="text-mayor-navy/70 font-amharic leading-relaxed text-sm sm:text-base">{body}</p>
        )}
      </div>
    )
  }

  return (
    <div className="p-8 sm:p-10 lg:p-12 min-h-[280px]">
      <div className="flex items-start gap-5 mb-8">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 ${meta.border} ${meta.accentLight}`}
        >
          <Icon className={`h-8 w-8 ${meta.accentText}`} strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-mayor-navy font-amharic">{title}</h3>
          {isValues && valueItems.length > 0 && (
            <p className="mt-2 text-sm text-mayor-navy/50 font-amharic">
              {lang === 'am'
                ? `${valueItems.length} ዋና እሴቶች`
                : lang === 'om'
                  ? `Gatiilee bu\'uuraa ${valueItems.length}`
                  : `${valueItems.length} core values`}
            </p>
          )}
        </div>
      </div>

      {isValues && valueItems.length > 0 ? (
        <ValuesList items={valueItems} meta={meta} compact={false} />
      ) : (
        <p className="text-mayor-navy/75 font-amharic leading-relaxed text-lg sm:text-xl max-w-3xl">
          {body}
        </p>
      )}
    </div>
  )
}

export default function MissionVisionSection({ standalone = false, variant }) {
  const { lang } = useLanguage()
  const { sections, loading } = useSiteContent()
  const compact = variant === 'compact' || (!standalone && variant !== 'featured')

  const [activeKey, setActiveKey] = useState('mission')

  const displaySections = SECTION_ORDER.map((key) =>
    sections.find((s) => s.section_key === key && s.is_active !== false)
  ).filter(Boolean)

  useEffect(() => {
    if (displaySections.length && !displaySections.some((s) => s.section_key === activeKey)) {
      setActiveKey(displaySections[0].section_key)
    }
  }, [displaySections, activeKey])

  const activeSection = displaySections.find((s) => s.section_key === activeKey) || displaySections[0]
  const activeMeta = CARD_META[activeKey] || CARD_META.mission

  const sectionLabel = lang === 'am' ? 'ስለ እኛ' : lang === 'om' ? 'Waa\'ee Keenya' : 'About Us'

  if (loading) {
    return (
      <section id="about" className={compact ? 'py-12 sm:py-14' : standalone ? 'py-0' : 'py-20 sm:py-24'}>
        <div className={`animate-pulse ${compact ? 'max-w-5xl mx-auto px-4 sm:px-6' : ''}`}>
          <div className={`h-6 bg-slate-200 rounded mb-6 ${compact ? 'w-1/4' : 'w-1/3 mx-auto'}`} />
          <div className={`bg-slate-100 border-2 border-slate-200 ${compact ? 'h-48 rounded-2xl' : 'h-64 rounded-3xl'}`} />
        </div>
      </section>
    )
  }

  if (displaySections.length === 0) return null

  return (
    <section
      id="about"
      className={`scroll-mt-24 ${compact ? 'py-12 sm:py-14 bg-white' : standalone ? 'py-0' : 'py-20 sm:py-24'}`}
    >
      <div className={compact ? 'max-w-5xl mx-auto px-4 sm:px-6' : ''}>
        {standalone ? (
          <h2 className="text-2xl font-bold text-mayor-navy font-amharic mb-8">
            {lang === 'am' ? 'ተልዕኮ፣ ራዕይ እና እሴቶች' : lang === 'om' ? 'Ergama, Mul\'ata fi Gatiilee' : 'Mission, Vision & Values'}
          </h2>
        ) : compact ? (
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-mayor-royal-blue" />
            <span className="text-xs font-bold uppercase tracking-widest text-mayor-royal-blue font-amharic">
              {sectionLabel}
            </span>
          </div>
        ) : (
          <SectionHeading
            label={sectionLabel}
            title={
              lang === 'am'
                ? 'ተልዕኮ፣ ራዕይ እና እሴቶች'
                : lang === 'om'
                  ? 'Ergama, Mul\'ata fi Gatiilee'
                  : 'Mission, Vision & Values'
            }
            description={
              lang === 'am'
                ? 'የወረዳ አስተዳደር ግቦች እና ዋና እሴቶች'
                : lang === 'om'
                  ? 'Ergama fi gatiilee bulchiinsa woredaa keenyaa'
                  : 'The goals and principles guiding our woreda administration'
            }
          />
        )}

        <div
          className={`bg-white border-2 border-mayor-gray-divider overflow-hidden ${
            compact
              ? 'rounded-2xl shadow-[0_8px_30px_rgba(10,42,74,0.06)]'
              : 'rounded-3xl shadow-[0_12px_40px_rgba(10,42,74,0.06)]'
          }`}
        >
          <div
            role="tablist"
            className={`flex gap-2 border-b-2 border-mayor-gray-divider ${
              compact ? 'p-2 bg-white' : 'flex-col sm:flex-row sm:gap-0 p-3 sm:p-4 bg-slate-50'
            }`}
          >
            {displaySections.map((section) => {
              const meta = CARD_META[section.section_key]
              const { Icon } = meta
              const label = pickLocalized(section, 'title', lang)
              const isActive = section.section_key === activeKey

              return (
                <button
                  key={section.section_key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveKey(section.section_key)}
                  className={`flex-1 flex items-center justify-center gap-2 font-semibold font-amharic transition-all ${
                    compact
                      ? `px-3 py-2.5 rounded-lg text-sm ${isActive ? `${meta.accent} text-white` : `${meta.accentText} hover:bg-slate-50`}`
                      : `px-4 py-3.5 rounded-xl text-sm sm:text-base ${isActive ? `${meta.accent} text-white shadow-md` : `bg-white border-2 ${meta.border} ${meta.accentText} hover:shadow-sm`}`
                  }`}
                >
                  <Icon className={`shrink-0 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} strokeWidth={isActive ? 2 : 1.75} />
                  {label}
                </button>
              )
            })}
          </div>

          <div role="tabpanel" className={compact ? '' : `border-t-4 ${activeMeta.accentBorder}`}>
            {activeSection && (
              <TabContent
                key={activeSection.section_key}
                section={activeSection}
                lang={lang}
                compact={compact}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
