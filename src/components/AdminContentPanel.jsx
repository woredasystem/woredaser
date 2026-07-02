import { useState, useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useSiteContent } from '../hooks/useSiteContent'
import { supabase } from '../lib/supabase'
import { showToast } from './ToastContainer'
import { FileText, Pencil, Save, RefreshCw } from 'lucide-react'
import MultilingualFormHint from './admin/MultilingualFormHint'
import MultilingualFieldLabel from './admin/MultilingualFieldLabel'
import { isAmharicRequired, validateAmharicFields, trimOptional, MULTILINGUAL_LANGS } from '../utils/multilingualForm'

const SECTION_KEYS = ['mission', 'vision', 'values']

export default function AdminContentPanel() {
  const { lang } = useLanguage()
  const { sections, loading, error, refreshSiteContent } = useSiteContent()
  const [editingKey, setEditingKey] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const contentSections = sections.filter((s) => SECTION_KEYS.includes(s.section_key))

  useEffect(() => {
    refreshSiteContent()
  }, [refreshSiteContent])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshSiteContent()
    setRefreshing(false)
  }

  const openEdit = (section) => {
    setEditingKey(section.section_key)
    setForm({
      title_am: section.title_am || '',
      title_en: section.title_en || '',
      title_om: section.title_om || '',
      body_am: section.body_am || '',
      body_en: section.body_en || '',
      body_om: section.body_om || '',
      is_active: section.is_active !== false,
    })
  }

  const saveSection = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      validateAmharicFields(form, lang, {
        title_am: { am: 'ርዕስ (አማርኛ)', en: 'Title (Amharic)' },
        body_am: { am: 'ይዘት (አማርኛ)', en: 'Body (Amharic)' },
      })

      const { error: saveError } = await supabase
        .from('site_content_sections')
        .update({
          title_am: form.title_am.trim(),
          title_en: trimOptional(form.title_en),
          title_om: trimOptional(form.title_om),
          body_am: form.body_am.trim(),
          body_en: trimOptional(form.body_en),
          body_om: trimOptional(form.body_om),
          is_active: form.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('section_key', editingKey)

      if (saveError) throw saveError
      showToast(lang === 'am' ? 'ይዘት ተዘምኗል' : 'Content updated', 'success')
      setEditingKey(null)
      await refreshSiteContent()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl border border-mayor-gray-divider p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-mayor-royal-blue/10">
              <FileText className="w-6 h-6 text-mayor-royal-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-mayor-navy font-amharic">
                {lang === 'am' ? 'ተልዕኮ፣ ራዕይ እና እሴቶች' : 'Mission, Vision & Values'}
              </h2>
              <p className="text-sm text-mayor-navy/60 font-amharic">
                {lang === 'am' ? 'የመነሻ ገጽ ይዘት ያስተዳድሩ' : 'Manage homepage about sections'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-mayor-gray-divider rounded-xl text-sm text-mayor-navy hover:border-mayor-royal-blue/40 font-amharic"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing || loading ? 'animate-spin' : ''}`} />
            {lang === 'am' ? 'አድስ' : 'Refresh'}
          </button>
        </div>

        {loading && (
          <p className="text-mayor-navy/60 font-amharic text-sm py-6 text-center">
            {lang === 'am' ? 'በመጫን ላይ...' : 'Loading...'}
          </p>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4">
            <p className="text-red-700 text-sm font-amharic">{error}</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {contentSections.map((section) => (
              <div
                key={section.id}
                className="border border-mayor-gray-divider rounded-xl p-4 hover:border-mayor-royal-blue/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-mayor-navy font-amharic capitalize">
                      {section.section_key}
                    </p>
                    <p className="text-sm text-mayor-navy/60 font-amharic line-clamp-2">
                      {section.title_en} — {section.body_en?.slice(0, 80)}...
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEdit(section)}
                    className="gov-button px-4 py-2 flex items-center gap-2 self-start"
                  >
                    <Pencil className="w-4 h-4" />
                    {lang === 'am' ? 'አርትዕ' : 'Edit'}
                  </button>
                </div>
              </div>
            ))}

            {contentSections.length === 0 && !error && (
              <p className="text-mayor-navy/60 font-amharic text-sm py-4 text-center">
                {lang === 'am' ? 'ምንም ይዘት አልተገኘም። Refresh ይጫኑ።' : 'No sections loaded. Try Refresh.'}
              </p>
            )}
          </div>
        )}
      </div>

      {editingKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={saveSection}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold text-mayor-navy font-amharic mb-4 capitalize">
              {lang === 'am' ? 'አርትዕ' : 'Edit'}: {editingKey}
            </h3>

            {editingKey === 'values' && (
              <p className="mb-4 text-sm text-mayor-royal-blue bg-mayor-royal-blue/5 border border-mayor-royal-blue/20 rounded-lg px-4 py-3 font-amharic">
                {lang === 'am'
                  ? 'እሴቶችን በነጠላ ጽሑፍ ይለዩ (ለምሳሌ፡ ግልጽነት፣ ተጠያቂነት፣ እኩልነት እና ተሳትፎ) — በገጽ ላይ እያንዳንዱ በተለየ ይታያል።'
                  : 'Separate each value with a comma (e.g. Transparency, accountability, equity and participation) — each appears as its own item on the site.'}
              </p>
            )}

            <MultilingualFormHint lang={lang} variant="site" className="mb-4" />

            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              {MULTILINGUAL_LANGS.map((l) => (
                <div key={l}>
                  <MultilingualFieldLabel lang={lang} code={l} fieldName={lang === 'am' ? 'ርዕስ' : 'Title'} />
                  <input
                    value={form[`title_${l}`] || ''}
                    onChange={(e) => setForm({ ...form, [`title_${l}`]: e.target.value })}
                    className="w-full px-3 py-2 border border-mayor-gray-divider rounded-lg text-sm font-amharic"
                    required={isAmharicRequired(l)}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-6">
              {MULTILINGUAL_LANGS.map((l) => (
                <div key={l}>
                  <MultilingualFieldLabel lang={lang} code={l} fieldName={lang === 'am' ? 'ይዘት' : 'Body'} />
                  <textarea
                    value={form[`body_${l}`] || ''}
                    onChange={(e) => setForm({ ...form, [`body_${l}`]: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-mayor-gray-divider rounded-lg text-sm font-amharic"
                    required={isAmharicRequired(l)}
                  />
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 mb-6 font-amharic text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              {lang === 'am' ? 'በገጽ ላይ አሳይ' : 'Visible on site'}
            </label>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setEditingKey(null)}
                className="px-4 py-2 border border-mayor-gray-divider rounded-lg font-amharic"
              >
                {lang === 'am' ? 'ተወው' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="gov-button px-6 py-2 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {lang === 'am' ? 'አስቀምጥ' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
