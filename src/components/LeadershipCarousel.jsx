import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useOfficials } from '../hooks/useOfficials'
import LeaderCard from './LeaderCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SectionHeading from './layout/SectionHeading'

export default function LeadershipCarousel({ embedded = false }) {
  const { lang } = useLanguage()
  const { officials } = useOfficials()
  const [currentIndex, setCurrentIndex] = useState(0)

  const itemsPerView = 3
  const totalLeaders = officials.length

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, totalLeaders - itemsPerView) : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, totalLeaders - itemsPerView)
      return prev >= maxIndex ? 0 : prev + 1
    })
  }

  const getVisibleOfficials = () => {
    const endIndex = Math.min(currentIndex + itemsPerView, totalLeaders)
    return officials.slice(currentIndex, endIndex)
  }

  const carouselContent =
    totalLeaders === 0 ? (
      <p className="text-center text-mayor-navy/60 font-amharic py-12 text-lg">
        {lang === 'am' ? 'አመራሮች እስካሁን አልተጨመሩም' : 'No officials added yet'}
      </p>
    ) : (
      <div className={`relative max-w-6xl ${embedded ? 'mx-auto' : ''}`}>
        
        {/* Navigation Buttons */}
        <button
          type="button"
          onClick={goToPrevious}
          className="absolute left-0 lg:-left-6 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-md border border-white p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,45,92,0.1)] text-mayor-navy hover:bg-mayor-royal-blue hover:text-white hover:scale-110 hover:-translate-x-2 transition-all duration-300"
          aria-label="Previous"
        >
          <ChevronLeft className="w-7 h-7" strokeWidth={2.5} />
        </button>

        <button
          type="button"
          onClick={goToNext}
          className="absolute right-0 lg:-right-6 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-md border border-white p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,45,92,0.1)] text-mayor-navy hover:bg-mayor-royal-blue hover:text-white hover:scale-110 hover:translate-x-2 transition-all duration-300"
          aria-label="Next"
        >
          <ChevronRight className="w-7 h-7" strokeWidth={2.5} />
        </button>

        {/* Carousel Items */}
        <div className="flex justify-center items-center gap-6 sm:gap-10 overflow-hidden py-12 px-10">
          {getVisibleOfficials().map((official, idx) => (
            <LeaderCard key={official.id} official={official} isActive={idx === 1} />
          ))}
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-3 mt-4">
          {officials.map((official, index) => {
            const isVisible = index >= currentIndex && index < currentIndex + itemsPerView
            return (
              <button
                key={official.id}
                type="button"
                onClick={() => {
                  const newIndex = Math.max(0, Math.min(index - 1, totalLeaders - itemsPerView))
                  setCurrentIndex(newIndex)
                }}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  isVisible ? 'bg-gradient-to-r from-mayor-navy to-mayor-royal-blue w-10 shadow-md' : 'bg-gray-200 hover:bg-mayor-royal-blue/50 w-2.5'
                }`}
                aria-label={`Go to ${official.full_name_en}`}
              />
            )
          })}
        </div>
      </div>
    )

  if (embedded) {
    return (
      <div className="relative">
        <SectionHeading
          label={lang === 'am' ? 'አመራሮች' : lang === 'om' ? 'Hoggantoota' : 'Officials'}
          title={lang === 'am' ? 'የወረዳው አመራሮች' : lang === 'om' ? 'Hoggantoota Aanaa Keenyaa' : 'Meet Our Leaders'}
        />
        {carouselContent}
      </div>
    )
  }

  return (
    <div className="py-24 bg-slate-50/50 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-mayor-royal-blue/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <SectionHeading
          label={lang === 'am' ? 'የስራ ላለፊወች' : lang === 'om' ? 'Hoggantoonni Hojii' : 'Our Leadership'}
          title={lang === 'am' ? 'የወረዳው አመራሮች' : lang === 'om' ? 'Hoggantoota Aanaa Keenyaa' : 'Meet Our Leaders'}
        />
        {carouselContent}
      </div>
    </div>
  )
}
