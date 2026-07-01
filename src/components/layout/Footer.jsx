import { useLanguage } from '../../hooks/useLanguage'
import {
  getSubcityWoredaLabel,
  getCopyrightText,
} from '../../config/site'
import BrandSunburst from '../brand/BrandSunburst'

export default function Footer() {
  const { lang } = useLanguage()

  return (
    <footer className="aurora-bg text-white mt-auto relative overflow-hidden border-t border-white/10">
      <div className="absolute inset-0 bg-gradient-to-t from-mayor-navy/90 to-transparent z-0"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <p className="font-amharic font-semibold text-lg mb-2">
              {getSubcityWoredaLabel(lang)}
            </p>
            <p className="text-sm text-white/70 font-amharic">
              {lang === 'am' ? 'ዲጂታል አገልግሎት ፖርታል' : lang === 'om' ? 'Paanelii Tajaajila Dijitaalaa' : 'Digital Service Portal'}
            </p>
          </div>
          <div className="md:text-center">
            <p className="text-sm text-white/60 font-amharic italic">
              {lang === 'am'
                ? 'አልቆ ለመፈጸም ከህዝብ የተሰጠን አደራ!'
                : lang === 'om'
                  ? 'Amanamummaa Ummataaf Kennine!'
                  : 'Commitment to Public Trust'}
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-sm text-white/70 font-amharic">
              {getCopyrightText(lang)}
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-xs text-white/50 font-amharic">
          {lang === 'am' ? 'ሁሉም መብቶች የተጠበቁ ናቸው' : lang === 'om' ? 'Mirgi hundi eegame' : 'All rights reserved'}
        </div>
      </div>
    </footer>
  )
}
