import { createClient } from '@supabase/supabase-js'

// Woreda Digital Portal - Supabase Configuration
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env (restart dev server after changes)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Save .env as UTF-8 (not UTF-16) and restart npm run dev.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage, // Use localStorage for session persistence across page refreshes
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
  }
)

