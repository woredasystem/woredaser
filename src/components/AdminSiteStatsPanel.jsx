import { useState, useEffect, useMemo } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useSiteStats } from '../hooks/useSiteStats'
import { supabase } from '../lib/supabase'
import { showToast } from './ToastContainer'
import { BarChart2, Plus, Save, Trash2, GripVertical } from 'lucide-react'
import AdminFormTip from './admin/AdminFormTip'
import MultilingualFormHint from './admin/MultilingualFormHint'
import MultilingualFieldLabel from './admin/MultilingualFieldLabel'
import SiteStatsShowcase from './SiteStatsShowcase'
import { isAmharicRequired, validateAmharicFields, trimOptional } from '../utils/multilingualForm'
import { STAT_ICON_OPTIONS, STAT_THEME_OPTIONS } from '../utils/siteStatPresets'

const emptyItem = {
  label_am: '',
  label_en: '',
  label_om: '',
  value: 0,
  suffix: '',
  icon: 'chart',
  theme: 'blue',
  sort_order: 0,
  is_active: true,
}

export default function AdminSiteStatsPanel() {
  const { lang } = useLanguage()
  const { allItems, loading, refreshSiteStats } = useSiteStats()
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    refreshSiteStats()
  }, [refreshSiteStats])

  useEffect(() => {
    setItems(allItems.length ? allItems : [])
  }, [allItems])

  const previewItems = useMemo(
    () => [...items]
      .filter((i) => i.is_active !== false)
      .sort((a, b) => a.sort_order - b.sort_order),
    [items]
  )

  const updateItem = (index, patch) => {
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { ...emptyItem, sort_order: prev.length, id: `new-${Date.now()}` },
    ])
  }

  const removeItem = async (index) => {
    const row = items[index]
    if (row.id && !String(row.id).startsWith('new-') && !String(row.id).startsWith('default-')) {
      if (!confirm(lang === 'am' ? 'ይህ ስታትስቲክስ ይሰረዝ?' : 'Delete this stat?')) return
      setSaving(true)
      try {
        const { error } = await supabase.from('site_stat_items').delete().eq('id', row.id)
        if (error) throw error
        showToast(lang === 'am' ? 'ተሰርዟል' : 'Removed', 'success')
        await refreshSiteStats()
      } catch (err) {
        showToast(err.message, 'error')
      } finally {
        setSaving(false)
      }
      return
    }
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveAll = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      for (let i = 0; i < items.length; i += 1) {
        const row = items[i]
        validateAmharicFields(row, lang, {
          label_am: { am: 'ርዕስ (አማርኛ)', en: 'Title (Amharic)' },
        })

        const payload = {
          label_am: row.label_am.trim(),
          label_en: trimOptional(row.label_en),
          label_om: trimOptional(row.label_om),
          value: Math.max(0, Number(row.value) || 0),
          suffix: row.suffix?.trim() || '',
          icon: row.icon || 'chart',
          theme: row.theme || 'blue',
          sort_order: i,
          is_active: row.is_active !== false,
          updated_at: new Date().toISOString(),
        }

        const isNew = !row.id || String(row.id).startsWith('new-') || String(row.id).startsWith('default-')

        if (isNew) {
          const { error } = await supabase.from('site_stat_items').insert([payload])
          if (error) throw error
        } else {
          const { error } = await supabase.from('site_stat_items').update(payload).eq('id', row.id)
          if (error) throw error
        }
      }

      showToast(lang === 'am' ? 'ስታትስቲክስ ተዘምኗል' : 'Statistics updated', 'success')
      await refreshSiteStats()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-8 max-w-5xl">
      <div className="bg-white rounded-2xl border border-mayor-gray-divider p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-mayor-royal-blue/10">
              <BarChart2 className="w-6 h-6 text-mayor-royal-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-mayor-navy font-amharic">
                {lang === 'am' ? 'የመነሻ ገጽ ስታትስቲክስ' : 'Homepage Statistics'}
              </h2>
              <p className="text-sm text-mayor-navy/60 font-amharic">
                {lang === 'am' ? 'ቁጥሮችን ያስተዳድሩ እና አዲስ ይጨምሩ' : 'Manage counters and add new metrics'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-gov border-2 border-mayor-royal-blue text-mayor-royal-blue font-semibold hover:bg-mayor-royal-blue hover:text-white transition-colors font-amharic text-sm"
          >
            <Plus className="w-4 h-4" />
            {lang === 'am' ? 'ስታትስቲክስ ጨምር' : 'Add stat'}
          </button>
        </div>

        <AdminFormTip className="mb-6">
          {lang === 'am'
            ? 'በታች ያለው ቅድመ-እይታ በመነሻ ገጽ ላይ እንደሚታየው ያሳያል። ቁጥሮች ሲጫኑ ከዜሮ በላይ ይቆጠራሉ።'
            : 'The preview below matches the public homepage. Numbers count up when the section appears.'}
        </AdminFormTip>

        <div className="rounded-2xl border border-dashed border-mayor-royal-blue/25 bg-slate-50/80 p-2 sm:p-4 overflow-hidden">
          <p className="text-xs font-semibold text-mayor-navy/45 uppercase tracking-wider text-center mb-2 font-amharic">
            {lang === 'am' ? 'ቅድመ-እይታ' : 'Live preview'}
          </p>
          <SiteStatsShowcase
            items={previewItems}
            loading={loading}
            variant="preview"
            animate
            className="!py-2"
          />
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="bg-white rounded-2xl border border-mayor-gray-divider p-6 shadow-sm space-y-6">
        <MultilingualFormHint lang={lang} variant="site" />

        {items.length === 0 && !loading && (
          <p className="text-center text-mayor-navy/50 font-amharic py-8">
            {lang === 'am' ? 'እስካሁን ስታትስቲክስ የለም — ጨምር ይጫኑ' : 'No stats yet — click Add stat'}
          </p>
        )}

        <div className="space-y-4">
          {items.map((row, index) => (
            <div
              key={row.id || index}
              className="border border-mayor-gray-divider rounded-xl p-4 bg-slate-50/50 space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-mayor-navy/60 font-amharic">
                  <GripVertical className="w-4 h-4" />
                  {lang === 'am' ? `ስታትስቲክስ ${index + 1}` : `Stat ${index + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title={lang === 'am' ? 'ሰርዝ' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {['am', 'en', 'om'].map((l) => (
                  <div key={l}>
                    <MultilingualFieldLabel lang={lang} code={l} fieldName={lang === 'am' ? 'ርዕስ' : 'Label'} />
                    <input
                      required={isAmharicRequired(l)}
                      value={row[`label_${l}`] || ''}
                      onChange={(e) => updateItem(index, { [`label_${l}`]: e.target.value })}
                      className="w-full px-3 py-2 border border-mayor-gray-divider rounded-lg text-sm font-amharic"
                    />
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-mayor-navy/70 mb-1 font-amharic">
                    {lang === 'am' ? 'ቁጥር' : 'Value'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={row.value}
                    onChange={(e) => updateItem(index, { value: e.target.value })}
                    className="w-full px-3 py-2 border border-mayor-gray-divider rounded-lg text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-mayor-navy/70 mb-1 font-amharic">
                    {lang === 'am' ? 'ተከታይ (+, %…)' : 'Suffix (+, %…)'}
                  </label>
                  <input
                    value={row.suffix || ''}
                    onChange={(e) => updateItem(index, { suffix: e.target.value })}
                    placeholder="+"
                    className="w-full px-3 py-2 border border-mayor-gray-divider rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-mayor-navy/70 mb-1 font-amharic">
                    {lang === 'am' ? 'አዶ' : 'Icon'}
                  </label>
                  <select
                    value={row.icon}
                    onChange={(e) => updateItem(index, { icon: e.target.value })}
                    className="w-full px-3 py-2 border border-mayor-gray-divider rounded-lg text-sm"
                  >
                    {STAT_ICON_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {lang === 'am' ? opt.label.am : opt.label.en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-mayor-navy/70 mb-1 font-amharic">
                    {lang === 'am' ? 'ቀለም' : 'Color'}
                  </label>
                  <select
                    value={row.theme}
                    onChange={(e) => updateItem(index, { theme: e.target.value })}
                    className="w-full px-3 py-2 border border-mayor-gray-divider rounded-lg text-sm capitalize"
                  >
                    {STAT_THEME_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>{opt.key}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-amharic text-mayor-navy">
                <input
                  type="checkbox"
                  checked={row.is_active !== false}
                  onChange={(e) => updateItem(index, { is_active: e.target.checked })}
                />
                {lang === 'am' ? 'በመነሻ ገጽ ላይ አሳይ' : 'Show on homepage'}
              </label>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <button type="submit" disabled={saving} className="gov-button px-6 py-2 flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? (lang === 'am' ? 'በመቀመጥ...' : 'Saving...') : (lang === 'am' ? 'ሁሉንም አስቀምጥ' : 'Save all')}
          </button>
        )}
      </form>
    </section>
  )
}
