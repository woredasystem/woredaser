import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { officials } from '../data/officials'
import LeaderCard from './LeaderCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function LeadershipCarousel() {
  const { t, lang } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)

  const itemsPerView = 3
  const totalLeaders = officials.length

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalLeaders - itemsPerView : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, totalLeaders - itemsPerView)
      return prev >= maxIndex ? 0 : prev + 1
    })
  }

  const getVisibleOfficials = () => {
    // Show 3 at a time, but can scroll through all
    const endIndex = Math.min(currentIndex + itemsPerView, totalLeaders)
    return officials.slice(currentIndex, endIndex)
  }

  return (
    <div className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title Section */}
        <div className="mb-12 text-center">
          <span className="text-mayor-royal-blue font-bold tracking-wider uppercase text-sm mb-2 block">
            {lang === 'am' ? 'የስራ ላላፊወች' : lang === 'om' ? 'Hoggantoonni Hojii' : 'Our Leadership'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-mayor-navy font-amharic">
            {lang === 'am' ? 'የወረዳው አመራሮች' : lang === 'om' ? 'Hoggantoota Aanaa Keenyaa' : 'Meet Our Leaders'}
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-10 bg-white p-4 rounded-full shadow-lg text-mayor-navy hover:bg-mayor-royal-blue hover:text-white transition-all duration-300 hover:scale-110 group"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-10 bg-white p-4 rounded-full shadow-lg text-mayor-navy hover:bg-mayor-royal-blue hover:text-white transition-all duration-300 hover:scale-110 group"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Cards Container */}
          <div className="flex justify-center items-center gap-8 overflow-hidden py-10">
            {getVisibleOfficials().map((official, idx) => {
              const isActive = idx === 1 // Center card is active
              return (
                <LeaderCard
                  key={official.id}
                  official={official}
                  isActive={isActive}
                />
              )
            })}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {officials.map((official, index) => {
              const isVisible = index >= currentIndex && index < currentIndex + itemsPerView
              return (
                <button
                  key={official.id}
                  onClick={() => {
                    const newIndex = Math.max(0, Math.min(index - 1, totalLeaders - itemsPerView))
                    setCurrentIndex(newIndex)
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${isVisible
                    ? 'bg-mayor-royal-blue w-8'
                    : 'bg-gray-200 hover:bg-mayor-royal-blue/50 w-2'
                    }`}
                  aria-label={`Go to ${official.full_name_en}`}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

