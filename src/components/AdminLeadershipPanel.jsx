import { useState, useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useOfficials } from '../hooks/useOfficials'
import { useDepartments } from '../hooks/useDepartments'
import { useSiteContent } from '../hooks/useSiteContent'
import { supabase } from '../lib/supabase'
import { getDepartmentDisplayName } from '../utils/routing'
import { uploadOfficialPhoto } from '../utils/storage'
import { showToast } from './ToastContainer'
import { Users, Trash2, Plus, Pencil, Upload, Eye, Check, ChevronDown, Save } from 'lucide-react'
import ExpandableText from './admin/ExpandableText'
import AdminRecordDetailModal from './admin/AdminRecordDetailModal'
import MultilingualFormHint from './admin/MultilingualFormHint'
import MultilingualFieldLabel from './admin/MultilingualFieldLabel'
import { isAmharicRequired, validateAmharicFields, trimOptional, MULTILINGUAL_LANGS } from '../utils/multilingualForm'
import { pickLocalized } from '../utils/localized'

const CUSTOM_LEADER_ROLE = 'custom_leader'

const DEFAULT_SECTION = {
  title_am: 'ከአመራር ዘንድ',
  title_en: 'From Our Leadership',
  title_om: 'Ergaa Hogganaa',
  body_am: 'የወረዳ አመራር ለህዝቡ የሚሰጠው መልእክት',
  body_en: 'A message from woreda leadership to the community',
  body_om: 'Ergaa hoggantoonni woredaa ummataaf kennan',
}

const emptyOfficialForm = {
  full_name_am: '',
  full_name_en: '',
  full_name_om: '',
  title_am: '',
  title_en: '',
  title_om: '',
  role_key: 'trade_head',
  custom_role_key: '',
  image_url: '',
  bio_am: '',
  bio_en: '',
  bio_om: '',
  show_on_home: false,
}

export default function AdminLeadershipPanel() {
  const { lang } = useLanguage()
  const { officials, refreshOfficials } = useOfficials()
  const { departments } = useDepartments()
  const { sections, refreshSiteContent } = useSiteContent()
  const [officialForm, setOfficialForm] = useState(emptyOfficialForm)
  const [sectionForm, setSectionForm] = useState(DEFAULT_SECTION)
  const [sectionOpen, setSectionOpen] = useState(false)
  const [savingSection, setSavingSection] = useState(false)
  const [editingOfficialId, setEditingOfficialId] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [savingOfficial, setSavingOfficial] = useState(false)
  const [showOfficialForm, setShowOfficialForm] = useState(false)
  const [leaderDetail, setLeaderDetail] = useState(null)

  const nonAdminDepartments = departments.filter((d) => !d.isAdmin)

  useEffect(() => {
    const row = sections.find((s) => s.section_key === 'leadership_message')
    if (row) {
      setSectionForm({
        title_am: row.title_am || '',
        title_en: row.title_en || '',
        title_om: row.title_om || '',
        body_am: row.body_am || '',
        body_en: row.body_en || '',
        body_om: row.body_om || '',
      })
    }
  }, [sections])

  const homepageCount = officials.filter((o) => o.show_on_home).length

  const getLeaderDisplayName = (official) => pickLocalized(official, 'full_name', lang)

  const getLeaderDisplayTitle = (official) => pickLocalized(official, 'title', lang)

  const getLeaderBioPreview = (official) => {
    const bio = pickLocalized(official, 'bio', lang)
    return bio || official.bio_am || official.bio_en || official.bio_om || ''
  }

  const getLeaderDetailFields = (official) => [
    { label: lang === 'am' ? 'ስም (አማ)' : 'Name (Amharic)', value: official.full_name_am },
    { label: lang === 'am' ? 'ስም (እንግ)' : 'Name (English)', value: official.full_name_en },
    ...(official.full_name_om ? [{ label: lang === 'am' ? 'ስም (ኦሮ)' : 'Name (Oromo)', value: official.full_name_om }] : []),
    { label: lang === 'am' ? 'ርዕስ (አማ)' : 'Title (Amharic)', value: official.title_am },
    { label: lang === 'am' ? 'ርዕስ (እንግ)' : 'Title (English)', value: official.title_en },
    ...(official.title_om ? [{ label: lang === 'am' ? 'ርዕስ (ኦሮ)' : 'Title (Oromo)', value: official.title_om }] : []),
    { label: lang === 'am' ? 'ሚና' : 'Role key', value: official.role_key },
    {
      label: lang === 'am' ? 'በመነሻ ገጽ' : 'Homepage',
      value: official.show_on_home
        ? (lang === 'am' ? 'መልእክት ይታያል' : 'Featured on homepage')
        : (lang === 'am' ? 'አይታይም' : 'Not featured'),
    },
    ...(official.bio_am
      ? [{ label: lang === 'am' ? 'ባዮ / መልእክት (አማ)' : 'Bio (Amharic)', value: official.bio_am }]
      : []),
    ...(official.bio_en
      ? [{ label: lang === 'am' ? 'ባዮ / መልእክት (እንግ)' : 'Bio (English)', value: official.bio_en }]
      : []),
    ...(official.bio_om
      ? [{ label: lang === 'am' ? 'ባዮ / መልእክት (ኦሮ)' : 'Bio (Oromo)', value: official.bio_om }]
      : []),
  ]

  const openEditOfficial = (official) => {
    setEditingOfficialId(official.id)
    setOfficialForm({
      full_name_am: official.full_name_am,
      full_name_en: official.full_name_en || '',
      full_name_om: official.full_name_om || '',
      title_am: official.title_am,
      title_en: official.title_en || '',
      title_om: official.title_om || '',
      role_key: official.role_key,
      custom_role_key: '',
      image_url: official.image_url || '',
      bio_am: official.bio_am || '',
      bio_en: official.bio_en || '',
      bio_om: official.bio_om || '',
      show_on_home: !!official.show_on_home,
    })
    setPhotoFile(null)
    setShowOfficialForm(true)
  }

  const openAddOfficial = () => {
    setEditingOfficialId(null)
    setOfficialForm(emptyOfficialForm)
    setPhotoFile(null)
    setShowOfficialForm(true)
  }

  const saveOfficial = async (e) => {
    e.preventDefault()
    setSavingOfficial(true)
    try {
      let imageUrl = officialForm.image_url.trim() || null
      const roleKey = officialForm.role_key === CUSTOM_LEADER_ROLE
        ? officialForm.custom_role_key.trim().toLowerCase().replace(/\s+/g, '_')
        : officialForm.role_key

      if (!roleKey) {
        throw new Error(lang === 'am' ? 'የሚና ቁልፍ ያስፈልጋል' : 'Role key is required')
      }

      validateAmharicFields(officialForm, lang, {
        full_name_am: { am: 'ሙሉ ስም (አማርኛ)', en: 'Full name (Amharic)' },
        title_am: { am: 'ርዕስ (አማርኛ)', en: 'Title (Amharic)' },
      })

      const payload = {
        full_name_am: officialForm.full_name_am.trim(),
        full_name_en: trimOptional(officialForm.full_name_en),
        full_name_om: trimOptional(officialForm.full_name_om),
        title_am: officialForm.title_am.trim(),
        title_en: trimOptional(officialForm.title_en),
        title_om: trimOptional(officialForm.title_om),
        role_key: roleKey,
        bio_am: trimOptional(officialForm.bio_am),
        bio_en: trimOptional(officialForm.bio_en),
        bio_om: trimOptional(officialForm.bio_om),
        show_on_home: !!officialForm.show_on_home,
        image_url: imageUrl,
      }

      if (editingOfficialId) {
        if (photoFile) {
          imageUrl = await uploadOfficialPhoto(photoFile, editingOfficialId)
          payload.image_url = imageUrl
        }
        const { error } = await supabase.from('officials').update(payload).eq('id', editingOfficialId)
        if (error) throw error
        showToast(lang === 'am' ? 'አመራር ተዘምኗል' : 'Leader updated', 'success')
      } else {
        const { data, error } = await supabase.from('officials').insert([payload]).select('id').single()
        if (error) throw error
        if (photoFile && data?.id) {
          imageUrl = await uploadOfficialPhoto(photoFile, data.id)
          await supabase.from('officials').update({ image_url: imageUrl }).eq('id', data.id)
        }
        showToast(lang === 'am' ? 'አመራር ታክሏል' : 'Leader added', 'success')
      }

      setOfficialForm(emptyOfficialForm)
      setPhotoFile(null)
      setEditingOfficialId(null)
      setShowOfficialForm(false)
      await refreshOfficials()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setSavingOfficial(false)
    }
  }

  const handleDeleteOfficial = async (id) => {
    if (!confirm(lang === 'am' ? 'እርግጠኛ ነዎት?' : 'Are you sure?')) return
    try {
      const { error } = await supabase.from('officials').delete().eq('id', id)
      if (error) throw error
      showToast(lang === 'am' ? 'አመራር ተሰርዟል' : 'Leader removed', 'success')
      await refreshOfficials()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const saveSectionHeading = async (e) => {
    e.preventDefault()
    setSavingSection(true)
    try {
      validateAmharicFields(sectionForm, lang, {
        title_am: { am: 'ርዕስ (አማርኛ)', en: 'Heading (Amharic)' },
        body_am: { am: 'መግለጫ (አማርኛ)', en: 'Description (Amharic)' },
      })
      const { error } = await supabase.from('site_content_sections').upsert({
        section_key: 'leadership_message',
        title_am: sectionForm.title_am.trim(),
        title_en: trimOptional(sectionForm.title_en),
        title_om: trimOptional(sectionForm.title_om),
        body_am: sectionForm.body_am.trim(),
        body_en: trimOptional(sectionForm.body_en),
        body_om: trimOptional(sectionForm.body_om),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'section_key' })
      if (error) throw error
      showToast(lang === 'am' ? 'የክፍል ርዕስ ተዘምኗል' : 'Section heading saved', 'success')
      await refreshSiteContent()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setSavingSection(false)
    }
  }

  const toggleHomepage = async (official) => {
    const next = !official.show_on_home
    try {
      const { error } = await supabase
        .from('officials')
        .update({ show_on_home: next })
        .eq('id', official.id)
      if (error) throw error
      await refreshOfficials()
      showToast(
        next
          ? (lang === 'am' ? 'በመነሻ ገጽ ታክሏል' : 'Added to homepage')
          : (lang === 'am' ? 'ከመነሻ ገጽ ተወግዷል' : 'Removed from homepage'),
        'success'
      )
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  return (
    <section className="gov-card p-4 sm:p-6 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-mayor-navy font-amharic flex items-center gap-2">
            <Users className="w-6 h-6" />
            {lang === 'am' ? 'አመራሮች (መነሻ ገጽ)' : 'Leadership (Homepage)'}
          </h2>
          <p className="text-sm text-mayor-navy/70 font-amharic mt-1">
            {lang === 'am'
              ? `አመራሮችን ያስተዳድሩ — ${homepageCount} በመነሻ ገጽ መልእክት ላይ`
              : `Manage leaders — ${homepageCount} on homepage messages`}
          </p>
        </div>
        <button type="button" onClick={openAddOfficial} className="gov-button px-4 py-2 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {lang === 'am' ? 'አመራር ጨምር' : 'Add Leader'}
        </button>
      </div>

      <div className="mb-6 border border-mayor-gray-divider rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setSectionOpen(!sectionOpen)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 text-left font-amharic text-sm font-semibold text-mayor-navy hover:bg-slate-100"
        >
          <span>{lang === 'am' ? 'የክፍል ርዕስ (የአመራር መልእክት)' : 'Section heading (Leadership Message)'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${sectionOpen ? 'rotate-180' : ''}`} />
        </button>
        {sectionOpen && (
          <form onSubmit={saveSectionHeading} className="p-4 space-y-4 border-t border-mayor-gray-divider bg-white">
            <MultilingualFormHint lang={lang} variant="leadership" />
            <div className="grid sm:grid-cols-3 gap-3">
              {MULTILINGUAL_LANGS.map((l) => (
                <div key={`st-${l}`}>
                  <MultilingualFieldLabel lang={lang} code={l} fieldName={lang === 'am' ? 'ርዕስ' : 'Title'} />
                  <input
                    required={isAmharicRequired(l)}
                    value={sectionForm[`title_${l}`] || ''}
                    onChange={(e) => setSectionForm({ ...sectionForm, [`title_${l}`]: e.target.value })}
                    className="w-full px-3 py-2 border rounded-gov text-sm font-amharic"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {MULTILINGUAL_LANGS.map((l) => (
                <div key={`sb-${l}`}>
                  <MultilingualFieldLabel lang={lang} code={l} fieldName={lang === 'am' ? 'መግለጫ' : 'Description'} />
                  <textarea
                    required={isAmharicRequired(l)}
                    value={sectionForm[`body_${l}`] || ''}
                    onChange={(e) => setSectionForm({ ...sectionForm, [`body_${l}`]: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-gov text-sm font-amharic"
                  />
                </div>
              ))}
            </div>
            <button type="submit" disabled={savingSection} className="gov-button px-4 py-2 text-sm flex items-center gap-2">
              <Save className="w-4 h-4" />
              {savingSection ? (lang === 'am' ? 'በመቀመጥ...' : 'Saving...') : (lang === 'am' ? 'ርዕስ አስቀምጥ' : 'Save heading')}
            </button>
          </form>
        )}
      </div>

      {showOfficialForm && (
        <form onSubmit={saveOfficial} className="mb-6 p-4 bg-slate-50 rounded-gov-lg space-y-4">
          <MultilingualFormHint lang={lang} variant="leadership" />

          <div className="grid md:grid-cols-3 gap-4">
            {MULTILINGUAL_LANGS.map((l) => (
              <div key={`name-${l}`}>
                <MultilingualFieldLabel lang={lang} code={l} fieldName={lang === 'am' ? 'ሙሉ ስም' : 'Full name'} />
                <input
                  required={isAmharicRequired(l)}
                  value={officialForm[`full_name_${l}`]}
                  onChange={(e) => setOfficialForm({ ...officialForm, [`full_name_${l}`]: e.target.value })}
                  className="w-full px-4 py-2 border rounded-gov font-amharic"
                />
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {MULTILINGUAL_LANGS.map((l) => (
              <div key={`title-${l}`}>
                <MultilingualFieldLabel lang={lang} code={l} fieldName={lang === 'am' ? 'ርዕስ' : 'Title'} />
                <input
                  required={isAmharicRequired(l)}
                  value={officialForm[`title_${l}`]}
                  onChange={(e) => setOfficialForm({ ...officialForm, [`title_${l}`]: e.target.value })}
                  className="w-full px-4 py-2 border rounded-gov font-amharic"
                />
              </div>
            ))}
          </div>

          <div className="rounded-xl border-2 border-dashed border-mayor-royal-blue/25 bg-white p-4 sm:p-5 space-y-4">
            <p className="text-sm font-bold text-mayor-navy font-amharic">
              {lang === 'am' ? 'የመነሻ ገጽ መልእክት' : 'Homepage message'}
            </p>
            <p className="text-xs text-mayor-navy/55 font-amharic -mt-2">
              {lang === 'am'
                ? 'አማራጭ ነው። በባዶ ቦታ አንድን አንቀላፀል ከሌላው ይለዩ። ብዙ አመራሮች ሲታዩ በተራ ይቀያየራሉ።'
                : 'Optional. Separate paragraphs with a blank line. Multiple leaders slide on the homepage.'}
            </p>

            {MULTILINGUAL_LANGS.map((l) => (
              <div key={`bio-${l}`}>
                <MultilingualFieldLabel
                  lang={lang}
                  code={l}
                  fieldName={lang === 'am' ? 'መልእክት' : 'Message'}
                  required={false}
                />
                <textarea
                  value={officialForm[`bio_${l}`]}
                  onChange={(e) => setOfficialForm({ ...officialForm, [`bio_${l}`]: e.target.value })}
                  className="w-full px-4 py-2 border rounded-gov font-amharic"
                  rows={4}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => setOfficialForm({ ...officialForm, show_on_home: !officialForm.show_on_home })}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-colors ${
                officialForm.show_on_home
                  ? 'border-emerald-500 bg-emerald-50/80'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                  officialForm.show_on_home
                    ? 'bg-emerald-500 text-white'
                    : 'border-2 border-slate-300 bg-white'
                }`}
              >
                {officialForm.show_on_home && <Check className="w-4 h-4" strokeWidth={3} />}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-mayor-navy font-amharic text-sm">
                  {lang === 'am' ? 'በመነሻ ገጽ ላይ አሳይ' : 'Show on homepage'}
                </span>
                <span className="block text-xs text-mayor-navy/50 font-amharic mt-0.5">
                  {lang === 'am'
                    ? 'ተመረጠ ብቻ ይታያል — ብዙ አመራሮች ሊታዩ ይችላሉ'
                    : 'Only when checked — multiple leaders can be featured'}
                </span>
              </span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <select value={officialForm.role_key} onChange={(e) => setOfficialForm({ ...officialForm, role_key: e.target.value })} className="w-full px-4 py-2 border rounded-gov md:col-span-2">
              {nonAdminDepartments.map((role) => (
                <option key={role.roleKey} value={role.roleKey}>
                  {getDepartmentDisplayName(role.department, lang)} ({role.roleKey})
                </option>
              ))}
              <option value={CUSTOM_LEADER_ROLE}>
                {lang === 'am' ? 'ተጨማሪ አመራር (ሌላ ሚና)' : 'Additional leader (custom role)'}
              </option>
            </select>
            {officialForm.role_key === CUSTOM_LEADER_ROLE && (
              <input
                required
                placeholder={lang === 'am' ? 'የሚና ቁልፍ (ለምሳሌ deputy_leader)' : 'Role key (e.g. deputy_leader)'}
                value={officialForm.custom_role_key}
                onChange={(e) => setOfficialForm({ ...officialForm, custom_role_key: e.target.value })}
                className="w-full px-4 py-2 border rounded-gov md:col-span-2"
              />
            )}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-amharic text-mayor-navy mb-2">
                <Upload className="w-4 h-4" />
                {lang === 'am' ? 'ፎቶ ይጫኑ' : 'Upload photo'}
              </label>
              <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="w-full text-sm" />
              {officialForm.image_url && !photoFile && (
                <img src={officialForm.image_url} alt="" className="mt-2 h-24 w-24 object-cover rounded-gov" />
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={savingOfficial} className="gov-button px-6 py-2">
              {savingOfficial ? (lang === 'am' ? 'በመቀመጥ...' : 'Saving...') : (editingOfficialId ? (lang === 'am' ? 'አዘምን' : 'Update') : (lang === 'am' ? 'አስቀምጥ' : 'Save'))}
            </button>
            <button type="button" onClick={() => { setShowOfficialForm(false); setEditingOfficialId(null) }} className="px-6 py-2 border rounded-gov">
              {lang === 'am' ? 'ሰርዝ' : 'Cancel'}
            </button>
          </div>
        </form>
      )}

      {officials.length === 0 ? (
        <p className="text-mayor-navy/60 font-amharic text-center py-8">{lang === 'am' ? 'እስካሁን አመራር አልተጨመረም' : 'No leaders added yet'}</p>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {officials.map((official) => (
              <article
                key={official.id}
                className="gov-card p-4 border-l-4 border-l-mayor-royal-blue flex gap-3"
              >
                <button
                  type="button"
                  onClick={() => setLeaderDetail(official)}
                  className="shrink-0"
                  aria-label={lang === 'am' ? 'ዝርዝር ይመልከቱ' : 'View details'}
                >
                  {official.image_url ? (
                    <img
                      src={official.image_url}
                      alt=""
                      className="h-16 w-16 rounded-xl object-cover border border-mayor-gray-divider"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-mayor-royal-blue/10 border border-mayor-gray-divider" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <p className="font-amharic font-semibold text-mayor-navy truncate">
                        {getLeaderDisplayName(official)}
                      </p>
                      <p className="text-sm text-mayor-navy/65 font-amharic line-clamp-2">
                        {getLeaderDisplayTitle(official)}
                      </p>
                    </div>
                    {official.show_on_home && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                        <Check className="w-3 h-3" />
                        {lang === 'am' ? 'መነሻ' : 'Home'}
                      </span>
                    )}
                  </div>
                  {getLeaderBioPreview(official) && (
                    <ExpandableText
                      text={getLeaderBioPreview(official)}
                      lang={lang}
                      onExpand={() => setLeaderDetail(official)}
                      className="mb-2"
                      lineClamp={2}
                    />
                  )}
                  <p className="text-xs text-mayor-navy/45 mb-2">{official.role_key}</p>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-mayor-gray-divider">
                    <button
                      type="button"
                      onClick={() => toggleHomepage(official)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-amharic rounded-lg border ${
                        official.show_on_home
                          ? 'text-emerald-700 border-emerald-200 bg-emerald-50'
                          : 'text-mayor-navy border-mayor-gray-divider hover:bg-slate-50'
                      }`}
                    >
                      <Check className={`w-4 h-4 ${official.show_on_home ? '' : 'opacity-40'}`} />
                      {lang === 'am' ? 'መነሻ' : 'Homepage'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaderDetail(official)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-mayor-royal-blue font-amharic font-semibold hover:bg-mayor-royal-blue/5 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                      {lang === 'am' ? 'ዝርዝር' : 'Details'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditOfficial(official)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-mayor-navy font-amharic rounded-lg border border-mayor-gray-divider hover:bg-slate-50"
                    >
                      <Pencil className="w-4 h-4" />
                      {lang === 'am' ? 'አርም' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOfficial(official.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 font-amharic rounded-lg border border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {lang === 'am' ? 'ሰርዝ' : 'Delete'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block portal-table-scroll">
          <table className="w-full min-w-[640px] table-fixed text-left">
            <thead className="portal-table-head-light">
              <tr className="border-b">
                <th className="py-2 px-3 w-16"></th>
                <th className="py-2 px-3 font-amharic w-36">{lang === 'am' ? 'ስም' : 'Name'}</th>
                <th className="py-2 px-3 font-amharic w-40">{lang === 'am' ? 'ርዕስ' : 'Title'}</th>
                <th className="py-2 px-3 w-48">{lang === 'am' ? 'ባዮ' : 'Bio'}</th>
                <th className="py-2 px-3 w-28">{lang === 'am' ? 'ሚና' : 'Role'}</th>
                <th className="py-2 px-3 w-20 text-center font-amharic">{lang === 'am' ? 'መነሻ' : 'Home'}</th>
                <th className="py-2 px-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {officials.map((official) => (
                <tr key={official.id} className="border-b border-gray-100 hover:bg-slate-50/80">
                  <td className="py-3 px-3 align-top">
                    <button type="button" onClick={() => setLeaderDetail(official)} className="block">
                      {official.image_url ? (
                        <img src={official.image_url} alt="" className="h-12 w-12 rounded-xl object-cover border border-mayor-gray-divider hover:ring-2 hover:ring-mayor-royal-blue/30 transition-shadow" />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-mayor-royal-blue/10 border border-mayor-gray-divider" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-3 font-amharic align-top">
                    <p className="font-semibold text-mayor-navy truncate">{getLeaderDisplayName(official)}</p>
                  </td>
                  <td className="py-3 px-3 font-amharic text-sm align-top">
                    <ExpandableText
                      text={getLeaderDisplayTitle(official)}
                      lang={lang}
                      onExpand={() => setLeaderDetail(official)}
                      lineClamp={2}
                    />
                  </td>
                  <td className="py-3 px-3 align-top">
                    {getLeaderBioPreview(official) ? (
                      <ExpandableText
                        text={getLeaderBioPreview(official)}
                        lang={lang}
                        onExpand={() => setLeaderDetail(official)}
                        lineClamp={2}
                      />
                    ) : (
                      <span className="text-mayor-navy/35 text-sm">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-sm align-top truncate">{official.role_key}</td>
                  <td className="py-3 px-3 align-top text-center">
                    <button
                      type="button"
                      onClick={() => toggleHomepage(official)}
                      title={lang === 'am' ? 'በመነሻ ገጽ አሳይ/ደብቅ' : 'Toggle homepage'}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                        official.show_on_home
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-200 text-slate-300 hover:border-emerald-400 hover:text-emerald-500'
                      }`}
                    >
                      <Check className="w-4 h-4" strokeWidth={official.show_on_home ? 3 : 2} />
                    </button>
                  </td>
                  <td className="py-3 px-3 align-top">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setLeaderDetail(official)} className="text-mayor-navy/50 hover:text-mayor-royal-blue p-1" title={lang === 'am' ? 'ዝርዝር' : 'Details'}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => openEditOfficial(official)} className="text-mayor-royal-blue p-1"><Pencil className="w-4 h-4" /></button>
                      <button type="button" onClick={() => handleDeleteOfficial(official.id)} className="text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}

      {leaderDetail && (
        <AdminRecordDetailModal
          title={lang === 'am' ? 'የአመራር ዝርዝር' : 'Leader profile'}
          fields={getLeaderDetailFields(leaderDetail)}
          photoUrl={leaderDetail.image_url}
          photoAlt={getLeaderDisplayName(leaderDetail)}
          showPhotoPlaceholder
          lang={lang}
          onClose={() => setLeaderDetail(null)}
        />
      )}
    </section>
  )
}
