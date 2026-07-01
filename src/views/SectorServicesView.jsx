import { useLanguage } from '../hooks/useLanguage'
import { useServices } from '../hooks/useServices'
import { useMemo } from 'react'
import PublicPageLayout from '../components/layout/PublicPageLayout'
import ServiceDetailAccordion from '../components/ServiceDetailAccordion'

export default function SectorServicesView({ sectorKey, onBack }) {
  const { t, lang } = useLanguage()
  const { services, loading } = useServices()

  const sector = services[sectorKey]

  const groupedServices = useMemo(() => {
    if (!sector) return { groups: {}, ungrouped: [] }

    const groups = {}
    const ungrouped = []

    sector.items.forEach((service, index) => {
      if (service.serviceGroup) {
        const groupKey = service.serviceGroup[lang] || service.serviceGroup.am || 'Other'
        if (!groups[groupKey]) groups[groupKey] = []
        groups[groupKey].push({ ...service, originalIndex: index })
      } else {
        ungrouped.push({ ...service, originalIndex: index })
      }
    })

    return { groups, ungrouped }
  }, [sector, lang])

  if (loading) {
    return (
      <PublicPageLayout
        title={t('services')}
        subtitle={lang === 'am' ? 'በመጫን ላይ...' : 'Loading...'}
        onBack={onBack}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-20 bg-white border-2 border-mayor-gray-divider rounded-2xl" />
          ))}
        </div>
      </PublicPageLayout>
    )
  }

  if (!sector) {
    return (
      <PublicPageLayout title={t('services')} onBack={onBack}>
        <p className="text-mayor-navy font-amharic text-center">
          {lang === 'am' ? 'አገልግሎት አልተገኘም' : lang === 'om' ? 'Tajaajilli hin argamne' : 'Service not found'}
        </p>
      </PublicPageLayout>
    )
  }

  const hideRequirements = sectorKey === 'tradeOffice'
  const hideFee = sectorKey === 'tradeOffice'

  const countLabel =
    lang === 'am'
      ? `${sector.items.length} አገልግሎቶች`
      : lang === 'om'
        ? `Tajaajiloota ${sector.items.length}`
        : `${sector.items.length} services`

  return (
    <PublicPageLayout
      title={sector.name[lang]}
      subtitle={countLabel}
      onBack={onBack}
      maxWidth="max-w-3xl"
    >
      <p className="text-center text-sm text-mayor-navy/45 font-amharic mb-6 -mt-2">
        {lang === 'am'
          ? 'ዝርዝር ለማየት አገልግሎት ይጫኑ'
          : lang === 'om'
            ? 'Bal\'ina argachuuf tajaajila cuqaasaa'
            : 'Tap a service to view full details'}
      </p>

      <div className="space-y-8">
        {Object.entries(groupedServices.groups).map(([groupName, groupServices]) => (
          <section key={groupName}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-mayor-navy/10">
              <span className="h-1 w-8 rounded-full bg-mayor-royal-blue" aria-hidden="true" />
              <h2 className="text-lg font-bold text-mayor-navy font-amharic">{groupName}</h2>
              <span className="text-xs text-mayor-navy/40 font-amharic">
                ({groupServices.length})
              </span>
            </div>

            <div className="space-y-3">
              {groupServices.map((service, index) => (
                <ServiceDetailAccordion
                  key={`${groupName}-${service.originalIndex}`}
                  service={service}
                  index={index}
                  sectorKey={sectorKey}
                  hideRequirements={hideRequirements}
                  hideFee={hideFee}
                />
              ))}
            </div>
          </section>
        ))}

        {groupedServices.ungrouped.length > 0 && (
          <section className="space-y-3">
            {Object.keys(groupedServices.groups).length > 0 && (
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-mayor-navy/10">
                <span className="h-1 w-8 rounded-full bg-mayor-royal-blue" aria-hidden="true" />
                <h2 className="text-lg font-bold text-mayor-navy font-amharic">
                  {lang === 'am' ? 'ሌሎች አገልግሎቶች' : lang === 'om' ? 'Tajaajiloota Biroo' : 'Other Services'}
                </h2>
              </div>
            )}
            {groupedServices.ungrouped.map((service, index) => (
              <ServiceDetailAccordion
                key={`ungrouped-${service.originalIndex}`}
                service={service}
                index={index}
                sectorKey={sectorKey}
                hideRequirements={hideRequirements}
                hideFee={hideFee}
              />
            ))}
          </section>
        )}
      </div>
    </PublicPageLayout>
  )
}
