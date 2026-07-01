import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { useOfficials } from '../hooks/useOfficials'
import { login, getCurrentUser, logout } from '../utils/auth'
import { supabase } from '../lib/supabase'
import { getDepartmentDisplayName } from '../utils/routing'
import { Shield, Lock, Mail, ArrowLeft, Building2 } from 'lucide-react'
import PasswordInput from './PasswordInput'
import logo from '../assets/logo1.png'

const ROLE_ACCENTS = {
  trade_head: 'bg-mayor-royal-blue',
  civil_head: 'bg-mayor-deep-blue',
  labor_head: 'bg-mayor-navy',
  ceo_office_head: 'bg-mayor-highlight-blue',
  ceo: 'bg-mayor-deep-blue',
  council_speaker: 'bg-mayor-royal-blue',
  admin: 'bg-mayor-navy',
}

export default function PortalLogin({ department, roleKey, onSuccess, onBack }) {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const { officials } = useOfficials()

  const departmentLabel = getDepartmentDisplayName(department, lang)
  const accentClass = ROLE_ACCENTS[roleKey] || 'bg-mayor-royal-blue'
  const official = officials.find((o) => o.role_key === roleKey)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const checkExistingAuth = async () => {
      setCheckingAuth(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const user = await getCurrentUser()

        if (user) {
          const hasAccess =
            user.portalUser.department === department ||
            (user.portalUser.isAdmin && department === 'Admin') ||
            user.portalUser.isAdmin

          if (hasAccess) {
            if (user.portalUser.isAdmin) {
              navigate('/portal/admin', { replace: true })
            } else {
              navigate(
                `/portal/department/${encodeURIComponent(user.portalUser.department)}/${user.portalUser.roleKey}`,
                { replace: true }
              )
            }
            return
          }
          setError(
            lang === 'am'
              ? 'ይህንን ፓንል ለመዳረስ ፍቃድ የለዎትም'
              : 'You do not have access to this portal'
          )
        }
      } catch (err) {
        console.error('Error checking existing auth:', err)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkExistingAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, lang, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: existingPortalUser } = await supabase
          .from('portal_users')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (
          existingPortalUser &&
          existingPortalUser.department !== department &&
          !existingPortalUser.is_admin
        ) {
          await logout()
        }
      }

      const result = await login(email.trim(), password)

      if (result.success) {
        setLoading(false)

        if (result.authData.portalUser.department !== department && !result.authData.portalUser.isAdmin) {
          setError(
            lang === 'am'
              ? 'ይህንን ፓንል ለመዳረስ ፍቃድ የለዎትም'
              : 'You do not have access to this portal'
          )
          return
        }

        if (result.authData.portalUser.isAdmin) {
          navigate('/portal/admin', { replace: true })
        } else {
          navigate(
            `/portal/department/${encodeURIComponent(result.authData.portalUser.department)}/${result.authData.portalUser.roleKey}`,
            { replace: true }
          )
        }

        onSuccess(result.authData)
      } else {
        setError(
          result.error ||
            (lang === 'am'
              ? 'የተሳሳተ ኢሜይል ወይም የይለፍ ቃል'
              : lang === 'om'
                ? 'Imeelii ykn jecha icciitii dogoggoraa'
                : 'Invalid email or password')
        )
        setLoading(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(
        err.message ||
          (lang === 'am'
            ? 'ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ'
            : lang === 'om'
              ? "Dogongora uumameera. Mee irra deebi'ii yaali"
              : 'An error occurred. Please try again')
      )
      setLoading(false)
    }
  }

  const loginTitle =
    lang === 'am' ? 'የመግቢያ ፓንል' : lang === 'om' ? 'Seensa Paanelii' : 'Portal Login'

  const backLabel =
    lang === 'am' ? 'ተመለስ' : lang === 'om' ? 'Deebi\'i' : t('back')

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-mayor-navy/5 border-2 border-mayor-navy/10 mb-4">
            <div className="h-6 w-6 border-2 border-mayor-royal-blue/30 border-t-mayor-royal-blue rounded-full animate-spin" />
          </div>
          <p className="text-mayor-navy/60 font-amharic text-sm">
            {lang === 'am' ? 'በመጫን ላይ...' : lang === 'om' ? 'Fe\'aa jira...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 w-full max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col justify-center">
        <header className="text-center mb-8">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-mayor-navy/50 hover:text-mayor-royal-blue transition-colors font-amharic group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              {backLabel}
            </button>
          )}

          <img src={logo} alt="" className="h-12 w-auto mx-auto mb-4 opacity-90" />

          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${accentClass} mb-4 shadow-sm`}>
            {official?.image_url ? (
              <img src={official.image_url} alt="" className="h-full w-full rounded-xl object-cover" />
            ) : (
              <Shield className="w-6 h-6 text-white" strokeWidth={1.75} />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-mayor-navy font-amharic leading-tight">
            {loginTitle}
          </h1>
          <p className="mt-2 text-base text-mayor-navy/55 font-amharic">
            {departmentLabel}
          </p>

          <div className="flex items-center justify-center gap-2 mt-4" aria-hidden="true">
            <span className="w-2 h-2 rounded-full bg-mayor-royal-blue/25" />
            <span className="w-10 h-0.5 rounded-full bg-mayor-royal-blue" />
            <span className="w-2 h-2 rounded-full bg-mayor-royal-blue/25" />
          </div>
        </header>

        <div className="bg-white border-2 border-mayor-gray-divider rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_8px_24px_rgba(10,42,74,0.06)] transition-shadow duration-300">
          <div className={`h-1 ${accentClass}`} />

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3 rounded-xl border-2 border-mayor-gray-divider bg-slate-50/80 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mayor-royal-blue/10">
                <Building2 className="w-4 h-4 text-mayor-royal-blue" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-mayor-navy/45 font-amharic">
                  {lang === 'am' ? 'የስራ ክፍል' : lang === 'om' ? 'Kutaa Hojii' : 'Department'}
                </p>
                <p className="text-sm font-semibold text-mayor-navy font-amharic truncate">{departmentLabel}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mayor-navy/45 font-amharic mb-2">
                {lang === 'am' ? 'ኢሜይል' : lang === 'om' ? 'Imeelii' : 'Email'}
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-mayor-navy/30 group-focus-within:text-mayor-royal-blue transition-colors" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-mayor-gray-divider text-mayor-navy focus:outline-none focus:border-mayor-royal-blue focus:bg-white transition-colors"
                  placeholder={
                    lang === 'am'
                      ? 'example@woreda.gov.et'
                      : 'your.email@woreda.gov.et'
                  }
                />
              </div>
              <p className="text-xs text-mayor-navy/45 mt-2 font-amharic">
                {lang === 'am'
                  ? 'ከአስተዳዳሪ የተሰጠዎት ኢሜይል ያስገቡ'
                  : lang === 'om'
                    ? 'Imeelii adminin kenname galchaa'
                    : 'Enter the email assigned by your administrator'}
              </p>
            </div>

            <div>
              <label
                htmlFor="portal-password"
                className="block text-xs font-bold uppercase tracking-wider text-mayor-navy/45 font-amharic mb-2"
              >
                {lang === 'am' ? 'የይለፍ ቃል' : lang === 'om' ? 'Jecha Icciitii' : 'Password'}
              </label>
              <PasswordInput
                id="portal-password"
                lang={lang}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  lang === 'am'
                    ? 'የይለፍ ቃል ያስገቡ'
                    : lang === 'om'
                      ? 'Jecha icciitii galchaa'
                      : 'Enter password'
                }
              />
            </div>

            {error && (
              <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm font-amharic">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-mayor-navy hover:bg-mayor-deep-blue text-white rounded-xl font-semibold font-amharic transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {lang === 'am' ? 'በመግባት ላይ...' : 'Logging in...'}
                </>
              ) : (
                lang === 'am' ? 'ግባ' : lang === 'om' ? 'Seeni' : 'Login'
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-xs text-mayor-navy/35 font-amharic">
          <Lock className="w-3.5 h-3.5" />
          {lang === 'am' ? 'ደህንነቱ የተጠበቀ መዳረሻ' : 'Secure staff access'}
        </p>
      </div>
    </div>
  )
}
