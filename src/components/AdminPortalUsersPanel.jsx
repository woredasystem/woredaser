import { useState, useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useDepartments } from '../hooks/useDepartments'
import { supabase } from '../lib/supabase'
import { getDepartmentDisplayName } from '../utils/routing'
import { createPortalUser, updatePortalUser, resetPortalUserPassword } from '../utils/adminApi'
import { showToast } from './ToastContainer'
import { UserPlus, KeyRound, Trash2, Pencil } from 'lucide-react'

const emptyUserForm = {
  email: '',
  password: '',
  username: '',
  full_name: '',
  role_key: 'trade_head',
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

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreatingUser(true)
    try {
      const role = getRole(userForm.role_key)
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
        isAdmin: !!role.isAdmin,
        createOfficial: false,
      })

      showToast(lang === 'am' ? 'የፖርታል ተጠቃሚ ተፈጥሯል' : 'Portal user created', 'success')
      setUserForm(emptyUserForm)
      setShowUserForm(false)
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
    <section className="gov-card p-6">
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
        <button type="button" onClick={() => { setShowUserForm(true); setEditingUser(null) }} className="gov-button px-4 py-2 flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          {lang === 'am' ? 'ተጠቃሚ ፍጠር' : 'Create Officer'}
        </button>
      </div>

      {showUserForm && !editingUser && (
        <form onSubmit={handleCreateUser} className="mb-6 p-4 bg-slate-50 rounded-gov-lg space-y-4">
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
            <select
              value={userForm.role_key}
              onChange={(e) => setUserForm({ ...userForm, role_key: e.target.value })}
              className="w-full px-4 py-2 border rounded-gov md:col-span-2"
            >
              {allDepartments.map((role) => (
                <option key={role.roleKey} value={role.roleKey}>
                  {getDepartmentDisplayName(role.department, lang)} ({role.roleKey})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={creatingUser} className="gov-button px-6 py-2">
            {creatingUser ? '...' : (lang === 'am' ? 'ተጠቃሚ ፍጠር' : 'Create')}
          </button>
        </form>
      )}

      {editingUser && (
        <form onSubmit={handleUpdateUser} className="mb-6 p-4 bg-blue-50 rounded-gov-lg space-y-4 border border-mayor-royal-blue/20">
          <p className="font-semibold text-mayor-navy">{lang === 'am' ? 'ተጠቃሚ አርትዕ' : 'Edit Officer'}</p>
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
              {allDepartments.map((role) => (
                <option key={role.roleKey} value={role.roleKey}>{getDepartmentDisplayName(role.department, lang)}</option>
              ))}
            </select>
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
        <p className="text-mayor-navy/60 font-amharic text-center py-8">{lang === 'am' ? 'እስካሁን የፖርታል ተጠቃሚ አልተጨመረም' : 'No portal officers yet'}</p>
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
  )
}
