import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const SiteContentContext = createContext({
  sections: [],
  loading: true,
  error: null,
  refreshSiteContent: async () => {},
})

export function SiteContentProvider({ children }) {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refreshSiteContent = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('site_content_sections')
        .select('*')
        .order('sort_order', { ascending: true })

      if (fetchError) throw fetchError
      setSections(data || [])
    } catch (err) {
      console.error('Failed to load site content:', err)
      setError(err.message || 'Failed to load site content')
      setSections([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSiteContent()
  }, [refreshSiteContent])

  return (
    <SiteContentContext.Provider value={{ sections, loading, error, refreshSiteContent }}>
      {children}
    </SiteContentContext.Provider>
  )
}

export function useSiteContent() {
  return useContext(SiteContentContext)
}
