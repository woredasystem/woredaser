import { getLeadershipTeamSubtitle } from '../config/site'
import { useLanguage } from '../hooks/useLanguage'
import { useOfficials } from '../hooks/useOfficials'
import ChiefExecutiveSpotlight from './ChiefExecutiveSpotlight'
import LeadershipCarousel from './LeadershipCarousel'
import SectionHeading from './layout/SectionHeading'
import LeaderPageCard from './LeaderPageCard'

export default function OfficialsSection({ variant = 'full' }) {
  const { lang } = useLanguage()
  const { officials, loading } = useOfficials()

  const isHomepage = variant === 'homepage'
  const sectionClass = isHomepage
    ? 'py-24 sm:py-32 scroll-mt-24 bg-slate-50/50'
    : 'py-12 sm:py-16 scroll-mt-24 border-t border-mayor-gray-divider mt-12'

  return (
    <section id="officials" className={sectionClass}>
      <div className={isHomepage ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : ''}>
        {!isHomepage && (
          <SectionHeading
            label={lang === 'am' ? 'አመራሮች' : lang === 'om' ? 'Hoggantoota' : 'Leadership'}
            title={lang === 'am' ? 'አመራሮቻችን' : lang === 'om' ? 'Hoggantoota Keenya' : 'Our Officials'}
            description={getLeadershipTeamSubtitle(lang)}
            align="left"
          />
        )}

        {variant === 'full' && (
          <div className="space-y-12 mb-12">
            <ChiefExecutiveSpotlight />
            <LeadershipCarousel />
          </div>
        )}

        {isHomepage && <LeadershipCarousel embedded />}

        {loading ? (
          <p className="text-mayor-navy/60 font-amharic py-8">
            {lang === 'am' ? 'በመጫን ላይ...' : 'Loading...'}
          </p>
        ) : officials.length === 0 && !isHomepage ? (
          <p className="text-mayor-navy/60 font-amharic py-8 text-center bg-slate-50 rounded-2xl">
            {lang === 'am'
              ? 'አመራሮች በአስተዳደር ፓንል ይታከላሉ'
              : 'Officials are added through the Admin Portal'}
          </p>
        ) : variant === 'compact' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {officials.map((leader) => (
              <LeaderPageCard key={leader.id} official={leader} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
