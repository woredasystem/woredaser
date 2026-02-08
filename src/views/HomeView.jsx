import { useLanguage } from '../hooks/useLanguage'
import HeroButton from '../components/HeroButton'
import AnalyticsBar from '../components/AnalyticsBar'
import ChiefExecutiveSpotlight from '../components/ChiefExecutiveSpotlight'
import LeadershipCarousel from '../components/LeadershipCarousel'
import logo from '../assets/logo1.png'
import heroBg from '../assets/hero-bg.jpg'

export default function HomeView({ onNavigate }) {
  const { t, lang } = useLanguage()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Modern Split Layout */}
      <section className="relative min-h-screen flex items-center px-6 pt-24 pb-12 overflow-hidden bg-slate-50">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-full lg:w-[45%] h-full bg-mayor-deep-blue clip-path-diagonal opacity-[0.98]" />
          <div
            className="absolute top-0 right-0 w-full h-full bg-cover bg-center opacity-10 mix-blend-overlay"
            style={{ backgroundImage: `url(${heroBg})` }}
          />

          {/* Animated Shapes */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-mayor-royal-blue rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-40 right-40 w-64 h-64 bg-mayor-highlight-blue rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          {/* Left Content - Welcome Message */}
          <div className="text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white lg:bg-mayor-deep-blue/5 lg:border-mayor-deep-blue/10 lg:text-mayor-deep-blue font-medium text-sm animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {lang === 'am' ? 'ዲጂታል አገልግሎት' : lang === 'om' ? 'Tajaajila Dijitaalaa Kallattiin' : 'Digital Services Live'}
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white lg:text-mayor-navy leading-tight animate-fade-in-up delay-100">
              {lang === 'am' ? (
                <>
                  የወረዳ 9 <br />
                  <span className="text-blue-200 lg:text-transparent lg:bg-clip-text lg:bg-gradient-to-r lg:from-mayor-royal-blue lg:to-mayor-deep-blue">
                    ዲጂታል አገልግሎት
                  </span>
                </>
              ) : lang === 'om' ? (
                <>
                  Aanaa 9 <br />
                  <span className="text-blue-200 lg:text-transparent lg:bg-clip-text lg:bg-gradient-to-r lg:from-mayor-royal-blue lg:to-mayor-deep-blue">
                    Tajaajila Dijitaalaa
                  </span>
                </>
              ) : (
                <>
                  Woreda 9 <br />
                  <span className="text-blue-200 lg:text-transparent lg:bg-clip-text lg:bg-gradient-to-r lg:from-mayor-royal-blue lg:to-mayor-deep-blue">
                    Digital Service
                  </span>
                </>
              )}
            </h1>

            <p className="text-xl text-blue-50 lg:text-gray-600 max-w-lg leading-relaxed animate-fade-in-up delay-200 font-amharic">
              {lang === 'am'
                ? 'የአቃቂ ቃሊቲ ክፍለ ከተማ ወረዳ 9 አስተዳደር አገልግሎቶችን በዲጂታል መንገድ ያግኙ። ፈጣን፣ ቀልጣፋ እና ተደራሽ።'
                : lang === 'om'
                  ? 'Tajaajila bulchiinsa Aanaa 9 Magaalaa Xiqqoo Akaki Qaaliitii karaa dijitaalaatiin argadhaa. Saffisaa, gahumsa qabu fi dhaqqabamaa.'
                  : 'Access Akaki Kality Sub-City Woreda 9 administration services digitally. Fast, efficient, and accessible.'
              }
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-in-up delay-300">
              <button
                onClick={() => onNavigate('services')}
                className="px-8 py-4 bg-mayor-deep-blue text-white rounded-xl font-semibold shadow-lg shadow-mayor-deep-blue/30 hover:bg-mayor-navy hover:scale-105 transition-all duration-300"
              >
                {lang === 'am' ? 'አገልግሎቶችን ይጀምሩ' : lang === 'om' ? 'Tajaajiloota Jalqabaa' : 'Get Started'}
              </button>
              <button className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 lg:bg-white lg:text-mayor-deep-blue lg:border-gray-200 lg:hover:bg-gray-50 lg:hover:border-mayor-deep-blue/30 transition-all duration-300">
                {lang === 'am' ? 'ስለ እና' : lang === 'om' ? 'Waa\'ee Keenya' : 'Learn More'}
              </button>
            </div>
          </div>

          {/* Right Content - Service Dashboard Card */}
          <div className="relative animate-fade-in-up delay-400">
            {/* Glass Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/5 opacity-100" />

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8 text-white">
                  <div>
                    <h3 className="text-2xl font-bold font-amharic">
                      {lang === 'am' ? 'ፈጣን አገልግሎቶች' : lang === 'om' ? 'Tajaajiloota Saffisaa' : 'Quick Services'}
                    </h3>
                    <p className="text-white/70 text-sm">
                      {lang === 'am' ? 'የሚፈልጉትን አገልግሎት ይምረጡ' : lang === 'om' ? 'Tajaajila barbaaddan filadhaa' : 'Select a service to proceed'}
                    </p>
                  </div>
                  <div className="p-2 bg-white/10 rounded-lg">
                    <img src={logo} alt="Logo" className="w-8 h-8 opacity-80" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <HeroButton
                    type="services"
                    onClick={() => onNavigate('services')}
                    label={t('services')}
                  />
                  <HeroButton
                    type="complaints"
                    onClick={() => onNavigate('complaints')}
                    label={t('complaints')}
                  />
                  <HeroButton
                    type="appointments"
                    onClick={() => onNavigate('appointments')}
                    label={t('appointments')}
                  />
                  <HeroButton
                    type="leaders"
                    onClick={() => onNavigate('leaders')}
                    label={t('leaders')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Sections - Separated from Hero */}
      <section className="relative bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Analytics Bar */}
          <AnalyticsBar />

          {/* Chief Executive Spotlight */}
          <ChiefExecutiveSpotlight />

          {/* Leadership Carousel */}
          <LeadershipCarousel />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-mayor-navy text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="font-amharic font-semibold mb-1">
                {lang === 'am' ? 'አቃኪ ቃሊቲ ክፍለ ከተማ ወረዳ 9' : lang === 'om' ? 'Aanaa 9 Magaalaa Xiqqoo Akaki Qaaliitii' : 'Akaki Kality Sub-City Woreda 9'}
              </p>
              <p className="text-sm text-white/80 font-amharic">
                {lang === 'am' ? 'ዲጂታል አገልግሎት ፖርታል' : lang === 'om' ? 'Paanelii Tajaajila Dijitaalaa' : 'Digital Service Portal'}
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-white/70 font-amharic">
                {lang === 'am'
                  ? `© ${new Date().getFullYear()} ወረዳ 9. ሁሉም መብቶች የተጠበቁ ናቸው።`
                  : lang === 'om'
                    ? `© ${new Date().getFullYear()} Aanaa 9. Mirgi hundi eegameera.`
                    : `© ${new Date().getFullYear()} Woreda 9. All rights reserved.`
                }
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

