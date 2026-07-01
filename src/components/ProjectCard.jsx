import { ArrowRight, Images } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { pickLocalized } from '../utils/localized'

export function getProjectImages(project) {
  return [
    ...(project.cover_image_url ? [project.cover_image_url] : []),
    ...(project.gallery_urls || []).filter((u) => u !== project.cover_image_url),
  ]
}

export default function ProjectCard({ project, onClick, variant = 'grid' }) {
  const { lang } = useLanguage()
  const title = pickLocalized(project, 'title', lang)
  const description = pickLocalized(project, 'description', lang)
  const images = getProjectImages(project)
  const cover = images[0]

  const excerpt =
    description.length > 120 ? `${description.slice(0, 120).trim()}…` : description

  if (variant === 'carousel') {
    return (
      <article
        className="flex-shrink-0 w-full snap-center"
        aria-label={title}
      >
        <button
          type="button"
          onClick={onClick}
          className="group w-full text-left bg-white border-2 border-mayor-gray-divider rounded-2xl overflow-hidden hover:border-mayor-royal-blue/40 hover:shadow-lg transition-all duration-300"
        >
          <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
            {cover ? (
              <img
                src={cover}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-mayor-navy/25">
                <Images className="w-14 h-14" />
              </div>
            )}
          </div>
          <div className="p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-mayor-navy font-amharic mb-2 group-hover:text-mayor-royal-blue transition-colors">
              {title}
            </h3>
            <p className="text-mayor-navy/65 font-amharic leading-relaxed line-clamp-3">{excerpt}</p>
            <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-mayor-royal-blue font-amharic">
              {lang === 'am' ? 'ተጨማሪ ይመልከቱ' : lang === 'om' ? 'Bal\'inaan ilaali' : 'Read more'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </button>
      </article>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left bg-white border-2 border-mayor-gray-divider rounded-2xl overflow-hidden hover:border-mayor-royal-blue/40 hover:shadow-md transition-all duration-300"
    >
      <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mayor-navy/25">
            <Images className="w-12 h-12" />
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-mayor-navy font-amharic mb-2 group-hover:text-mayor-royal-blue transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-mayor-navy/60 font-amharic line-clamp-2">{excerpt}</p>
      </div>
    </button>
  )
}
