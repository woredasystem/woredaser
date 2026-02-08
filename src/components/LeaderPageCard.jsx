import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import ImageModal from './ImageModal'

export default function LeaderPageCard({ official }) {
  const { lang } = useLanguage()
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="gov-card overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 relative">
        {/* Photo Section - Large and Prominent */}
        <div className="relative h-96 bg-gradient-to-br from-mayor-deep-blue via-mayor-royal-blue to-mayor-highlight-blue overflow-hidden">
          {/* Decorative Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)'
            }}></div>
          </div>

          {/* Photo Container */}
          <div className="relative h-full flex items-center justify-center p-8">
            {official.image_url ? (
              <div
                className="relative w-64 h-80 rounded-gov-xl overflow-hidden shadow-2xl cursor-pointer group-hover:scale-105 transition-transform duration-500 border-4 border-white"
                onClick={() => setShowModal(true)}
              >
                <img
                  src={official.image_url}
                  alt={official.full_name_en}
                  className="w-full h-full object-cover"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-mayor-royal-blue/0 group-hover:bg-mayor-royal-blue/20 transition-colors duration-300"></div>
              </div>
            ) : (
              <div className="w-64 h-80 rounded-gov-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white shadow-2xl">
                <div className="text-8xl text-white font-bold opacity-80">
                  {official.full_name_en.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
            )}
          </div>

          {/* Decorative Corner Elements */}
          <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-white/30 rounded-tl-lg"></div>
          <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-white/30 rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-white/30 rounded-bl-lg"></div>
          <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-white/30 rounded-br-lg"></div>
        </div>

        {/* Name & Title Section */}
        <div className="bg-white p-8 text-center relative">
          {/* Decorative Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mayor-deep-blue via-mayor-royal-blue to-mayor-highlight-blue"></div>

          <h3 className="text-3xl font-bold text-mayor-navy mb-3 font-amharic group-hover:text-mayor-royal-blue transition-colors">
            {lang === 'am' ? official.full_name_am : lang === 'om' ? (official.full_name_om || official.full_name_en) : official.full_name_en}
          </h3>

          <div className="w-20 h-1 bg-mayor-royal-blue mx-auto mb-4 rounded-full"></div>

          <p className="text-lg text-mayor-royal-blue font-amharic font-semibold leading-relaxed">
            {lang === 'am' ? official.title_am : lang === 'om' ? (official.title_om || official.title_en) : official.title_en}
          </p>

          {/* Decorative Bottom Accent */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-mayor-highlight-blue to-transparent"></div>
        </div>
      </div>

      {/* Image Modal */}
      {showModal && official.image_url && (
        <ImageModal
          imageUrl={official.image_url}
          alt={lang === 'am' ? official.full_name_am : lang === 'om' ? (official.full_name_om || official.full_name_en) : official.full_name_en}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}










