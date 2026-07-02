import { useState, useEffect, useRef, useMemo } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { pickLocalized } from '../utils/localized'
import { getStatIcon, getStatTheme } from '../utils/siteStatPresets'

const STATS_PER_ROW = 4

function useCountUp(target, active, duration = 2200) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) {
      setValue(0)
      return
    }
    if (target <= 0) {
      setValue(target)
      return
    }

    const startTime = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setValue(Math.floor(target * eased))
      if (progress < 1) requestAnimationFrame(tick)
      else setValue(target)
    }

    requestAnimationFrame(tick)
  }, [target, active, duration])

  return value
}

function chunkRows(items, size) {
  const rows = []
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size))
  }
  return rows
}

function StatTile({ item, animate, label, isLastInRow }) {
  const Icon = getStatIcon(item.icon)
  const theme = getStatTheme(item.theme)
  const display = useCountUp(item.value, animate)

  return (
    <article
      className={`group relative flex items-center justify-center sm:justify-start gap-4 sm:gap-5 px-6 sm:px-8 lg:px-10 py-7 sm:py-8 min-h-[5.5rem] w-full sm:w-1/2 lg:w-1/4 max-w-md ${
        !isLastInRow ? 'sm:border-r border-slate-100/90' : ''
      }`}
    >
      <div
        className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ${theme.iconRing} group-hover:scale-105 transition-transform duration-300`}
      >
        <div className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl ${theme.iconBg}`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${theme.iconText}`} strokeWidth={1.75} />
        </div>
      </div>

      <div className="text-left min-w-0 flex-1">
        <p className="text-3xl sm:text-4xl lg:text-[2.5rem] font-bold text-mayor-navy tabular-nums tracking-tight leading-none">
          {display.toLocaleString()}
          {item.suffix && (
            <span className={`text-xl sm:text-2xl lg:text-3xl font-bold ${theme.suffix} ml-0.5`}>
              {item.suffix}
            </span>
          )}
        </p>
        <p className="mt-1.5 text-sm sm:text-base font-semibold text-mayor-navy/50 font-amharic truncate">
          {label}
        </p>
      </div>

      <div
        className={`hidden sm:block absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r ${theme.bar} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left opacity-70`}
      />
    </article>
  )
}

export default function SiteStatsShowcase({
  items = [],
  loading = false,
  animate: animateProp,
  className = '',
  variant = 'homepage',
}) {
  const { lang } = useLanguage()
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  const activeItems = items.filter((item) => item.is_active !== false)
  const isHomepage = variant === 'homepage'
  const rows = useMemo(() => chunkRows(activeItems, STATS_PER_ROW), [activeItems])

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true)
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const shouldAnimate = animateProp !== undefined ? animateProp : inView

  if (!loading && activeItems.length === 0) return null

  return (
    <section
      ref={ref}
      className={`relative z-10 w-full ${
        isHomepage
          ? 'bg-white border-t border-slate-100 px-4 sm:px-6 lg:px-10 pt-10 pb-12 sm:pt-12 sm:pb-14'
          : 'px-0 py-4'
      } ${className}`}
      aria-label={lang === 'am' ? 'የወረዳ ስታትስቲክስ' : 'Woreda statistics'}
    >
      <div className={`${isHomepage ? 'max-w-[90rem]' : 'max-w-full'} mx-auto w-full`}>
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_-16px_rgba(0,45,92,0.12)]">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80 pointer-events-none" />

          {loading ? (
            <div className="flex flex-wrap justify-center relative z-10 border-b border-slate-100">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-full sm:w-1/2 lg:w-1/4 max-w-md flex items-center gap-5 px-8 py-8 animate-pulse ${
                    i < 3 ? 'sm:border-r border-slate-100' : ''
                  }`}
                >
                  <div className="h-14 w-14 rounded-2xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-9 w-32 rounded-lg bg-slate-200" />
                    <div className="h-4 w-24 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative z-10">
              {rows.map((row, rowIndex) => (
                <div
                  key={`row-${rowIndex}`}
                  className={`flex flex-wrap justify-center ${
                    rowIndex > 0 ? 'border-t border-slate-100/90' : ''
                  }`}
                >
                  {row.map((item, colIndex) => (
                    <StatTile
                      key={item.id || `${item.label_am}-${item.sort_order}`}
                      item={item}
                      animate={shouldAnimate && !loading}
                      label={pickLocalized(item, 'label', lang)}
                      isLastInRow={colIndex === row.length - 1}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
