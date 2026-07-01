import { MessageSquareQuote, Quote } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { useOfficials } from '../hooks/useOfficials'
import { pickLocalized } from '../utils/localized'
import { leadershipSpeech } from '../data/leadershipMessages'
import SectionHeading from './layout/SectionHeading'

const SAMPLE_LEADER = {
  full_name_am: 'አቶ ተመስገን በላይ',
  full_name_en: 'Mr. Temesgen Belachew',
  title_am: 'ዋና ሥራ አስፈፃሚ',
  title_en: 'Chief Executive',
  image_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=480&h=560&fit=crop',
  bio_am: leadershipSpeech.am.join('\n\n'),
  bio_en: leadershipSpeech.en.join('\n\n'),
  bio_om: leadershipSpeech.om.join('\n\n'),
}

function getFeaturedLeader(officials) {
  return (
    officials.find((o) => o.show_on_home) ||
    officials.find((o) => o.role_key === 'ceo') ||
    officials[0] ||
    null
  )
}

function getMessageParagraphs(leader, lang) {
  const bio = pickLocalized(leader, 'bio', lang)
  if (bio?.trim()) {
    return bio.split(/\n\n+/).filter(Boolean)
  }
  return leadershipSpeech[lang] || leadershipSpeech.en
}

function LeaderCard({ leader, lang, compact }) {
  const name = pickLocalized(leader, 'full_name', lang)
  const title = pickLocalized(leader, 'title', lang)
  const paragraphs = getMessageParagraphs(leader, lang)
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)

  return (
    <div className={`relative isolate w-full ${compact ? '' : 'pt-10'}`}>
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-gradient-to-br from-mayor-royal-blue/10 to-transparent rounded-full blur-3xl opacity-50"></div>
      
      <div className={`flex flex-col ${compact ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12 items-center`}>
        
        {/* Image Column */}
        <div className={`w-full lg:w-2/5 shrink-0 relative ${compact ? 'max-w-md mx-auto' : ''}`}>
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,45,92,0.15)] group">
            {leader.image_url ? (
              <img
                src={leader.image_url}
                alt={name}
                className="w-full aspect-[4/5] object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full aspect-[4/5] flex items-center justify-center bg-gradient-to-br from-mayor-navy to-mayor-royal-blue text-white/50 font-bold text-6xl">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-mayor-navy/80 via-transparent to-transparent opacity-80 mix-blend-multiply"></div>
            
            {/* Image Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="text-2xl font-bold font-amharic mb-1 drop-shadow-md">{name}</h3>
              <p className="text-white/80 font-medium font-amharic flex items-center gap-2">
                <span className="w-6 h-[2px] bg-mayor-highlight-blue block"></span>
                {title}
              </p>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-mayor-royal-blue to-mayor-highlight-blue rounded-full opacity-20 blur-xl"></div>
          <div className="absolute top-10 -left-6 w-12 h-12 bg-mayor-highlight-blue rounded-full opacity-20 blur-md"></div>
        </div>

        {/* Content Column */}
        <div className="w-full lg:w-3/5 relative">
          <div className="absolute -top-10 -left-10 text-mayor-gray-divider opacity-20">
            <Quote size={120} strokeWidth={1} />
          </div>
          
          <div className="relative z-10 bg-white/70 backdrop-blur-xl border border-white p-8 sm:p-10 lg:p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,45,92,0.04)]">
            {!compact && (
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-mayor-gray-divider/50">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-mayor-royal-blue to-mayor-navy shadow-lg shadow-mayor-royal-blue/20">
                  <MessageSquareQuote className="h-8 w-8 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mayor-navy to-mayor-royal-blue font-amharic">
                    {name}
                  </h3>
                  <p className="text-base text-mayor-navy/60 font-medium font-amharic uppercase tracking-wider mt-1">{title}</p>
                </div>
              </div>
            )}

            <blockquote className="space-y-6">
              {paragraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className={`font-amharic leading-relaxed relative z-10 ${
                    i === 0
                      ? 'text-mayor-navy text-xl sm:text-2xl font-bold tracking-tight'
                      : 'text-mayor-navy/70 text-lg'
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </blockquote>
            
            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-mayor-royal-blue/20 to-transparent"></div>
              <div className="w-3 h-3 rounded-full bg-mayor-royal-blue/40"></div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default function LeaderMessageSection({ variant = 'compact' }) {
  const { lang } = useLanguage()
  const { officials, loading } = useOfficials()
  const featured = variant === 'featured'

  const leader = getFeaturedLeader(officials) || (!loading ? SAMPLE_LEADER : null)

  const sectionLabel =
    lang === 'am' ? 'የአመራር መልእክት' : lang === 'om' ? 'Ergaa Hogganaa' : 'Leadership Message'

  const sectionTitle =
    lang === 'am' ? 'ከአመራር ዘንድ' : lang === 'om' ? 'Ergaa Hogganaa' : 'From Our Leadership'

  const sectionDesc =
    lang === 'am'
      ? 'የወረዳ አመራር ለህዝቡ የሚሰጠው መልእክት'
      : lang === 'om'
        ? 'Ergaa hoggantoonni woredaa ummataaf kennan'
        : 'A message from woreda leadership to the community'

  if (!leader) {
    return (
      <section className="py-24 sm:py-32 relative overflow-hidden bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-6" />
          <div className="h-96 bg-slate-100 rounded-[2.5rem]" />
        </div>
      </section>
    )
  }

  return (
    <section className="scroll-mt-24 relative overflow-hidden py-24 sm:py-32 bg-slate-50/50">
      {/* Background soft styling */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading label={sectionLabel} title={sectionTitle} description={sectionDesc} align="left" />

        <LeaderCard leader={leader} lang={lang} compact={!featured} />
      </div>
    </section>
  )
}
