import { useState, useEffect } from 'react'
import { Users, Building2, Briefcase } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { useSiteStats } from '../hooks/useSiteStats'

function useCountUp(target, active, duration = 2000) {
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
      const eased = 1 - Math.pow(1 - progress, 4) // Quarkt ease out
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
    <div className="group relative flex flex-col items-center text-center px-6 py-10 overflow-hidden hover:bg-slate-50/50 transition-colors duration-500">
      {/* Background glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-b ${accent.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}></div>
      
      <div
        className={`mb-6 relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md border ${accent.border} group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-500`}
      >
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-tr ${accent.iconBg} opacity-10`}></div>
        <Icon className={`h-8 w-8 ${accent.iconText} relative z-10`} strokeWidth={1.5} />
      </div>
      
      <p className="text-5xl font-bold text-mayor-navy tabular-nums tracking-tight relative z-10">
        {display}
        {suffix && <span className={`text-3xl ${accent.iconText} ml-1`}>{suffix}</span>}
      </p>
      
      <p className="mt-3 text-sm font-bold text-mayor-navy/50 font-amharic uppercase tracking-widest relative z-10">
        {label}
      </p>
      
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${accent.bar} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
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
        glow: 'from-blue-500/5 to-transparent',
        iconBg: 'from-blue-500 to-cyan-500',
        iconText: 'text-blue-600',
        border: 'border-blue-100',
        bar: 'from-blue-500 to-cyan-500',
      },
    },
    {
      icon: Building2,
      label: t('blocks'),
      value: blocks,
      suffix: '',
      accent: {
        glow: 'from-indigo-500/5 to-transparent',
        iconBg: 'from-indigo-500 to-purple-500',
        iconText: 'text-indigo-600',
        border: 'border-indigo-100',
        bar: 'from-indigo-500 to-purple-500',
      },
    },
    {
      icon: Briefcase,
      label: t('servicesCount'),
      value: services,
      suffix: '+',
      accent: {
        glow: 'from-emerald-500/5 to-transparent',
        iconBg: 'from-emerald-500 to-teal-500',
        iconText: 'text-emerald-600',
        border: 'border-emerald-100',
        bar: 'from-emerald-500 to-teal-500',
      },
    },
  ]

  return (
    <section
      className={`relative z-20 px-4 sm:px-6 ${overlap ? '-mt-24 mb-12' : 'py-12'}`}
      aria-label="Woreda statistics"
    >
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,45,92,0.1)] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/60 to-white/20 pointer-events-none"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 relative z-10">
            {items.map((item) => (
              <StatCell key={item.label} {...item} />
            ))}
          </div>
        </div>
        {loading && (
          <p className="text-center text-xs text-mayor-navy/40 font-amharic mt-4 animate-pulse">
            …
          </p>
        )}
      </div>
    </section>
  )
}
