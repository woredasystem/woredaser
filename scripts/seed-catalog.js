// One-time seed: departments + services from static files into Supabase
// Usage: node scripts/seed-catalog.js <SERVICE_ROLE_KEY>

import { createClient } from '@supabase/supabase-js'
import { services } from '../src/data/services.js'
import { portalRoles } from '../src/data/portalRoles.js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rbbyniuqdukfehbacgyo.supabase.co'
const serviceRoleKey = process.argv[2] || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('Usage: node scripts/seed-catalog.js <SERVICE_ROLE_KEY>')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const sectorDepartmentMap = {
  civilRegistration: 'civil_head',
  tradeOffice: 'trade_head',
  laborSkills: 'labor_head',
  chiefExecutiveOffice: 'ceo_office_head',
}

const sectorOrder = ['civilRegistration', 'tradeOffice', 'laborSkills', 'chiefExecutiveOffice']

async function seedDepartments() {
  const { count } = await supabase.from('departments').select('*', { count: 'exact', head: true })
  if (count > 0) {
    console.log(`Departments already seeded (${count} rows), skipping`)
    return
  }

  const rows = portalRoles.map((role, index) => ({
    role_key: role.roleKey,
    department: role.department,
    department_am: role.departmentAm,
    department_om: role.departmentOm || null,
    is_admin: !!role.isAdmin,
    sort_order: index,
  }))

  const { error } = await supabase.from('departments').insert(rows)
  if (error) throw error
  console.log(`Seeded ${rows.length} departments`)
}

async function seedServices() {
  const { count } = await supabase.from('service_sectors').select('*', { count: 'exact', head: true })
  if (count > 0) {
    console.log(`Service sectors already seeded (${count} rows), skipping`)
    return
  }

  for (let i = 0; i < sectorOrder.length; i++) {
    const sectorKey = sectorOrder[i]
    const sector = services[sectorKey]
    if (!sector) continue

    const { data: sectorRow, error: sectorError } = await supabase
      .from('service_sectors')
      .insert({
        sector_key: sectorKey,
        name_am: sector.name.am,
        name_en: sector.name.en,
        name_om: sector.name.om || null,
        department_role_key: sectorDepartmentMap[sectorKey] || null,
        sort_order: i,
      })
      .select('id')
      .single()

    if (sectorError) throw sectorError

    const items = (sector.items || []).map((item, index) => ({
      sector_id: sectorRow.id,
      name_am: item.name.am,
      name_en: item.name.en,
      name_om: item.name.om || null,
      requirements_am: item.requirements?.am || null,
      requirements_en: item.requirements?.en || null,
      requirements_om: item.requirements?.om || null,
      fee: item.fee ?? null,
      standard_time: item.standardTime || null,
      payment_method_am: item.paymentMethod?.am || null,
      payment_method_en: item.paymentMethod?.en || null,
      service_group_am: item.serviceGroup?.am || null,
      service_group_en: item.serviceGroup?.en || null,
      sort_order: index,
      is_bookable: sectorKey !== 'chiefExecutiveOffice',
      is_active: true,
    }))

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from('service_items').insert(items)
      if (itemsError) throw itemsError
    }

    console.log(`Seeded sector ${sectorKey}: ${items.length} items`)
  }
}

async function main() {
  await seedDepartments()
  await seedServices()
  console.log('Catalog seed complete')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
