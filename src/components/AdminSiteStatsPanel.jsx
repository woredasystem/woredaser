import { useState, useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useSiteStats } from '../hooks/useSiteStats'
import { supabase } from '../lib/supabase'
import { showToast } from './ToastContainer'
import { BarChart2, Save } from 'lucide-react'

export default function AdminSiteStatsPanel() {
  const { lang } = useLanguage()
  const { stats, refreshSiteStats } = useSiteStats()
  const [form, setForm] = useState({
    population: stats.population,
    blocks: stats.blocks,
    services_count: stats.services_count,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({
      population: stats.population,
      blocks: stats.blocks,
      services_count: stats.services_count,
    })
  }, [stats])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        population: Math.max(0, Number(form.population) || 0),
        blocks: Math.max(0, Number(form.blocks) || 0),
        services_count: Math.max(0, Number(form.services_count) || 0),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('site_stats').upsert({ id: 1, ...payload })
      if (error) throw error

      showToast(lang === 'am' ? 'ስታትስቲክስ ተዘምኗል' : 'Statistics updated', 'success')
      await refreshSiteStats()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="bg-white rounded-2xl border border-mayor-gray-divider p-6 shadow-sm max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-mayor-royal-blue/10">
          <BarChart2 className="w-6 h-6 text-mayor-royal-blue" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-mayor-navy font-amharic">
            {lang === 'am' ? 'የመነሻ ገጽ ስታትስቲክስ' : 'Homepage Statistics'}
          </h2>
          <p className="text-sm text-mayor-navy/60 font-amharic">
            {lang === 'am' ? 'ህዝብ፣ ብሎኮች፣ አገልግሎቶች' : 'Population, blocks, services'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-mayor-navy font-amharic mb-1">
            {lang === 'am' ? 'ህዝብ' : 'Population'}
          </label>
          <input
            type="number"
            min="0"
            value={form.population}
            onChange={(e) => setForm({ ...form, population: e.target.value })}
            className="w-full px-3 py-2 border border-mayor-gray-divider rounded-lg font-amharic"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-mayor-navy font-amharic mb-1">
            {lang === 'am' ? 'ብሎኮች' : 'Blocks'}
          </label>
          <input
            type="number"
            min="0"
            value={form.blocks}
            onChange={(e) => setForm({ ...form, blocks: e.target.value })}
            className="w-full px-3 py-2 border border-mayor-gray-divider rounded-lg font-amharic"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-mayor-navy font-amharic mb-1">
            {lang === 'am' ? 'አገልግሎቶች' : 'Services'}
          </label>
          <input
            type="number"
            min="0"
            value={form.services_count}
            onChange={(e) => setForm({ ...form, services_count: e.target.value })}
            className="w-full px-3 py-2 border border-mayor-gray-divider rounded-lg font-amharic"
            required
          />
        </div>
        <button type="submit" disabled={saving} className="gov-button px-6 py-2 flex items-center gap-2">
          <Save className="w-4 h-4" />
          {lang === 'am' ? 'አስቀምጥ' : 'Save'}
        </button>
      </form>
    </section>
  )
}
