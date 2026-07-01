import { Search, KeyRound } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export default function UniqueCodeSearch({
  value,
  onChange,
  onSubmit,
  loading,
  prompt,
  notFound,
  showNotFound,
  children,
}) {
  const { t } = useLanguage()

  return (
    <div className="bg-white border-2 border-mayor-gray-divider rounded-2xl overflow-hidden">
      <div className="px-6 sm:px-8 pt-8 pb-6 text-center border-b border-mayor-navy/8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-mayor-navy/5 border-2 border-mayor-navy/10 mb-4">
          <KeyRound className="w-7 h-7 text-mayor-royal-blue" strokeWidth={1.75} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-mayor-navy font-amharic">
          {t('followUpByUniqueCode')}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-mayor-navy/55 font-amharic max-w-md mx-auto leading-relaxed">
          {prompt}
        </p>
      </div>

      <div className="p-6 sm:p-8">
        <form onSubmit={onSubmit} className="max-w-lg mx-auto">
          <label className="block text-xs font-semibold uppercase tracking-wider text-mayor-navy/45 font-amharic mb-3 text-center">
            {t('uniqueCode')}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            placeholder={t('enterUniqueCodePlaceholder')}
            maxLength={8}
            className="w-full px-4 py-4 rounded-xl bg-slate-50 border-2 border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/30 focus:outline-none focus:border-mayor-royal-blue focus:bg-white font-mono text-center text-2xl sm:text-3xl tracking-[0.35em] transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-mayor-navy hover:bg-mayor-deep-blue text-white rounded-xl font-semibold font-amharic transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <Search className="w-5 h-5" />
            <span>{loading ? t('searching') : t('search')}</span>
          </button>
        </form>

        {loading && (
          <div className="mt-8 text-center py-6">
            <div className="inline-block h-8 w-8 border-2 border-mayor-royal-blue/30 border-t-mayor-royal-blue rounded-full animate-spin" />
            <p className="mt-3 text-mayor-navy/60 font-amharic text-sm">{t('searching')}</p>
          </div>
        )}

        {!loading && showNotFound && (
          <div className="mt-8 max-w-lg mx-auto rounded-xl border-2 border-red-200 bg-red-50 px-5 py-4 text-center">
            <p className="text-red-700 font-amharic text-sm sm:text-base">{notFound}</p>
          </div>
        )}

        {!loading && children && <div className="mt-8">{children}</div>}
      </div>
    </div>
  )
}
