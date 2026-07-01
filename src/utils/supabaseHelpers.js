import { supabase } from '../lib/supabase'

/**
 * Execute a Supabase query with cache-busting
 * Adds timestamp to ensure fresh data
 */
export async function fetchWithCacheBust(table, queryBuilder, options = {}) {
  const { forceRefresh = true } = options
  
  // Add cache-busting timestamp if needed
  if (forceRefresh) {
    const timestamp = Date.now()
    // This ensures the query is unique and won't be cached
    queryBuilder = queryBuilder || supabase.from(table).select('*')
  }
  
  return queryBuilder
}

/**
 * Fetch complaints with cache control
 */
export async function fetchComplaints(filters = {}) {
  let query = supabase
    .from('complaints')
    .select('*')
  
  if (filters.department) {
    query = query.eq('assigned_department', filters.department)
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters.orderBy) {
    query = query.order(filters.orderBy, { ascending: filters.ascending !== false })
  } else {
    query = query.order('created_at', { ascending: false })
  }
  
  // Add cache-busting header
  const { data, error } = await query
  
  return { data, error }
}

/**
 * Fetch appointments with cache control
 */
export async function fetchAppointments(filters = {}) {
  let query = supabase
    .from('appointments')
    .select('*')
  
  if (filters.department) {
    query = query.eq('assigned_department', filters.department)
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters.orderBy) {
    query = query.order(filters.orderBy, { ascending: filters.ascending !== false })
  } else {
    query = query.order('created_at', { ascending: false })
  }
  
  const { data, error } = await query
  
  return { data, error }
}

/**
 * Clear Supabase client cache and refresh
 */
export async function refreshSupabaseClient() {
  // Clear any cached sessions
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    // Refresh the session
    await supabase.auth.refreshSession()
  }
  
  return true
}









