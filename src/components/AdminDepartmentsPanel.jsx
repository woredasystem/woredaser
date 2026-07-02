import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useDepartments } from '../hooks/useDepartments'
import { supabase } from '../lib/supabase'
import { showToast } from './ToastContainer'
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react'
import MultilingualFormHint from './admin/MultilingualFormHint'
import MultilingualFieldLabel from './admin/MultilingualFieldLabel'
import { isAmharicRequired, validateAmharicFields, trimOptional } from '../utils/multilingualForm'
const emptyForm = {
  role_key: '',
  department: '',
  department_am: '',
  department_om: '',
  is_admin: false,
  sort_order: 0,
}

export default function AdminDepartmentsPanel() {
  const { lang } = useLanguage()
  const { departments, refreshDepartments } = useDepartments()
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm, sort_order: departments.length })
    setShowForm(true)
  }

  const openEdit = (dept) => {
    setEditingId(dept.id)
    setForm({
      role_key: dept.roleKey,
      department: dept.department,
      department_am: dept.departmentAm,
      department_om: dept.departmentOm || '',
      is_admin: dept.isAdmin,
      sort_order: dept.sortOrder,
    })
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      validateAmharicFields(form, lang, {
        department_am: { am: 'ስም (አማርኛ)', en: 'Name (Amharic)' },
      })

      const payload = {
        role_key: form.role_key.trim(),
        department: trimOptional(form.department),
        department_am: form.department_am.trim(),
        department_om: trimOptional(form.department_om),
        is_admin: !!form.is_admin,
        sort_order: Number(form.sort_order) || 0,
      }

      if (editingId) {
        const { error } = await supabase.from('departments').update(payload).eq('id', editingId)
        if (error) throw error
        showToast(lang === 'am' ? 'ክፍል ተዘምኗል' : 'Department updated', 'success')
      } else {
        const { error } = await supabase.from('departments').insert([payload])
        if (error) throw error
        showToast(lang === 'am' ? 'ክፍል ታክሏል' : 'Department added', 'success')
      }

      setShowForm(false)
      setForm(emptyForm)
      await refreshDepartments()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (dept) => {
    if (!confirm(lang === 'am' ? 'እርግጠኛ ነዎት?' : 'Delete this department?')) return
    try {
      const { error } = await supabase.from('departments').delete().eq('id', dept.id)
      if (error) throw error
      showToast(lang === 'am' ? 'ክፍል ተሰርዟል' : 'Department removed', 'success')
      await refreshDepartments()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  return (
    <section className="gov-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-mayor-navy font-amharic flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            {lang === 'am' ? 'ክፍሎች / ሚናዎች' : 'Departments & Roles'}
          </h2>
          <p className="text-sm text-mayor-navy/70 font-amharic mt-1">
            {lang === 'am'
              ? 'የፖርታል መዳረሻ እና የቅሬታ ምደባ ክፍሎች'
              : 'Portal access and complaint routing departments'}
          </p>
        </div>
        <button type="button" onClick={openCreate} className="gov-button px-4 py-2 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {lang === 'am' ? 'ክፍል ጨምር' : 'Add Department'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="mb-6 p-4 bg-slate-50 rounded-gov-lg space-y-4">
          <MultilingualFormHint lang={lang} variant="departments" />

          <div className="grid md:grid-cols-2 gap-4">
            <input
              required
              disabled={!!editingId}
              placeholder="role_key (e.g. trade_head)"
              value={form.role_key}
              onChange={(e) => setForm({ ...form, role_key: e.target.value })}
              className="w-full px-4 py-2 border rounded-gov disabled:bg-gray-100"
            />
            <input
              type="number"
              placeholder={lang === 'am' ? 'ቅደም ተከተል' : 'Sort order'}
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              className="w-full px-4 py-2 border rounded-gov"
            />
            <div>
              <MultilingualFieldLabel lang={lang} code="am" fieldName={lang === 'am' ? 'ስም' : 'Name'} />
              <input
                required
                value={form.department_am}
                onChange={(e) => setForm({ ...form, department_am: e.target.value })}
                className="w-full px-4 py-2 border rounded-gov font-amharic"
              />
            </div>
            <div>
              <MultilingualFieldLabel lang={lang} code="en" fieldName={lang === 'am' ? 'ስም' : 'Name'} />
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-4 py-2 border rounded-gov"
              />
            </div>
            <div className="md:col-span-2">
              <MultilingualFieldLabel lang={lang} code="om" fieldName={lang === 'am' ? 'ስም' : 'Name'} />
              <input
                value={form.department_om}
                onChange={(e) => setForm({ ...form, department_om: e.target.value })}
                className="w-full px-4 py-2 border rounded-gov font-amharic"
              />
            </div>
          </div>          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_admin}
              onChange={(e) => setForm({ ...form, is_admin: e.target.checked })}
            />
            {lang === 'am' ? 'አስተዳደር ሚና' : 'Admin role'}
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="gov-button px-6 py-2">
              {saving ? (lang === 'am' ? 'በመቀመጥ...' : 'Saving...') : (lang === 'am' ? 'አስቀምጥ' : 'Save')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border rounded-gov">
              {lang === 'am' ? 'ሰርዝ' : 'Cancel'}
            </button>
          </div>
        </form>
      )}

      <div className="portal-table-scroll">
        <table className="w-full text-left">
          <thead className="portal-table-head-white">
            <tr className="border-b">
              <th className="py-2 px-3">role_key</th>
              <th className="py-2 px-3 font-amharic">{lang === 'am' ? 'ክፍል' : 'Department'}</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id} className="border-b border-gray-100">
                <td className="py-3 px-3 text-sm">{dept.roleKey}</td>
                <td className="py-3 px-3 font-amharic">
                  {lang === 'am' ? dept.departmentAm : dept.department}
                  {dept.isAdmin && (
                    <span className="ml-2 text-xs bg-mayor-royal-blue/10 text-mayor-royal-blue px-2 py-0.5 rounded-full">Admin</span>
                  )}
                </td>
                <td className="py-3 px-3 flex gap-2">
                  <button type="button" onClick={() => openEdit(dept)} className="text-mayor-royal-blue p-1">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(dept)} className="text-red-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
