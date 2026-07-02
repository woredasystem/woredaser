import { useState, useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useAppointmentSettings } from '../hooks/useAppointmentSettings'
import { useServices } from '../hooks/useServices'
import { supabase } from '../lib/supabase'
import { showToast } from './ToastContainer'
import { CalendarClock } from 'lucide-react'
import AdminFormTip from './admin/AdminFormTip'

export default function AdminAppointmentSettingsPanel() {
  const { lang } = useLanguage()
  const { settings, refreshSettings } = useAppointmentSettings()
  const { sectorsList } = useServices()
  const [form, setForm] = useState({
    start_hour: settings.startHour,
    end_hour: settings.endHour,
    slot_minutes: settings.slotMinutes,
    bookable_sector_keys: [...settings.bookableSectorKeys],
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({
      start_hour: settings.startHour,
      end_hour: settings.endHour,
      slot_minutes: settings.slotMinutes,
      bookable_sector_keys: [...settings.bookableSectorKeys],
    })
  }, [settings])

  const toggleSector = (key) => {
    setForm((prev) => {
      const keys = prev.bookable_sector_keys.includes(key)
        ? prev.bookable_sector_keys.filter((k) => k !== key)
        : [...prev.bookable_sector_keys, key]
      return { ...prev, bookable_sector_keys: keys }
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('appointment_settings')
        .upsert({
          id: 1,
          start_hour: Number(form.start_hour),
          end_hour: Number(form.end_hour),
          slot_minutes: Number(form.slot_minutes),
          bookable_sector_keys: form.bookable_sector_keys,
        })

      if (error) throw error
      showToast(lang === 'am' ? 'ቀጠሮ ቅንብሮች ተቀምጠዋል' : 'Appointment settings saved', 'success')
      await refreshSettings()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="gov-card p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-mayor-navy font-amharic flex items-center gap-2">
          <CalendarClock className="w-6 h-6" />
          {lang === 'am' ? 'የቀጠሮ ቅንብሮች' : 'Appointment Settings'}
        </h2>
        <p className="text-sm text-mayor-navy/70 font-amharic mt-1">
          {lang === 'am' ? 'ሰዓቶች እና የሚገኙ አገልግሎቶች' : 'Booking hours and available services'}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-xl">
        <AdminFormTip>
          {lang === 'am'
            ? 'ጎብኝቶች በእነዚህ ሰዓቶች ውስጥ ብቻ ቀጠሮ ማዘዝ ይችላሉ — ለቀጠሮ የምትፈቀዱ ዘርፎችንም ይምረጡ።'
            : 'Citizens can only book during these hours — enable the sectors you want available for appointments.'}
        </AdminFormTip>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-amharic mb-1">{lang === 'am' ? 'መጀመሪያ ሰዓት' : 'Start hour'}</label>
            <input
              type="number"
              min={0}
              max={23}
              value={form.start_hour}
              onChange={(e) => setForm({ ...form, start_hour: e.target.value })}
              className="w-full px-4 py-2 border rounded-gov"
            />
          </div>
          <div>
            <label className="block text-sm font-amharic mb-1">{lang === 'am' ? 'መጨረሻ ሰዓት' : 'End hour'}</label>
            <input
              type="number"
              min={0}
              max={23}
              value={form.end_hour}
              onChange={(e) => setForm({ ...form, end_hour: e.target.value })}
              className="w-full px-4 py-2 border rounded-gov"
            />
          </div>
          <div>
            <label className="block text-sm font-amharic mb-1">{lang === 'am' ? 'ስላት (ደቂቃ)' : 'Slot (min)'}</label>
            <select
              value={form.slot_minutes}
              onChange={(e) => setForm({ ...form, slot_minutes: e.target.value })}
              className="w-full px-4 py-2 border rounded-gov"
            >
              {[15, 30, 45, 60].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-mayor-navy font-amharic mb-2">
            {lang === 'am' ? 'ለቀጠሮ የሚገኙ ዘርፎች' : 'Bookable sectors'}
          </p>
          <div className="space-y-2">
            {sectorsList.map((sector) => (
              <label key={sector.key} className="flex items-center gap-2 font-amharic text-sm">
                <input
                  type="checkbox"
                  checked={form.bookable_sector_keys.includes(sector.key)}
                  onChange={() => toggleSector(sector.key)}
                />
                {lang === 'am' ? sector.name.am : sector.name.en}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="gov-button px-6 py-2">
          {saving ? (lang === 'am' ? 'በመቀመጥ...' : 'Saving...') : (lang === 'am' ? 'አስቀምጥ' : 'Save Settings')}
        </button>
      </form>
    </section>
  )
}
