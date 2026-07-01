import { useLanguage } from '../hooks/useLanguage'
import { FileText, Briefcase, Users, ArrowUpRight } from 'lucide-react'

const sectorIcons = {
  civilRegistration: FileText,
  tradeOffice: Briefcase,
  laborSkills: Users,
  chiefExecutiveOffice: FileText,
}

const SECTOR_ACCENTS = {
  civilRegistration: {
    panel: 'bg-mayor-royal-blue',
    pill: 'bg-mayor-royal-blue/10 text-mayor-royal-blue',
    hover: 'hover:border-mayor-royal-blue/35',
    index: 'text-mayor-royal-blue/20',
  },
  tradeOffice: {
    panel: 'bg-mayor-deep-blue',
    pill: 'bg-mayor-deep-blue/10 text-mayor-deep-blue',
    hover: 'hover:border-mayor-deep-blue/35',
    index: 'text-mayor-deep-blue/20',
  },
  laborSkills: {
    panel: 'bg-mayor-navy',
    pill: 'bg-mayor-navy/10 text-mayor-navy',
    hover: 'hover:border-mayor-navy/35',
    index: 'text-mayor-navy/20',
  },
  chiefExecutiveOffice: {
    panel: 'bg-mayor-highlight-blue',
    pill: 'bg-mayor-highlight-blue/10 text-mayor-deep-blue',
    hover: 'hover:border-mayor-highlight-blue/40',
    index: 'text-mayor-highlight-blue/25',
  },
}

const DEFAULT_ACCENT = SECTOR_ACCENTS.civilRegistration

export default function SectorCard({ sector, onClick, index = 0 }) {
  const { lang } = useLanguage()
  const Icon = sectorIcons[sector.key] || FileText
  const accent = SECTOR_ACCENTS[sector.key] || DEFAULT_ACCENT
  const count = sector.items.length

  const countLabel =
    lang === 'am'
      ? 'አገልግሎቶች'
      : lang === 'om'
        ? 'Tajaajiloota'
        : 'Services'

  const indexLabel = String(index + 1).padStart(2, '0')

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full min-h-[7.5rem] sm:min-h-[8.5rem] text-left bg-white border-2 border-mayor-gray-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_12px_32px_rgba(10,42,74,0.08)] hover:-translate-y-0.5 ${accent.hover}`}
    >
      <div
        className={`relative flex w-[5.5rem] sm:w-[6.5rem] shrink-0 flex-col items-center justify-between py-5 px-3 ${accent.panel}`}
      >
        <Icon className="w-7 h-7 text-white/90" strokeWidth={1.75} />
        <span className="text-3xl sm:text-4xl font-bold text-white tabular-nums leading-none">
          {count}
        </span>
        <div className="absolute inset-y-0 -right-px w-px bg-white/15" aria-hidden="true" />
      </div>

      <div className="relative flex flex-1 flex-col justify-center gap-2 py-5 pl-5 pr-14 sm:pl-6 sm:pr-16">
        <span
          className={`absolute top-3 right-4 text-2xl sm:text-3xl font-bold tabular-nums leading-none select-none ${accent.index}`}
          aria-hidden="true"
        >
          {indexLabel}
        </span>

        <h3 className="text-lg sm:text-xl font-bold text-mayor-navy font-amharic leading-snug group-hover:text-mayor-deep-blue transition-colors pr-2">
          {sector.name[lang]}
        </h3>

        <span className={`inline-flex w-fit items-center px-2.5 py-0.5 rounded-md text-xs font-semibold font-amharic ${accent.pill}`}>
          {countLabel}
        </span>
      </div>

      <span className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-mayor-gray-divider bg-slate-50 text-mayor-navy/40 group-hover:border-mayor-navy group-hover:bg-mayor-navy group-hover:text-white transition-all duration-300">
        <ArrowUpRight className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={2} />
      </span>
    </button>
  )
}
