import { MessageSquareQuote } from 'lucide-react'
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
    <div
      className={`bg-white border-2 border-mayor-gray-divider overflow-hidden ${
        compact
          ? 'rounded-2xl shadow-[0_8px_30px_rgba(10,42,74,0.06)]'
          : 'rounded-3xl shadow-[0_12px_40px_rgba(10,42,74,0.06)]'
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        <div
          className={`shrink-0 bg-slate-100 border-mayor-gray-divider ${
            compact
              ? 'sm:w-44 md:w-52 border-b-2 sm:border-b-0 sm:border-r-2'
              : 'sm:w-56 md:w-64 border-b-2 sm:border-b-0 sm:border-r-2'
          }`}
        >
          {leader.image_url ? (
            <img
              src={leader.image_url}
              alt={name}
              className={`w-full object-cover object-top ${
                compact ? 'h-52 sm:h-full sm:min-h-[240px]' : 'h-56 sm:h-full sm:min-h-[320px]'
              }`}
            />
          ) : (
            <div
              className={`w-full flex items-center justify-center bg-mayor-navy text-white/30 font-bold ${
                compact ? 'h-52 sm:min-h-[240px] text-4xl' : 'h-56 sm:min-h-[320px] text-5xl'
              }`}
            >
              {initials}
            </div>
          )}
        </div>

        <div className={`flex-1 min-w-0 ${compact ? 'p-6 sm:p-8' : 'p-8 sm:p-10 lg:p-12'}`}>
          {!compact && (
            <div className="flex items-start gap-5 mb-6 pb-6 border-b border-mayor-gray-divider">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-mayor-royal-blue/25 bg-mayor-royal-blue/10">
                <MessageSquareQuote className="h-7 w-7 text-mayor-royal-blue" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-mayor-navy font-amharic">{name}</h3>
                <p className="text-sm text-mayor-royal-blue font-semibold font-amharic mt-1">{title}</p>
              </div>
            </div>
          )}

          {compact && (
            <div className="mb-5 pb-5 border-b border-mayor-gray-divider">
              <h3 className="text-xl sm:text-2xl font-bold text-mayor-navy font-amharic">{name}</h3>
              <p className="text-sm text-mayor-royal-blue font-semibold font-amharic mt-1">{title}</p>
            </div>
          )}

          <blockquote className={`space-y-4 ${compact ? '' : 'border-t-4 border-t-mayor-royal-blue pt-6'}`}>
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className={`font-amharic leading-relaxed ${
                  i === 0
                    ? compact
                      ? 'text-mayor-navy text-base sm:text-lg font-medium'
                      : 'text-mayor-navy text-lg sm:text-xl font-medium'
                    : compact
                      ? 'text-mayor-navy/65 text-sm sm:text-base'
                      : 'text-mayor-navy/75 text-base sm:text-lg'
                }`}
              >
                {compact && i === 0 && (
                  <span className="text-mayor-royal-blue/40 text-3xl font-serif leading-none mr-1">“</span>
                )}
                {paragraph}
                {compact && i === paragraphs.length - 1 && (
                  <span className="text-mayor-royal-blue/40 text-3xl font-serif leading-none ml-1">”</span>
                )}
              </p>
            ))}
          </blockquote>
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
      <section className={featured ? 'py-20 sm:py-24' : 'py-12 sm:py-14 bg-white'}>
        <div className={`${featured ? 'max-w-7xl' : 'max-w-5xl'} mx-auto px-4 sm:px-6 animate-pulse`}>
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-6" />
          <div className="h-64 bg-slate-100 rounded-3xl" />
        </div>
      </section>
    )
  }

  return (
    <section className={`scroll-mt-24 ${featured ? 'py-20 sm:py-24' : 'py-12 sm:py-14 bg-white'}`}>
      <div className={`${featured ? 'max-w-7xl' : 'max-w-5xl'} mx-auto px-4 sm:px-6 lg:px-8`}>
        {featured ? (
          <SectionHeading label={sectionLabel} title={sectionTitle} description={sectionDesc} />
        ) : (
          <div className="flex items-center gap-2 mb-6">
            <MessageSquareQuote className="w-5 h-5 text-mayor-royal-blue" />
            <span className="text-xs font-bold uppercase tracking-widest text-mayor-royal-blue font-amharic">
              {sectionLabel}
            </span>
          </div>
        )}

        <LeaderCard leader={leader} lang={lang} compact={!featured} />
      </div>
    </section>
  )
}
