import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { useDepartments } from '../hooks/useDepartments'
import { getDepartmentDisplayName } from '../utils/routing'
import { useOfficials } from '../hooks/useOfficials'
import { Building2, Shield, ArrowUpRight, ArrowLeft, Lock } from 'lucide-react'
import logo from '../assets/logo1.png'
import { getWoredaAdministration } from '../config/site'

const DEPT_ACCENTS = [
  {
    panel: 'bg-mayor-royal-blue',
    hover: 'hover:border-mayor-royal-blue/40',
    icon: 'text-mayor-royal-blue',
  },
  {
    panel: 'bg-mayor-deep-blue',
    hover: 'hover:border-mayor-deep-blue/40',
    icon: 'text-mayor-deep-blue',
  },
  {
    panel: 'bg-mayor-navy',
    hover: 'hover:border-mayor-navy/40',
    icon: 'text-mayor-navy',
  },
  {
    panel: 'bg-mayor-highlight-blue',
    hover: 'hover:border-mayor-highlight-blue/45',
    icon: 'text-mayor-highlight-blue',
  },
  {
    panel: 'bg-mayor-deep-blue',
    hover: 'hover:border-mayor-deep-blue/40',
    icon: 'text-mayor-deep-blue',
  },
  {
    panel: 'bg-mayor-royal-blue',
    hover: 'hover:border-mayor-royal-blue/40',
    icon: 'text-mayor-royal-blue',
  },
]

function PortalDepartmentCard({ dept, official, lang, accent, index, onClick }) {
  const indexLabel = String(index + 1).padStart(2, '0')

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full min-h-[5.5rem] text-left bg-white border-2 border-mayor-gray-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_12px_32px_rgba(10,42,74,0.08)] hover:-translate-y-0.5 ${accent.hover}`}
    >
      <div className={`relative flex w-16 sm:w-[4.5rem] shrink-0 items-center justify-center ${accent.panel}`}>
        {official?.image_url ? (
          <img
            src={official.image_url}
            alt=""
            className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <Building2 className="w-6 h-6 text-white/90" strokeWidth={1.75} />
        )}
        <div className="absolute inset-y-0 -right-px w-px bg-white/15" aria-hidden="true" />
      </div>

      <div className="relative flex flex-1 flex-col justify-center gap-0.5 py-4 pl-4 pr-12 sm:pl-5 sm:pr-14 min-w-0">
        <span
          className={`absolute top-2.5 right-3 text-xl font-bold tabular-nums leading-none select-none ${accent.icon} opacity-15`}
          aria-hidden="true"
        >
          {indexLabel}
        </span>

        <h3 className="text-base sm:text-lg font-bold text-mayor-navy font-amharic leading-snug group-hover:text-mayor-deep-blue transition-colors truncate">
          {getDepartmentDisplayName(dept.key, lang)}
        </h3>

        {official && (
          <p className="text-xs sm:text-sm text-mayor-navy/50 font-amharic truncate">
            {lang === 'am' ? official.full_name_am : official.full_name_en}
          </p>
        )}
      </div>

      <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-mayor-gray-divider bg-slate-50 text-mayor-navy/35 group-hover:border-mayor-navy group-hover:bg-mayor-navy group-hover:text-white transition-all duration-300">
        <ArrowUpRight className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" strokeWidth={2} />
      </span>
    </button>
  )
}

export default function PortalAccess({ onSelectPortal }) {
  const { lang } = useLanguage()
  const navigate = useNavigate()
  const { officials } = useOfficials()
  const { departments } = useDepartments()

  const portalDepartments = departments
    .filter((role) => !role.isAdmin)
    .map((role) => ({ key: role.department, roleKey: role.roleKey }))

  const handlePortalAccess = (department, roleKey) => {
    onSelectPortal({ type: 'login', department, roleKey })
  }

  const handleAdminAccess = () => {
    onSelectPortal({ type: 'login', department: 'Admin', roleKey: 'admin' })
  }

  const subtitle =
    lang === 'am'
      ? 'የስራ ክፍል ወይም አስተዳደር ፓንል ይምረጡ'
      : lang === 'om'
        ? 'Kutaa Hojii ykn Paanelii Bulchiinsaa Filadhu'
        : 'Select your department or admin portal to sign in'

  const backLabel =
    lang === 'am' ? 'ወደ መነሻ' : lang === 'om' ? 'Gara Jalqabaatti' : 'Back to Home'

  const departmentsLabel =
    lang === 'am' ? 'የስራ ክፍሎች' : lang === 'om' ? 'Kutaalee Hojii' : 'Departments'

  const adminLabel =
    lang === 'am' ? 'አስተዳደር' : lang === 'om' ? 'Bulchiinsa' : 'Administration'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <header className="text-center mb-8 sm:mb-10">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-mayor-navy/50 hover:text-mayor-royal-blue transition-colors font-amharic group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            {backLabel}
          </button>

          <img src={logo} alt="" className="h-14 w-auto mx-auto mb-5" />

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-mayor-navy font-amharic leading-tight">
            {getWoredaAdministration(lang)}
          </h1>
          <p className="mt-2 sm:mt-3 text-base text-mayor-navy/55 font-amharic max-w-md mx-auto leading-relaxed">
            {subtitle}
          </p>

          <div className="flex items-center justify-center gap-2 mt-5" aria-hidden="true">
            <span className="w-2 h-2 rounded-full bg-mayor-royal-blue/25" />
            <span className="w-10 h-0.5 rounded-full bg-mayor-royal-blue" />
            <span className="w-2 h-2 rounded-full bg-mayor-royal-blue/25" />
          </div>
        </header>

        <section className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-mayor-navy/40 font-amharic mb-4 text-center">
            {departmentsLabel}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {portalDepartments.map((dept, index) => {
              const official = officials.find((o) => o.role_key === dept.roleKey)
              const accent = DEPT_ACCENTS[index % DEPT_ACCENTS.length]
              return (
                <PortalDepartmentCard
                  key={dept.key}
                  dept={dept}
                  official={official}
                  lang={lang}
                  accent={accent}
                  index={index}
                  onClick={() => handlePortalAccess(dept.key, dept.roleKey)}
                />
              )
            })}
          </div>
        </section>

        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-mayor-navy/40 font-amharic mb-4 text-center">
            {adminLabel}
          </p>
          <button
            type="button"
            onClick={handleAdminAccess}
            className="group w-full flex items-center gap-4 brand-sunburst-bg hover:opacity-95 text-white rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,70,148,0.25)] hover:-translate-y-0.5 text-left"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 group-hover:bg-white/15 transition-colors">
              <Shield className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold font-amharic">
                {lang === 'am' ? 'የአስተዳደር ፓንል' : lang === 'om' ? 'Paanelii Bulchiinsaa' : 'Admin Portal'}
              </h3>
              <p className="text-sm text-white/65 font-amharic mt-0.5">
                {lang === 'am' ? 'ሙሉ የስርዓት አስተዳደር' : 'Full system management'}
              </p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:scale-110 transition-all shrink-0" />
          </button>
        </section>

        <p className="mt-10 flex items-center justify-center gap-2 text-xs text-mayor-navy/35 font-amharic">
          <Lock className="w-3.5 h-3.5" />
          {lang === 'am' ? 'ደህንነቱ የተጠበቀ መዳረሻ · ለሰራተኞች ብቻ' : 'Secure staff access only'}
        </p>
      </div>
    </div>
  )
}
