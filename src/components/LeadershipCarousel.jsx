import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useOfficials } from '../hooks/useOfficials'
import LeaderCard from './LeaderCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
      <p className="text-center text-mayor-navy/60 font-amharic py-8">
        {lang === 'am' ? 'አመራሮች እስካሁን አልተጨመሩም' : 'No officials added yet'}
      </p>
    ) : (
      <div className={`relative max-w-6xl ${embedded ? 'mx-auto' : ''}`}>
        <button
          type="button"
          onClick={goToPrevious}
          className="absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-10 bg-white p-4 rounded-full shadow-lg text-mayor-navy hover:bg-mayor-royal-blue hover:text-white transition-all duration-300"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={goToNext}
          className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-10 bg-white p-4 rounded-full shadow-lg text-mayor-navy hover:bg-mayor-royal-blue hover:text-white transition-all duration-300"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="flex justify-center items-center gap-8 overflow-hidden py-10">
          {getVisibleOfficials().map((official, idx) => (
            <LeaderCard key={official.id} official={official} isActive={idx === 1} />
          ))}
        </div>

        <div className="flex justify-center gap-3 mt-8">
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
                className={`h-2 rounded-full transition-all duration-300 ${
                  isVisible ? 'bg-mayor-royal-blue w-8' : 'bg-gray-200 hover:bg-mayor-royal-blue/50 w-2'
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
      <div>
        <div className="mb-10 text-center">
          <span className="text-mayor-royal-blue font-bold tracking-wider uppercase text-sm mb-2 block font-amharic">
            {lang === 'am' ? 'አመራሮች' : lang === 'om' ? 'Hoggantoota' : 'Officials'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-mayor-navy font-amharic">
            {lang === 'am' ? 'የወረዳው አመራሮች' : lang === 'om' ? 'Hoggantoota Aanaa Keenyaa' : 'Meet Our Leaders'}
          </h2>
        </div>
        {carouselContent}
      </div>
    )
  }

  return (
    <div className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center">
          <span className="text-mayor-royal-blue font-bold tracking-wider uppercase text-sm mb-2 block font-amharic">
            {lang === 'am' ? 'የስራ ላለፊወች' : lang === 'om' ? 'Hoggantoonni Hojii' : 'Our Leadership'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-mayor-navy font-amharic">
            {lang === 'am' ? 'የወረዳው አመራሮች' : lang === 'om' ? 'Hoggantoota Aanaa Keenyaa' : 'Meet Our Leaders'}
          </h2>
        </div>
        {carouselContent}
      </div>
    </div>
  )
}
