import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const SAMPLE_STATS = { population: 125000, blocks: 12, services_count: 58 }

const SiteStatsContext = createContext({
  stats: SAMPLE_STATS,
  loading: true,
  refreshSiteStats: async () => {},
})

export function SiteStatsProvider({ children }) {
  const [stats, setStats] = useState(SAMPLE_STATS)
  const [loading, setLoading] = useState(true)

  const refreshSiteStats = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('site_stats')
        .select('population, blocks, services_count')
        .eq('id', 1)
        .maybeSingle()

      if (error) throw error
      if (data) {
        setStats({
          population: Number(data.population) || 0,
          blocks: Number(data.blocks) || 0,
          services_count: Number(data.services_count) || 0,
        })
      }
    } catch (err) {
      console.error('Failed to load site stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSiteStats()
  }, [refreshSiteStats])

  return (
    <SiteStatsContext.Provider value={{ stats, loading, refreshSiteStats }}>
      {children}
    </SiteStatsContext.Provider>
  )
}

export function useSiteStats() {
  return useContext(SiteStatsContext)
}
