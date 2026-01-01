import { useLanguage } from '../hooks/useLanguage'
import { useState, useEffect } from 'react'
import { Users, Building2, Briefcase } from 'lucide-react'
import { services } from '../data/services'

export default function AnalyticsBar() {
  const { t } = useLanguage()
  const [counts, setCounts] = useState({
    population: 0,
    blocks: 0,
    services: 0
  })

  // Calculate total services count from all sectors
  const getTotalServicesCount = () => {
    let total = 0
    Object.values(services).forEach(sector => {
      if (sector.items && Array.isArray(sector.items)) {
        total += sector.items.length
      }
    })
    return total
  }

  useEffect(() => {
    // Animate counters
    const totalServices = getTotalServicesCount()
    const targets = {
      population: 57000,
      blocks: 55,
      services: totalServices
    }

    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setCounts({
        population: Math.floor(targets.population * progress),
        blocks: Math.floor(targets.blocks * progress),
        services: Math.floor(targets.services * progress)
      })

      if (currentStep >= steps) {
        clearInterval(interval)
        setCounts(targets)
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }, [])

  const stats = [
    { label: t('population'), value: counts.population.toLocaleString(), suffix: '+', icon: Users },
    { label: t('blocks'), value: counts.blocks, suffix: '', icon: Building2 },
    { label: t('servicesCount'), value: counts.services, suffix: '+', icon: Briefcase }
  ]

  return (
    <div className="w-full max-w-7xl mx-auto px-6 mb-16 relative z-20 -mt-10">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-mayor-royal-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-mayor-highlight-blue/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="relative group text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-6 p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-mayor-royal-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 text-mayor-royal-blue">
                  <Icon className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-green-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>

              <div>
                <div className="text-4xl lg:text-5xl font-bold text-mayor-navy mb-1 tracking-tight">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-gray-500 font-amharic font-medium text-lg uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

