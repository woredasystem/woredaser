// Seed 7+ public leaders (officials) and 7+ portal admin accounts
// Usage: node scripts/seed-leaders-and-admins.js <SERVICE_ROLE_KEY>

import { createClient } from '@supabase/supabase-js'
import { seedOfficials, seedPortalAdmins } from '../src/data/seedLeadersAndAdmins.js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rbbyniuqdukfehbacgyo.supabase.co'
const serviceRoleKey = process.argv[2] || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('Usage: node scripts/seed-leaders-and-admins.js <SERVICE_ROLE_KEY>')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seedLeaders() {
  console.log(`\n📋 Seeding ${seedOfficials.length} leaders (officials)...`)

  for (const official of seedOfficials) {
    const { data: existing } = await supabase
      .from('officials')
      .select('id')
      .eq('role_key', official.role_key)
      .maybeSingle()

    if (existing?.id) {
      const { error } = await supabase.from('officials').update(official).eq('id', existing.id)
      if (error) throw new Error(`officials ${official.role_key}: ${error.message}`)
    } else {
      const { error } = await supabase.from('officials').insert(official)
      if (error) throw new Error(`officials ${official.role_key}: ${error.message}`)
    }
    console.log(`  ✅ ${official.full_name_en} (${official.role_key})`)
  }
}

async function upsertPortalAdminRow(admin) {
  const { data: existing } = await supabase
    .from('portal_users')
    .select('id')
    .eq('email', admin.email)
    .maybeSingle()

  const row = {
    email: admin.email,
    username: admin.username,
    full_name: admin.fullName,
    department: admin.department,
    department_am: admin.departmentAm,
    role_key: admin.roleKey,
    is_admin: true,
  }

  if (existing) {
    const { error } = await supabase.from('portal_users').update(row).eq('id', existing.id)
    if (error) throw error
    return existing.id
  }

  const { data, error } = await supabase.from('portal_users').insert(row).select('id').single()
  if (error) throw error
  return data.id
}

async function createOrLinkAuthUser(admin) {
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: admin.email,
    password: admin.password,
    email_confirm: true,
    user_metadata: {
      department: admin.department,
      department_am: admin.departmentAm,
      role_key: admin.roleKey,
    },
  })

  if (authError) {
    const alreadyExists =
      authError.message?.includes('already registered') ||
      authError.message?.includes('already been registered')

    if (!alreadyExists) throw authError

    const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })
    if (listError) throw listError

    const existingUser = listed.users.find(
      (u) => u.email?.toLowerCase() === admin.email.toLowerCase()
    )
    if (!existingUser) throw new Error(`Auth user exists but could not find ${admin.email}`)

    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: admin.password,
      email_confirm: true,
    })
    if (updateAuthError) throw updateAuthError

    const { error: linkError } = await supabase
      .from('portal_users')
      .update({ user_id: existingUser.id, department_am: admin.departmentAm })
      .eq('email', admin.email)
    if (linkError) throw linkError
    return
  }

  if (!authUser?.user) throw new Error(`No user returned for ${admin.email}`)

  const { error: linkError } = await supabase
    .from('portal_users')
    .update({ user_id: authUser.user.id, department_am: admin.departmentAm })
    .eq('email', admin.email)
  if (linkError) throw linkError
}

async function seedAdmins() {
  console.log(`\n👤 Seeding ${seedPortalAdmins.length} portal admins...`)

  for (const admin of seedPortalAdmins) {
    await upsertPortalAdminRow(admin)
    await createOrLinkAuthUser(admin)
    console.log(`  ✅ ${admin.email}`)
  }
}

async function main() {
  console.log('🚀 Seeding leaders and portal admins...')
  await seedLeaders()
  await seedAdmins()
  console.log('\n✨ Done!')
  console.log('\nPortal admin logins:')
  seedPortalAdmins.forEach((a) => console.log(`  ${a.email} → ${a.password}`))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
