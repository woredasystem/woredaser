import { useLanguage } from '../../hooks/useLanguage'

export function CitizenPortalTabs({ mode, onModeChange, fileOption, trackOption }) {
  const options = [
    { id: 'file', ...fileOption },
    { id: 'track', ...trackOption },
  ]

  return (
    <div className="flex justify-center mb-6 sm:mb-8">
      <div
        className="inline-flex w-full max-w-md sm:max-w-lg p-1.5 bg-white border-2 border-mayor-gray-divider rounded-2xl shadow-sm"
        role="tablist"
      >
        {options.map((option) => {
          const active = mode === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onModeChange(option.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-5 py-3 rounded-xl text-sm sm:text-base font-semibold font-amharic transition-all duration-200 ${
                active
                  ? 'bg-mayor-navy text-white shadow-md'
                  : 'text-mayor-navy/55 hover:text-mayor-navy hover:bg-slate-50'
              }`}
            >
              <option.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CitizenStepsPanel({ steps, accentClass = 'bg-mayor-royal-blue' }) {
  const { lang } = useLanguage()

  return (
    <div className="mb-6 sm:mb-8 bg-white border-2 border-mayor-gray-divider rounded-2xl overflow-hidden">
      <div className={`h-1 ${accentClass}`} />
      <div className="px-4 sm:px-6 py-4 sm:py-5">
        <p className="text-xs font-bold uppercase tracking-widest text-mayor-navy/40 font-amharic mb-4 text-center sm:text-left">
          {lang === 'am' ? 'እንዴት ይሠራል?' : lang === 'om' ? 'Akka itti hojjetu' : 'How it works'}
        </p>
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {steps.map((step, i) => (
            <li key={step.title} className="flex sm:flex-col items-start sm:items-center sm:text-center gap-3 sm:gap-0">
              <span
                className={`flex h-8 w-8 shrink-0 sm:mb-3 items-center justify-center rounded-lg text-sm font-bold text-white ${accentClass}`}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-mayor-navy font-amharic text-sm leading-snug">
                  {step.title}
                </p>
                <p className="mt-1 text-xs text-mayor-navy/55 font-amharic leading-relaxed">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export default function CitizenPortalFrame({ mode, onModeChange, fileOption, trackOption, steps, accentClass, children }) {
  return (
    <div className="max-w-5xl mx-auto">
      <CitizenPortalTabs
        mode={mode}
        onModeChange={onModeChange}
        fileOption={fileOption}
        trackOption={trackOption}
      />

      <CitizenStepsPanel steps={steps} accentClass={accentClass} />

      <div className="min-w-0">{children}</div>
    </div>
  )
}
