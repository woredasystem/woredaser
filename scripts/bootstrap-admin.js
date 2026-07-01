// Create or link the bootstrap admin user (Auth + portal_users)
// Usage: node scripts/bootstrap-admin.js <SERVICE_ROLE_KEY>

import { createClient } from '@supabase/supabase-js'
import { getPortalEmail } from '../src/config/site.js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rbbyniuqdukfehbacgyo.supabase.co'
const serviceRoleKey = process.argv[2] || process.env.SUPABASE_SERVICE_ROLE_KEY
const adminPassword = process.env.ADMIN_PASSWORD || 'WoredaAdmin2026!'

if (!serviceRoleKey) {
  console.error('Usage: node scripts/bootstrap-admin.js <SERVICE_ROLE_KEY>')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const email = getPortalEmail('admin')

async function findAuthUserByEmail(targetEmail) {
  let page = 1
  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const match = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase())
    if (match) return match
    if (data.users.length < 200) break
    page += 1
  }
  return null
}

async function main() {
  console.log(`Setting up admin: ${email}`)

  let authUser = await findAuthUserByEmail(email)

  if (authUser) {
    const { error } = await supabase.auth.admin.updateUserById(authUser.id, {
      password: adminPassword,
      email_confirm: true,
    })
    if (error) throw error
    console.log('Updated existing auth user password')
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        department: 'Admin',
        department_am: 'አስተዳደር',
        role_key: 'admin',
      },
    })
    if (error) throw error
    authUser = data.user
    console.log('Created auth user')
  }

  const { data: existingPortal } = await supabase
    .from('portal_users')
    .select('*')
    .eq('role_key', 'admin')
    .maybeSingle()

  const portalPayload = {
    email,
    username: 'admin',
    full_name: 'System Administrator',
    department: 'Admin',
    department_am: 'አስተዳደር',
    role_key: 'admin',
    is_admin: true,
    user_id: authUser.id,
  }

  if (existingPortal) {
    const { error } = await supabase
      .from('portal_users')
      .update(portalPayload)
      .eq('id', existingPortal.id)
    if (error) throw error
    console.log('Linked existing portal_users admin row')
  } else {
    const { error } = await supabase.from('portal_users').insert([portalPayload])
    if (error) throw error
    console.log('Inserted portal_users admin row')
  }

  console.log('\nAdmin ready.')
  console.log(`  Email:    ${email}`)
  console.log(`  Password: ${adminPassword}`)
  console.log('\nLog in at /portal → Admin Portal')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
