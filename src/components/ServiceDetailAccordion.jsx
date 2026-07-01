import { useState } from 'react'
import { ChevronDown, Check, Clock, Banknote } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'

const SECTOR_ACCENTS = {
  civilRegistration: {
    panel: 'bg-mayor-royal-blue',
    pill: 'bg-mayor-royal-blue/10 text-mayor-royal-blue',
    hover: 'hover:border-mayor-royal-blue/35',
    border: 'border-mayor-royal-blue/35',
  },
  tradeOffice: {
    panel: 'bg-mayor-deep-blue',
    pill: 'bg-mayor-deep-blue/10 text-mayor-deep-blue',
    hover: 'hover:border-mayor-deep-blue/35',
    border: 'border-mayor-deep-blue/35',
  },
  laborSkills: {
    panel: 'bg-mayor-navy',
    pill: 'bg-mayor-navy/10 text-mayor-navy',
    hover: 'hover:border-mayor-navy/35',
    border: 'border-mayor-navy/35',
  },
  chiefExecutiveOffice: {
    panel: 'bg-mayor-highlight-blue',
    pill: 'bg-mayor-highlight-blue/10 text-mayor-deep-blue',
    hover: 'hover:border-mayor-highlight-blue/40',
    border: 'border-mayor-highlight-blue/40',
  },
}

const DEFAULT_ACCENT = SECTOR_ACCENTS.civilRegistration

function parseRequirements(reqText) {
  if (!reqText) return []
  const items = reqText
    .split(/[።፣,]/)
    .map((req) => req.trim())
    .filter((req) => req.length > 0)
  return items.length > 0 ? items : [reqText]
}

export default function ServiceDetailAccordion({
  service,
  index,
  sectorKey,
  hideRequirements = false,
  hideFee = false,
}) {
  const { lang } = useLanguage()
  const [open, setOpen] = useState(false)
  const accent = SECTOR_ACCENTS[sectorKey] || DEFAULT_ACCENT
  const indexLabel = String(index + 1).padStart(2, '0')

  const requirements = hideRequirements ? [] : parseRequirements(service.requirements?.[lang])
  const hasDetails =
    requirements.length > 0 ||
    service.standard ||
    service.standardTime ||
    (!hideFee && (service.fee != null || service.paymentMethod))

  const feeLabel =
    service.fee === 0
      ? lang === 'am'
        ? 'ነጻ'
        : lang === 'om'
          ? 'Bilisaa'
          : 'Free'
      : `${service.fee} ${lang === 'am' ? 'ብር' : lang === 'om' ? 'Qarshii' : 'ETB'}`

  const timeLabel = service.standard?.[lang] || service.standardTime

  return (
    <div
      className={`bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
        open ? accent.border : 'border-mayor-gray-divider'
      } ${!open ? accent.hover : ''} ${!open ? 'hover:shadow-[0_8px_24px_rgba(10,42,74,0.06)] hover:-translate-y-0.5' : 'shadow-[0_8px_24px_rgba(10,42,74,0.06)]'}`}
    >
      <button
        type="button"
        onClick={() => hasDetails && setOpen(!open)}
        aria-expanded={open}
        className={`group flex w-full min-h-[4.5rem] text-left transition-colors ${hasDetails ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <div className={`flex w-12 sm:w-14 shrink-0 items-center justify-center ${accent.panel}`}>
          <span className="text-sm font-bold text-white/90 tabular-nums">{indexLabel}</span>
        </div>

        <div className="flex flex-1 items-center gap-3 py-4 pl-4 pr-3 sm:pl-5 min-w-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-mayor-navy font-amharic leading-snug group-hover:text-mayor-deep-blue transition-colors">
              {service.name[lang]}
            </h3>

            {!open && (
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {!hideFee && service.fee != null && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold font-amharic ${accent.pill}`}>
                    <Banknote className="w-3 h-3" />
                    {feeLabel}
                  </span>
                )}
                {timeLabel && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-mayor-navy/50 bg-slate-100 font-amharic">
                    <Clock className="w-3 h-3" />
                    {timeLabel}
                  </span>
                )}
              </div>
            )}
          </div>

          {hasDetails && (
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-mayor-gray-divider bg-slate-50 text-mayor-navy/40 transition-all duration-300 ${
                open
                  ? 'border-mayor-navy bg-mayor-navy text-white rotate-180'
                  : 'group-hover:border-mayor-navy group-hover:bg-mayor-navy group-hover:text-white'
              }`}
            >
              <ChevronDown className="w-4 h-4" strokeWidth={2} />
            </span>
          )}
        </div>
      </button>

      {open && hasDetails && (
        <div className="border-t border-mayor-navy/8 px-4 sm:px-5 pb-5 pt-4 ml-12 sm:ml-14 space-y-4">
          {!hideRequirements && requirements.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-mayor-navy/40 font-amharic mb-3">
                {lang === 'am' ? 'የሚፈለጉ ሰነዶች' : lang === 'om' ? 'Ragaalee Barbaachisan' : 'Required Documents'}
              </p>
              <ul className="space-y-2">
                {requirements.map((requirement, reqIndex) => (
                  <li key={reqIndex} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-green-50 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" strokeWidth={2.5} />
                    </span>
                    <span className="text-sm text-mayor-navy/80 leading-relaxed font-amharic">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {timeLabel && (
            <div className="flex items-center gap-3 rounded-xl border-2 border-mayor-gray-divider bg-slate-50/80 px-4 py-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent.pill}`}>
                <Clock className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs text-mayor-navy/45 font-amharic">
                  {lang === 'am' ? 'የተቀመጠው ስታንዳርድ' : lang === 'om' ? 'Sadarkaa' : 'Standard Time'}
                </p>
                <p className="text-sm font-semibold text-mayor-navy font-amharic">{timeLabel}</p>
              </div>
            </div>
          )}

          {!hideFee && service.fee != null && (
            <div className="rounded-xl border-2 border-mayor-gray-divider bg-slate-50/80 px-4 py-3">
              <div className="flex items-start gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent.pill}`}>
                  <Banknote className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-mayor-navy/45 font-amharic">
                    {lang === 'am' ? 'ክፍያ' : lang === 'om' ? 'Kaffaltii' : 'Fee'}
                  </p>
                  <p
                    className={`text-base sm:text-lg font-bold font-amharic mt-0.5 ${
                      service.fee === 0 ? 'text-green-600' : 'text-mayor-navy'
                    }`}
                  >
                    {feeLabel}
                  </p>
                </div>
              </div>
              {service.paymentMethod?.[lang] && (
                <p className="text-xs sm:text-sm text-mayor-navy/55 font-amharic mt-3 pt-3 border-t border-mayor-navy/8 leading-relaxed">
                  {service.paymentMethod[lang]}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
