import { useLanguage } from '../hooks/useLanguage'
import { useOfficials } from '../hooks/useOfficials'
import { useSiteContent } from '../hooks/useSiteContent'
import { pickLocalized } from '../utils/localized'
import SectionHeading from './layout/SectionHeading'
import { LeadershipMessageCarousel, getHomepageLeaders } from './LeadershipMessageCard'
import { leadershipSpeech } from '../data/leadershipMessages'

const SAMPLE_LEADER = {
  full_name_am: 'አቶ ተመስገን በላይ',
  full_name_en: 'Mr. Temesgen Belachew',
  title_am: 'ዋና ሥራ አስፈፃሚ',
  title_en: 'Chief Executive',
  image_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=480&h=560&fit=crop',
  bio_am: leadershipSpeech.am.join('\n\n'),
  bio_en: leadershipSpeech.en.join('\n\n'),
  bio_om: leadershipSpeech.om.join('\n\n'),
  show_on_home: true,
}

const DEFAULT_SECTION = {
  title_am: 'ከአመራር ዘንድ',
  title_en: 'From Our Leadership',
  title_om: 'Ergaa Hogganaa',
  body_am: 'የወረዳ አመራር ለህዝቡ የሚሰጠው መልእክት',
  body_en: 'A message from woreda leadership to the community',
  body_om: 'Ergaa hoggantoonni woredaa ummataaf kennan',
}

function getSectionMeta(sections, lang, override) {
  const row = override || sections.find((s) => s.section_key === 'leadership_message')
  const source = row || DEFAULT_SECTION
  return {
    label: lang === 'am' ? 'የአመራር መልእክት' : lang === 'om' ? 'Ergaa Hogganaa' : 'Leadership Message',
    title: pickLocalized(source, 'title', lang) || DEFAULT_SECTION[`title_${lang === 'om' ? 'om' : lang === 'am' ? 'am' : 'en'}`],
    description: pickLocalized(source, 'body', lang),
  }
}

export default function LeaderMessageSection({
  leaders: leadersOverride,
  sectionOverride,
  preview = false,
  className = '',
}) {
  const { lang } = useLanguage()
  const { officials, loading: officialsLoading } = useOfficials()
  const { sections, loading: contentLoading } = useSiteContent()

  const homepageLeaders = leadersOverride
    ? (Array.isArray(leadersOverride) ? leadersOverride : [leadersOverride])
    : getHomepageLeaders(officials)

  const leaders =
    homepageLeaders.length > 0
      ? homepageLeaders
      : !officialsLoading
        ? [SAMPLE_LEADER]
        : []

  const meta = getSectionMeta(sections, lang, sectionOverride)
  const loading = !preview && (officialsLoading || contentLoading)

  if (loading || leaders.length === 0) {
    return (
      <section className={`py-16 sm:py-20 bg-white ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-8 bg-slate-200 rounded-full w-48 mb-6" />
          <div className="h-12 bg-slate-100 rounded-xl w-2/3 mb-4" />
          <div className="h-96 bg-slate-50 rounded-3xl mt-10" />
        </div>
      </section>
    )
  }

  return (
    <section className={`scroll-mt-24 py-16 sm:py-20 lg:py-24 bg-white relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(0,70,148,0.04),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          label={meta.label}
          title={meta.title}
          description={meta.description}
          align="left"
          className="mb-10 sm:mb-14"
        />

        <LeadershipMessageCarousel leaders={leaders} lang={lang} />
      </div>
    </section>
  )
}
