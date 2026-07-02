import { useState, useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useProjects } from '../hooks/useProjects'
import { supabase } from '../lib/supabase'
import { uploadProjectPhoto } from '../utils/storage'
import { showToast } from './ToastContainer'
import { FolderKanban, Plus, Pencil, Trash2, Upload, X } from 'lucide-react'
import MultilingualFormHint from './admin/MultilingualFormHint'
import MultilingualFieldLabel from './admin/MultilingualFieldLabel'
import { isAmharicRequired, validateAmharicFields, trimOptional, MULTILINGUAL_LANGS } from '../utils/multilingualForm'

const emptyForm = {
  title_am: '',
  title_en: '',
  title_om: '',
  description_am: '',
  description_en: '',
  description_om: '',
  cover_image_url: '',
  sort_order: 0,
  is_active: true,
}

export default function AdminProjectsPanel() {
  const { lang } = useLanguage()
  const { refreshProjects } = useProjects()
  const [allProjects, setAllProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [galleryUrls, setGalleryUrls] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [coverFile, setCoverFile] = useState(null)
  const [galleryFiles, setGalleryFiles] = useState([])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      setAllProjects(data || [])
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm, sort_order: allProjects.length })
    setGalleryUrls([])
    setCoverFile(null)
    setGalleryFiles([])
    setShowForm(true)
  }

  const openEdit = (project) => {
    setEditingId(project.id)
    setForm({
      title_am: project.title_am || '',
      title_en: project.title_en || '',
      title_om: project.title_om || '',
      description_am: project.description_am || '',
      description_en: project.description_en || '',
      description_om: project.description_om || '',
      cover_image_url: project.cover_image_url || '',
      sort_order: project.sort_order || 0,
      is_active: project.is_active !== false,
    })
    setGalleryUrls(project.gallery_urls || [])
    setCoverFile(null)
    setGalleryFiles([])
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      validateAmharicFields(form, lang, {
        title_am: { am: 'ርዕስ (አማርኛ)', en: 'Title (Amharic)' },
        description_am: { am: 'መግለጫ (አማርኛ)', en: 'Description (Amharic)' },
      })

      const payload = {
        title_am: form.title_am.trim(),
        title_en: trimOptional(form.title_en),
        title_om: trimOptional(form.title_om),
        description_am: form.description_am.trim(),
        description_en: trimOptional(form.description_en),
        description_om: trimOptional(form.description_om),
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      }

      let projectId = editingId

      if (editingId) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('projects').insert([payload]).select('id').single()
        if (error) throw error
        projectId = data.id
      }

      let coverUrl = form.cover_image_url || null
      if (coverFile) {
        coverUrl = await uploadProjectPhoto(coverFile, projectId)
      }

      const newGallery = [...galleryUrls]
      for (const file of galleryFiles) {
        const url = await uploadProjectPhoto(file, projectId)
        newGallery.push(url)
      }

      const { error: imgError } = await supabase
        .from('projects')
        .update({
          cover_image_url: coverUrl,
          gallery_urls: newGallery,
        })
        .eq('id', projectId)

      if (imgError) throw imgError

      showToast(
        editingId
          ? (lang === 'am' ? 'ፕሮጀክት ተዘምኗል' : 'Project updated')
          : (lang === 'am' ? 'ፕሮጀክት ታክሏል' : 'Project added'),
        'success'
      )
      setShowForm(false)
      await fetchAll()
      await refreshProjects()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (project) => {
    if (!confirm(lang === 'am' ? 'ፕሮጀክት ይሰረዝ?' : 'Delete this project?')) return
    try {
      const { error } = await supabase.from('projects').delete().eq('id', project.id)
      if (error) throw error
      showToast(lang === 'am' ? 'ተሰርዟል' : 'Deleted', 'success')
      await fetchAll()
      await refreshProjects()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const removeGalleryUrl = (url) => {
    setGalleryUrls((prev) => prev.filter((u) => u !== url))
  }

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl border border-mayor-gray-divider p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-mayor-royal-blue/10">
              <FolderKanban className="w-6 h-6 text-mayor-royal-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-mayor-navy font-amharic">
                {lang === 'am' ? 'ፕሮጀክቶች' : 'Projects'}
              </h2>
              <p className="text-sm text-mayor-navy/60 font-amharic">
                {lang === 'am' ? 'የመነሻ ገጽ ፕሮጀክቶች' : 'Homepage project showcase'}
              </p>
            </div>
          </div>
          <button type="button" onClick={openCreate} className="gov-button px-4 py-2 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {lang === 'am' ? 'አዲስ ፕሮጀክት' : 'Add Project'}
          </button>
        </div>

        {loading ? (
          <p className="text-mayor-navy/60 font-amharic">{lang === 'am' ? 'በመጫን ላይ...' : 'Loading...'}</p>
        ) : allProjects.length === 0 ? (
          <p className="text-mayor-navy/60 font-amharic py-8 text-center">
            {lang === 'am' ? 'ፕሮጀክት አልተጨመረም' : 'No projects yet'}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allProjects.map((project) => (
              <article
                key={project.id}
                className="border border-mayor-gray-divider rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                {project.cover_image_url ? (
                  <img
                    src={project.cover_image_url}
                    alt={project.title_en}
                    className="w-full h-36 object-cover"
                  />
                ) : (
                  <div className="w-full h-36 bg-slate-100 flex items-center justify-center text-mayor-navy/30">
                    <FolderKanban className="w-10 h-10" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-mayor-navy font-amharic truncate">
                        {project.title_en}
                      </h3>
                      <p className="text-xs text-mayor-navy/50 mt-1">
                        {project.is_active ? (lang === 'am' ? 'ንቁ' : 'Active') : (lang === 'am' ? 'የታወቀ' : 'Hidden')}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button type="button" onClick={() => openEdit(project)} className="p-2 text-mayor-royal-blue hover:bg-mayor-royal-blue/10 rounded-lg">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(project)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold text-mayor-navy font-amharic mb-4">
              {editingId
                ? (lang === 'am' ? 'ፕሮጀክት አርትዕ' : 'Edit Project')
                : (lang === 'am' ? 'አዲስ ፕሮጀክት' : 'New Project')}
            </h3>

            <MultilingualFormHint lang={lang} variant="site" className="mb-4" />

            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              {MULTILINGUAL_LANGS.map((l) => (
                <div key={`title-${l}`}>
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

            <div className="space-y-4 mb-4">
              {MULTILINGUAL_LANGS.map((l) => (
                <div key={`desc-${l}`}>
                  <MultilingualFieldLabel lang={lang} code={l} fieldName={lang === 'am' ? 'መግለጫ' : 'Description'} />
                  <textarea
                    value={form[`description_${l}`] || ''}
                    onChange={(e) => setForm({ ...form, [`description_${l}`]: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-mayor-gray-divider rounded-lg text-sm font-amharic"
                    required={isAmharicRequired(l)}
                  />
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-mayor-navy/70 mb-1">
                  {lang === 'am' ? 'ዋና ፎቶ' : 'Cover photo'}
                </label>
                <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-mayor-gray-divider rounded-lg cursor-pointer hover:border-mayor-royal-blue/50">
                  <Upload className="w-4 h-4 text-mayor-royal-blue" />
                  <span className="text-sm font-amharic">{coverFile?.name || (lang === 'am' ? 'ፎቶ ይምረጡ' : 'Choose file')}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                </label>
                {form.cover_image_url && !coverFile && (
                  <img src={form.cover_image_url} alt="" className="mt-2 h-20 object-cover rounded-lg" />
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-mayor-navy/70 mb-1">
                  {lang === 'am' ? 'ተጨማሪ ፎቶዎች' : 'Gallery photos'}
                </label>
                <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-mayor-gray-divider rounded-lg cursor-pointer hover:border-mayor-royal-blue/50">
                  <Upload className="w-4 h-4 text-mayor-royal-blue" />
                  <span className="text-sm font-amharic">{lang === 'am' ? 'ፎቶዎች ይምረጡ' : 'Add photos'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))}
                  />
                </label>
              </div>
            </div>

            {galleryUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {galleryUrls.map((url) => (
                  <div key={url} className="relative">
                    <img src={url} alt="" className="h-16 w-24 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeGalleryUrl(url)}
                      className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-mayor-navy/70 mb-1">Sort order</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  className="w-24 px-3 py-2 border border-mayor-gray-divider rounded-lg text-sm"
                />
              </div>
              <label className="flex items-center gap-2 self-end font-amharic text-sm">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                {lang === 'am' ? 'በገጽ ላይ አሳይ' : 'Visible on site'}
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-mayor-gray-divider rounded-lg font-amharic">
                {lang === 'am' ? 'ተወው' : 'Cancel'}
              </button>
              <button type="submit" disabled={saving} className="gov-button px-6 py-2">
                {lang === 'am' ? 'አስቀምጥ' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
