import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useServices } from '../hooks/useServices'
import { supabase } from '../lib/supabase'
import { showToast } from './ToastContainer'
import { FileText, Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react'

const emptySector = {
  sector_key: '',
  name_am: '',
  name_en: '',
  department_role_key: '',
  sort_order: 0,
}

const emptyItem = {
  name_am: '',
  name_en: '',
  requirements_am: '',
  requirements_en: '',
  fee: '',
  standard_time: '',
  payment_method_am: '',
  payment_method_en: '',
  is_bookable: true,
  is_active: true,
  sort_order: 0,
}

export default function AdminServicesPanel() {
  const { lang } = useLanguage()
  const { sectorsList, refreshServices } = useServices()
  const [expanded, setExpanded] = useState(null)
  const [sectorForm, setSectorForm] = useState(emptySector)
  const [itemForm, setItemForm] = useState(emptyItem)
  const [editingSectorId, setEditingSectorId] = useState(null)
  const [editingItemId, setEditingItemId] = useState(null)
  const [activeSectorId, setActiveSectorId] = useState(null)
  const [showSectorForm, setShowSectorForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
  const [sectorItems, setSectorItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [saving, setSaving] = useState(false)

  const catalogFromDb = sectorsList.some((s) => s.id != null)

  const loadSectorItems = async (sectorId) => {
    if (sectorId == null) return
    setLoadingItems(true)
    try {
      const { data, error } = await supabase
        .from('service_items')
        .select('*')
        .eq('sector_id', sectorId)
        .order('sort_order', { ascending: true })
      if (error) throw error
      setSectorItems(data || [])
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setLoadingItems(false)
    }
  }

  const toggleSector = async (sector) => {
    const expandKey = sector.id ?? sector.key
    if (expanded === expandKey) {
      setExpanded(null)
      return
    }
    setExpanded(expandKey)

    if (sector.id == null) {
      setActiveSectorId(null)
      setSectorItems([])
      showToast(
        lang === 'am'
          ? 'አገልግሎቶች ከመረጃ ቤት አልተጫኑም። seed-catalog.js ያስፈልጋል።'
          : 'Services not in database. Run: node scripts/seed-catalog.js <SERVICE_ROLE_KEY>',
        'error'
      )
      return
    }

    setActiveSectorId(sector.id)
    await loadSectorItems(sector.id)
  }

  const saveSector = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        sector_key: sectorForm.sector_key.trim(),
        name_am: sectorForm.name_am.trim(),
        name_en: sectorForm.name_en.trim(),
        department_role_key: sectorForm.department_role_key.trim() || null,
        sort_order: Number(sectorForm.sort_order) || 0,
      }

      if (editingSectorId) {
        const { error } = await supabase.from('service_sectors').update(payload).eq('id', editingSectorId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('service_sectors').insert([payload])
        if (error) throw error
      }

      showToast(lang === 'am' ? 'ዘርፍ ተቀምጧል' : 'Sector saved', 'success')
      setShowSectorForm(false)
      setSectorForm(emptySector)
      await refreshServices()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveItem = async (e) => {
    e.preventDefault()
    if (!activeSectorId) return
    setSaving(true)
    try {
      const payload = {
        sector_id: activeSectorId,
        name_am: itemForm.name_am.trim(),
        name_en: itemForm.name_en.trim(),
        requirements_am: itemForm.requirements_am.trim() || null,
        requirements_en: itemForm.requirements_en.trim() || null,
        fee: itemForm.fee !== '' ? Number(itemForm.fee) : null,
        standard_time: itemForm.standard_time.trim() || null,
        payment_method_am: itemForm.payment_method_am.trim() || null,
        payment_method_en: itemForm.payment_method_en.trim() || null,
        is_bookable: !!itemForm.is_bookable,
        is_active: !!itemForm.is_active,
        sort_order: Number(itemForm.sort_order) || 0,
      }

      if (editingItemId) {
        const { error } = await supabase.from('service_items').update(payload).eq('id', editingItemId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('service_items').insert([payload])
        if (error) throw error
      }

      showToast(lang === 'am' ? 'አገልግሎት ተቀምጧል' : 'Service saved', 'success')
      setShowItemForm(false)
      setItemForm(emptyItem)
      await loadSectorItems(activeSectorId)
      await refreshServices()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const deleteSector = async (sector) => {
    if (sector.id == null) return
    if (!confirm(lang === 'am' ? 'ዘርፍ እና አገልግሎቶች ይሰረዙ?' : 'Delete sector and all its services?')) return
    try {
      const { error } = await supabase.from('service_sectors').delete().eq('id', sector.id)
      if (error) throw error
      showToast(lang === 'am' ? 'ዘርፍ ተሰርዟል' : 'Sector deleted', 'success')
      setExpanded(null)
      await refreshServices()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const deleteItem = async (itemId) => {
    if (!confirm(lang === 'am' ? 'አገልግሎት ይሰረዝ?' : 'Delete service?')) return
    try {
      const { error } = await supabase.from('service_items').delete().eq('id', itemId)
      if (error) throw error
      await loadSectorItems(activeSectorId)
      await refreshServices()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  return (
    <section className="gov-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-mayor-navy font-amharic flex items-center gap-2">
            <FileText className="w-6 h-6" />
            {lang === 'am' ? 'አገልግሎቶች' : 'Services Catalog'}
          </h2>
          <p className="text-sm text-mayor-navy/70 font-amharic mt-1">
            {lang === 'am' ? 'ዘርፎች እና አገልግሎቶችን ያስተዳድሩ' : 'Manage sectors and service items'}
          </p>
          {!catalogFromDb && (
            <p className="text-sm text-amber-700 font-amharic mt-2 bg-amber-50 border border-amber-200 rounded-gov px-3 py-2">
              {lang === 'am'
                ? 'ካታሎጉ ከመረጃ ቤት አልተጫነም። ተርሚናል፡ node scripts/seed-catalog.js <SERVICE_ROLE_KEY>'
                : 'Catalog not in database yet. Run: node scripts/seed-catalog.js <SERVICE_ROLE_KEY>'}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingSectorId(null)
            setSectorForm({ ...emptySector, sort_order: sectorsList.length })
            setShowSectorForm(true)
          }}
          className="gov-button px-4 py-2 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {lang === 'am' ? 'ዘርፍ ጨምር' : 'Add Sector'}
        </button>
      </div>

      {showSectorForm && (
        <form onSubmit={saveSector} className="mb-6 p-4 bg-slate-50 rounded-gov-lg grid md:grid-cols-2 gap-4">
          <input required disabled={!!editingSectorId} placeholder="sector_key" value={sectorForm.sector_key} onChange={(e) => setSectorForm({ ...sectorForm, sector_key: e.target.value })} className="px-4 py-2 border rounded-gov disabled:bg-gray-100" />
          <input placeholder="department_role_key" value={sectorForm.department_role_key} onChange={(e) => setSectorForm({ ...sectorForm, department_role_key: e.target.value })} className="px-4 py-2 border rounded-gov" />
          <input required placeholder={lang === 'am' ? 'ስም አማ' : 'Name Amharic'} value={sectorForm.name_am} onChange={(e) => setSectorForm({ ...sectorForm, name_am: e.target.value })} className="px-4 py-2 border rounded-gov" />
          <input required placeholder={lang === 'am' ? 'ስም እንግ' : 'Name English'} value={sectorForm.name_en} onChange={(e) => setSectorForm({ ...sectorForm, name_en: e.target.value })} className="px-4 py-2 border rounded-gov" />
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" disabled={saving} className="gov-button px-6 py-2">{lang === 'am' ? 'አስቀምጥ' : 'Save'}</button>
            <button type="button" onClick={() => setShowSectorForm(false)} className="px-6 py-2 border rounded-gov">{lang === 'am' ? 'ሰርዝ' : 'Cancel'}</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {sectorsList.map((sector) => (
          <div key={sector.key} className="border rounded-gov-lg overflow-hidden">
            <div className="flex items-center gap-2 p-4 bg-slate-50">
              <button type="button" onClick={() => toggleSector(sector)} className="flex-1 flex items-center gap-2 text-left">
                {expanded === (sector.id ?? sector.key) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className="font-amharic font-semibold text-mayor-navy">
                  {lang === 'am' ? sector.name.am : sector.name.en}
                </span>
                <span className="text-xs text-mayor-navy/50">({sector.key})</span>
              </button>
              <button type="button" onClick={() => { setEditingSectorId(sector.id); setSectorForm({ sector_key: sector.key, name_am: sector.name.am, name_en: sector.name.en, department_role_key: sector.departmentRoleKey || '', sort_order: 0 }); setShowSectorForm(true) }} className="text-mayor-royal-blue p-1"><Pencil className="w-4 h-4" /></button>
              <button type="button" onClick={() => deleteSector(sector)} className="text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
            </div>

            {expanded === (sector.id ?? sector.key) && (
              <div className="p-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-amharic text-mayor-navy/70">
                    {lang === 'am' ? `${sectorItems.length} አገልግሎቶች` : `${sectorItems.length} services`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItemId(null)
                      setItemForm({ ...emptyItem, sort_order: sectorItems.length })
                      setShowItemForm(true)
                    }}
                    className="gov-button px-3 py-1 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {lang === 'am' ? 'አገልግሎት' : 'Add Service'}
                  </button>
                </div>

                {showItemForm && (
                  <form onSubmit={saveItem} className="mb-4 p-4 bg-white border rounded-gov space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <input required placeholder={lang === 'am' ? 'ስም አማ' : 'Name Amharic'} value={itemForm.name_am} onChange={(e) => setItemForm({ ...itemForm, name_am: e.target.value })} className="px-3 py-2 border rounded-gov text-sm" />
                      <input required placeholder={lang === 'am' ? 'ስም እንግ' : 'Name English'} value={itemForm.name_en} onChange={(e) => setItemForm({ ...itemForm, name_en: e.target.value })} className="px-3 py-2 border rounded-gov text-sm" />
                      <input placeholder={lang === 'am' ? 'ክፍያ' : 'Fee'} value={itemForm.fee} onChange={(e) => setItemForm({ ...itemForm, fee: e.target.value })} className="px-3 py-2 border rounded-gov text-sm" />
                      <input placeholder={lang === 'am' ? 'ጊዜ' : 'Standard time'} value={itemForm.standard_time} onChange={(e) => setItemForm({ ...itemForm, standard_time: e.target.value })} className="px-3 py-2 border rounded-gov text-sm" />
                    </div>
                    <textarea placeholder={lang === 'am' ? 'መስፈርቶች አማ' : 'Requirements Amharic'} value={itemForm.requirements_am} onChange={(e) => setItemForm({ ...itemForm, requirements_am: e.target.value })} className="w-full px-3 py-2 border rounded-gov text-sm" rows={2} />
                    <textarea placeholder={lang === 'am' ? 'መስፈርቶች እንግ' : 'Requirements English'} value={itemForm.requirements_en} onChange={(e) => setItemForm({ ...itemForm, requirements_en: e.target.value })} className="w-full px-3 py-2 border rounded-gov text-sm" rows={2} />
                    <div className="flex gap-4 text-sm">
                      <label className="flex items-center gap-1"><input type="checkbox" checked={itemForm.is_bookable} onChange={(e) => setItemForm({ ...itemForm, is_bookable: e.target.checked })} />{lang === 'am' ? 'ቀጠሮ' : 'Bookable'}</label>
                      <label className="flex items-center gap-1"><input type="checkbox" checked={itemForm.is_active} onChange={(e) => setItemForm({ ...itemForm, is_active: e.target.checked })} />{lang === 'am' ? 'ንቁ' : 'Active'}</label>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={saving} className="gov-button px-4 py-1 text-sm">{lang === 'am' ? 'አስቀምጥ' : 'Save'}</button>
                      <button type="button" onClick={() => setShowItemForm(false)} className="px-4 py-1 border rounded-gov text-sm">{lang === 'am' ? 'ሰርዝ' : 'Cancel'}</button>
                    </div>
                  </form>
                )}

                {loadingItems ? (
                  <p className="text-sm text-center py-4">{lang === 'am' ? 'በመጫን...' : 'Loading...'}</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {sectorItems.map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-2 p-3 border rounded-gov text-sm">
                        <div className="font-amharic flex-1">
                          <p className="font-medium">{lang === 'am' ? item.name_am : item.name_en}</p>
                          <p className="text-xs text-mayor-navy/50">
                            {item.is_bookable ? (lang === 'am' ? 'ቀጠሮ ✓' : 'Bookable') : ''}
                            {!item.is_active && (lang === 'am' ? ' · ንቁ አይደለም' : ' · Inactive')}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button type="button" onClick={() => { setEditingItemId(item.id); setItemForm({ name_am: item.name_am, name_en: item.name_en, requirements_am: item.requirements_am || '', requirements_en: item.requirements_en || '', fee: item.fee ?? '', standard_time: item.standard_time || '', payment_method_am: item.payment_method_am || '', payment_method_en: item.payment_method_en || '', is_bookable: item.is_bookable, is_active: item.is_active, sort_order: item.sort_order }); setShowItemForm(true) }} className="text-mayor-royal-blue p-1"><Pencil className="w-3 h-3" /></button>
                          <button type="button" onClick={() => deleteItem(item.id)} className="text-red-600 p-1"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
