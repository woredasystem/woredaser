// Seed leaders + portal admins using primary admin login (no service role required)
// Usage: node scripts/seed-leaders-and-admins-via-admin.js

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { seedOfficials, seedPortalAdmins } from '../src/data/seedLeadersAndAdmins.js'

function loadEnv() {
  try {
    const raw = readFileSync('.env', 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim()
    }
  } catch {
    // ignore
  }
}

loadEnv()

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rbbyniuqdukfehbacgyo.supabase.co'
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@woreda.gov.et'
const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'Admin2025!'

if (!anonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, anonKey)

async function seedLeaders() {
  console.log(`\n📋 Seeding ${seedOfficials.length} leaders...`)
  for (const official of seedOfficials) {
    const { data: existing } = await supabase
      .from('officials')
      .select('id')
      .eq('role_key', official.role_key)
      .maybeSingle()

    if (existing?.id) {
      const { error } = await supabase.from('officials').update(official).eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('officials').insert(official)
      if (error) throw error
    }
    console.log(`  ✅ ${official.full_name_en}`)
  }
}

async function seedAdmins() {
  console.log(`\n👤 Seeding ${seedPortalAdmins.length} portal admins...`)
  for (const admin of seedPortalAdmins) {
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-portal-user', {
        body: {
          email: admin.email,
          password: admin.password,
          username: admin.username,
          fullName: admin.fullName,
          department: admin.department,
          departmentAm: admin.departmentAm,
          roleKey: admin.roleKey,
          isAdmin: true,
          createOfficial: false,
        },
      })
      if (error) {
        console.log(`  ⚠️  ${admin.email}: ${error.message}`)
        continue
      }
      if (data?.error) {
        const msg = data.error.toLowerCase()
        if (msg.includes('already') || msg.includes('registered') || msg.includes('duplicate')) {
          console.log(`  ⚠️  ${admin.email} (already exists)`)
          continue
        }
        console.log(`  ⚠️  ${admin.email}: ${data.error}`)
        continue
      }
      console.log(`  ✅ ${admin.email}`)
    } catch (err) {
      console.log(`  ⚠️  ${admin.email}: ${err.message}`)
    }
  }
}

async function main() {
  console.log('Signing in as primary admin...')
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  })
  if (loginError) throw loginError

  await seedLeaders()
  await seedAdmins()

  console.log('\n✨ Done!')
  console.log('\nAdditional portal admin logins:')
  seedPortalAdmins.slice(1).forEach((a) => console.log(`  ${a.email} → ${a.password}`))
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
