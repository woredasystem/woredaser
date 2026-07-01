import { Target, Eye, Heart } from 'lucide-react'

const ICONS = {
  mission: Target,
  vision: Eye,
  values: Heart,
  about: Target,
}

export default function SectionHeading({ label, title, description, align = 'center', className = '' }) {
  const alignClass = align === 'left' ? 'text-left' : 'text-center'
  const isCenter = align === 'center'

  return (
    <div className={`mb-12 sm:mb-16 ${alignClass} ${className}`}>
      {label && (
        <div className={`flex items-center gap-3 mb-4 ${isCenter ? 'justify-center' : 'justify-start'}`}>
          {!isCenter && <span className="w-8 h-[2px] bg-gradient-to-r from-mayor-royal-blue to-mayor-highlight-blue rounded-full"></span>}
          <span className="inline-flex px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-mayor-royal-blue bg-mayor-royal-blue/5 border border-mayor-royal-blue/10 rounded-full font-amharic shadow-[0_2px_10px_rgba(26,111,191,0.05)]">
            {label}
          </span>
          {isCenter && <span className="w-8 h-[2px] bg-gradient-to-r from-mayor-highlight-blue to-mayor-royal-blue rounded-full"></span>}
        </div>
      )}
      
      {title && (
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-mayor-navy font-amharic mb-6 leading-tight tracking-tight">
          {title}
        </h2>
      )}
      
      {description && (
        <p className={`text-mayor-navy/60 font-amharic max-w-2xl text-lg sm:text-xl font-medium leading-relaxed ${isCenter ? 'mx-auto' : ''}`}>
          {description}
        </p>
      )}
    </div>
  )
}

export function SectionIcon({ sectionKey }) {
  const Icon = ICONS[sectionKey] || Target
  return (
    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-mayor-royal-blue/10 to-mayor-highlight-blue/5 text-mayor-royal-blue mb-6 shadow-inner border border-mayor-royal-blue/10">
      <Icon className="w-7 h-7" strokeWidth={1.5} />
    </div>
  )
}
