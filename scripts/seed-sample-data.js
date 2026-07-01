// Sample data for complaints, appointments, site stats, content, projects
// Excludes: services, officials, departments
// Usage: node scripts/seed-sample-data.js <SERVICE_ROLE_KEY>

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rbbyniuqdukfehbacgyo.supabase.co'
const serviceRoleKey = process.argv[2] || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('Usage: node scripts/seed-sample-data.js <SERVICE_ROLE_KEY>')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEPARTMENTS = [
  'Civil Registration',
  'Trade Office',
  'Labor & Skills',
  'Chief Executive Office',
]

const COMPLAINT_NAMES = [
  'አበበ ከበደ',
  'ሰረጀ ሙሉጌታ',
  'ሀና አማረ',
  'ገብረ ሥላሴ',
  'ሰናይት ተስፋዬ',
  'ብርሃኑ ወልደ',
  'ሚሊዮን አሰፋ',
  'ሳራ ተክለ',
  'ዮሴፍ አሊ',
  'ማርያም ገብረ',
  'ተክለ ሃይማኖት',
  'ፍቅረብርሃን ደስታ',
  'ሀረጌ ገብረ',
  'አስናቀ መንግስት',
  'ዳዊት አበበ',
  'አማኑኤል ተሰማ',
  'ሰላማዊት ገብረ',
  'በላይነሽ ፀጋዬ',
  'አብርሃም ሀይሉ',
  'ሰይፈ መንግስቱ',
  'ሄሊን ገብረ',
  'አዳነ ተፈሪ',
  'ሙሉነሽ አሰፋ',
  'ጌታቸው ተስፋ',
]

const OFFICIALS = [
  'አቶ ተመስገን በላይ',
  'የሲቪል ምዝገባ ሀላፊ',
  'የንግድ ጽ/ቤት ሀላፊ',
  'የስራና ክህሎት ሀላፊ',
]

const COMPLAINT_DETAILS = [
  'የልደት ምዝገባ ሂደት ረጅም እንደሆነ ተገልጾልኝ ይታወቃል።',
  'የንግድ ፈቃድ ማዘጋጀት ተዘግይቷል።',
  'በክፍል ውስጥ አገልግሎት ለማግኘት ተደጋጋሚ ጉዞ አድርጌያለሁ።',
  'የሰራተኞች አክብሮት ጉዳይ ተጠቅሶልኝ።',
  'የአገልግሎት ሰዓት መረጃ በድረ-ገጽ ላይ የተሳሳተ ነው።',
  'የጉዲፍቻ ማረጋገጫ ሰነድ ተዘግይቷል።',
  'የስራ ፈቃድ ማዘጋጀት ሂደት ግልጽ አይደለም።',
  'በቢሮ ውስጥ ያለው ወረቀት ስራ ተጨማሪ ጊዜ ይዞኛል።',
]

const SERVICE_TYPES = [
  'የልደት ምዝገባ እና ማስረጃ አገልግሎት',
  'የጋብቻ ምዝገባ እና ማስረጃ አገልግሎት',
  'ዲጂታል የነዋሪነት ምዝገባ አገልግሎት',
  'የንግድ ፈቃድ ማዘጋጀት',
  'የስራ ፈቃድ ማዘጋጀት',
  'የክህሎት ስልጠና ምዝገባ',
  'የሞት ምዝገባ እና ማስረጃ አገልግሎት',
  'የፍች ምዝገባ እና ማስረጃ አገልግሎት',
]

const CITIZEN_NAMES = [
  'ሰለሞን ተወልደ',
  'ሀና መንግስት',
  'አብርሃም ገብረ',
  'ደሀኔ መሀመድ',
  'ሰናይት አሰፋ',
  'ብርሃኑ ተክለ',
  'ማርያም ደስታ',
  'ገብረ ሥላሴ',
  'ተክለ መንግስት',
  'ፍቅረብርሀን አማረ',
  'ዮሴፍ ሀሰን',
  'ሀረጌ ተስፋ',
  'አስናቀ ገብረ',
  'ዳዊት መንግስት',
  'ሙሉነሽ ተሰማ',
  'ጌታቸው ገብረ',
  'ሄሊን አሰፋ',
  'አዳነ ተከለ',
]

const SAMPLE_TICKET_PREFIX = 'GRV-2026-S'
const SAMPLE_CODES = [
  'ABCD1234', 'EFGH5678', 'IJKL9012', 'MNOP3456', 'QRST7890',
  'UVWX2345', 'YZAB6789', 'CDEF0123', 'GHIJ4567', 'KLMN8901',
  'OPQR2345', 'STUV6789', 'WXYZ0123', 'BCDE4567', 'FGHI8901',
  'JKLM2345', 'NOPQ6789', 'RSTU0123', 'VWXY4567', 'ZABC8901',
  'DEFG2345', 'HIJK6789', 'LMNO0123', 'PQRS4567', 'TUVW8901',
  'XYAB2345', 'ZCDE6789', 'FGHK0123', 'IJLM4567', 'NOPR8901',
  'QRSU2345', 'TVWX6789', 'YZAC0123', 'BDEF4567', 'GHJK8901',
  'LMNP2345', 'QRST6789', 'UVWX0123', 'YZAB4567', 'CDEF8901',
  'GHIJ2345', 'KLMN6789',
]

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(9 + (n % 6), (n * 7) % 60, 0, 0)
  return d.toISOString()
}

function futureDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(10 + (n % 5), (n * 11) % 60, 0, 0)
  return d.toISOString()
}

async function ensureColumns() {
  // Run supabase-sample-data-migration.sql in SQL editor for column setup, or use service role DDL.
  console.log('Skipping DDL — apply supabase-sample-data-migration.sql if unique_code columns are missing.')
}

async function seedSiteStats() {
  const { error } = await supabase.from('site_stats').upsert({
    id: 1,
    population: 128450,
    blocks: 14,
    services_count: 58,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
  console.log('Updated site_stats')
}

async function seedSiteContent() {
  const updates = [
    {
      section_key: 'mission',
      body_am: 'የወረዳችን ተልዕኮ ህዝቡን በቅርብ፣ በግልጽ እና በታማኝ ዲጂታል አገልግሎት ማገልገል ነው።',
      body_en: 'Our mission is to deliver accessible, transparent, and accountable digital public service to every resident.',
    },
    {
      section_key: 'vision',
      body_am: 'ዘመናዊ፣ ዲጂታል እና ለህዝብ ተገቢ የሆነ ወረዳ መፍጠር — የአገልግሎት ሁሉ በአንድ ቦታ።',
      body_en: 'A modern, digital, citizen-centered woreda where every service is within reach.',
    },
    {
      section_key: 'values',
      body_am: 'ግልጽነት · ተጠያቂነት · እኩልነት · ተሳትፎ · ለአካባቢ ጥበቃ',
      body_en: 'Transparency · Accountability · Equity · Participation · Environmental care',
    },
  ]

  for (const row of updates) {
    const { error } = await supabase
      .from('site_content_sections')
      .update({ body_am: row.body_am, body_en: row.body_en, updated_at: new Date().toISOString() })
      .eq('section_key', row.section_key)
    if (error) throw error
  }
  console.log('Updated site_content_sections')
}

async function seedProjects() {
  const projects = [
    {
      title_am: 'የወጣቶች ክህሎት ማዕከል',
      title_en: 'Youth Skills Center',
      title_om: 'Giddugala Dandeettii Dargaggootaa',
      description_am: 'ለወጣቶች የኮምፒውተር እና የክህሎት ስልጠና ማዕከል በመገንባት ላይ።',
      description_en: 'Computer and vocational training hub for youth.',
      sort_order: 4,
      is_active: true,
    },
    {
      title_am: 'የጥበቃ ማሻሻያ',
      title_en: 'Sanitation Upgrade',
      title_om: 'Fooyya\'iinsa Qulqullina',
      description_am: 'በዋና መንገዶች ላይ የጥበቃ መሳሪያዎች እና የአረንጓዴ ቦታ መስፋት።',
      description_en: 'Public sanitation and green-space expansion along main roads.',
      sort_order: 5,
      is_active: true,
    },
  ]

  for (const project of projects) {
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('title_am', project.title_am)
      .maybeSingle()

    if (existing) continue

    const { error } = await supabase.from('projects').insert(project)
    if (error) throw error
  }
  console.log('Seeded extra projects (if missing)')
}

function buildComplaints() {
  const statusPlan = [
    ...Array(8).fill('Pending'),
    ...Array(5).fill('In Progress'),
    ...Array(8).fill('Resolved'),
    ...Array(3).fill('Escalated'),
  ]

  return statusPlan.map((status, i) => {
    const dept = DEPARTMENTS[i % DEPARTMENTS.length]
    const resolved = status === 'Resolved'
    const escalated = status === 'Escalated'
    return {
      ticket_number: `${SAMPLE_TICKET_PREFIX}${String(i + 1).padStart(3, '0')}`,
      unique_code: SAMPLE_CODES[i],
      complainant_name: COMPLAINT_NAMES[i],
      complainant_phone: `09${String(10000000 + i * 111111).slice(0, 8)}`,
      target_official: OFFICIALS[i % OFFICIALS.length],
      department: dept,
      assigned_department: dept,
      details: COMPLAINT_DETAILS[i % COMPLAINT_DETAILS.length],
      status,
      escalation_level: escalated ? 2 : 1,
      resolution_note: resolved ? 'ጉዳዩ ተፈትቷል እና ለቅሬታ አቅራቢው ተመልሶ ተገልጿል።' : null,
      created_at: daysAgo(1 + (i % 28)),
    }
  })
}

function buildAppointments() {
  const statusPlan = [
    ...Array(10).fill('Confirmed'),
    ...Array(6).fill('Completed'),
    ...Array(4).fill('Missed'),
  ]
  const sampleCodes = [
    'TUVW8901','XYAB2345','ZCDE6789','FGHK0123','IJLM4567','NOPR8901','QRSU2345',
    'TVWX6789','YZAC0123','BDEF4567','GHJK8901','LMNP2345','QRST6789','UVWX0123',
    'YZAB4567','CDEF8901','GHIJ2345','KLMN6789','OPQT0123','RSTV4567',
  ]

  return statusPlan.map((status, i) => {
    const dept = DEPARTMENTS[i % DEPARTMENTS.length]
    const isPast = status === 'Completed' || status === 'Missed'
    const dayOffset = isPast ? -(2 + (i % 20)) : 1 + (i % 14)
    return {
      unique_code: sampleCodes[i],
      citizen_name: CITIZEN_NAMES[i],
      citizen_phone: `09${String(20000000 + i * 123457).slice(0, 8)}`,
      service_type: SERVICE_TYPES[i % SERVICE_TYPES.length],
      appointment_date: isPast ? daysAgo(-dayOffset) : futureDays(dayOffset),
      status,
      assigned_department: dept,
      created_at: daysAgo(3 + (i % 25)),
    }
  })
}

async function clearSampleRows() {
  const { error: cErr } = await supabase
    .from('complaints')
    .delete()
    .like('ticket_number', `${SAMPLE_TICKET_PREFIX}%`)

  if (cErr) throw cErr

  const sampleCodes = [
    'TUVW8901','XYAB2345','ZCDE6789','FGHK0123','IJLM4567','NOPR8901','QRSU2345',
    'TVWX6789','YZAC0123','BDEF4567','GHJK8901','LMNP2345','QRST6789','UVWX0123',
    'YZAB4567','CDEF8901','GHIJ2345','KLMN6789','OPQT0123','RSTV4567',
  ]
  const { error: aErr } = await supabase
    .from('appointments')
    .delete()
    .in('unique_code', sampleCodes)

  if (aErr) throw aErr
}

async function seedComplaintsAndAppointments() {
  await clearSampleRows()

  const complaints = buildComplaints()
  const { error: cInsertErr } = await supabase.from('complaints').insert(complaints)
  if (cInsertErr) throw cInsertErr
  console.log(`Seeded ${complaints.length} complaints`)

  const appointments = buildAppointments()
  const { error: aInsertErr } = await supabase.from('appointments').insert(appointments)
  if (aInsertErr) throw aInsertErr
  console.log(`Seeded ${appointments.length} appointments`)
}

async function main() {
  await ensureColumns()
  await seedSiteStats()
  await seedSiteContent()
  await seedProjects()
  await seedComplaintsAndAppointments()
  console.log('Sample data seed complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
