import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { services } from '../data/services'
import { FileText, CheckCircle, Check, Users } from 'lucide-react'
import { useMemo } from 'react'

export default function SectorServicesView({ sectorKey, onBack }) {
  const { t, lang } = useLanguage()

  const sector = services[sectorKey]
  if (!sector) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-6 pt-24">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={onBack}
              className="mb-6 gov-button px-4 py-2 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('back')}</span>
            </button>
            <p className="text-mayor-navy font-amharic">{lang === 'am' ? 'አገልግሎት አልተገኘም' : lang === 'om' ? 'Tajaajilli hin argamne' : 'Service not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  // Group services by serviceGroup if they have one
  const groupedServices = useMemo(() => {
    const groups = {}
    const ungrouped = []

    sector.items.forEach((service, index) => {
      if (service.serviceGroup) {
        const groupKey = service.serviceGroup[lang] || service.serviceGroup.am || 'Other'
        if (!groups[groupKey]) {
          groups[groupKey] = []
        }
        groups[groupKey].push({ ...service, originalIndex: index })
      } else {
        ungrouped.push({ ...service, originalIndex: index })
      }
    })

    return { groups, ungrouped }
  }, [sector.items, lang])

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="mb-6 gov-button px-4 py-2 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('back')}</span>
          </button>

          {/* Sector Header */}
          <div className="gov-header rounded-gov-lg p-8 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-gov-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-amharic">
                {sector.name[lang]}
              </h1>
            </div>
            <div className="w-24 h-1 bg-white/30 rounded-full"></div>
          </div>

          {/* Services List - Grouped by serviceGroup */}
          <div className="space-y-8">
            {/* Render grouped services */}
            {Object.entries(groupedServices.groups).map(([groupName, groupServices]) => (
              <div key={groupName} className="space-y-4">
                {/* Service Group Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-mayor-royal-blue/10 p-2 rounded-gov">
                    <Users className="w-5 h-5 text-mayor-royal-blue" />
                  </div>
                  <h2 className="text-2xl font-bold text-mayor-navy font-amharic">
                    {groupName}
                  </h2>
                  <span className="text-sm text-mayor-navy/60 font-amharic">
                    ({groupServices.length} {lang === 'am' ? 'አገልግሎቶች' : lang === 'om' ? 'tajaajiloota' : 'services'})
                  </span>
                </div>

                {/* Services in this group */}
                {groupServices.map((service, index) => (
                  <div
                    key={`${groupName}-${index}`}
                    className="gov-card p-6 hover:shadow-gov-md transition-all duration-300 border-l-4 border-l-mayor-royal-blue ml-6"
                  >
                    {/* Service Name */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-mayor-royal-blue/10 p-2 rounded-gov flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-mayor-royal-blue" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-mayor-navy mb-2 font-amharic">
                          {service.name[lang]}
                        </h3>

                        {/* Requirements - Hide for Trade Office since it repeats the name */}
                        {sectorKey !== 'tradeOffice' && (
                          <div className="bg-mayor-gray-divider/30 rounded-gov p-4 mb-3">
                            <div className="flex items-start gap-2 mb-3">
                              <span className="text-sm font-semibold text-mayor-navy font-amharic">
                                {lang === 'am' ? 'የሚፈለጉ ሰነዶች:' : lang === 'om' ? 'Ragaalee Barbaachisan:' : 'Requirements:'}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {(() => {
                                const reqText = service.requirements[lang]
                                // Split by common separators (Amharic period ።, Amharic comma ፣, or English comma)
                                const requirements = reqText
                                  .split(/[።፣,]/)
                                  .map(req => req.trim())
                                  .filter(req => req.length > 0)

                                // If no separators found or only one item, treat as single requirement
                                if (requirements.length <= 1) {
                                  return (
                                    <div className="flex items-start gap-2">
                                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-mayor-navy/90 leading-relaxed font-amharic text-sm">
                                        {reqText}
                                      </span>
                                    </div>
                                  )
                                }

                                return requirements.map((requirement, reqIndex) => (
                                  <div key={reqIndex} className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-mayor-navy/90 leading-relaxed font-amharic text-sm">
                                      {requirement}
                                    </span>
                                  </div>
                                ))
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Standard */}
                        {service.standard && (
                          <div className="mb-3 pt-2 border-t border-mayor-gray-divider">
                            <span className="text-sm font-semibold text-mayor-royal-blue font-amharic">
                              {service.standard[lang]}
                            </span>
                          </div>
                        )}

                        {/* Standard Time (if standard doesn't exist) */}
                        {!service.standard && service.standardTime && (
                          <div className="mb-3 pt-2 border-t border-mayor-gray-divider">
                            <span className="text-sm font-semibold text-mayor-royal-blue font-amharic">
                              {lang === 'am' ? 'የተቀመጠው ስታንዳርድ: ' : lang === 'om' ? 'Sadarkaa Murteeffame: ' : 'Set Standard: '}
                              {service.standardTime}
                            </span>
                          </div>
                        )}

                        {/* Fee - Hide for Trade Office */}
                        {sectorKey !== 'tradeOffice' && (
                          <div className="flex items-center justify-between pt-2 border-t border-mayor-gray-divider">
                            <span className="text-sm text-mayor-navy/70 font-amharic">
                              {lang === 'am' ? 'ክፍያ:' : lang === 'om' ? 'Kaffaltii:' : 'Fee:'}
                            </span>
                            <div className="text-right">
                              <span className={`text-lg font-bold font-amharic ${service.fee === 0 ? 'text-green-600' : 'text-mayor-royal-blue'
                                }`}>
                                {service.fee === 0
                                  ? (lang === 'am' ? 'ነጻ' : lang === 'om' ? 'Bilisaa' : 'Free')
                                  : `${service.fee} ${lang === 'am' ? 'ብር' : lang === 'om' ? 'Qarshii' : 'ETB'}`
                                }
                              </span>
                              {service.paymentMethod && (
                                <p className="text-xs text-mayor-navy/60 font-amharic mt-1">
                                  {service.paymentMethod[lang]}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Render ungrouped services */}
            {groupedServices.ungrouped.length > 0 && (
              <div className="space-y-4">
                {groupedServices.ungrouped.map((service, index) => (
                  <div
                    key={`ungrouped-${index}`}
                    className="gov-card p-6 hover:shadow-gov-md transition-all duration-300 border-l-4 border-l-mayor-royal-blue"
                  >
                    {/* Service Name */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-mayor-royal-blue/10 p-2 rounded-gov flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-mayor-royal-blue" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-mayor-navy mb-2 font-amharic">
                          {service.name[lang]}
                        </h3>

                        {/* Requirements - Hide for Trade Office since it repeats the name */}
                        {sectorKey !== 'tradeOffice' && (
                          <div className="bg-mayor-gray-divider/30 rounded-gov p-4 mb-3">
                            <div className="flex items-start gap-2 mb-3">
                              <span className="text-sm font-semibold text-mayor-navy font-amharic">
                                {lang === 'am' ? 'የሚፈለጉ ሰነዶች:' : lang === 'om' ? 'Ragaalee Barbaachisan:' : 'Requirements:'}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {(() => {
                                const reqText = service.requirements[lang]
                                // Split by common separators (Amharic period ።, Amharic comma ፣, or English comma)
                                const requirements = reqText
                                  .split(/[።፣,]/)
                                  .map(req => req.trim())
                                  .filter(req => req.length > 0)

                                // If no separators found or only one item, treat as single requirement
                                if (requirements.length <= 1) {
                                  return (
                                    <div className="flex items-start gap-2">
                                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-mayor-navy/90 leading-relaxed font-amharic text-sm">
                                        {reqText}
                                      </span>
                                    </div>
                                  )
                                }

                                return requirements.map((requirement, reqIndex) => (
                                  <div key={reqIndex} className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-mayor-navy/90 leading-relaxed font-amharic text-sm">
                                      {requirement}
                                    </span>
                                  </div>
                                ))
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Standard */}
                        {service.standard && (
                          <div className="mb-3 pt-2 border-t border-mayor-gray-divider">
                            <span className="text-sm font-semibold text-mayor-royal-blue font-amharic">
                              {service.standard[lang]}
                            </span>
                          </div>
                        )}

                        {/* Standard Time (if standard doesn't exist) */}
                        {!service.standard && service.standardTime && (
                          <div className="mb-3 pt-2 border-t border-mayor-gray-divider">
                            <span className="text-sm font-semibold text-mayor-royal-blue font-amharic">
                              {lang === 'am' ? 'የተቀመጠው ስታንዳርድ: ' : lang === 'om' ? 'Sadarkaa Murteeffame: ' : 'Set Standard: '}
                              {service.standardTime}
                            </span>
                          </div>
                        )}

                        {/* Fee - Hide for Trade Office */}
                        {sectorKey !== 'tradeOffice' && (
                          <div className="flex items-center justify-between pt-2 border-t border-mayor-gray-divider">
                            <span className="text-sm text-mayor-navy/70 font-amharic">
                              {lang === 'am' ? 'ክፍያ:' : lang === 'om' ? 'Kaffaltii:' : 'Fee:'}
                            </span>
                            <div className="text-right">
                              <span className={`text-lg font-bold font-amharic ${service.fee === 0 ? 'text-green-600' : 'text-mayor-royal-blue'
                                }`}>
                                {service.fee === 0
                                  ? (lang === 'am' ? 'ነጻ' : lang === 'om' ? 'Bilisaa' : 'Free')
                                  : `${service.fee} ${lang === 'am' ? 'ብር' : lang === 'om' ? 'Qarshii' : 'ETB'}`
                                }
                              </span>
                              {service.paymentMethod && (
                                <p className="text-xs text-mayor-navy/60 font-amharic mt-1">
                                  {service.paymentMethod[lang]}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

