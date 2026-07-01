// Supabase Authentication utility for internal portals
import { supabase } from '../lib/supabase'
import { getPortalEmail } from '../config/site'

// Map Amharic department name directly to email (frontend mapping - no DB query needed)
const departmentToEmailMap = {
  'ንግድ ጽ/ቤት': getPortalEmail('trade'),
  'ሲቪል ምዝገባ': getPortalEmail('civil'),
  'ስራና ክህሎት': getPortalEmail('labor'),
  'ዋና ሥራ አስፈፃሚ ጽ/ቤት': getPortalEmail('ceo'),
  'ዋና ሥራ አስፈፃሚ': getPortalEmail('chief.executive'),
  'ወረዳ ምክር ቤት': getPortalEmail('council.speaker'),
  'አስተዳደር': getPortalEmail('admin')
}

// Map Amharic department name to English department name
function getDepartmentFromAmharic(deptAm) {
  const mapping = {
    'ንግድ ጽ/ቤት': 'Trade Office',
    'ሲቪል ምዝገባ': 'Civil Registration',
    'ስራና ክህሎት': 'Labor & Skills',
    'ዋና ሥራ አስፈፃሚ ጽ/ቤት': 'Chief Executive Office',
    'ዋና ሥራ አስፈፃሚ': 'Chief Executive',
    'ወረዳ ምክር ቤት': 'Woreda Council',
    'አስተዳደር': 'Admin'
  }
  return mapping[deptAm] || null
}

// Session cache with TTL (Time To Live)
const sessionCache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000, // 5 minutes cache
  isRefreshing: false
}

// Clear cache
function clearCache() {
  sessionCache.data = null
  sessionCache.timestamp = null
  sessionCache.isRefreshing = false
}

// Check if cache is valid
function isCacheValid() {
  if (!sessionCache.data || !sessionCache.timestamp) {
    return false
  }
  const age = Date.now() - sessionCache.timestamp
  return age < sessionCache.ttl
}

// Get cached user or null
function getCachedUser() {
  if (isCacheValid()) {
    return sessionCache.data
  }
  return null
}

// Set cached user
function setCachedUser(user) {
  sessionCache.data = user
  sessionCache.timestamp = Date.now()
}

// Retry helper with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
}

export async function login(departmentNameOrEmail, password) {
  try {
    // Determine if input is Amharic department name or email
    let email = null
    let targetDepartment = null
    
    // Check if it's an Amharic department name - use frontend mapping (no DB query)
    if (departmentToEmailMap[departmentNameOrEmail]) {
      // It's an Amharic department name - get email from frontend mapping
      email = departmentToEmailMap[departmentNameOrEmail]
      targetDepartment = getDepartmentFromAmharic(departmentNameOrEmail)
    } else {
      // Assume it's an email
      email = departmentNameOrEmail.trim().toLowerCase()
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      // Provide more helpful error messages
      let errorMessage = authError.message
      
      if (authError.message.includes('Invalid login credentials') || authError.message.includes('Email not confirmed')) {
        errorMessage = 'Invalid email or password. Please check your credentials.'
      } else if (authError.message.includes('User not found') || authError.message.includes('Invalid login')) {
        errorMessage = 'User account not found. Please contact administrator to create your account.'
      } else if (authError.message.includes('Email not confirmed')) {
        errorMessage = 'Email not confirmed. Please contact administrator.'
      }
      
      return { success: false, error: errorMessage }
    }

    if (!authData.user || !authData.session) {
      return { success: false, error: 'Authentication failed - no user or session' }
    }

    // Now that we're authenticated, RLS policies allow us to query
    let portalUser = null
    
    // Try by user_id first (preferred method) - this should work with the active session
    const { data: userById, error: errorById } = await retryWithBackoff(async () => {
      const result = await supabase
        .from('portal_users')
        .select('*')
        .eq('user_id', authData.user.id)
        .single()
      if (result.error && result.error.code !== 'PGRST116') throw result.error
      return result
    })
    
    if (userById && !errorById) {
      portalUser = userById
    } else {
      // Fallback to email lookup (for initial setup)
      const { data: userByEmail, error: errorByEmail } = await retryWithBackoff(async () => {
        const result = await supabase
          .from('portal_users')
          .select('*')
          .eq('email', email)
          .single()
        if (result.error && result.error.code !== 'PGRST116') throw result.error
        return result
      })
      
      if (userByEmail && !errorByEmail) {
        portalUser = userByEmail
        // Link the user_id if not already linked
        if (!portalUser.user_id) {
          await supabase
            .from('portal_users')
            .update({ user_id: authData.user.id })
            .eq('id', portalUser.id)
        }
      } else {
        // If user doesn't exist in portal_users, sign out
        await supabase.auth.signOut()
        clearCache()
        return { 
          success: false, 
          error: errorByEmail?.message || errorById?.message || 'User not authorized for portal access' 
        }
      }
    }

    if (!portalUser) {
      await supabase.auth.signOut()
      clearCache()
      return { success: false, error: 'User not authorized for portal access' }
    }

    // Cache the user data
    const userData = {
      user: authData.user,
      session: authData.session,
      portalUser: {
        id: portalUser.id,
        email: portalUser.email,
        username: portalUser.username,
        fullName: portalUser.full_name,
        department: portalUser.department,
        roleKey: portalUser.role_key,
        isAdmin: portalUser.is_admin
      }
    }
    
    setCachedUser(userData)

    return {
      success: true,
      authData: userData
    }
  } catch (error) {
    console.error('Login error:', error)
    clearCache()
    return { success: false, error: error.message || 'An error occurred during login' }
  }
}

export async function logout() {
  clearCache()
  await supabase.auth.signOut()
}

// Track if getCurrentUser is already running to prevent concurrent calls
let getCurrentUserPromise = null

export async function getCurrentUser(forceRefresh = false) {
  try {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = getCachedUser()
      if (cached) {
        // Verify session is still valid
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.id === cached.user?.id) {
          return cached
        } else {
          // Session changed, clear cache
          clearCache()
        }
      }
    }

    // If already running, return the existing promise
    if (getCurrentUserPromise) {
      return await getCurrentUserPromise
    }
    
    // Create the promise and store it
    getCurrentUserPromise = (async () => {
      try {
        // First check if there's an active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          clearCache()
          return null
        }

        // Get the user from the session (this validates the token)
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          clearCache()
          return null
        }

        // Get portal user details using user_id with retry
        const { data: portalUser, error: portalUserError } = await retryWithBackoff(async () => {
          const result = await supabase
            .from('portal_users')
            .select('*')
            .eq('user_id', user.id)
            .single()
          if (result.error && result.error.code !== 'PGRST116') throw result.error
          return result
        })

        if (portalUserError || !portalUser) {
          clearCache()
          return null
        }

        const userData = {
          user,
          session,
          portalUser: {
            id: portalUser.id,
            email: portalUser.email,
            username: portalUser.username,
            fullName: portalUser.full_name,
            department: portalUser.department,
            roleKey: portalUser.role_key,
            isAdmin: portalUser.is_admin
          }
        }

        // Cache the result
        setCachedUser(userData)
        
        return userData
      } catch (error) {
        console.error('getCurrentUser error:', error)
        clearCache()
        return null
      } finally {
        // Clear the promise when done
        getCurrentUserPromise = null
      }
    })()
    
    // Add timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => {
        getCurrentUserPromise = null
        reject(new Error('getCurrentUser timeout'))
      }, 5000) // 5 second timeout
    )
    
    return await Promise.race([getCurrentUserPromise, timeoutPromise])
  } catch (error) {
    getCurrentUserPromise = null
    clearCache()
    return null
  }
}

export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      clearCache()
      return null
    }
    return session
  } catch (error) {
    clearCache()
    return null
  }
}

export function isAuthenticated() {
  return getSession().then(session => session !== null)
}

// Listen to auth state changes
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    // Clear cache on sign out
    if (event === 'SIGNED_OUT') {
      clearCache()
    }
    
    // Refresh cache on sign in or token refresh
    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
      // Clear cache to force refresh
      clearCache()
    }
    
    // Call the callback
    callback(event, session)
  })
}

// Refresh user data (force cache refresh)
export async function refreshUser() {
  return getCurrentUser(true)
}

// Check if user has access to a department
export async function hasDepartmentAccess(department) {
  const user = await getCurrentUser()
  if (!user) return false
  if (user.portalUser.isAdmin) return true
  return user.portalUser.department === department
}

// Export cache utilities for debugging
export const authCache = {
  clear: clearCache,
  get: getCachedUser,
  isValid: isCacheValid
}
