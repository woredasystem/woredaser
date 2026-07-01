import { useLanguage } from '../hooks/useLanguage'
import { useServices } from '../hooks/useServices'
import SectorCard from '../components/SectorCard'
import PublicPageLayout from '../components/layout/PublicPageLayout'

export default function ServicesView({ onBack, onNavigateToSector }) {
  const { t, lang } = useLanguage()
  const { sectorsList } = useServices()

  return (
    <PublicPageLayout
      title={t('services')}
      subtitle={
        lang === 'am'
          ? 'የሚፈልጉትን የአገልግሎት ዘርፍ ይምረጡ'
          : lang === 'om'
            ? 'Gosa tajaajilaa barbaaddan filadhaa'
            : 'Choose a service sector to explore available offerings'
      }
      onBack={onBack}
      maxWidth="max-w-7xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 max-w-5xl mx-auto">
        {sectorsList.map((sector, index) => (
          <SectorCard
            key={sector.key}
            sector={sector}
            index={index}
            onClick={() => onNavigateToSector?.(sector.key)}
          />
        ))}
      </div>
    </PublicPageLayout>
  )
}
