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
    accent: 'bg-gradient-to-r from-mayor-royal-blue to-blue-500',
    accentLight: 'bg-blue-50',
    accentText: 'text-mayor-royal-blue',
    shadow: 'shadow-blue-500/20',
  },
  vision: {
    Icon: Eye,
    accent: 'bg-gradient-to-r from-mayor-deep-blue to-indigo-500',
    accentLight: 'bg-indigo-50',
    accentText: 'text-mayor-deep-blue',
    shadow: 'shadow-indigo-500/20',
  },
  values: {
    Icon: Heart,
    accent: 'bg-gradient-to-r from-mayor-navy to-emerald-500',
    accentLight: 'bg-emerald-50',
    accentText: 'text-mayor-navy',
    shadow: 'shadow-emerald-500/20',
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
    <ul className={`grid gap-4 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
      {items.map((item, i) => (
        <li
          key={item}
          className={`group flex items-center gap-4 bg-white/60 backdrop-blur-md border border-white rounded-2xl shadow-[0_8px_30px_rgba(0,45,92,0.04)] hover:shadow-[0_15px_40px_rgba(0,45,92,0.1)] transition-all duration-300 hover:-translate-y-1 ${
            compact ? 'p-4' : 'p-5 sm:p-6'
          }`}
        >
          <span
            className={`flex shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${meta.accent} ${meta.shadow} shadow-lg ${
              compact ? 'h-10 w-10' : 'h-12 w-12 text-base'
            } transition-transform duration-300 group-hover:scale-110`}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <span
            className={`font-bold text-mayor-navy font-amharic leading-snug ${
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

  return (
    <div className={`relative ${compact ? 'p-6 sm:p-8' : 'p-8 sm:p-12'} animate-fadeInUp`}>
      <div className={`flex items-start gap-4 sm:gap-6 mb-8 ${isValues ? 'pb-8 border-b border-mayor-gray-divider/30' : ''}`}>
        <div
          className={`flex shrink-0 items-center justify-center rounded-2xl ${meta.accent} ${meta.shadow} shadow-xl ${
            compact ? 'h-14 w-14' : 'h-20 w-20'
          }`}
        >
          <Icon className={`text-white ${compact ? 'h-7 w-7' : 'h-10 w-10'}`} strokeWidth={1.5} />
        </div>
        <div>
          <h3 className={`font-bold text-mayor-navy font-amharic ${compact ? 'text-2xl mt-3' : 'text-3xl sm:text-4xl mt-4'}`}>
            {title}
          </h3>
          {isValues && valueItems.length > 0 && (
            <p className="mt-2 text-sm font-bold uppercase tracking-widest text-mayor-navy/40 font-amharic">
              {lang === 'am'
                ? `${valueItems.length} ዋና እሴቶች`
                : lang === 'om'
                  ? `Gatiilee bu\'uuraa ${valueItems.length}`
                  : `${valueItems.length} core values`}
            </p>
          )}
        </div>
      </div>

      <div className="relative z-10">
        {isValues && valueItems.length > 0 ? (
          <ValuesList items={valueItems} meta={meta} compact={compact} />
        ) : (
          <p className={`text-mayor-navy/80 font-amharic leading-relaxed font-medium ${compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl max-w-4xl'}`}>
            {body}
          </p>
        )}
      </div>
      
      {/* Decorative large background icon */}
      {!isValues && (
        <div className="absolute right-10 bottom-10 opacity-5 pointer-events-none transform -rotate-12">
          <Icon size={compact ? 150 : 250} strokeWidth={1} />
        </div>
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

  const sectionLabel = lang === 'am' ? 'ስለ እኛ' : lang === 'om' ? 'Waa\'ee Keenya' : 'About Us'

  if (loading) {
    return (
      <section id="about" className={compact ? 'py-16' : standalone ? 'py-0' : 'py-24'}>
        <div className={`animate-pulse ${compact ? 'max-w-5xl mx-auto px-4 sm:px-6' : ''}`}>
          <div className={`h-8 bg-slate-200 rounded mb-8 ${compact ? 'w-1/4' : 'w-1/3 mx-auto'}`} />
          <div className={`bg-slate-100 rounded-[2.5rem] ${compact ? 'h-64' : 'h-96'}`} />
        </div>
      </section>
    )
  }

  if (displaySections.length === 0) return null

  return (
    <section
      id="about"
      className={`scroll-mt-24 relative overflow-hidden bg-white ${standalone ? 'py-0' : 'py-24 sm:py-32'}`}
    >
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-mayor-royal-blue/10 rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-mayor-highlight-blue/10 rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none"></div>

      <div className={`${compact ? 'max-w-6xl mx-auto px-4 sm:px-6' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} relative z-10`}>
        {standalone ? (
          <h2 className="text-3xl font-bold text-mayor-navy font-amharic mb-10">
            {lang === 'am' ? 'ተልዕኮ፣ ራዕይ እና እሴቶች' : lang === 'om' ? 'Ergama, Mul\'ata fi Gatiilee' : 'Mission, Vision & Values'}
          </h2>
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
              compact ? null : lang === 'am'
                ? 'የወረዳ አስተዳደር ግቦች እና ዋና እሴቶች'
                : lang === 'om'
                  ? 'Ergama fi gatiilee bulchiinsa woredaa keenyaa'
                  : 'The goals and principles guiding our woreda administration'
            }
            align={compact ? "left" : "center"}
          />
        )}

        <div className="flex flex-col gap-8">
          {/* Floating Pill Tabs */}
          <div className={`flex flex-wrap gap-3 ${compact ? '' : 'justify-center'}`}>
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
                  className={`flex items-center gap-2.5 font-bold font-amharic transition-all duration-300 rounded-full px-6 py-3 shadow-sm ${
                    isActive
                      ? `${meta.accent} text-white shadow-lg ${meta.shadow} scale-105`
                      : 'bg-white/80 backdrop-blur-md text-mayor-navy/60 hover:text-mayor-navy hover:bg-white hover:shadow-md border border-white'
                  }`}
                >
                  <Icon className={`shrink-0 w-5 h-5`} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                </button>
              )
            })}
          </div>

          {/* Main Content Glass Card */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,45,92,0.1)] overflow-hidden relative min-h-[300px]">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none"></div>
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
