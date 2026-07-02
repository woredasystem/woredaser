import { useState, useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useDepartments } from '../hooks/useDepartments'
import { supabase } from '../lib/supabase'
import { getDepartmentDisplayName } from '../utils/routing'
import { createPortalUser, updatePortalUser, resetPortalUserPassword } from '../utils/adminApi'
import AdminFormTip from './admin/AdminFormTip'
import { showToast } from './ToastContainer'
import { UserPlus, KeyRound, Trash2, Pencil } from 'lucide-react'

const emptyUserForm = {
  email: '',
  password: '',
  username: '',
  full_name: '',
  role_key: 'trade_head',
  is_admin: false,
}

export default function AdminPortalUsersPanel() {
  const { lang } = useLanguage()
  const { departments } = useDepartments()
  const [portalUsers, setPortalUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [userForm, setUserForm] = useState(emptyUserForm)
  const [editingUser, setEditingUser] = useState(null)
  const [resetPassword, setResetPassword] = useState('')
  const [creatingUser, setCreatingUser] = useState(false)
  const [updatingUser, setUpdatingUser] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [showAdminForm, setShowAdminForm] = useState(false)

  const officerDepartments = departments.filter((d) => !d.isAdmin)
  const adminDepartment = departments.find((d) => d.isAdmin)

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

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreatingUser(true)
    try {
      const role = showAdminForm
        ? (adminDepartment || getRole('admin'))
        : getRole(userForm.role_key)
      if (!role) throw new Error('Invalid role')

      const email = userForm.email.trim().toLowerCase()
      if (!email) throw new Error(lang === 'am' ? 'ኢሜይል ያስፈልጋል' : 'Email is required')

      await createPortalUser({
        email,
        password: userForm.password,
        username: userForm.username.trim(),
        fullName: userForm.full_name.trim(),
        department: role.department,
        departmentAm: role.departmentAm,
        roleKey: role.roleKey,
        isAdmin: showAdminForm || userForm.is_admin || !!role.isAdmin,
        createOfficial: false,
      })

      showToast(lang === 'am' ? 'የፖርታል ተጠቃሚ ተፈጥሯል' : 'Portal user created', 'success')
      setUserForm(emptyUserForm)
      setShowUserForm(false)
      setShowAdminForm(false)
      await fetchPortalUsers()
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
        email: editingUser.email.trim().toLowerCase(),
        username: editingUser.username,
        fullName: editingUser.full_name,
        department: role?.department || editingUser.department,
        departmentAm: role?.departmentAm || editingUser.department_am,
        roleKey: editingUser.role_key,
        isAdmin: editingUser.is_admin,
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

  const portalAdmins = portalUsers.filter((u) => u.is_admin)
  const portalOfficers = portalUsers.filter((u) => !u.is_admin)

  const openCreateAdmin = () => {
    setUserForm({
      ...emptyUserForm,
      role_key: adminDepartment?.roleKey || 'admin',
      is_admin: true,
    })
    setShowAdminForm(true)
    setShowUserForm(false)
    setEditingUser(null)
  }

  const openCreateOfficer = () => {
    setUserForm({
      ...emptyUserForm,
      role_key: officerDepartments[0]?.roleKey || 'trade_head',
      is_admin: false,
    })
    setShowUserForm(true)
    setShowAdminForm(false)
    setEditingUser(null)
  }

  const renderUserForm = (isAdminForm) => (
    <form onSubmit={handleCreateUser} className="mb-6 p-4 bg-slate-50 rounded-gov-lg space-y-4">
      <p className="font-semibold text-mayor-navy font-amharic">
        {isAdminForm
          ? (lang === 'am' ? 'አዲስ የፖርታል አስተዳዳሪ' : 'New portal administrator')
          : (lang === 'am' ? 'አዲስ የፖርታል ባለሙያ' : 'New portal officer')}
      </p>
      <AdminFormTip>
        {lang === 'am'
          ? 'ኢሜይል እና የይለፍ ቃል ለመግቢያ ይጠቀማሉ — ባለሙያው በሰጡት ኢሜይል ብቻ ወደ ፓንሉ መግባት ይችላል።'
          : 'Officers sign in with the email and password you set here — use their real work email.'}
      </AdminFormTip>
      <div className="grid md:grid-cols-2 gap-4">
        <input
          required
          type="email"
          placeholder={lang === 'am' ? 'ኢሜይል (ለመግቢያ)' : 'Login email'}
          value={userForm.email}
          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
          className="w-full px-4 py-2 border rounded-gov md:col-span-2"
        />
        <input
          required
          placeholder={lang === 'am' ? 'የተጠቃሚ ስም' : 'Username'}
          value={userForm.username}
          onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
          className="w-full px-4 py-2 border rounded-gov"
        />
        <input
          required
          type="password"
          minLength={8}
          placeholder={lang === 'am' ? 'የይለፍ ቃል' : 'Password'}
          value={userForm.password}
          onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
          className="w-full px-4 py-2 border rounded-gov"
        />
        <input
          required
          placeholder={lang === 'am' ? 'ሙሉ ስም' : 'Full name'}
          value={userForm.full_name}
          onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
          className="w-full px-4 py-2 border rounded-gov md:col-span-2"
        />
        {!isAdminForm && (
          <select
            value={userForm.role_key}
            onChange={(e) => setUserForm({ ...userForm, role_key: e.target.value })}
            className="w-full px-4 py-2 border rounded-gov md:col-span-2"
          >
            {officerDepartments.map((role) => (
              <option key={role.roleKey} value={role.roleKey}>
                {getDepartmentDisplayName(role.department, lang)} ({role.roleKey})
              </option>
            ))}
          </select>
        )}
        {!isAdminForm && (
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={userForm.is_admin}
              onChange={(e) => setUserForm({ ...userForm, is_admin: e.target.checked })}
            />
            {lang === 'am' ? 'የፖርታል አስተዳዳሪ ፍቃድ (ሙሉ አስተዳደር)' : 'Grant portal admin access (full system admin)'}
          </label>
        )}
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={creatingUser} className="gov-button px-6 py-2">
          {creatingUser ? '...' : (lang === 'am' ? 'ፍጠር' : 'Create')}
        </button>
        <button
          type="button"
          onClick={() => { setShowUserForm(false); setShowAdminForm(false) }}
          className="px-6 py-2 border rounded-gov"
        >
          {lang === 'am' ? 'ሰርዝ' : 'Cancel'}
        </button>
      </div>
    </form>
  )

  const renderUserTable = (users, emptyLabel) => {
    if (users.length === 0) {
      return <p className="text-mayor-navy/60 font-amharic text-center py-6">{emptyLabel}</p>
    }

    return (
      <div className="portal-table-scroll">
        <table className="w-full min-w-[520px] text-left">
          <thead className="portal-table-head-white">
            <tr className="border-b">
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3 font-amharic">{lang === 'am' ? 'ስም' : 'Name'}</th>
              <th className="py-2 px-3">{lang === 'am' ? 'ክፍል' : 'Dept'}</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100">
                <td className="py-3 px-3 text-sm break-all max-w-[10rem] sm:max-w-none">{user.email}</td>
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
    )
  }

  return (
    <section className="gov-card p-4 sm:p-6 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-mayor-navy font-amharic flex items-center gap-2">
            <KeyRound className="w-6 h-6" />
            {lang === 'am' ? 'የፖርታል ባለሙያዎች' : 'Portal Officers'}
          </h2>
          <p className="text-sm text-mayor-navy/70 font-amharic mt-1">
            {lang === 'am'
              ? 'ወደ ፓንል የሚገቡ ሰራተኞች — በመነሻ ገጽ አይታዩም። የሚፈጥሩት ኢሜይል ለመግቢያ ይጠቀሙ'
              : 'Staff who log into department portals. Not shown on the homepage. Use the email you assign here to sign in.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={openCreateOfficer} className="gov-button px-4 py-2 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            {lang === 'am' ? 'ባለሙያ ፍጠር' : 'Create Officer'}
          </button>
          <button type="button" onClick={openCreateAdmin} className="px-4 py-2 flex items-center gap-2 rounded-gov border-2 border-mayor-royal-blue text-mayor-royal-blue font-semibold hover:bg-mayor-royal-blue hover:text-white transition-colors">
            <UserPlus className="w-4 h-4" />
            {lang === 'am' ? 'አስተዳዳሪ ፍጠር' : 'Create Admin'}
          </button>
        </div>
      </div>

      {showUserForm && !editingUser && renderUserForm(false)}
      {showAdminForm && !editingUser && renderUserForm(true)}

      {editingUser && (
        <form onSubmit={handleUpdateUser} className="mb-6 p-4 bg-blue-50 rounded-gov-lg space-y-4 border border-mayor-royal-blue/20">
          <p className="font-semibold text-mayor-navy">{lang === 'am' ? 'ተጠቃሚ አርትዕ' : 'Edit Officer'}</p>
          <AdminFormTip>
            {lang === 'am'
              ? 'ኢሜይል ሲቀየር ባለሙያው በአዲሱ ኢሜይል መግባት ይኖርበታል።'
              : 'If you change the email, the officer must sign in with the new address.'}
          </AdminFormTip>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              required
              type="email"
              value={editingUser.email}
              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              className="px-4 py-2 border rounded-gov md:col-span-2"
              placeholder="Email"
            />
            <input
              required
              value={editingUser.username}
              onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
              className="px-4 py-2 border rounded-gov"
              placeholder="Username"
            />
            <input
              required
              value={editingUser.full_name}
              onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
              className="px-4 py-2 border rounded-gov"
              placeholder={lang === 'am' ? 'ሙሉ ስም' : 'Full name'}
            />
            <select
              value={editingUser.role_key}
              onChange={(e) => setEditingUser({ ...editingUser, role_key: e.target.value })}
              className="px-4 py-2 border rounded-gov md:col-span-2"
            >
              {departments.map((role) => (
                <option key={role.roleKey} value={role.roleKey}>{getDepartmentDisplayName(role.department, lang)}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={!!editingUser.is_admin}
                onChange={(e) => setEditingUser({ ...editingUser, is_admin: e.target.checked })}
              />
              {lang === 'am' ? 'የፖርታል አስተዳዳሪ' : 'Portal administrator'}
            </label>
            <input
              type="password"
              minLength={8}
              placeholder={lang === 'am' ? 'አዲስ የይለፍ ቃል (አማራጭ)' : 'New password (optional)'}
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              className="px-4 py-2 border rounded-gov md:col-span-2"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={updatingUser} className="gov-button px-6 py-2">{lang === 'am' ? 'አዘምን' : 'Update'}</button>
            <button type="button" onClick={() => { setEditingUser(null); setResetPassword('') }} className="px-6 py-2 border rounded-gov">{lang === 'am' ? 'ሰርዝ' : 'Cancel'}</button>
          </div>
        </form>
      )}

      {loadingUsers ? (
        <p className="text-center py-8">{lang === 'am' ? 'በመጫን...' : 'Loading...'}</p>
      ) : portalUsers.length === 0 ? (
        <p className="text-mayor-navy/60 font-amharic text-center py-8">{lang === 'am' ? 'እስካሁን የፖርታል ተጠቃሚ አልተጨመረም' : 'No portal users yet'}</p>
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-mayor-navy font-amharic mb-3">
              {lang === 'am' ? 'የፖርታል አስተዳዳሪዎች' : 'Portal Administrators'}
            </h3>
            {renderUserTable(
              portalAdmins,
              lang === 'am' ? 'አስተዳዳሪ የለም' : 'No administrators yet',
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-mayor-navy font-amharic mb-3">
              {lang === 'am' ? 'የስራ ክፍል ባለሙያዎች' : 'Department Officers'}
            </h3>
            {renderUserTable(
              portalOfficers,
              lang === 'am' ? 'ባለሙያ የለም' : 'No officers yet',
            )}
          </div>
        </div>
      )}
    </section>
  )
}
