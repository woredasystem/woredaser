import { useLanguage } from '../hooks/useLanguage'
import { FileText, Briefcase, Users, ArrowRight } from 'lucide-react'

const sectorIcons = {
  civilRegistration: FileText,
  tradeOffice: Briefcase,
  laborSkills: Users,
  chiefExecutiveOffice: FileText
}

export default function SectorCard({ sector, onClick }) {
  const { lang } = useLanguage()
  const Icon = sectorIcons[sector.key] || FileText

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onClick) {
      onClick()
    }
  }

  return (
    <div
      onClick={handleClick}
      className="gov-card p-8 cursor-pointer group hover:shadow-gov-md transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-mayor-royal-blue/5 rounded-full -mr-16 -mt-16 group-hover:bg-mayor-royal-blue/10 transition-colors"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-mayor-highlight-blue/5 rounded-full -ml-12 -mb-12 group-hover:bg-mayor-highlight-blue/10 transition-colors"></div>

      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-6 flex items-center justify-between">
          <div className="bg-gradient-to-br from-mayor-deep-blue to-mayor-royal-blue p-4 rounded-gov-lg shadow-gov-md group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <ArrowRight className="w-6 h-6 text-mayor-royal-blue group-hover:translate-x-2 transition-transform" />
        </div>

        {/* Sector Name */}
        <h3 className="text-2xl font-bold text-mayor-navy mb-3 font-amharic group-hover:text-mayor-royal-blue transition-colors">
          {sector.name[lang]}
        </h3>

        {/* Service Count */}
        <div className="flex items-center gap-2 text-mayor-royal-blue">
          <span className="text-sm font-semibold font-amharic">
            {lang === 'am' ? `${sector.items.length} አገልግሎቶች` : lang === 'om' ? `Tajaajiloota ${sector.items.length}` : `${sector.items.length} Services`}
          </span>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute bottom-4 right-4 w-2 h-2 bg-mayor-royal-blue rounded-full group-hover:scale-150 transition-transform"></div>
      </div>
    </div>
  )
}

