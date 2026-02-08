import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { officialsByCategory } from '../data/officials'
import { staticLeadersByCategory } from '../data/staticLeaders'
import LeaderPageCard from '../components/LeaderPageCard'

export default function LeadersView({ onBack }) {
  const { t, lang } = useLanguage()

  // Define category order
  const categoryOrder = [
    'coordinating_committee',
    'party_committee',
    'commission_head',
    'office_heads'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-mayor-royal-blue/5 to-white">
      <div className="p-6 pt-24 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="mb-8 gov-button px-4 py-2 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('back')}</span>
          </button>

          {/* Header Section */}
          <div className="gov-header rounded-gov-xl p-8 mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 font-amharic">
              {lang === 'am' ? 'አመራሮቻችን' : lang === 'om' ? 'HOGGANTOOTA KEENYA' : 'OUR LEADERS'}
            </h1>
            <div className="w-32 h-1.5 bg-white/40 mx-auto rounded-full mb-2"></div>
            <p className="text-white/90 text-lg font-amharic mt-4">
              {lang === 'am'
                ? 'የወረዳ 9 አመራሮች እና አመራር ቡድን'
                : lang === 'om'
                  ? 'Garee Hoggansa Aanaa 9'
                  : 'Woreda 9 Leadership Team'
              }
            </p>
          </div>

          {/* Leaders by Category */}
          {categoryOrder.map((categoryKey, categoryIndex) => {
            const category = officialsByCategory[categoryKey]
            const staticCategory = staticLeadersByCategory[categoryKey]

            // Prioritize static leaders over dynamic officials
            // Static leaders have the updated full names, so use them when available
            // For categories that exist in both, prefer static leaders
            let allLeaders = []

            if (staticCategory?.leaders?.length > 0) {
              // Use static leaders (they have updated full names)
              allLeaders = staticCategory.leaders
            } else if (category?.officials?.length > 0) {
              // Fall back to dynamic officials if no static leaders
              allLeaders = category.officials
            }

            if (allLeaders.length === 0) return null

            // Use static category title if available, otherwise use dynamic
            const categoryTitle = staticCategory
              ? { am: staticCategory.title_am, en: staticCategory.title_en }
              : category
                ? { am: category.title_am, en: category.title_en }
                : null

            if (!categoryTitle) return null

            return (
              <div key={categoryKey} className={categoryIndex > 0 ? 'mt-16' : ''}>
                {/* Category Title */}
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-mayor-navy text-center font-amharic mb-4">
                    {lang === 'am' ? categoryTitle.am : lang === 'om' ? (categoryTitle.om || categoryTitle.en) : categoryTitle.en}
                  </h2>
                  <div className="w-32 h-1.5 bg-mayor-royal-blue mx-auto rounded-full"></div>
                </div>

                {/* Leaders Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {allLeaders.map((leader) => (
                    <LeaderPageCard key={leader.id} official={leader} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
