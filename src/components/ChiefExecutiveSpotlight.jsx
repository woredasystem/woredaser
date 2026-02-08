import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { Award, Target, Users, Zap, Crown, ChevronLeft, ChevronRight } from 'lucide-react'
import { officials } from '../data/officials'
import felekeImage from '../assets/ፈለቀ ደውዬ.jpg'

export default function ChiefExecutiveSpotlight() {
  const { t, lang } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)

  // Get Chief Executive (CEO) from officials
  const chiefExecutive = officials.find(o => o.role_key === 'ceo')

  // Define leaders with their speeches
  const leaders = [
    {
      id: 1,
      full_name_am: 'ወ/ሮ ጫልቱ አያና',
      full_name_en: 'Ms. Chaltu Ayana',
      full_name_om: 'Ad. Chaltuu Ayanaa',
      title_am: 'ዋና ሥራ አስፈፃሚ',
      title_en: 'Chief Executive',
      title_om: 'Hogganaa Ol\'aanaa',
      image_url: chiefExecutive?.image_url,
      speech: {
        am: [
          'የወረዳ 9 የዲጂታል ሽግግር ራይ - ሁሉንም ነዋሪዎች ወደ ዘመናዊ የአገልግሎት ስርዓት ለመሸጋገር እየሰራን ነን።',
          'በዚህ የዲጂታል ፖርታል በኩል፣ ነዋሪዎቻችን አገልግሎቶችን በቀላሉ፣ በፍጥነት እና በብቃት ማግኘት ይችላሉ። የእኛ ዋና ዓላማ ሁሉም ዜጎች ለመጠቀም የሚችሉ አገልግሎቶችን ማቅረብ ነው።',
          'የእኛ ቡድን በየቀኑ ለእርስዎ የተሻለ አገልግሎት ለመስጠት እየተጋ ነው። ቅሬታዎችን በቅልጥፍና እንቀበላለን እና እንፈታለን። ቀጠሮዎችን በመስመር ላይ ማዘዝ ይችላሉ።'
        ],
        om: [
          'Mul\'ata Jijjiirama Dijitaalaa Aanaa 9 - Jiraattoota hunda gara sirna tajaajila ammayyaatti ce\'uuf hojjechaa jirra.',
          'Karaa paanelii dijitaalaa kanaan, jiraattoonni keenya tajaajila salphaatti, saffisaan fi gahumsaan argachuu danda\'u. Kaayyoon keenya guddaan tajaajila lammoonni hundi itti fayyadamuu danda\'an dhiyeessuudha.',
          'Gareen keenya guyyaa guyyaan tajaajila fooyya\'aa isiniif kennuuf hojjechaa jira. Komii gahumsaan fudhanna fi ni furra. Beellama toora interneetii irratti qabachuu dandeessu.'
        ],
        en: [
          'Woreda 9 Digital Transformation Vision - We are working to transition all residents to a modern service system.',
          'Through this digital portal, our residents can access services easily, quickly, and efficiently. Our main goal is to provide services that all citizens can use.',
          'Our team is working every day to provide you with better service. We receive and resolve complaints efficiently. You can book appointments online.'
        ]
      }
    },
    {
      id: 2,
      full_name_am: 'አቶ ፈለቀ ደውዬ',
      full_name_en: 'Ato Feleke Dewuye',
      full_name_om: 'Obbo Feleke Dewuye',
      title_am: 'ወረዳ 9 ብልፅግና ፖርቲ ቅ/ፅ/ቤት ሀላፊ',
      title_en: 'Head, Woreda 9 Prosperity Party Office',
      title_om: 'Hogganaa Waajjira Paartii Badhaadhina Aanaa 9',
      image_url: felekeImage,
      speech: {
        am: [
          'አገልግሎት አሰጣጥን ቀልጣፋ ግልፀኝነትና ለአገልግሎት ምቹ ሁኔታን በመፍጠር   ፖርቲያችን የህዝብ አገልጋይነትንና ሰው ተኮር ፖሊሲያችንን  በአገልግሎት አሰጣጣችን እናረጋግጣለን!!'
        ],
        om: [
          'Kennaa tajaajila gahumsa qabu, iftoomina fi haala mijataa tajaajilaa uumuun, paartiin keenya uummataa tajaajiluu fi imaammata nama xiyyeeffate kennaa tajaajila keenyaan mirkaneessina!!'
        ],
        en: [
          'By creating transparent service delivery and convenient conditions for service, our party will demonstrate its people-serving nature and people-centered policy through our service delivery!!'
        ]
      }
    }
  ]

  const currentLeader = leaders[currentIndex]

  const nextLeader = () => {
    setCurrentIndex((prev) => (prev + 1) % leaders.length)
  }

  const prevLeader = () => {
    setCurrentIndex((prev) => (prev - 1 + leaders.length) % leaders.length)
  }

  return (
    <div className="relative py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-slate-50 skew-y-3 transform origin-top-left scale-110" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Section */}
          <div className="relative order-2 lg:order-1">
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group">
              <div className="aspect-[4/5] relative">
                {currentLeader?.image_url ? (
                  <img
                    src={currentLeader.image_url}
                    alt={lang === 'am' ? currentLeader.full_name_am : lang === 'om' ? currentLeader.full_name_om : currentLeader.full_name_en}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-mayor-deep-blue to-mayor-royal-blue flex items-center justify-center">
                    <span className="text-8xl text-white/20 font-bold">
                      {currentLeader?.full_name_en?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-mayor-navy/80 via-transparent to-transparent opacity-60" />

                {/* Floating Name Card */}
                <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white">
                  <h3 className="text-2xl font-bold font-amharic mb-1">
                    {lang === 'am' ? currentLeader.full_name_am : lang === 'om' ? currentLeader.full_name_om : currentLeader.full_name_en}
                  </h3>
                  <p className="text-white/80 font-amharic">
                    {lang === 'am' ? currentLeader.title_am : lang === 'om' ? currentLeader.title_om : currentLeader.title_en}
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-mayor-highlight-blue/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-mayor-royal-blue/20 rounded-full blur-3xl" />

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-6 lg:-left-12 z-20">
              <button
                onClick={prevLeader}
                className="p-4 bg-white rounded-full shadow-lg text-mayor-navy hover:bg-mayor-royal-blue hover:text-white transition-all duration-300 hover:scale-110 group"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-6 lg:-right-12 z-20">
              <button
                onClick={nextLeader}
                className="p-4 bg-white rounded-full shadow-lg text-mayor-navy hover:bg-mayor-royal-blue hover:text-white transition-all duration-300 hover:scale-110 group"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mayor-royal-blue/10 text-mayor-royal-blue font-medium text-sm">
              <Crown className="w-4 h-4" />
              {lang === 'am' ? 'የአመራር መልእክት' : lang === 'om' ? 'Ergaa Hogganaa' : 'Leadership Message'}
            </div>

            <div className="relative">
              <span className="absolute -top-8 -left-8 text-8xl text-mayor-royal-blue/10 font-serif">"</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-mayor-navy leading-tight font-amharic relative z-10">
                {lang === 'am' ? 'ለህዝብ አገልግሎት እና ለለውጥ ቁርጠኛ ነን' : lang === 'om' ? 'Tajaajila Ummataaf fi Jijjiiramaf Kutannoo Qabna' : 'Committed to Public Service and Transformation'}
              </h2>
            </div>

            <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-amharic">
              {currentLeader.speech[lang].map((paragraph, index) => (
                <p key={index} className={index === 0 ? 'text-mayor-navy font-medium' : ''}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-100">
              {[
                { icon: Zap, label: lang === 'am' ? 'ፈጣን አገልግሎት' : lang === 'om' ? 'Tajaajila Saffisaa' : 'Fast Service', color: 'text-amber-500', bg: 'bg-amber-50' },
                { icon: Users, label: lang === 'am' ? 'የህዝብ ተሳትፎ' : lang === 'om' ? 'Hirmaannaa Ummata' : 'Public Engagement', color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: Target, label: lang === 'am' ? 'የተሻለ ውጤት' : lang === 'om' ? 'Bu\'aa Fooyya\'aa' : 'Better Results', color: 'text-green-500', bg: 'bg-green-50' },
                { icon: Award, label: lang === 'am' ? 'ከፍተኛ ጥራት' : lang === 'om' ? 'Qulqullina Olaanaa' : 'High Quality', color: 'text-purple-500', bg: 'bg-purple-50' },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4 group cursor-default">
                  <div className={`p-3 rounded-xl ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-mayor-navy font-amharic">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

