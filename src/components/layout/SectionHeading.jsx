import { Target, Eye, Heart } from 'lucide-react'

const ICONS = {
  mission: Target,
  vision: Eye,
  values: Heart,
  about: Target,
}

export default function SectionHeading({ label, title, description, align = 'center', className = '' }) {
  const alignClass = align === 'left' ? 'text-left' : 'text-center'

  return (
    <div className={`mb-10 ${alignClass} ${className}`}>
      {label && (
        <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold uppercase tracking-wider text-mayor-royal-blue bg-mayor-royal-blue/10 rounded-full font-amharic">
          {label}
        </span>
      )}
      {title && (
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-mayor-navy font-amharic mb-3">
          {title}
        </h2>
      )}
      {description && (
        <p className={`text-mayor-navy/65 font-amharic max-w-2xl text-base sm:text-lg ${align === 'center' ? 'mx-auto' : ''}`}>
          {description}
        </p>
      )}
      <div className={`w-12 h-1 bg-mayor-royal-blue rounded-full mt-4 ${align === 'center' ? 'mx-auto' : ''}`} />
    </div>
  )
}

export function SectionIcon({ sectionKey }) {
  const Icon = ICONS[sectionKey] || Target
  return (
    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-mayor-royal-blue/10 text-mayor-royal-blue mb-4">
      <Icon className="w-6 h-6" />
    </div>
  )
}
