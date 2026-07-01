import { useState } from 'react'
import { ChevronLeft, ChevronRight, Images } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { useProjects } from '../hooks/useProjects'
import { pickLocalized } from '../utils/localized'
import SectionHeading from './layout/SectionHeading'
import ImageModal from './ImageModal'

function ProjectGallery({ images, title }) {
  const [index, setIndex] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  if (!images?.length) {
    return (
      <div className="aspect-[16/10] bg-slate-100 rounded-xl flex items-center justify-center text-mayor-navy/30">
        <Images className="w-12 h-12" />
      </div>
    )
  }

  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1))

  return (
    <>
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 group">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="w-full h-full"
        >
          <img
            src={images[index]}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </button>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {modalOpen && (
        <ImageModal
          imageUrl={images[index]}
          alt={title}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}

export default function ProjectsSection({ standalone = false }) {
  const { lang } = useLanguage()
  const { projects, loading } = useProjects()

  const sectionClass = standalone
    ? 'py-4'
    : 'py-16 sm:py-20 bg-slate-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 scroll-mt-24'

  if (loading) {
    return (
      <section id="projects" className={sectionClass}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto" />
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="h-64 bg-slate-200 rounded-2xl" />
            <div className="h-64 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </section>
    )
  }

  if (projects.length === 0) {
    return (
      <p className="text-center text-mayor-navy/60 font-amharic py-16">
        {lang === 'am' ? 'ፕሮጀክት አልተጨመረም' : 'No projects published yet'}
      </p>
    )
  }

  return (
    <section id="projects" className={sectionClass}>
      {!standalone && (
        <SectionHeading
          label={lang === 'am' ? 'ፕሮጀክቶች' : lang === 'om' ? 'Pirojektoota' : 'Projects'}
          title={lang === 'am' ? 'የማህበረሰብ እና የልማት ፕሮጀክቶች' : lang === 'om' ? 'Pirojektoota Hawaasaa fi Guddinaa' : 'Community & Development Projects'}
          description={
            lang === 'am'
              ? 'በወረዳው ላይ እየተካሄዱ ያሉ ዋና ዋና ፕሮጀክቶች'
              : lang === 'om'
                ? 'Pirojektoota gurguddoo woredaa keessatti hojjetaman'
                : 'Key initiatives underway in our woreda'
          }
        />
      )}

      <div className="space-y-12">
        {projects.map((project, idx) => {
          const title = pickLocalized(project, 'title', lang)
          const description = pickLocalized(project, 'description', lang)
          const images = [
            ...(project.cover_image_url ? [project.cover_image_url] : []),
            ...(project.gallery_urls || []).filter((u) => u !== project.cover_image_url),
          ]

          return (
            <article
              key={project.id}
              className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                idx % 2 === 1 ? 'lg:[direction:rtl] lg:*:[direction:ltr]' : ''
              }`}
            >
              <div className="space-y-4">
                <span className="inline-block text-xs font-semibold text-mayor-royal-blue uppercase tracking-wider">
                  {lang === 'am' ? `ፕሮጀክት ${idx + 1}` : `Project ${idx + 1}`}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-mayor-navy font-amharic">
                  {title}
                </h3>
                <p className="text-mayor-navy/70 font-amharic leading-relaxed text-base sm:text-lg whitespace-pre-line">
                  {description}
                </p>
              </div>
              <ProjectGallery images={images} title={title} />
            </article>
          )
        })}
      </div>
    </section>
  )
}
