import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const OfficialsContext = createContext({
  officials: [],
  complaintOfficials: [],
  loading: true,
  refreshOfficials: async () => {},
})

function mapOfficial(row) {
  return {
    id: row.id,
    full_name_am: row.full_name_am,
    full_name_en: row.full_name_en,
    full_name_om: row.full_name_om || null,
    title_am: row.title_am,
    title_en: row.title_en,
    title_om: row.title_om || null,
    role_key: row.role_key,
    image_url: row.image_url || null,
    bio_am: row.bio_am || null,
    bio_en: row.bio_en || null,
    bio_om: row.bio_om || null,
    show_on_home: !!row.show_on_home,
  }
}

export function OfficialsProvider({ children }) {
  const [officials, setOfficials] = useState([])
  const [loading, setLoading] = useState(true)

  const refreshOfficials = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('officials')
        .select('*')
        .order('id', { ascending: true })

      if (error) throw error
      setOfficials((data || []).map(mapOfficial))
    } catch (error) {
      console.error('Error loading officials:', error)
      setOfficials([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshOfficials()
  }, [refreshOfficials])

  const value = {
    officials,
    complaintOfficials: officials,
    loading,
    refreshOfficials,
  }

  return (
    <OfficialsContext.Provider value={value}>
      {children}
    </OfficialsContext.Provider>
  )
}

export function useOfficials() {
  const context = useContext(OfficialsContext)
  if (!context) {
    throw new Error('useOfficials must be used within OfficialsProvider')
  }
  return context
}
