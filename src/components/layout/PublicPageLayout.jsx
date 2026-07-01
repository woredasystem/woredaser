import { useLanguage } from '../../hooks/useLanguage'
import Footer from './Footer'
import PageHeaderBand from './PageHeaderBand'

export default function PublicPageLayout({
  title,
  subtitle,
  onBack,
  children,
  maxWidth = 'max-w-6xl',
}) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28 sm:pt-32 ${maxWidth}`}>
        <PageHeaderBand
          title={title}
          subtitle={subtitle}
          onBack={onBack}
          backLabel={t('back')}
        />

        <main>{children}</main>
      </div>
      <Footer />
    </div>
  )
}
