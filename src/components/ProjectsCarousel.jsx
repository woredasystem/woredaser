import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight, Images } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { useProjects } from '../hooks/useProjects'
import { pickLocalized } from '../utils/localized'
import { getProjectImages } from './ProjectCard'

function CarouselSlide({ project, lang, onClick }) {
  const title = pickLocalized(project, 'title', lang)
  const description = pickLocalized(project, 'description', lang)
  const cover = getProjectImages(project)[0]
  const excerpt =
    description.length > 100 ? `${description.slice(0, 100).trim()}…` : description

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left flex flex-col sm:flex-row bg-white border-2 border-mayor-gray-divider rounded-2xl overflow-hidden hover:border-mayor-royal-blue/35 transition-colors"
    >
      <div className="sm:w-[38%] shrink-0 h-44 sm:h-auto sm:min-h-[200px] bg-slate-100 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mayor-navy/20">
            <Images className="w-10 h-10" />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center p-5 sm:p-6 sm:w-[62%] min-w-0">
        <h3 className="text-lg font-bold text-mayor-navy font-amharic mb-2 line-clamp-2 group-hover:text-mayor-royal-blue transition-colors">
          {title}
        </h3>
        <p className="text-sm text-mayor-navy/60 font-amharic leading-relaxed line-clamp-2 mb-3">
          {excerpt}
        </p>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-mayor-royal-blue font-amharic">
          {lang === 'am' ? 'ተጨማሪ' : lang === 'om' ? 'Bal\'inaan' : 'Read more'}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </button>
  )
}

export default function ProjectsCarousel({ onViewAll, onProjectClick }) {
  const { lang } = useLanguage()
  const { projects, loading } = useProjects()
  const [index, setIndex] = useState(0)

  const count = projects.length
  const prev = useCallback(() => {
    setIndex((i) => (i === 0 ? count - 1 : i - 1))
  }, [count])
  const next = useCallback(() => {
    setIndex((i) => (i === count - 1 ? 0 : i + 1))
  }, [count])

  useEffect(() => {
    if (count <= 1) return
    const timer = setInterval(next, 7000)
    return () => clearInterval(timer)
  }, [count, next])

  if (loading) {
    return (
      <section className="py-12 sm:py-14 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-6" />
          <div className="h-52 bg-slate-200 rounded-2xl" />
        </div>
      </section>
    )
  }

  if (count === 0) return null

  const viewAllLabel =
    lang === 'am' ? 'ሁሉንም' : lang === 'om' ? 'Hunda' : 'View all'

  const sectionTitle =
    lang === 'am' ? 'ፕሮጀክቶች' : lang === 'om' ? 'Pirojektoota' : 'Projects'

  return (
    <section id="projects" className="py-12 sm:py-14 bg-slate-50 scroll-mt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-mayor-royal-blue font-amharic">
              {sectionTitle}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-mayor-navy font-amharic mt-1">
              {lang === 'am'
                ? 'የልማት ፕሮጀክቶች'
                : lang === 'om'
                  ? 'Pirojektoota Guddinaa'
                  : 'Development Projects'}
            </h2>
          </div>
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-mayor-navy text-mayor-navy rounded-lg text-sm font-semibold font-amharic hover:bg-mayor-navy hover:text-white transition-colors shrink-0"
            >
              {viewAllLabel}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-400 ease-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {projects.map((project) => (
                <div key={project.id} className="w-full flex-shrink-0">
                  <CarouselSlide
                    project={project}
                    lang={lang}
                    onClick={() => onProjectClick?.(project.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {count > 1 && (
            <div className="flex items-center justify-between mt-4 gap-3">
              <div className="flex gap-1.5">
                {projects.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? 'w-6 bg-mayor-royal-blue' : 'w-1.5 bg-mayor-gray-divider hover:bg-mayor-royal-blue/50'
                    }`}
                    aria-label={`Project ${i + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prev}
                  className="p-2 rounded-lg border border-mayor-gray-divider bg-white text-mayor-navy hover:border-mayor-royal-blue hover:text-mayor-royal-blue transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="p-2 rounded-lg border border-mayor-gray-divider bg-white text-mayor-navy hover:border-mayor-royal-blue hover:text-mayor-royal-blue transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
