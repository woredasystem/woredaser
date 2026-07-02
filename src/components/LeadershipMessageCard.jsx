import { useState } from 'react'
import { MessageSquareQuote, ChevronLeft, ChevronRight } from 'lucide-react'
import { pickLocalized } from '../utils/localized'

export function getMessageParagraphs(leader, lang) {
  const bio = pickLocalized(leader, 'bio', lang)
  if (bio?.trim()) {
    return bio.split(/\n\n+/).filter(Boolean)
  }
  return []
}

export function getFeaturedLeader(officials) {
  return getHomepageLeaders(officials)[0] || officials.find((o) => o.role_key === 'ceo') || officials[0] || null
}

export function getHomepageLeaders(officials) {
  return officials.filter((o) => o.show_on_home)
}

export default function LeadershipMessageCard({ leader, lang, className = '' }) {
  const name = pickLocalized(leader, 'full_name', lang)
  const title = pickLocalized(leader, 'title', lang)
  const paragraphs = getMessageParagraphs(leader, lang)
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)

  return (
    <div className={`relative ${className}`}>
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-stretch">
        <div className="lg:col-span-5">
          <div className="relative min-h-[22rem] sm:min-h-[26rem] lg:min-h-[32rem] rounded-[1.75rem] overflow-hidden bg-mayor-navy shadow-[0_24px_60px_rgba(0,45,92,0.22)]">
            {leader.image_url ? (
              <img
                src={leader.image_url}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-mayor-navy to-mayor-royal-blue text-white/40 text-6xl font-bold">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-mayor-navy via-mayor-navy/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10">
              <p className="text-white text-2xl sm:text-3xl font-bold font-amharic leading-tight">{name}</p>
              <p className="mt-3 text-white/80 text-base sm:text-lg font-amharic flex items-center gap-3">
                <span className="h-px w-10 bg-mayor-highlight-blue shrink-0" />
                {title}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex">
          <div className="relative flex-1 rounded-[1.75rem] border border-slate-200/80 bg-white p-8 sm:p-10 lg:p-12 xl:p-14 shadow-[0_16px_48px_-24px_rgba(0,45,92,0.14)] overflow-hidden min-h-[22rem] lg:min-h-0 flex flex-col">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-mayor-royal-blue to-mayor-highlight-blue" />
            <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-mayor-royal-blue/5 blur-2xl pointer-events-none" />

            <div className="flex items-start gap-4 mb-8 sm:mb-10">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-mayor-royal-blue/10 text-mayor-royal-blue">
                <MessageSquareQuote className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 pt-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-mayor-royal-blue font-amharic">
                  {lang === 'am' ? 'የአመራር መልእክት' : lang === 'om' ? 'Ergaa Hogganaa' : 'Leadership Message'}
                </p>
                <p className="text-base text-mayor-navy/50 font-amharic mt-1.5">{title}</p>
              </div>
            </div>

            <blockquote className="space-y-5 sm:space-y-6 flex-1">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className={`font-amharic leading-[1.9] ${
                      i === 0
                        ? 'text-xl sm:text-2xl lg:text-[1.65rem] font-bold text-mayor-navy tracking-tight'
                        : 'text-base sm:text-lg text-mayor-navy/70'
                    }`}
                  >
                    {i === 0 && (
                      <span className="text-mayor-royal-blue/30 text-4xl font-serif leading-none mr-1 align-top">
                        “
                      </span>
                    )}
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="font-amharic text-base sm:text-lg text-mayor-navy/40 italic">
                  {lang === 'am' ? 'መልእክት አልተገኘም።' : lang === 'om' ? 'Ergaan hin jiru.' : 'No message provided.'}
                </p>
              )}
            </blockquote>

            <footer className="mt-8 sm:mt-10 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-mayor-navy font-amharic">{name}</p>
                <p className="text-sm text-mayor-navy/50 font-amharic mt-0.5">{title}</p>
              </div>
              <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-full border border-mayor-royal-blue/15 text-mayor-royal-blue/40 text-xl font-serif">
                ”
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LeadershipMessageCarousel({ leaders, lang }) {
  const [index, setIndex] = useState(0)
  const count = leaders.length
  const current = leaders[index]

  if (!current) return null

  const go = (dir) => {
    setIndex((prev) => (prev + dir + count) % count)
  }

  return (
    <div className="relative">
      <LeadershipMessageCard leader={current} lang={lang} />

      {count > 1 && (
        <>
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              type="button"
              onClick={() => go(-1)}
              className="p-2.5 rounded-full border border-slate-200 text-mayor-navy hover:bg-mayor-royal-blue hover:text-white hover:border-mayor-royal-blue transition-colors"
              aria-label={lang === 'am' ? 'ቀዳሚ' : 'Previous'}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-2">
              {leaders.map((leader, i) => {
                const leaderName = pickLocalized(leader, 'full_name', lang)
                return (
                  <button
                    key={leader.id || i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`transition-all rounded-full ${
                      i === index
                        ? 'w-8 h-2.5 bg-mayor-royal-blue'
                        : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={leaderName}
                    title={leaderName}
                  />
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              className="p-2.5 rounded-full border border-slate-200 text-mayor-navy hover:bg-mayor-royal-blue hover:text-white hover:border-mayor-royal-blue transition-colors"
              aria-label={lang === 'am' ? 'ቀጣይ' : 'Next'}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-sm text-mayor-navy/45 font-amharic mt-4">
            {index + 1} / {count}
            <span className="mx-2">·</span>
            {pickLocalized(current, 'full_name', lang)}
          </p>
        </>
      )}
    </div>
  )
}
