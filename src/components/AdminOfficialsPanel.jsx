import { useState, useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useOfficials } from '../hooks/useOfficials'
import { useDepartments } from '../hooks/useDepartments'
import { supabase } from '../lib/supabase'
import { getPortalEmail } from '../config/site'
import { getDepartmentDisplayName } from '../utils/routing'
import { createPortalUser, updatePortalUser, resetPortalUserPassword } from '../utils/adminApi'
import { uploadOfficialPhoto } from '../utils/storage'
import { showToast } from './ToastContainer'
import { UserPlus, Users, Trash2, Plus, KeyRound, Pencil, Upload } from 'lucide-react'

const emptyOfficialForm = {
  full_name_am: '',
  full_name_en: '',
  title_am: '',
  title_en: '',
  role_key: 'trade_head',
  image_url: '',
  bio_am: '',
  bio_en: '',
  show_on_home: false,
}

const emptyUserForm = {
  email: '',
  password: '',
  username: '',
  full_name: '',
  role_key: 'trade_head',
  createOfficial: true,
}

export default function AdminOfficialsPanel() {
  const { lang } = useLanguage()
  const { officials, refreshOfficials } = useOfficials()
  const { departments } = useDepartments()
  const [portalUsers, setPortalUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [officialForm, setOfficialForm] = useState(emptyOfficialForm)
  const [editingOfficialId, setEditingOfficialId] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [userForm, setUserForm] = useState(emptyUserForm)
  const [editingUser, setEditingUser] = useState(null)
  const [resetPassword, setResetPassword] = useState('')
  const [savingOfficial, setSavingOfficial] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)
  const [updatingUser, setUpdatingUser] = useState(false)
  const [showOfficialForm, setShowOfficialForm] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)

  const nonAdminDepartments = departments.filter((d) => !d.isAdmin)
  const allDepartments = departments

  const fetchPortalUsers = async () => {
    setLoadingUsers(true)
    try {
      const { data, error } = await supabase
        .from('portal_users')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setPortalUsers(data || [])
    } catch (error) {
      showToast(lang === 'am' ? 'ተጠቃሚዎችን መጫን አልተሳካም' : 'Failed to load portal users', 'error')
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    fetchPortalUsers()
  }, [])

  const getRole = (roleKey) => departments.find((d) => d.roleKey === roleKey)

  const openEditOfficial = (official) => {
    setEditingOfficialId(official.id)
    setOfficialForm({
      full_name_am: official.full_name_am,
      full_name_en: official.full_name_en,
      title_am: official.title_am,
      title_en: official.title_en,
      role_key: official.role_key,
      image_url: official.image_url || '',
      bio_am: official.bio_am || '',
      bio_en: official.bio_en || '',
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

      const payload = {
        full_name_am: officialForm.full_name_am.trim(),
        full_name_en: officialForm.full_name_en.trim(),
        title_am: officialForm.title_am.trim(),
        title_en: officialForm.title_en.trim(),
        role_key: officialForm.role_key,
        bio_am: officialForm.bio_am.trim() || null,
        bio_en: officialForm.bio_en.trim() || null,
        show_on_home: !!officialForm.show_on_home,
        image_url: imageUrl,
      }

      if (officialForm.show_on_home) {
        const clearQuery = supabase.from('officials').update({ show_on_home: false })
        if (editingOfficialId) clearQuery.neq('id', editingOfficialId)
        await clearQuery
      }

      if (editingOfficialId) {
        if (photoFile) {
          imageUrl = await uploadOfficialPhoto(photoFile, editingOfficialId)
          payload.image_url = imageUrl
        }
        const { error } = await supabase.from('officials').update(payload).eq('id', editingOfficialId)
        if (error) throw error
        showToast(lang === 'am' ? 'አመራር ተዘምኗል' : 'Official updated', 'success')
      } else {
        const { data, error } = await supabase.from('officials').insert([payload]).select('id').single()
        if (error) throw error
        if (photoFile && data?.id) {
          imageUrl = await uploadOfficialPhoto(photoFile, data.id)
          await supabase.from('officials').update({ image_url: imageUrl }).eq('id', data.id)
        }
        showToast(lang === 'am' ? 'አመራር ታክሏል' : 'Official added', 'success')
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
      showToast(lang === 'am' ? 'አመራር ተሰርዟል' : 'Official removed', 'success')
      await refreshOfficials()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreatingUser(true)
    try {
      const role = getRole(userForm.role_key)
      if (!role) throw new Error('Invalid role')

      const email = userForm.email.trim() || getPortalEmail(userForm.username.trim())
      await createPortalUser({
        email,
        password: userForm.password,
        username: userForm.username.trim(),
        fullName: userForm.full_name.trim(),
        department: role.department,
        departmentAm: role.departmentAm,
        roleKey: role.roleKey,
        isAdmin: !!role.isAdmin,
        createOfficial: userForm.createOfficial,
        official: userForm.createOfficial ? {
          full_name_am: userForm.full_name.trim(),
          full_name_en: userForm.full_name.trim(),
          title_am: role.departmentAm,
          title_en: role.department,
          role_key: role.roleKey,
        } : null,
      })

      showToast(lang === 'am' ? 'ተጠቃሚ ተፈጥሯል' : 'Portal user created', 'success')
      setUserForm(emptyUserForm)
      setShowUserForm(false)
      await fetchPortalUsers()
      if (userForm.createOfficial) await refreshOfficials()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setCreatingUser(false)
    }
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    if (!editingUser) return
    setUpdatingUser(true)
    try {
      const role = getRole(editingUser.role_key)
      await updatePortalUser({
        portalUserId: editingUser.id,
        email: editingUser.email,
        username: editingUser.username,
        fullName: editingUser.full_name,
        department: role?.department || editingUser.department,
        departmentAm: role?.departmentAm || editingUser.department_am,
        roleKey: editingUser.role_key,
        isAdmin: role?.isAdmin ?? editingUser.is_admin,
        password: editingUser.newPassword || undefined,
      })

      if (resetPassword.trim().length >= 8) {
        await resetPortalUserPassword({
          portalUserId: editingUser.id,
          password: resetPassword.trim(),
        })
      }

      showToast(lang === 'am' ? 'ተጠቃሚ ተዘምኗል' : 'Portal user updated', 'success')
      setEditingUser(null)
      setResetPassword('')
      await fetchPortalUsers()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setUpdatingUser(false)
    }
  }

  const handleDeletePortalUser = async (id) => {
    if (!confirm(lang === 'am' ? 'የፖርታል መዝግብ ይሰረዝ?' : 'Delete portal user record?')) return
    try {
      const { error } = await supabase.from('portal_users').delete().eq('id', id)
      if (error) throw error
      showToast(lang === 'am' ? 'ተጠቃሚ ተሰርዟል' : 'Portal user removed', 'success')
      await fetchPortalUsers()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  return (
    <div className="space-y-8">
      <section className="gov-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-mayor-navy font-amharic flex items-center gap-2">
              <Users className="w-6 h-6" />
              {lang === 'am' ? 'አመራሮች' : 'Officials'}
            </h2>
            <p className="text-sm text-mayor-navy/70 font-amharic mt-1">
              {lang === 'am' ? 'አመራሮችን ያክሉ፣ ያርትዑ፣ ፎቶ እና ባዮ ያክሉ' : 'Add, edit officials with photo and bio'}
            </p>
          </div>
          <button type="button" onClick={openAddOfficial} className="gov-button px-4 py-2 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {lang === 'am' ? 'አመራር ጨምር' : 'Add Official'}
          </button>
        </div>

        {showOfficialForm && (
          <form onSubmit={saveOfficial} className="mb-6 p-4 bg-slate-50 rounded-gov-lg space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input required placeholder={lang === 'am' ? 'ሙሉ ስም (አማ)' : 'Full name (Amharic)'} value={officialForm.full_name_am} onChange={(e) => setOfficialForm({ ...officialForm, full_name_am: e.target.value })} className="w-full px-4 py-2 border rounded-gov" />
              <input required placeholder={lang === 'am' ? 'ሙሉ ስም (እንግ)' : 'Full name (English)'} value={officialForm.full_name_en} onChange={(e) => setOfficialForm({ ...officialForm, full_name_en: e.target.value })} className="w-full px-4 py-2 border rounded-gov" />
              <input required placeholder={lang === 'am' ? 'ርዕስ (አማ)' : 'Title (Amharic)'} value={officialForm.title_am} onChange={(e) => setOfficialForm({ ...officialForm, title_am: e.target.value })} className="w-full px-4 py-2 border rounded-gov" />
              <input required placeholder={lang === 'am' ? 'ርዕስ (እንግ)' : 'Title (English)'} value={officialForm.title_en} onChange={(e) => setOfficialForm({ ...officialForm, title_en: e.target.value })} className="w-full px-4 py-2 border rounded-gov" />
              <select value={officialForm.role_key} onChange={(e) => setOfficialForm({ ...officialForm, role_key: e.target.value })} className="w-full px-4 py-2 border rounded-gov md:col-span-2">
                {nonAdminDepartments.map((role) => (
                  <option key={role.roleKey} value={role.roleKey}>
                    {getDepartmentDisplayName(role.department, lang)} ({role.roleKey})
                  </option>
                ))}
              </select>
              <textarea placeholder={lang === 'am' ? 'ባዮ / መልእክት (አማ)' : 'Bio / message (Amharic)'} value={officialForm.bio_am} onChange={(e) => setOfficialForm({ ...officialForm, bio_am: e.target.value })} className="w-full px-4 py-2 border rounded-gov md:col-span-2" rows={3} />
              <textarea placeholder={lang === 'am' ? 'ባዮ / መልእክት (እንግ)' : 'Bio / message (English)'} value={officialForm.bio_en} onChange={(e) => setOfficialForm({ ...officialForm, bio_en: e.target.value })} className="w-full px-4 py-2 border rounded-gov md:col-span-2" rows={3} />
              <label className="flex items-center gap-2 md:col-span-2 font-amharic text-sm text-mayor-navy cursor-pointer">
                <input
                  type="checkbox"
                  checked={officialForm.show_on_home}
                  onChange={(e) => setOfficialForm({ ...officialForm, show_on_home: e.target.checked })}
                />
                {lang === 'am' ? 'በመነሻ ገጽ ላይ መልእክት አሳይ' : 'Show message on homepage'}
              </label>
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
          <p className="text-mayor-navy/60 font-amharic text-center py-8">{lang === 'am' ? 'እስካሁን አመራር አልተጨመረም' : 'No officials added yet'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3"></th>
                  <th className="py-2 px-3 font-amharic">{lang === 'am' ? 'ስም' : 'Name'}</th>
                  <th className="py-2 px-3 font-amharic">{lang === 'am' ? 'ርዕስ' : 'Title'}</th>
                  <th className="py-2 px-3">{lang === 'am' ? 'ሚና' : 'Role'}</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {officials.map((official) => (
                  <tr key={official.id} className="border-b border-gray-100">
                    <td className="py-3 px-3">
                      {official.image_url ? (
                        <img src={official.image_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-mayor-royal-blue/10" />
                      )}
                    </td>
                    <td className="py-3 px-3 font-amharic">{lang === 'am' ? official.full_name_am : official.full_name_en}</td>
                    <td className="py-3 px-3 font-amharic text-sm">{lang === 'am' ? official.title_am : official.title_en}</td>
                    <td className="py-3 px-3 text-sm">{official.role_key}</td>
                    <td className="py-3 px-3 flex gap-1">
                      <button type="button" onClick={() => openEditOfficial(official)} className="text-mayor-royal-blue p-1"><Pencil className="w-4 h-4" /></button>
                      <button type="button" onClick={() => handleDeleteOfficial(official.id)} className="text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="gov-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-mayor-navy font-amharic flex items-center gap-2">
              <KeyRound className="w-6 h-6" />
              {lang === 'am' ? 'የፖርታል ተጠቃሚዎች' : 'Portal Users'}
            </h2>
          </div>
          <button type="button" onClick={() => { setShowUserForm(true); setEditingUser(null) }} className="gov-button px-4 py-2 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            {lang === 'am' ? 'ተጠቃሚ ፍጠር' : 'Create User'}
          </button>
        </div>

        {showUserForm && !editingUser && (
          <form onSubmit={handleCreateUser} className="mb-6 p-4 bg-slate-50 rounded-gov-lg space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input required placeholder={lang === 'am' ? 'የተጠቃሚ ስም' : 'Username'} value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value, email: userForm.email || getPortalEmail(e.target.value) })} className="w-full px-4 py-2 border rounded-gov" />
              <input required type="email" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full px-4 py-2 border rounded-gov" />
              <input required type="password" minLength={8} placeholder={lang === 'am' ? 'የይለፍ ቃል' : 'Password'} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="w-full px-4 py-2 border rounded-gov" />
              <input required placeholder={lang === 'am' ? 'ሙሉ ስም' : 'Full name'} value={userForm.full_name} onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} className="w-full px-4 py-2 border rounded-gov" />
              <select value={userForm.role_key} onChange={(e) => setUserForm({ ...userForm, role_key: e.target.value })} className="w-full px-4 py-2 border rounded-gov md:col-span-2">
                {allDepartments.map((role) => (
                  <option key={role.roleKey} value={role.roleKey}>{getDepartmentDisplayName(role.department, lang)} ({role.roleKey})</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={userForm.createOfficial} onChange={(e) => setUserForm({ ...userForm, createOfficial: e.target.checked })} />
              {lang === 'am' ? 'እንደ አመራርም ጨምር' : 'Also add as official'}
            </label>
            <button type="submit" disabled={creatingUser} className="gov-button px-6 py-2">{creatingUser ? '...' : (lang === 'am' ? 'ተጠቃሚ ፍጠር' : 'Create')}</button>
          </form>
        )}

        {editingUser && (
          <form onSubmit={handleUpdateUser} className="mb-6 p-4 bg-blue-50 rounded-gov-lg space-y-4 border border-mayor-royal-blue/20">
            <p className="font-semibold text-mayor-navy">{lang === 'am' ? 'ተጠቃሚ አርትዕ' : 'Edit User'}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <input required value={editingUser.username} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} className="px-4 py-2 border rounded-gov" placeholder="Username" />
              <input required type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className="px-4 py-2 border rounded-gov" />
              <input required value={editingUser.full_name} onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })} className="px-4 py-2 border rounded-gov" placeholder={lang === 'am' ? 'ሙሉ ስም' : 'Full name'} />
              <select value={editingUser.role_key} onChange={(e) => setEditingUser({ ...editingUser, role_key: e.target.value })} className="px-4 py-2 border rounded-gov">
                {allDepartments.map((role) => (
                  <option key={role.roleKey} value={role.roleKey}>{getDepartmentDisplayName(role.department, lang)}</option>
                ))}
              </select>
              <input type="password" minLength={8} placeholder={lang === 'am' ? 'አዲስ የይለፍ ቃል (አማራጭ)' : 'New password (optional)'} value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} className="px-4 py-2 border rounded-gov md:col-span-2" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={updatingUser} className="gov-button px-6 py-2">{lang === 'am' ? 'አዘምን' : 'Update'}</button>
              <button type="button" onClick={() => { setEditingUser(null); setResetPassword('') }} className="px-6 py-2 border rounded-gov">{lang === 'am' ? 'ሰርዝ' : 'Cancel'}</button>
            </div>
          </form>
        )}

        {loadingUsers ? (
          <p className="text-center py-8">{lang === 'am' ? 'በመጫን...' : 'Loading...'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3 font-amharic">{lang === 'am' ? 'ስም' : 'Name'}</th>
                  <th className="py-2 px-3">{lang === 'am' ? 'ክፍል' : 'Dept'}</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {portalUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100">
                    <td className="py-3 px-3 text-sm">{user.email}</td>
                    <td className="py-3 px-3 font-amharic">{user.full_name}</td>
                    <td className="py-3 px-3 text-sm">{getDepartmentDisplayName(user.department, lang)}</td>
                    <td className="py-3 px-3 flex gap-1">
                      <button type="button" onClick={() => setEditingUser({ ...user })} className="text-mayor-royal-blue p-1"><Pencil className="w-4 h-4" /></button>
                      <button type="button" onClick={() => handleDeletePortalUser(user.id)} className="text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
