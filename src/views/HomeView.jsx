import { FileText, Shield, Zap, ArrowRight, ChevronRight, CheckCircle2, Calendar, Megaphone } from 'lucide-react'
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
    lang === 'am' ? 'አገልግሎቶች' : lang === 'om' ? 'Tajaajiloota Jalqabaa' : 'Explore Services'

  const ctaSecondary =
    lang === 'am' ? 'አመራሮች' : lang === 'om' ? 'Hoggantoota' : 'Meet the Leaders'

  const scrollToOfficials = () => {
    document.getElementById('officials')?.scrollIntoView({ behavior: 'smooth' })
  }

  const pills = [
    { icon: Zap, label: lang === 'am' ? 'ፈጣን' : lang === 'om' ? 'Saffisaa' : 'Fast & Seamless' },
    { icon: Shield, label: lang === 'am' ? 'አስተማማኝ' : lang === 'om' ? 'Amanamaa' : 'Secure Platform' },
    { icon: FileText, label: lang === 'am' ? 'ተደራሽ' : lang === 'om' ? 'Dhaqqabamaa' : 'Fully Accessible' },
  ]

  const heroQuickActions = [
    {
      id: 'services',
      icon: FileText,
      label: lang === 'am' ? 'አገልግሎቶች' : lang === 'om' ? 'Tajaajiloota' : 'Services',
      hint: lang === 'am'
        ? 'ካታሎግ ይመልከቱ እና መስፈርቶች ያግኙ'
        : lang === 'om'
          ? 'Kaataalooogii fi haalawwan barbaadi'
          : 'Browse catalog & requirements',
    },
    {
      id: 'appointments',
      icon: Calendar,
      label: lang === 'am' ? 'ቀጠሮ' : lang === 'om' ? 'Beellama' : 'Appointments',
      hint: lang === 'am'
        ? 'ቀጠሮ ይዘዙ ወይም በኮድ ይከታተሉ'
        : lang === 'om'
          ? 'Beellama ajaji ykn koodii fayyadami'
          : 'Book a slot or track by code',
    },
    {
      id: 'complaints',
      icon: Megaphone,
      label: lang === 'am' ? 'ቅሬታ' : lang === 'om' ? 'Komii' : 'Complaints',
      hint: lang === 'am'
        ? 'ቅሬታ ያስገቡ ወይም ሁኔታ ይመልከቱ'
        : lang === 'om'
          ? 'Komii galchi ykn haala hordofi'
          : 'Submit or follow a complaint',
    },
  ]

  const heroCardTitle =
    lang === 'am' ? 'የዜጎች አገልግሎት ማዕከል' : lang === 'om' ? 'Giddugala Tajaajila Hawaasaa' : 'Citizen Service Center'

  const heroCardBody =
    lang === 'am'
      ? 'የወረዳውን አስተዳደር እና አገልግሎቶች በአንድ ቦታ የሚያገኙበት ዘመናዊ ዲጂታል ሥርዓት።'
      : lang === 'om'
        ? 'Sirna dijitaalaa ammayyaa bulchiinsa fi tajaajiloota naannoo bakka tokkotti argachuuf.'
        : 'A modern digital system where you can access woreda administration and services in one place.'

  return (
    <div className="min-h-screen bg-white flex flex-col font-english overflow-x-hidden">
      {/* Hero Section with Aurora Background */}
      <section className="aurora-bg min-h-screen flex items-center justify-center px-4 sm:px-6 py-32 relative">
        {/* Abstract shapes for extra depth */}
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-brand-ray/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <div className="lg:col-span-7 text-left space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel-dark text-white/90 text-sm font-semibold tracking-wide border-white/20 shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              {liveBadge}
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight font-amharic drop-shadow-lg">
              <span className="block mb-2">{getWoredaLabel(lang)}</span>
              <span className="text-gradient-light block">{digitalServiceLabel}</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed font-amharic font-medium">
              {getHeroSubtitle(lang)}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => onNavigate('services')}
                className="group w-full sm:w-auto px-8 py-4 bg-white text-brand-dark rounded-xl font-bold text-lg hover:bg-slate-50 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:-translate-y-1 flex items-center justify-center gap-2 font-amharic"
              >
                {ctaPrimary}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                type="button"
                onClick={scrollToOfficials}
                className="group w-full sm:w-auto px-8 py-4 bg-transparent text-white border border-white/30 rounded-xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center gap-2 font-amharic"
              >
                {ctaSecondary}
                <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 pt-6 opacity-90">
              {pills.map(({ icon: Icon, label }, idx) => (
                <div key={label} className={`flex items-center gap-2 text-sm text-white/90 font-medium font-amharic animate-fade-in-up delay-${(idx+1)*100}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:flex justify-center relative animate-float">
             <div className="relative w-full max-w-md aspect-[4/5] glass-panel-dark rounded-[2rem] border border-white/20 p-8 shadow-2xl overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-ray/30 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 space-y-6">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white leading-tight font-amharic">
                    {heroCardTitle}
                  </h3>
                  <p className="text-white/70 font-amharic leading-relaxed">
                    {heroCardBody}
                  </p>
                </div>

                <div className="relative z-10 space-y-3 mt-8">
                  {heroQuickActions.map(({ id, icon: Icon, label, hint }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onNavigate(id)}
                      className="w-full h-auto min-h-[3.5rem] rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center px-4 py-3 gap-3 overflow-hidden group hover:bg-white/10 hover:border-white/20 transition-all text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-brand-ray/30 transition-colors">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white font-amharic truncate">{label}</p>
                        <p className="text-xs text-white/55 font-amharic truncate mt-0.5">{hint}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/40 shrink-0 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      <AnalyticsBar />

      {/* Main Content Layout */}
      <div className="relative z-20">
        <ChiefExecutiveSpotlight />
        <MissionVisionSection variant="compact" />
        <OfficialsSection variant="homepage" />
        <ProjectsCarousel
          onViewAll={() => onNavigate('projects')}
          onProjectClick={(id) => onNavigate('project', id)}
        />
      </div>

      <Footer />
    </div>
  )
}
