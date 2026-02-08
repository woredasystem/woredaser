import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import ImageModal from './ImageModal'

export default function LeaderCard({ official, isActive = false }) {
  const { lang } = useLanguage()
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className={`flex-shrink-0 w-72 transition-all duration-500 ${isActive ? 'scale-105 z-10' : 'scale-95 opacity-80 hover:opacity-100'}`}>
        <div className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group ${isActive ? 'ring-4 ring-mayor-royal-blue/20' : ''}`}>
          {/* Image Container */}
          <div
            className="relative h-80 overflow-hidden cursor-pointer"
            onClick={() => official.image_url && setShowModal(true)}
          >
            {official.image_url ? (
              <img
                src={official.image_url}
                alt={official.full_name_en}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-mayor-deep-blue to-mayor-royal-blue flex items-center justify-center">
                <div className="text-5xl text-white font-bold">
                  {official.full_name_en.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-mayor-navy/90 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

            {/* Hover Icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 text-center relative bg-white">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-1 bg-mayor-highlight-blue rounded-full" />

            <h3 className="text-lg font-bold text-mayor-navy mb-2 font-amharic line-clamp-1">
              {lang === 'am' ? official.full_name_am : lang === 'om' ? (official.full_name_om || official.full_name_en) : official.full_name_en}
            </h3>
            <p className="text-sm text-mayor-royal-blue font-medium font-amharic line-clamp-2 min-h-[2.5rem]">
              {lang === 'am' ? official.title_am : lang === 'om' ? (official.title_om || official.title_en) : official.title_en}
            </p>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showModal && (
        <ImageModal
          imageUrl={official.image_url}
          alt={lang === 'am' ? official.full_name_am : lang === 'om' ? (official.full_name_om || official.full_name_en) : official.full_name_en}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

