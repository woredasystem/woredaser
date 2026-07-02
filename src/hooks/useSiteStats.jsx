import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { DEFAULT_STAT_ITEMS, mapStatRow } from '../utils/siteStatPresets'

const SiteStatsContext = createContext({
  items: [],
  loading: true,
  refreshSiteStats: async () => {},
  /** @deprecated use items */
  stats: { population: 0, blocks: 0, services_count: 0 },
})

function buildLegacyStats(items) {
  const find = (hints) =>
    items.find((i) => hints.some((h) => i.label_en?.toLowerCase().includes(h) || i.label_am?.includes(h)))
  return {
    population: find(['population', 'ህዝብ'])?.value ?? items[0]?.value ?? 0,
    blocks: find(['blocks', 'ብሎኮች'])?.value ?? items[1]?.value ?? 0,
    services_count: find(['services', 'አገልግሎት'])?.value ?? items[2]?.value ?? 0,
  }
}

export function SiteStatsProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const refreshSiteStats = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('site_stat_items')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error

      if (data?.length) {
        setItems(data.map(mapStatRow))
        return
      }

      setItems(DEFAULT_STAT_ITEMS.map((item, idx) => ({ ...item, id: `default-${idx}`, is_active: true })))
    } catch (err) {
      console.error('Failed to load site stat items:', err)
      setItems(DEFAULT_STAT_ITEMS.map((item, idx) => ({ ...item, id: `default-${idx}`, is_active: true })))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSiteStats()
  }, [refreshSiteStats])

  const value = {
    items: items.filter((i) => i.is_active !== false),
    allItems: items,
    loading,
    refreshSiteStats,
    stats: buildLegacyStats(items),
  }

  return (
    <SiteStatsContext.Provider value={value}>
      {children}
    </SiteStatsContext.Provider>
  )
}

export function useSiteStats() {
  return useContext(SiteStatsContext)
}
