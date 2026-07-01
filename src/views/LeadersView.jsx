import { getLeadershipTeamSubtitle } from '../config/site'
import { useLanguage } from '../hooks/useLanguage'
import { useOfficials } from '../hooks/useOfficials'
import LeaderPageCard from '../components/LeaderPageCard'
import PublicPageLayout from '../components/layout/PublicPageLayout'

export default function LeadersView({ onBack }) {
  const { lang } = useLanguage()
  const { officials, loading } = useOfficials()

  return (
    <PublicPageLayout
      title={lang === 'am' ? 'አመራሮቻችን' : lang === 'om' ? 'Hoggantoota Keenya' : 'Our Leaders'}
      subtitle={getLeadershipTeamSubtitle(lang)}
      onBack={onBack}
      maxWidth="max-w-7xl"
    >
      {loading ? (
        <p className="text-center text-mayor-navy/60 font-amharic py-16">
          {lang === 'am' ? 'በመጫን ላይ...' : 'Loading...'}
        </p>
      ) : officials.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-mayor-gray-divider">
          <p className="text-mayor-navy/60 font-amharic">
            {lang === 'am'
              ? 'አመራሮች በአስተዳደር ፓንል ይታከላሉ'
              : 'Officials are added through the Admin Portal'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {officials.map((leader) => (
            <LeaderPageCard key={leader.id} official={leader} />
          ))}
        </div>
      )}
    </PublicPageLayout>
  )
}
