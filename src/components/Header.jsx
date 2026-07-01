import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Shield, Menu, X } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { getWoredaAdministration, getWoredaLabel } from '../config/site'
import logo from '../assets/logo1.png'

const NAV_ITEMS = [
  { key: 'home', path: '/' },
  { key: 'services', path: '/services' },
  { key: 'complaints', path: '/complaints' },
  { key: 'appointments', path: '/appointments' },
  { key: 'projects', path: '/projects' },
]

function getNavLabel(key, lang, t) {
  const labels = {
    home: lang === 'am' ? 'መነሻ' : lang === 'om' ? 'Mana' : 'Home',
    services: t('services'),
    complaints: t('complaints'),
    appointments: t('appointments'),
    projects: lang === 'am' ? 'ፕሮጀክቶች' : lang === 'om' ? 'Pirojektoota' : 'Projects',
  }
  return labels[key] || key
}

export default function Header({ onPortalAccess }) {
  const { lang, setLang, t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileRef = useRef(null)

  const languages = [
    { code: 'am', shortName: 'አማ' },
    { code: 'om', shortName: 'ORO' },
    { code: 'en', shortName: 'EN' },
  ]

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const onOutside = (e) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [mobileOpen])

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`)

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-3 sm:pt-4" ref={mobileRef}>
        <div className="flex items-center gap-3 sm:gap-4 h-[3.25rem] sm:h-14 rounded-full border border-mayor-navy/10 bg-white px-2 sm:px-3 shadow-[0_4px_24px_rgba(10,42,74,0.06)]">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 shrink-0 pl-1 sm:pl-2 min-w-0 group"
          >
            <img
              src={logo}
              alt={`${getWoredaLabel(lang)} Logo`}
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
            />
            <span className="hidden md:block text-sm font-bold text-mayor-navy font-amharic truncate max-w-[140px] lg:max-w-[180px] group-hover:text-mayor-royal-blue transition-colors">
              {getWoredaAdministration(lang)}
            </span>
          </button>

          <div className="hidden lg:block w-px h-5 bg-mayor-gray-divider shrink-0" />

          {/* Desktop nav */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-0.5 min-w-0">
            {NAV_ITEMS.map(({ key, path }) => {
              const active = isActive(path)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigate(path)}
                  className={`relative px-3 xl:px-4 py-2 text-sm font-medium font-amharic whitespace-nowrap rounded-full transition-colors ${
                    active
                      ? 'text-mayor-navy font-semibold'
                      : 'text-mayor-navy/50 hover:text-mayor-navy'
                  }`}
                >
                  {getNavLabel(key, lang, t)}
                  {active && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-mayor-royal-blue" />
                  )}
                </button>
              )
            })}
          </nav>

          <div className="flex-1 lg:flex-none" />

          {/* Language + actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div
              className="flex items-center rounded-full bg-slate-100 p-0.5"
              role="group"
              aria-label="Language"
            >
              {languages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => setLang(language.code)}
                  className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-full transition-all ${
                    lang === language.code
                      ? 'bg-white text-mayor-navy shadow-sm'
                      : 'text-mayor-navy/45 hover:text-mayor-navy/70'
                  }`}
                >
                  {language.shortName}
                </button>
              ))}
            </div>

            {onPortalAccess && (
              <button
                type="button"
                onClick={onPortalAccess}
                className="hidden sm:flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 rounded-full border border-mayor-navy/15 text-mayor-navy text-xs sm:text-sm font-semibold font-amharic hover:bg-mayor-navy hover:text-white transition-colors"
              >
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">
                  {lang === 'am' ? 'ፓንል' : lang === 'om' ? 'Paanelii' : 'Portal'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full text-mayor-navy hover:bg-slate-100 transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="lg:hidden mt-2 py-2 px-2 rounded-2xl border border-mayor-navy/10 bg-white shadow-[0_8px_32px_rgba(10,42,74,0.08)]">
            {NAV_ITEMS.map(({ key, path }) => {
              const active = isActive(path)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigate(path)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-amharic transition-colors ${
                    active
                      ? 'bg-mayor-navy/5 text-mayor-navy font-semibold'
                      : 'text-mayor-navy/60 hover:bg-slate-50'
                  }`}
                >
                  {getNavLabel(key, lang, t)}
                </button>
              )
            })}
            {onPortalAccess && (
              <button
                type="button"
                onClick={onPortalAccess}
                className="sm:hidden w-full flex items-center gap-2 px-4 py-3 mt-1 rounded-xl text-sm font-semibold font-amharic text-mayor-royal-blue hover:bg-slate-50"
              >
                <Shield className="w-4 h-4" />
                {lang === 'am' ? 'የአስተዳደር ፓንል' : 'Admin Portal'}
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
