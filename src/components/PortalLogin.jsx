import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { login, getCurrentUser, logout } from '../utils/auth'
import { supabase } from '../lib/supabase'
import { getDepartmentDisplayName } from '../utils/routing'
import { Shield, Lock, Building2, Home } from 'lucide-react'

export default function PortalLogin({ department, roleKey, onSuccess, onBack }) {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()

  // Get the Amharic department name for this portal (as default/suggestion)
  const defaultDepartmentAm = getDepartmentDisplayName(department, 'am')

  const [departmentName, setDepartmentName] = useState(defaultDepartmentAm || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true) // Track if we're checking for existing auth

  // Check if user is already logged in on mount - redirect immediately if authenticated
  useEffect(() => {
    const checkExistingAuth = async () => {
      setCheckingAuth(true)
      try {
        // Wait a bit for Supabase to restore session from storage
        await new Promise(resolve => setTimeout(resolve, 500))

        // Use getCurrentUser which uses caching
        const user = await getCurrentUser()

        if (user) {
          console.log('PortalLogin: User already authenticated:', user.portalUser)

          // User is already logged in, verify access and navigate immediately
          const hasAccess = user.portalUser.department === department ||
            (user.portalUser.isAdmin && department === 'Admin') ||
            user.portalUser.isAdmin

          if (hasAccess) {
            console.log('Redirecting authenticated user to portal')
            // Navigate directly to the portal page
            if (user.portalUser.isAdmin) {
              navigate('/portal/admin', { replace: true })
            } else {
              navigate(`/portal/department/${encodeURIComponent(user.portalUser.department)}/${user.portalUser.roleKey}`, { replace: true })
            }
            return // Exit early, don't show login form
          } else {
            // User is logged in but doesn't have access to this portal
            console.log('User logged in but no access to this portal')
            setError(lang === 'am' ? 'ይህንን ፓንል ለመዳረስ ፍቃድ የለዎትም' : 'You do not have access to this portal')
          }
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
      // Check if user is already logged in with a different account
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: existingPortalUser } = await supabase
          .from('portal_users')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (existingPortalUser && existingPortalUser.department !== department && !existingPortalUser.is_admin) {
          await logout()
        }
      }

      const result = await login(departmentName.trim(), password)

      if (result.success) {
        setLoading(false) // Stop loading immediately

        // Verify user has access to this department
        if (result.authData.portalUser.department !== department && !result.authData.portalUser.isAdmin) {
          setError(lang === 'am' ? 'ይህንን ፓንል ለመዳረስ ፍቃድ የለዎትም' : 'You do not have access to this portal')
          return
        }

        // Navigate directly instead of relying on onSuccess callback
        // This ensures navigation happens even if auth state change handler fails
        if (result.authData.portalUser.isAdmin) {
          navigate('/portal/admin', { replace: true })
        } else {
          navigate(`/portal/department/${encodeURIComponent(result.authData.portalUser.department)}/${result.authData.portalUser.roleKey}`, { replace: true })
        }

        // Also call onSuccess for state management
        onSuccess(result.authData)
      } else {
        setError(result.error || (lang === 'am' ? 'የተሳሳተ የመግቢያ መረጃ' : lang === 'om' ? 'Odeeffannoo seensaa dogoggoraa' : 'Invalid credentials'))
        setLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(error.message || (lang === 'am' ? 'ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ' : lang === 'om' ? 'Dogongora uumameera. Mee irra deebi\'ii yaali' : 'An error occurred. Please try again'))
      setLoading(false)
    }
  }

  // Show loading screen while checking if user is already authenticated
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mayor-deep-blue via-mayor-royal-blue to-mayor-highlight-blue flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <p className="text-white font-amharic text-lg">
            {lang === 'am' ? 'በመጫን ላይ...' : lang === 'om' ? 'Fe\'aa jira...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mayor-deep-blue via-mayor-royal-blue to-mayor-highlight-blue flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="gov-card p-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-mayor-navy hover:text-mayor-royal-blue hover:bg-mayor-royal-blue/10 rounded-gov transition-colors font-amharic"
            >
              <Home className="w-5 h-5" />
              <span>{lang === 'am' ? 'ወደ መነሻ ተመለስ' : lang === 'om' ? 'Gara Jalqabaatti Deebi\'i' : 'Back to Home'}</span>
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-mayor-royal-blue/10 rounded-full mb-4">
              <Shield className="w-8 h-8 text-mayor-royal-blue" />
            </div>
            <h1 className="text-2xl font-bold text-mayor-navy mb-2 font-amharic">
              {lang === 'am' ? 'የመግቢያ ፓንል' : 'Portal Login'}
            </h1>
            <p className="text-mayor-navy/70 font-amharic">
              {getDepartmentDisplayName(department, lang)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                {lang === 'am' ? 'የስራ ክፍል (አማርኛ)' : lang === 'om' ? 'Kutaa Hojii (Afaan Amaaraa)' : 'Department (Amharic)'}
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mayor-navy/40" />
                <input
                  type="text"
                  required
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue font-amharic"
                  placeholder={lang === 'am' ? 'የስራ ክፍል በአማርኛ ያስገቡ (ምሳሌ: ንግድ ጽ/ቤት)' : lang === 'om' ? 'Kutaa hojii Afaan Amaaraan galchaa (fkn: ንግድ ጽ/ቤት)' : 'Enter department in Amharic (e.g., ንግድ ጽ/ቤት)'}
                />
              </div>
              <p className="text-xs text-mayor-navy/60 mt-1 font-amharic">
                {lang === 'am'
                  ? `ምክር: ${defaultDepartmentAm}`
                  : lang === 'om'
                    ? `Yaada: ${defaultDepartmentAm}`
                    : `Suggested: ${defaultDepartmentAm}`
                }
              </p>
            </div>

            <div>
              <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                {lang === 'am' ? 'የይለፍ ቃል' : lang === 'om' ? 'Jecha Icciitii' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mayor-navy/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                  placeholder={lang === 'am' ? 'የይለፍ ቃል ያስገቡ' : lang === 'om' ? 'Jecha icciitii galchaa' : 'Enter password'}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-gov text-sm font-amharic">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 px-4 py-2 bg-white border border-mayor-gray-divider text-mayor-navy rounded-gov hover:bg-mayor-gray-divider transition-colors font-amharic"
                >
                  {t('back')}
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 gov-button py-2 disabled:opacity-50 font-amharic"
              >
                {loading
                  ? (lang === 'am' ? 'በመግባት ላይ...' : lang === 'om' ? 'Seenaa jira...' : 'Logging in...')
                  : (lang === 'am' ? 'ግባ' : lang === 'om' ? 'Seeni' : 'Login')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

