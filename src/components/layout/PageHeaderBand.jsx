import { ArrowLeft } from 'lucide-react'

export default function PageHeaderBand({ title, subtitle, onBack, backLabel }) {
  if (!title && !subtitle) return null

  return (
    <header className="mb-8 sm:mb-10 text-center">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-mayor-navy/50 hover:text-mayor-royal-blue transition-colors font-amharic group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          {backLabel}
        </button>
      )}

      <div className="pb-8 border-b border-mayor-navy/10">
        {title && (
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-mayor-navy font-amharic leading-tight tracking-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="mt-2 sm:mt-3 text-base sm:text-lg text-mayor-navy/55 font-amharic max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="flex items-center justify-center gap-2 mt-5" aria-hidden="true">
          <span className="w-2 h-2 rounded-full bg-mayor-royal-blue/25" />
          <span className="w-10 h-0.5 rounded-full bg-mayor-royal-blue" />
          <span className="w-2 h-2 rounded-full bg-mayor-royal-blue/25" />
        </div>
      </div>
    </header>
  )
}
