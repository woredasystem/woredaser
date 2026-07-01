import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight, Images, ArrowUpRight } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { useProjects } from '../hooks/useProjects'
import { pickLocalized } from '../utils/localized'
import { getProjectImages } from './ProjectCard'

function CarouselSlide({ project, lang, onClick, isActive }) {
  const title = pickLocalized(project, 'title', lang)
  const description = pickLocalized(project, 'description', lang)
  const cover = getProjectImages(project)[0]
  const excerpt =
    description.length > 120 ? `${description.slice(0, 120).trim()}…` : description

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left relative bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,45,92,0.1)] transition-all duration-700 ${isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}
    >
      <div className="flex flex-col sm:flex-row h-full">
        <div className="sm:w-1/2 relative h-64 sm:h-auto sm:min-h-[360px] overflow-hidden bg-slate-100">
          {cover ? (
            <>
              <img
                src={cover}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 mix-blend-multiply sm:bg-gradient-to-l sm:from-transparent sm:to-black/30"></div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-mayor-navy/5 to-mayor-royal-blue/10 text-mayor-navy/20">
              <Images className="w-16 h-16" />
            </div>
          )}
          
          {/* Decorative Tag */}
          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-mayor-navy shadow-lg">
            {lang === 'am' ? 'ፕሮጀክት' : lang === 'om' ? 'Pirojekti' : 'Project'}
          </div>
        </div>
        
        <div className="sm:w-1/2 flex flex-col justify-center p-8 sm:p-12 relative z-10 bg-white">
          <h3 className="text-2xl sm:text-3xl font-bold text-mayor-navy font-amharic mb-4 line-clamp-2 group-hover:text-mayor-royal-blue transition-colors">
            {title}
          </h3>
          <p className="text-base sm:text-lg text-mayor-navy/60 font-medium font-amharic leading-relaxed line-clamp-3 mb-8">
            {excerpt}
          </p>
          
          <div className="mt-auto flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-mayor-royal-blue font-amharic group-hover:text-mayor-highlight-blue transition-colors">
              {lang === 'am' ? 'ዝርዝር እይ' : lang === 'om' ? 'Bal\'inaan' : 'View Details'}
              <div className="w-8 h-8 rounded-full bg-mayor-royal-blue/10 flex items-center justify-center group-hover:bg-mayor-royal-blue/20 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </span>
          </div>
        </div>
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
    const timer = setInterval(next, 8000)
    return () => clearInterval(timer)
  }, [count, next])

  if (loading) {
    return (
      <section className="py-20 sm:py-28 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-10" />
          <div className="h-96 bg-slate-100 rounded-[2.5rem]" />
        </div>
      </section>
    )
  }

  if (count === 0) return null

  const viewAllLabel =
    lang === 'am' ? 'ሁሉንም ፕሮጀክቶች እይ' : lang === 'om' ? 'Hunda' : 'View all projects'

  const sectionTitle =
    lang === 'am' ? 'ፕሮጀክቶች' : lang === 'om' ? 'Pirojektoota' : 'Projects'

  return (
    <section id="projects" className="py-20 sm:py-28 bg-white scroll-mt-24 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-mayor-royal-blue/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4 justify-start">
              <span className="w-8 h-[2px] bg-gradient-to-r from-mayor-royal-blue to-mayor-highlight-blue rounded-full"></span>
              <span className="inline-flex px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-mayor-royal-blue bg-mayor-royal-blue/5 border border-mayor-royal-blue/10 rounded-full font-amharic shadow-[0_2px_10px_rgba(26,111,191,0.05)]">
                {sectionTitle}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-mayor-navy font-amharic mb-0 leading-tight tracking-tight">
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-mayor-navy text-white rounded-2xl text-sm font-bold font-amharic hover:bg-mayor-royal-blue hover:shadow-lg hover:shadow-mayor-royal-blue/20 hover:-translate-y-0.5 transition-all shrink-0"
            >
              {viewAllLabel}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[2.5rem] py-4">
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {projects.map((project, i) => (
                <div key={project.id} className="w-full flex-shrink-0 px-2 sm:px-4">
                  <CarouselSlide
                    project={project}
                    lang={lang}
                    onClick={() => onProjectClick?.(project.id)}
                    isActive={i === index}
                  />
                </div>
              ))}
            </div>
          </div>

          {count > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-6 px-4">
              <div className="flex gap-2">
                {projects.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      i === index ? 'w-10 bg-gradient-to-r from-mayor-navy to-mayor-royal-blue shadow-md' : 'w-2 bg-mayor-gray-divider hover:bg-mayor-royal-blue/50'
                    }`}
                    aria-label={`Project ${i + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prev}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-mayor-gray-divider/50 bg-white text-mayor-navy hover:border-mayor-royal-blue hover:text-mayor-royal-blue hover:shadow-lg transition-all"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-mayor-gray-divider/50 bg-white text-mayor-navy hover:border-mayor-royal-blue hover:text-mayor-royal-blue hover:shadow-lg transition-all"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
