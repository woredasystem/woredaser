// Add a second portal admin + an additional homepage leader
// Usage: node scripts/add-secondary-admin-leader.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rbbyniuqdukfehbacgyo.supabase.co'
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@woreda.gov.et'
const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'Admin2025!'

if (!anonKey) {
  console.error('Set VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, anonKey)

const SECOND_ADMIN = {
  email: 'admin2@woreda.gov.et',
  password: 'Admin22025!',
  username: 'admin2',
  fullName: 'Deputy Administrator',
  department: 'Admin',
  departmentAm: 'አስተዳደር',
  roleKey: 'admin',
  isAdmin: true,
}

const EXTRA_LEADER = {
  full_name_am: 'ሁለተኛ ምክትል አመራር',
  full_name_en: 'Deputy Leader',
  title_am: 'የወረዳ ምክትል አመራር',
  title_en: 'Deputy Woreda Leader',
  role_key: 'deputy_leader',
  show_on_home: false,
}

async function main() {
  console.log('Signing in as primary admin...')
  const { data: auth, error: loginError } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  })
  if (loginError) throw loginError

  console.log('Creating second portal admin...')
  const { data: adminResult, error: adminFnError } = await supabase.functions.invoke(
    'admin-create-portal-user',
    { body: { ...SECOND_ADMIN, createOfficial: false } },
  )
  if (adminFnError) throw adminFnError
  if (adminResult?.error) throw new Error(adminResult.error)

  console.log('Adding additional homepage leader...')
  const { error: leaderError } = await supabase.from('officials').insert([EXTRA_LEADER])
  if (leaderError && !leaderError.message.includes('duplicate')) throw leaderError

  console.log('\nDone.')
  console.log('Second portal admin:')
  console.log(`  Email:    ${SECOND_ADMIN.email}`)
  console.log(`  Password: ${SECOND_ADMIN.password}`)
  console.log('Additional leader:', EXTRA_LEADER.full_name_en)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
