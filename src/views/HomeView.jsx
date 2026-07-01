import { FileText, Shield, Zap } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { getWoredaLabel, getHeroSubtitle } from '../config/site'
import AnalyticsBar from '../components/AnalyticsBar'
import ChiefExecutiveSpotlight from '../components/ChiefExecutiveSpotlight'
import MissionVisionSection from '../components/MissionVisionSection'
import OfficialsSection from '../components/OfficialsSection'
import ProjectsCarousel from '../components/ProjectsCarousel'
import Footer from '../components/layout/Footer'

export default function HomeView({ onNavigate }) {
  const { lang } = useLanguage()

  const digitalServiceLabel =
    lang === 'am' ? 'ዲጂታል አገልግሎት' : lang === 'om' ? 'Tajaajila Dijitaalaa' : 'Digital Service'

  const liveBadge =
    lang === 'am' ? 'ዲጂታል አገልግሎት' : lang === 'om' ? 'Tajaajila Dijitaalaa Kallattiin' : 'Digital Services Live'

  const ctaPrimary =
    lang === 'am' ? 'አገልግሎቶች' : lang === 'om' ? 'Tajaajiloota Jalqabaa' : 'Get Started'

  const ctaSecondary =
    lang === 'am' ? 'አመራሮች' : lang === 'om' ? 'Hoggantoota' : 'Our Officials'

  const scrollToOfficials = () => {
    document.getElementById('officials')?.scrollIntoView({ behavior: 'smooth' })
  }

  const pills = [
    { icon: Zap, label: lang === 'am' ? 'ፈጣን' : lang === 'om' ? 'Saffisaa' : 'Fast' },
    { icon: Shield, label: lang === 'am' ? 'አስተማማኝ' : lang === 'om' ? 'Amanamaa' : 'Secure' },
    { icon: FileText, label: lang === 'am' ? 'ተደራሽ' : lang === 'om' ? 'Dhaqqabamaa' : 'Accessible' },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-28 sm:py-32 bg-mayor-navy">
        <div className="relative z-10 max-w-3xl mx-auto w-full text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium font-amharic mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {liveBadge}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight font-amharic mb-6">
            <span className="block">{getWoredaLabel(lang)}</span>
            <span className="block mt-2 text-mayor-highlight-blue">{digitalServiceLabel}</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-amharic mb-10">
            {getHeroSubtitle(lang)}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10">
            <button
              type="button"
              onClick={() => onNavigate('services')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-mayor-navy rounded-xl font-semibold hover:bg-blue-50 transition-colors font-amharic"
            >
              {ctaPrimary}
            </button>
            <button
              type="button"
              onClick={scrollToOfficials}
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-white border-2 border-white/40 rounded-xl font-semibold hover:bg-white/10 transition-colors font-amharic"
            >
              {ctaSecondary}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {pills.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white/90 text-sm font-amharic"
              >
                <Icon className="w-4 h-4 text-mayor-highlight-blue" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <AnalyticsBar overlap />

      <ChiefExecutiveSpotlight />

      <MissionVisionSection variant="compact" />

      <OfficialsSection variant="homepage" />

      <ProjectsCarousel
        onViewAll={() => onNavigate('projects')}
        onProjectClick={(id) => onNavigate('project', id)}
      />

      <Footer />
    </div>
  )
}
