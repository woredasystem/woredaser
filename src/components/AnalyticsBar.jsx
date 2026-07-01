import { useState, useEffect } from 'react'
import { Users, Building2, Briefcase } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { useSiteStats } from '../hooks/useSiteStats'

function useCountUp(target, active, duration = 1600) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active || target <= 0) {
      setValue(target)
      return
    }

    let start = 0
    const startTime = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setValue(Math.floor(start + (target - start) * eased))
      if (progress < 1) requestAnimationFrame(tick)
      else setValue(target)
    }

    requestAnimationFrame(tick)
  }, [target, active, duration])

  return value
}

function StatCell({ icon: Icon, label, value, suffix, accent }) {
  const display = value.toLocaleString()

  return (
    <div className="group relative flex flex-col items-center text-center px-6 py-8 sm:py-10 md:py-12">
      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border-2 ${accent.border} ${accent.bg}`}
      >
        <Icon className={`h-7 w-7 ${accent.icon}`} strokeWidth={1.75} />
      </div>
      <p className="text-4xl sm:text-5xl font-bold text-mayor-navy tabular-nums tracking-tight">
        {display}
        {suffix && <span className="text-2xl sm:text-3xl text-mayor-royal-blue ml-0.5">{suffix}</span>}
      </p>
      <p className="mt-3 text-base sm:text-lg font-semibold text-mayor-navy/70 font-amharic uppercase tracking-wide">
        {label}
      </p>
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-12 ${accent.bar} rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />
    </div>
  )
}

export default function AnalyticsBar({ overlap = false }) {
  const { t } = useLanguage()
  const { stats, loading } = useSiteStats()

  const pop = useCountUp(stats.population, !loading)
  const blocks = useCountUp(stats.blocks, !loading)
  const services = useCountUp(stats.services_count, !loading)

  const items = [
    {
      icon: Users,
      label: t('population'),
      value: pop,
      suffix: '+',
      accent: {
        border: 'border-mayor-royal-blue/30',
        bg: 'bg-mayor-royal-blue/8',
        icon: 'text-mayor-royal-blue',
        bar: 'bg-mayor-royal-blue',
      },
    },
    {
      icon: Building2,
      label: t('blocks'),
      value: blocks,
      suffix: '',
      accent: {
        border: 'border-mayor-deep-blue/30',
        bg: 'bg-mayor-deep-blue/8',
        icon: 'text-mayor-deep-blue',
        bar: 'bg-mayor-deep-blue',
      },
    },
    {
      icon: Briefcase,
      label: t('servicesCount'),
      value: services,
      suffix: '+',
      accent: {
        border: 'border-mayor-navy/25',
        bg: 'bg-mayor-navy/5',
        icon: 'text-mayor-navy',
        bar: 'bg-mayor-navy',
      },
    },
  ]

  return (
    <section
      className={`relative z-20 px-4 sm:px-6 ${overlap ? '-mt-20 sm:-mt-24 mb-8' : 'py-8'}`}
      aria-label="Woreda statistics"
    >
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border-2 border-mayor-gray-divider rounded-2xl shadow-[0_8px_30px_rgba(10,42,74,0.08)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-mayor-gray-divider">
            {items.map((item) => (
              <StatCell key={item.label} {...item} />
            ))}
          </div>
        </div>
        {loading && (
          <p className="text-center text-xs text-mayor-navy/40 font-amharic mt-3 animate-pulse">
            …
          </p>
        )}
      </div>
    </section>
  )
}
