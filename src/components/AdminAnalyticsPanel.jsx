import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts'
import {
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Activity,
} from 'lucide-react'
import { getDepartmentDisplayName } from '../utils/routing'

const BRAND = {
  navy: '#0A2A4A',
  deep: '#0D47A1',
  royal: '#1565C0',
  highlight: '#1E88E5',
  pending: '#F59E0B',
  inProgress: '#1E88E5',
  resolved: '#16A34A',
  escalated: '#EF4444',
  confirmed: '#1565C0',
  rescheduled: '#F59E0B',
  completed: '#16A34A',
  missed: '#EF4444',
  slate: '#94A3B8',
}

function StatCard({ icon: Icon, label, value, sub, accent = 'royal', trend }) {
  const accents = {
    royal: 'bg-mayor-royal-blue/10 text-mayor-royal-blue border-mayor-royal-blue/20',
    deep: 'bg-mayor-deep-blue/10 text-mayor-deep-blue border-mayor-deep-blue/20',
    navy: 'bg-mayor-navy/10 text-mayor-navy border-mayor-navy/20',
    highlight: 'bg-mayor-highlight-blue/10 text-mayor-highlight-blue border-mayor-highlight-blue/20',
    green: 'bg-green-50 text-green-600 border-green-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  }

  return (
    <div className="bg-white border-2 border-mayor-gray-divider rounded-2xl p-5 hover:shadow-[0_8px_24px_rgba(10,42,74,0.06)] transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 ${accents[accent]}`}>
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>
        {trend != null && (
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-mayor-royal-blue">
            <TrendingUp className="w-3.5 h-3.5" />
            {trend}%
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold text-mayor-navy tabular-nums">{value}</p>
      <p className="mt-1 text-sm font-semibold text-mayor-navy/70 font-amharic">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-mayor-navy/45 font-amharic">{sub}</p>}
    </div>
  )
}

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-white border-2 border-mayor-gray-divider rounded-2xl overflow-hidden ${className}`}>
      <div className="h-1 bg-mayor-royal-blue" />
      <div className="p-5 sm:p-6">
        <h3 className="text-lg font-bold text-mayor-navy font-amharic">{title}</h3>
        {subtitle && <p className="text-xs text-mayor-navy/45 font-amharic mt-1">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-mayor-navy text-white text-xs rounded-xl px-3 py-2 shadow-lg border border-white/10 font-amharic">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

function buildLastNDaysTrend(items, dateField, days = 14) {
  const buckets = {}
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    buckets[key] = { date: key, label: `${d.getMonth() + 1}/${d.getDate()}`, complaints: 0, appointments: 0 }
  }

  items.complaints.forEach((c) => {
    const key = new Date(c.created_at).toISOString().slice(0, 10)
    if (buckets[key]) buckets[key].complaints++
  })

  items.appointments.forEach((a) => {
    const key = new Date(a.created_at).toISOString().slice(0, 10)
    if (buckets[key]) buckets[key].appointments++
  })

  return Object.values(buckets)
}

export default function AdminAnalyticsPanel({ complaints, appointments, loading, lang }) {
  const analytics = useMemo(() => {
    const inProgress = complaints.filter((c) => c.status === 'In Progress').length
    const pending = complaints.filter((c) => c.status === 'Pending').length
    const resolved = complaints.filter((c) => c.status === 'Resolved').length
    const escalated = complaints.filter((c) => c.status === 'Escalated').length
    const totalComplaints = complaints.length

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayApps = appointments.filter((a) => {
      const d = new Date(a.appointment_date)
      return d >= today && d < tomorrow
    }).length

    const confirmed = appointments.filter((a) => a.status === 'Confirmed').length
    const rescheduled = appointments.filter((a) => a.status === 'Rescheduled').length
    const completed = appointments.filter((a) => a.status === 'Completed').length
    const missed = appointments.filter((a) => a.status === 'Missed').length
    const totalAppointments = appointments.length

    const resolutionRate = totalComplaints > 0 ? Math.round((resolved / totalComplaints) * 100) : 0
    const completionRate = totalAppointments > 0 ? Math.round((completed / totalAppointments) * 100) : 0

    const last7Complaints = complaints.filter((c) => {
      const d = new Date(c.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return d >= weekAgo
    }).length

    const deptMap = complaints.reduce((acc, c) => {
      const dept = c.assigned_department || c.department || 'Unknown'
      if (!acc[dept]) acc[dept] = { pending: 0, inProgress: 0, resolved: 0, escalated: 0, total: 0 }
      acc[dept].total++
      if (c.status === 'Pending') acc[dept].pending++
      if (c.status === 'In Progress') acc[dept].inProgress++
      if (c.status === 'Resolved') acc[dept].resolved++
      if (c.status === 'Escalated') acc[dept].escalated++
      return acc
    }, {})

    const departmentChart = Object.entries(deptMap)
      .map(([dept, d]) => ({
        name: getDepartmentDisplayName(dept, lang).slice(0, 12),
        fullName: getDepartmentDisplayName(dept, lang),
        pending: d.pending,
        inProgress: d.inProgress,
        resolved: d.resolved,
        escalated: d.escalated,
        total: d.total,
      }))
      .sort((a, b) => b.total - a.total)

    const complaintStatusPie = [
      { name: lang === 'am' ? 'በመጠባበቅ' : 'Pending', value: pending, color: BRAND.pending },
      { name: lang === 'am' ? 'በሂደት' : 'In Progress', value: inProgress, color: BRAND.inProgress },
      { name: lang === 'am' ? 'ተፈትቷል' : 'Resolved', value: resolved, color: BRAND.resolved },
      { name: lang === 'am' ? 'ወደ ላይ' : 'Escalated', value: escalated, color: BRAND.escalated },
    ].filter((d) => d.value > 0)

    const appointmentStatusPie = [
      { name: lang === 'am' ? 'በሂደት ላይ' : 'Confirmed', value: confirmed, color: BRAND.confirmed },
      { name: lang === 'am' ? 'ቀኑ ተቀይሯል' : 'Rescheduled', value: rescheduled, color: BRAND.rescheduled },
      { name: lang === 'am' ? 'ተቀባይነት አግኝቷል' : 'Completed', value: completed, color: BRAND.completed },
      { name: lang === 'am' ? 'ተቀባይነት አላገኘም' : 'Missed', value: missed, color: BRAND.missed },
    ].filter((d) => d.value > 0)

    const serviceMap = appointments.reduce((acc, a) => {
      const svc = a.service_type || 'Other'
      acc[svc] = (acc[svc] || 0) + 1
      return acc
    }, {})

    const topServices = Object.entries(serviceMap)
      .map(([name, count]) => ({ name: name.length > 28 ? `${name.slice(0, 28)}…` : name, count, fullName: name }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    const trend = buildLastNDaysTrend({ complaints, appointments }, 'created_at', 14)

    return {
      inProgress,
      pending,
      resolved,
      escalated,
      totalComplaints,
      todayApps,
      confirmed,
      completed,
      missed,
      totalAppointments,
      resolutionRate,
      completionRate,
      last7Complaints,
      departmentChart,
      complaintStatusPie,
      appointmentStatusPie,
      topServices,
      trend,
    }
  }, [complaints, appointments, lang])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-32 bg-white border-2 border-mayor-gray-divider rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  const isAm = lang === 'am'

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={BarChart3}
          label={isAm ? 'ጠቅላላ ቅሬታዎች' : 'Total Complaints'}
          value={analytics.totalComplaints}
          sub={isAm ? `7 ቀናት ውስጥ: ${analytics.last7Complaints}` : `Last 7 days: ${analytics.last7Complaints}`}
          accent="royal"
        />
        <StatCard
          icon={Clock}
          label={isAm ? 'በመጠባበቅ ላይ' : 'Pending'}
          value={analytics.pending}
          accent="amber"
        />
        <StatCard
          icon={Activity}
          label={isAm ? 'በሂደት ላይ' : 'In Progress'}
          value={analytics.inProgress}
          accent="highlight"
        />
        <StatCard
          icon={CheckCircle2}
          label={isAm ? 'ተፈትቷል' : 'Resolved'}
          value={analytics.resolved}
          sub={isAm ? `${analytics.resolutionRate}% መፍትሄ መጠን` : `${analytics.resolutionRate}% resolution rate`}
          accent="green"
        />
        <StatCard
          icon={AlertTriangle}
          label={isAm ? 'ወደ ላይ ተላልፏል' : 'Escalated'}
          value={analytics.escalated}
          accent="red"
        />
        <StatCard
          icon={Calendar}
          label={isAm ? 'ጠቅላላ ቀጠሮዎች' : 'Total Appointments'}
          value={analytics.totalAppointments}
          accent="deep"
        />
        <StatCard
          icon={Calendar}
          label={isAm ? 'የዛሬ ቀጠሮዎች' : "Today's Appointments"}
          value={analytics.todayApps}
          accent="highlight"
        />
        <StatCard
          icon={ArrowUpRight}
          label={isAm ? 'የቀጠሮ ማጠናቀቂያ' : 'Completion Rate'}
          value={`${analytics.completionRate}%`}
          sub={isAm ? `${analytics.completed} ተጠናቀቁ` : `${analytics.completed} completed`}
          accent="green"
        />
      </div>

      {/* Activity trend */}
      <ChartCard
        title={isAm ? 'የ14 ቀናት እንቅስቃሴ' : '14-Day Activity'}
        subtitle={isAm ? 'አዲስ ቅሬታዎች እና ቀጠሮዎች' : 'New complaints and appointments submitted'}
      >
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.trend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradComplaints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND.royal} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={BRAND.royal} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAppointments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND.highlight} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={BRAND.highlight} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3E3E3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: BRAND.navy, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: BRAND.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Area
                type="monotone"
                dataKey="complaints"
                name={isAm ? 'ቅሬታዎች' : 'Complaints'}
                stroke={BRAND.royal}
                strokeWidth={2}
                fill="url(#gradComplaints)"
              />
              <Area
                type="monotone"
                dataKey="appointments"
                name={isAm ? 'ቀጠሮዎች' : 'Appointments'}
                stroke={BRAND.highlight}
                strokeWidth={2}
                fill="url(#gradAppointments)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Stacked bar - complaints by department */}
        <ChartCard
          title={isAm ? 'ቅሬታዎች በየስራ ክፍሉ' : 'Complaints by Department'}
          subtitle={isAm ? 'በሁኔታ የተከፋፈለ' : 'Stacked by status'}
        >
          {analytics.departmentChart.length === 0 ? (
            <p className="text-sm text-mayor-navy/45 font-amharic text-center py-12">
              {isAm ? 'መረጃ የለም' : 'No data yet'}
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.departmentChart} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E3E3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: BRAND.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={88} tick={{ fill: BRAND.navy, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="pending" name={isAm ? 'በመጠባበቅ' : 'Pending'} stackId="a" fill={BRAND.pending} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="inProgress" name={isAm ? 'በሂደት' : 'In Progress'} stackId="a" fill={BRAND.inProgress} />
                  <Bar dataKey="resolved" name={isAm ? 'ተፈትቷል' : 'Resolved'} stackId="a" fill={BRAND.resolved} />
                  <Bar dataKey="escalated" name={isAm ? 'ወደ ላይ' : 'Escalated'} stackId="a" fill={BRAND.escalated} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        {/* Donut - complaint status */}
        <ChartCard
          title={isAm ? 'የቅሬታ ሁኔታ' : 'Complaint Status'}
          subtitle={isAm ? 'አጠቃላይ ክፍፍል' : 'Overall breakdown'}
        >
          {analytics.complaintStatusPie.length === 0 ? (
            <p className="text-sm text-mayor-navy/45 font-amharic text-center py-12">
              {isAm ? 'ቅሬታ የለም' : 'No complaints yet'}
            </p>
          ) : (
            <div className="h-72 flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={analytics.complaintStatusPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {analytics.complaintStatusPie.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex flex-wrap sm:flex-col gap-2 sm:gap-3 justify-center">
                {analytics.complaintStatusPie.map((item) => (
                  <li key={item.name} className="flex items-center gap-2 text-sm font-amharic">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-mayor-navy/70">{item.name}</span>
                    <span className="font-bold text-mayor-navy tabular-nums">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ChartCard>

        {/* Donut - appointment status */}
        <ChartCard
          title={isAm ? 'የቀጠሮ ሁኔታ' : 'Appointment Status'}
          subtitle={isAm ? 'አጠቃላይ ክፍፍል' : 'Overall breakdown'}
        >
          {analytics.appointmentStatusPie.length === 0 ? (
            <p className="text-sm text-mayor-navy/45 font-amharic text-center py-12">
              {isAm ? 'ቀጠሮ የለም' : 'No appointments yet'}
            </p>
          ) : (
            <div className="h-72 flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={analytics.appointmentStatusPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {analytics.appointmentStatusPie.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex flex-wrap sm:flex-col gap-2 sm:gap-3 justify-center">
                {analytics.appointmentStatusPie.map((item) => (
                  <li key={item.name} className="flex items-center gap-2 text-sm font-amharic">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-mayor-navy/70">{item.name}</span>
                    <span className="font-bold text-mayor-navy tabular-nums">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ChartCard>

        {/* Top services bar chart */}
        <ChartCard
          title={isAm ? 'ታዋቂ አገልግሎቶች' : 'Top Booked Services'}
          subtitle={isAm ? 'በቀጠሮ ቁጥር' : 'By appointment count'}
        >
          {analytics.topServices.length === 0 ? (
            <p className="text-sm text-mayor-navy/45 font-amharic text-center py-12">
              {isAm ? 'ቀጠሮ የለም' : 'No appointments yet'}
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topServices} margin={{ top: 8, right: 8, left: -16, bottom: 48 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E3E3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: BRAND.navy, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis allowDecimals={false} tick={{ fill: BRAND.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="bg-mayor-navy text-white text-xs rounded-xl px-3 py-2 shadow-lg font-amharic max-w-xs">
                          <p className="font-semibold">{payload[0].payload.fullName}</p>
                          <p>{payload[0].value} {isAm ? 'ቀጠሮዎች' : 'bookings'}</p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="count" name={isAm ? 'ቀጠሮዎች' : 'Bookings'} fill={BRAND.deep} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
