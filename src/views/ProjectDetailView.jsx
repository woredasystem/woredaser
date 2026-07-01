import { useState } from 'react'
import { ChevronLeft, ChevronRight, Images } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { useProjects } from '../hooks/useProjects'
import { pickLocalized } from '../utils/localized'
import { getProjectImages } from '../components/ProjectCard'
import PublicPageLayout from '../components/layout/PublicPageLayout'
import ImageModal from '../components/ImageModal'

function ProjectGallery({ images, title }) {
  const [index, setIndex] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  if (!images.length) {
    return (
      <div className="aspect-[16/9] bg-slate-100 rounded-2xl flex items-center justify-center text-mayor-navy/30">
        <Images className="w-16 h-16" />
      </div>
    )
  }

  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1))

  return (
    <>
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 group border-2 border-mayor-gray-divider">
        <button type="button" onClick={() => setModalOpen(true)} className="w-full h-full">
          <img src={images[index]} alt={title} className="w-full h-full object-cover" />
        </button>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 text-mayor-navy shadow-md hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 text-mayor-navy shadow-md hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setIndex(i)}
              className={`aspect-square rounded-lg overflow-hidden border-2 ${
                i === index ? 'border-mayor-royal-blue' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {modalOpen && (
        <ImageModal imageUrl={images[index]} alt={title} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}

export default function ProjectDetailView({ projectId, onBack }) {
  const { lang } = useLanguage()
  const { projects, loading } = useProjects()

  const project = projects.find((p) => String(p.id) === String(projectId))

  const projectsLabel = lang === 'am' ? 'ፕሮጀክቶች' : lang === 'om' ? 'Pirojektoota' : 'Projects'

  if (loading) {
    return (
      <PublicPageLayout
        title={projectsLabel}
        subtitle={lang === 'am' ? 'በመጫን ላይ...' : 'Loading...'}
        onBack={onBack}
        maxWidth="max-w-4xl"
      >
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded" />
        </div>
      </PublicPageLayout>
    )
  }

  if (!project) {
    return (
      <PublicPageLayout
        title={lang === 'am' ? 'ፕሮጀክት አልተገኘም' : 'Project not found'}
        subtitle={lang === 'am' ? 'ይህ ፕሮጀክት አልተገኘም' : 'This project could not be found'}
        onBack={onBack}
        maxWidth="max-w-4xl"
      >
        {null}
      </PublicPageLayout>
    )
  }

  const title = pickLocalized(project, 'title', lang)
  const description = pickLocalized(project, 'description', lang)
  const images = getProjectImages(project)

  return (
    <PublicPageLayout
      title={title}
      subtitle={
        lang === 'am'
          ? 'የፕሮጀክት ዝርዝር መግለጫ'
          : lang === 'om'
            ? 'Ibsa bal\'aa pirojektii'
            : 'Project details and description'
      }
      onBack={onBack}
      maxWidth="max-w-4xl"
    >
      <article className="space-y-8">
        <ProjectGallery images={images} title={title} />

        <div className="bg-white border-2 border-mayor-gray-divider rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-mayor-navy font-amharic mb-4">
            {lang === 'am' ? 'ዝርዝር መግለጫ' : lang === 'om' ? 'Ibsa bal\'aa' : 'Description'}
          </h2>
          <p className="text-mayor-navy/75 font-amharic leading-relaxed text-base sm:text-lg whitespace-pre-line">
            {description}
          </p>
        </div>
      </article>
    </PublicPageLayout>
  )
}
