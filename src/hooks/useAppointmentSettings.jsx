import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const defaultSettings = {
  startHour: 3,
  endHour: 11,
  slotMinutes: 15,
  bookableSectorKeys: ['civilRegistration', 'tradeOffice', 'laborSkills'],
}

const AppointmentSettingsContext = createContext({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
})

function mapSettings(row) {
  if (!row) return defaultSettings
  return {
    startHour: row.start_hour ?? 3,
    endHour: row.end_hour ?? 11,
    slotMinutes: row.slot_minutes ?? 15,
    bookableSectorKeys: row.bookable_sector_keys || defaultSettings.bookableSectorKeys,
  }
}

export function AppointmentSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)

  const refreshSettings = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('appointment_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle()

      if (error) throw error
      setSettings(mapSettings(data))
    } catch (error) {
      console.error('Error loading appointment settings:', error)
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSettings()
  }, [refreshSettings])

  return (
    <AppointmentSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </AppointmentSettingsContext.Provider>
  )
}

export function useAppointmentSettings() {
  const context = useContext(AppointmentSettingsContext)
  if (!context) {
    throw new Error('useAppointmentSettings must be used within AppointmentSettingsProvider')
  }
  return context
}

export { defaultSettings }
