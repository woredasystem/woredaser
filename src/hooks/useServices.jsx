import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { services as fallbackServices } from '../data/services'
import { setServicesCache } from '../utils/routing'

const ServicesContext = createContext({
  services: {},
  sectorsList: [],
  fromDatabase: false,
  loading: true,
  refreshServices: async () => {},
})

function mapItemToLegacy(item) {
  const legacy = {
    id: item.id,
    name: {
      am: item.name_am,
      en: item.name_en,
      ...(item.name_om ? { om: item.name_om } : {}),
    },
    fee: item.fee != null ? Number(item.fee) : undefined,
    isBookable: item.is_bookable !== false,
    isActive: item.is_active !== false,
  }

  if (item.requirements_am || item.requirements_en) {
    legacy.requirements = {
      am: item.requirements_am || '',
      en: item.requirements_en || '',
      ...(item.requirements_om ? { om: item.requirements_om } : {}),
    }
  }

  if (item.standard_time) legacy.standardTime = item.standard_time

  if (item.payment_method_am || item.payment_method_en) {
    legacy.paymentMethod = {
      am: item.payment_method_am || '',
      en: item.payment_method_en || '',
    }
  }

  if (item.service_group_am || item.service_group_en) {
    legacy.serviceGroup = {
      am: item.service_group_am || '',
      en: item.service_group_en || '',
    }
  }

  return legacy
}

function buildCatalogFromRows(sectors, items) {
  const catalog = {}
  const sectorsList = []

  for (const sector of sectors) {
    const sectorItems = items
      .filter((i) => i.sector_id === sector.id && i.is_active !== false)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map(mapItemToLegacy)

    catalog[sector.sector_key] = {
      id: sector.id,
      sectorKey: sector.sector_key,
      departmentRoleKey: sector.department_role_key,
      name: {
        am: sector.name_am,
        en: sector.name_en,
        ...(sector.name_om ? { om: sector.name_om } : {}),
      },
      items: sectorItems,
    }

    sectorsList.push({
      key: sector.sector_key,
      id: sector.id,
      ...catalog[sector.sector_key],
    })
  }

  return { catalog, sectorsList }
}

function buildFallback() {
  const sectorsList = Object.entries(fallbackServices).map(([key, sector]) => ({
    key,
    ...sector,
  }))
  return { catalog: fallbackServices, sectorsList }
}

export function ServicesProvider({ children }) {
  const [catalog, setCatalog] = useState({})
  const [sectorsList, setSectorsList] = useState([])
  const [fromDatabase, setFromDatabase] = useState(false)
  const [loading, setLoading] = useState(true)

  const refreshServices = useCallback(async () => {
    setLoading(true)
    try {
      const [{ data: sectors, error: sErr }, { data: items, error: iErr }] = await Promise.all([
        supabase.from('service_sectors').select('*').order('sort_order', { ascending: true }),
        supabase.from('service_items').select('*').order('sort_order', { ascending: true }),
      ])

      if (sErr) throw sErr
      if (iErr) throw iErr

      if (!sectors?.length) {
        const fb = buildFallback()
        setCatalog(fb.catalog)
        setSectorsList(fb.sectorsList)
        setFromDatabase(false)
        setServicesCache(fb.catalog, fb.sectorsList)
        return
      }

      const { catalog: built, sectorsList: list } = buildCatalogFromRows(sectors, items || [])
      setCatalog(built)
      setSectorsList(list)
      setFromDatabase(true)
      setServicesCache(built, list)
    } catch (error) {
      console.error('Error loading services:', error)
      const fb = buildFallback()
      setCatalog(fb.catalog)
      setSectorsList(fb.sectorsList)
      setFromDatabase(false)
      setServicesCache(fb.catalog, fb.sectorsList)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshServices()
  }, [refreshServices])

  const value = useMemo(() => ({
    services: catalog,
    sectorsList,
    fromDatabase,
    loading,
    refreshServices,
  }), [catalog, sectorsList, fromDatabase, loading, refreshServices])

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  )
}

export function useServices() {
  const context = useContext(ServicesContext)
  if (!context) {
    throw new Error('useServices must be used within ServicesProvider')
  }
  return context
}
