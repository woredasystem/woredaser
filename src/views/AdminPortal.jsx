import { useState, useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { supabase } from '../lib/supabase'
import { getDepartmentDisplayName } from '../utils/routing'
import { gregorianToEthiopian, ethiopianMonths, ethiopianMonthsEn } from '../utils/ethiopianCalendar'
import { logout } from '../utils/auth'
import { BarChart3, AlertTriangle, Users, Calendar, Edit, Download, FileText, FileSpreadsheet, TrendingUp, Search, Trash2, Building2, Settings, FolderKanban, BookOpen, BarChart2, KeyRound, Eye } from 'lucide-react'
import AppointmentReschedule from '../components/AppointmentReschedule'
import ExpandableText from '../components/admin/ExpandableText'
import AdminRecordDetailModal from '../components/admin/AdminRecordDetailModal'
import { generateComplaintPDF } from '../utils/pdfGenerator'
import { exportComplaintsToPDF, exportComplaintsToCSV, exportAppointmentsToPDF, exportAppointmentsToCSV } from '../utils/exportUtils'
import AdminLeadershipPanel from '../components/AdminLeadershipPanel'
import AdminPortalUsersPanel from '../components/AdminPortalUsersPanel'
import AdminDepartmentsPanel from '../components/AdminDepartmentsPanel'
import AdminServicesPanel from '../components/AdminServicesPanel'
import AdminAppointmentSettingsPanel from '../components/AdminAppointmentSettingsPanel'
import AdminContentPanel from '../components/AdminContentPanel'
import AdminProjectsPanel from '../components/AdminProjectsPanel'
import AdminSiteStatsPanel from '../components/AdminSiteStatsPanel'
import AdminAnalyticsPanel from '../components/AdminAnalyticsPanel'
import AdminLayout from '../components/layout/AdminLayout'

export default function AdminPortal({ onBack }) {
  const { t, lang } = useLanguage()
  const [complaints, setComplaints] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [appointmentDetail, setAppointmentDetail] = useState(null)
  const [complaintDetail, setComplaintDetail] = useState(null)
  const [activeTab, setActiveTab] = useState('analytics')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [selectedComplaints, setSelectedComplaints] = useState(new Set())
  const [selectedAppointments, setSelectedAppointments] = useState(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState({ show: false, type: null, count: 0, all: false })
  
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    escalatedComplaints: 0,
    resolvedComplaints: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    missedAppointments: 0,
    confirmedAppointments: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch all complaints
      const { data: complaintsData, error: complaintsError } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false })

      if (complaintsError) throw complaintsError

      // Fetch all appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false })

      if (appointmentsError) throw appointmentsError

      setComplaints(complaintsData || [])
      setAppointments(appointmentsData || [])

      // Calculate stats
      const total = complaintsData?.length || 0
      const pending = complaintsData?.filter(c => c.status === 'Pending').length || 0
      const escalated = complaintsData?.filter(c => c.status === 'Escalated').length || 0
      const resolved = complaintsData?.filter(c => c.status === 'Resolved').length || 0
      
      const totalApps = appointmentsData?.length || 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const todayApps = appointmentsData?.filter(a => {
        const appDate = new Date(a.appointment_date)
        return appDate >= today && appDate < tomorrow
      }).length || 0
      
      const completed = appointmentsData?.filter(a => a.status === 'Completed').length || 0
      const missed = appointmentsData?.filter(a => a.status === 'Missed').length || 0
      const confirmed = appointmentsData?.filter(a => a.status === 'Confirmed').length || 0

      setStats({
        totalComplaints: total,
        pendingComplaints: pending,
        escalatedComplaints: escalated,
        resolvedComplaints: resolved,
        totalAppointments: totalApps,
        todayAppointments: todayApps,
        completedAppointments: completed,
        missedAppointments: missed,
        confirmedAppointments: confirmed
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = !searchTerm || 
      complaint.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complainant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complainant_phone?.includes(searchTerm) ||
      complaint.details?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter
    const matchesDept = departmentFilter === 'all' || 
      (complaint.assigned_department || complaint.department) === departmentFilter
    
    return matchesSearch && matchesStatus && matchesDept
  })

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = !searchTerm ||
      appointment.unique_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.citizen_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.citizen_phone?.includes(searchTerm) ||
      appointment.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    const matchesDept = departmentFilter === 'all' || appointment.assigned_department === departmentFilter
    
    return matchesSearch && matchesStatus && matchesDept
  })

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const gregorianDate = new Date(dateString)
    const ethDate = gregorianToEthiopian(gregorianDate)
    const monthName = lang === 'am' 
      ? ethiopianMonths[ethDate.month - 1]
      : ethiopianMonthsEn[ethDate.month - 1]
    return lang === 'am'
      ? `${ethDate.day} ${monthName} ${ethDate.year}`
      : `${monthName} ${ethDate.day}, ${ethDate.year}`
  }

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    const gregorianDate = new Date(dateString)
    const ethDate = gregorianToEthiopian(gregorianDate)
    const hour = gregorianDate.getUTCHours()
    const minute = gregorianDate.getUTCMinutes()
    
    let hourDisplay = hour
    let period = ''
    if (hour >= 3 && hour <= 7) {
      period = lang === 'am' ? 'ጠዋት' : 'AM'
    } else if (hour >= 8 && hour <= 11) {
      period = lang === 'am' ? 'ከሰአት' : 'PM'
    } else {
      let hour12 = hour
      if (hour === 0) {
        hour12 = 12
        period = lang === 'am' ? 'ማታ' : 'AM'
      } else if (hour < 12) {
        hour12 = hour
        period = lang === 'am' ? 'ጠዋት' : 'AM'
      } else if (hour === 12) {
        hour12 = 12
        period = lang === 'am' ? 'ከሰአት' : 'PM'
      } else {
        hour12 = hour - 12
        period = lang === 'am' ? 'ከሰአት' : 'PM'
      }
      hourDisplay = hour12
    }
    
    hourDisplay = hourDisplay.toString().padStart(2, '0')
    const minuteDisplay = minute.toString().padStart(2, '0')
    const monthName = lang === 'am' 
      ? ethiopianMonths[ethDate.month - 1]
      : ethiopianMonthsEn[ethDate.month - 1]
    
    return lang === 'am'
      ? `${ethDate.day} ${monthName} ${ethDate.year} ${hourDisplay}:${minuteDisplay} ${period}`
      : `${monthName} ${ethDate.day}, ${ethDate.year} ${hourDisplay}:${minuteDisplay} ${period}`
  }

  // Get unique departments
  const departments = [...new Set([
    ...complaints.map(c => c.assigned_department || c.department).filter(Boolean),
    ...appointments.map(a => a.assigned_department).filter(Boolean)
  ])]

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-600'
      case 'Confirmed': return 'bg-mayor-royal-blue'
      case 'Rescheduled': return 'bg-amber-500'
      case 'Missed': return 'bg-red-600'
      case 'Resolved': return 'bg-green-600'
      case 'Pending': return 'bg-yellow-500'
      case 'Escalated': return 'bg-red-600'
      case 'In Progress': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  // Get status text
  const getStatusText = (status) => {
    const statusMap = {
      'Confirmed': lang === 'am' ? 'በሂደት ላይ' : 'Confirmed',
      'Rescheduled': lang === 'am' ? 'ቀኑ ተቀይሯል' : 'Rescheduled',
      'Completed': lang === 'am' ? 'ተቀባይነት አግኝቷል' : 'Completed',
      'Missed': lang === 'am' ? 'ተቀባይነት አላገኘም' : 'Missed',
      'Pending': lang === 'am' ? 'በመጠባበቅ ላይ' : 'Pending',
      'Resolved': lang === 'am' ? 'ተፈትቷል' : 'Resolved',
      'Escalated': lang === 'am' ? 'ወደ ላይ ተላልፏል' : 'Escalated',
      'In Progress': lang === 'am' ? 'በሂደት ላይ' : 'In Progress'
    }
    return statusMap[status] || status
  }

  const getAppointmentDetailFields = (appointment) => [
    { label: lang === 'am' ? 'ኮድ' : 'Code', value: appointment.unique_code },
    { label: lang === 'am' ? 'ስም' : 'Name', value: appointment.citizen_name },
    { label: lang === 'am' ? 'ስልክ' : 'Phone', value: appointment.citizen_phone },
    { label: lang === 'am' ? 'የአገልግሎት አይነት' : 'Service', value: appointment.service_type },
    { label: lang === 'am' ? 'የቀጠሮ ቀን' : 'Appointment date', value: formatDateTime(appointment.appointment_date) },
    {
      label: lang === 'am' ? 'የስራ ክፍል' : 'Department',
      value: getDepartmentDisplayName(appointment.assigned_department, lang),
    },
    { label: lang === 'am' ? 'ሁኔታ' : 'Status', value: getStatusText(appointment.status) },
  ]

  const getComplaintDetailFields = (complaint) => {
    const fields = [
      { label: lang === 'am' ? 'ቲኬት' : 'Ticket', value: complaint.ticket_number },
      { label: lang === 'am' ? 'ስም' : 'Name', value: complaint.complainant_name },
      { label: lang === 'am' ? 'ስልክ' : 'Phone', value: complaint.complainant_phone },
      {
        label: lang === 'am' ? 'የስራ ክፍል' : 'Department',
        value: getDepartmentDisplayName(complaint.assigned_department || complaint.department, lang),
      },
      { label: lang === 'am' ? 'የቅሬታ ተቀባይ' : 'Target official', value: complaint.target_official },
      { label: lang === 'am' ? 'ሁኔታ' : 'Status', value: getStatusText(complaint.status) },
      { label: lang === 'am' ? 'ደረጃ' : 'Level', value: String(complaint.escalation_level || 1) },
      { label: lang === 'am' ? 'ቀን' : 'Date', value: formatDate(complaint.created_at) },
      { label: lang === 'am' ? 'ዝርዝር' : 'Details', value: complaint.details },
    ]
    if (complaint.resolution_note) {
      fields.push({
        label: lang === 'am' ? 'የመፍትሄ ማስታወሻ' : 'Resolution note',
        value: complaint.resolution_note,
      })
    }
    if (complaint.summary_response) {
      fields.push({
        label: lang === 'am' ? 'መልስ' : 'Response',
        value: complaint.summary_response,
      })
    }
    return fields
  }

  // Handle complaint selection
  const handleComplaintSelect = (complaintId) => {
    const newSelected = new Set(selectedComplaints)
    if (newSelected.has(complaintId)) {
      newSelected.delete(complaintId)
    } else {
      newSelected.add(complaintId)
    }
    setSelectedComplaints(newSelected)
  }

  // Handle select all complaints
  const handleSelectAllComplaints = () => {
    if (selectedComplaints.size === filteredComplaints.length) {
      setSelectedComplaints(new Set())
    } else {
      setSelectedComplaints(new Set(filteredComplaints.map(c => c.id)))
    }
  }

  // Handle appointment selection
  const handleAppointmentSelect = (appointmentId) => {
    const newSelected = new Set(selectedAppointments)
    if (newSelected.has(appointmentId)) {
      newSelected.delete(appointmentId)
    } else {
      newSelected.add(appointmentId)
    }
    setSelectedAppointments(newSelected)
  }

  // Handle select all appointments
  const handleSelectAllAppointments = () => {
    if (selectedAppointments.size === filteredAppointments.length) {
      setSelectedAppointments(new Set())
    } else {
      setSelectedAppointments(new Set(filteredAppointments.map(a => a.id)))
    }
  }

  // Delete selected complaints
  const deleteSelectedComplaints = async () => {
    if (selectedComplaints.size === 0) return
    
    try {
      const ids = Array.from(selectedComplaints)
      const { error } = await supabase
        .from('complaints')
        .delete()
        .in('id', ids)

      if (error) throw error

      setSelectedComplaints(new Set())
      fetchData()
      
      alert(lang === 'am' 
        ? `${ids.length} ቅሬታ(ዎች) በተሳካ ሁኔታ ተሰርዘዋል` 
        : `${ids.length} complaint(s) deleted successfully`)
    } catch (error) {
      console.error('Error deleting complaints:', error)
      alert(lang === 'am' ? 'ስህተት ተፈጥሯል' : 'An error occurred')
    }
  }

  // Delete all complaints
  const deleteAllComplaints = async () => {
    try {
      // Delete all filtered complaints
      const ids = filteredComplaints.map(c => c.id)
      if (ids.length === 0) return

      const { error } = await supabase
        .from('complaints')
        .delete()
        .in('id', ids)

      if (error) throw error

      setSelectedComplaints(new Set())
      fetchData()
      
      alert(lang === 'am' 
        ? `ሁሉም ${ids.length} ቅሬታዎች በተሳካ ሁኔታ ተሰርዘዋል` 
        : `All ${ids.length} complaints deleted successfully`)
    } catch (error) {
      console.error('Error deleting all complaints:', error)
      alert(lang === 'am' ? 'ስህተት ተፈጥሯል' : 'An error occurred')
    }
  }

  // Delete selected appointments
  const deleteSelectedAppointments = async () => {
    if (selectedAppointments.size === 0) return
    
    try {
      const ids = Array.from(selectedAppointments)
      const { error } = await supabase
        .from('appointments')
        .delete()
        .in('id', ids)

      if (error) throw error

      setSelectedAppointments(new Set())
      fetchData()
      
      alert(lang === 'am' 
        ? `${ids.length} ቀጠሮ(ዎች) በተሳካ ሁኔታ ተሰርዘዋል` 
        : `${ids.length} appointment(s) deleted successfully`)
    } catch (error) {
      console.error('Error deleting appointments:', error)
      alert(lang === 'am' ? 'ስህተት ተፈጥሯል' : 'An error occurred')
    }
  }

  // Delete all appointments
  const deleteAllAppointments = async () => {
    try {
      // Delete all filtered appointments
      const ids = filteredAppointments.map(a => a.id)
      if (ids.length === 0) return

      const { error } = await supabase
        .from('appointments')
        .delete()
        .in('id', ids)

      if (error) throw error

      setSelectedAppointments(new Set())
      fetchData()
      
      alert(lang === 'am' 
        ? `ሁሉም ${ids.length} ቀጠሮዎች በተሳካ ሁኔታ ተሰርዘዋል` 
        : `All ${ids.length} appointments deleted successfully`)
    } catch (error) {
      console.error('Error deleting all appointments:', error)
      alert(lang === 'am' ? 'ስህተት ተፈጥሯል' : 'An error occurred')
    }
  }

  // Show delete confirmation
  const confirmDelete = (type, all = false) => {
    const count = all 
      ? (type === 'complaints' ? filteredComplaints.length : filteredAppointments.length)
      : (type === 'complaints' ? selectedComplaints.size : selectedAppointments.size)
    
    if (count === 0) {
      alert(lang === 'am' ? 'እባክዎ ለመሰረዝ የሚፈለጉትን ይምረጡ' : 'Please select items to delete')
      return
    }

    setShowDeleteConfirm({ show: true, type, count, all })
  }

  // Execute delete after confirmation
  const executeDelete = async () => {
    const { type, all } = showDeleteConfirm
    
    if (type === 'complaints') {
      if (all) {
        await deleteAllComplaints()
      } else {
        await deleteSelectedComplaints()
      }
    } else if (type === 'appointments') {
      if (all) {
        await deleteAllAppointments()
      } else {
        await deleteSelectedAppointments()
      }
    }
    
    setShowDeleteConfirm({ show: false, type: null, count: 0, all: false })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-mayor-navy font-amharic">
          {lang === 'am' ? 'በመጫን ላይ...' : 'Loading...'}
        </p>
      </div>
    )
  }

  const navItems = [
    { id: 'analytics', label: lang === 'am' ? 'ትንተና' : 'Analytics', icon: TrendingUp },
    { id: 'complaints', label: lang === 'am' ? 'ቅሬታዎች' : 'Complaints', icon: FileText, badge: complaints.length },
    { id: 'appointments', label: lang === 'am' ? 'ቀጠሮዎች' : 'Appointments', icon: Calendar, badge: appointments.length },
    { id: 'content', label: lang === 'am' ? 'ተልዕኮ/ራዕይ' : 'Mission & Vision', icon: BookOpen },
    { id: 'siteStats', label: lang === 'am' ? 'ስታትስቲክስ' : 'Home Stats', icon: BarChart2 },
    { id: 'projects', label: lang === 'am' ? 'ፕሮጀክቶች' : 'Projects', icon: FolderKanban },
    { id: 'leadership', label: lang === 'am' ? 'አመራሮች' : 'Leadership', icon: Users },
    { id: 'portalUsers', label: lang === 'am' ? 'የፖርታል ባለሙያ' : 'Portal Officers', icon: KeyRound },
    { id: 'departments', label: lang === 'am' ? 'ክፍሎች' : 'Departments', icon: Building2 },
    { id: 'services', label: lang === 'am' ? 'አገልግሎቶች' : 'Services', icon: BarChart3 },
    { id: 'settings', label: lang === 'am' ? 'ቀጠሮ ቅንብር' : 'Booking', icon: Settings },
  ]

  const tabTitles = {
    analytics: { title: lang === 'am' ? 'ትንተና' : 'Analytics', subtitle: lang === 'am' ? 'የስርዓቱ አጠቃላይ እይታ' : 'System overview' },
    complaints: { title: lang === 'am' ? 'ቅሬታዎች' : 'Complaints', subtitle: lang === 'am' ? 'ሁሉንም ቅሬታዎች ያስተዳድሩ' : 'Manage all complaints' },
    appointments: { title: lang === 'am' ? 'ቀጠሮዎች' : 'Appointments', subtitle: lang === 'am' ? 'ሁሉንም ቀጠሮዎች ያስተዳድሩ' : 'Manage all appointments' },
    content: { title: lang === 'am' ? 'ይዘት' : 'Site Content', subtitle: lang === 'am' ? 'ተልዕኮ፣ ራዕይ እና እሴቶች' : 'Mission, vision & values' },
    siteStats: { title: lang === 'am' ? 'ስታትስቲክስ' : 'Homepage Stats', subtitle: lang === 'am' ? 'ህዝብ፣ ብሎኮች፣ አገልግሎቶች' : 'Population, blocks, services' },
    projects: { title: lang === 'am' ? 'ፕሮጀክቶች' : 'Projects', subtitle: lang === 'am' ? 'የመነሻ ገጽ ፕሮጀክቶች' : 'Homepage projects' },
    leadership: { title: lang === 'am' ? 'አመራሮች' : 'Leadership', subtitle: lang === 'am' ? 'መልእክት፣ ፎቶ እና መነሻ ገጽ' : 'Messages, photos & homepage' },
    portalUsers: { title: lang === 'am' ? 'የፖርታል ባለሙያ' : 'Portal Officers', subtitle: lang === 'am' ? 'ወደ ፓንል የሚገቡ ሰራተኞች' : 'Staff login accounts for department portals' },
    departments: { title: lang === 'am' ? 'ክፍሎች' : 'Departments', subtitle: lang === 'am' ? 'የስራ ክፍሎች' : 'Department catalog' },
    services: { title: lang === 'am' ? 'አገልግሎቶች' : 'Services', subtitle: lang === 'am' ? 'የአገልግሎት ካታሎግ' : 'Service catalog' },
    settings: { title: lang === 'am' ? 'ቀጠሮ ቅንብር' : 'Booking Settings', subtitle: lang === 'am' ? 'የቀጠሮ ሰዓት እና ቀን' : 'Appointment rules' },
  }

  const { title: pageTitle, subtitle: pageSubtitle } = tabTitles[activeTab] || tabTitles.analytics

  return (
    <AdminLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab)
        if (tab === 'complaints') setSelectedComplaints(new Set())
        if (tab === 'appointments') setSelectedAppointments(new Set())
      }}
      onBack={onBack}
      onLogout={() => { logout(); onBack() }}
    >
          {activeTab === 'leadership' && <AdminLeadershipPanel />}
          {activeTab === 'portalUsers' && <AdminPortalUsersPanel />}
          {activeTab === 'departments' && <AdminDepartmentsPanel />}
          {activeTab === 'services' && <AdminServicesPanel />}
          {activeTab === 'settings' && <AdminAppointmentSettingsPanel />}
          {activeTab === 'content' && <AdminContentPanel />}
          {activeTab === 'siteStats' && <AdminSiteStatsPanel />}
          {activeTab === 'projects' && <AdminProjectsPanel />}

          {activeTab === 'analytics' && (
            <AdminAnalyticsPanel
              complaints={complaints}
              appointments={appointments}
              loading={loading}
              lang={lang}
            />
          )}

          {/* Complaints Tab */}
          {activeTab === 'complaints' && (
            <div className="space-y-4">
              {/* Filters and Export */}
              <div className="gov-card p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex-1 relative w-full min-w-0">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mayor-navy/40 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={lang === 'am' ? 'ፈልግ...' : 'Search...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-gov border border-mayor-gray-divider focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue font-amharic"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-gov border border-mayor-gray-divider focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue font-amharic"
                  >
                    <option value="all">{lang === 'am' ? 'ሁሉም ሁኔታዎች' : 'All Statuses'}</option>
                    <option value="Pending">{lang === 'am' ? 'በመጠባበቅ ላይ' : 'Pending'}</option>
                    <option value="In Progress">{lang === 'am' ? 'በሂደት ላይ' : 'In Progress'}</option>
                    <option value="Resolved">{lang === 'am' ? 'ተፈትቷል' : 'Resolved'}</option>
                    <option value="Escalated">{lang === 'am' ? 'ወደ ላይ ተላልፏል' : 'Escalated'}</option>
                  </select>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-gov border border-mayor-gray-divider focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue font-amharic"
                  >
                    <option value="all">{lang === 'am' ? 'ሁሉም ክፍሎች' : 'All Departments'}</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{getDepartmentDisplayName(dept, lang)}</option>
                    ))}
                  </select>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full">
                    {selectedComplaints.size > 0 && (
                      <button
                        onClick={() => confirmDelete('complaints', false)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-gov flex items-center gap-2 font-amharic"
                      >
                        <Trash2 className="w-4 h-4" />
                        {lang === 'am' ? `የተመረጡትን ሰርዝ (${selectedComplaints.size})` : `Delete Selected (${selectedComplaints.size})`}
                      </button>
                    )}
                    <button
                      onClick={() => confirmDelete('complaints', true)}
                      className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-gov flex items-center gap-2 font-amharic"
                    >
                      <Trash2 className="w-4 h-4" />
                      {lang === 'am' ? 'ሁሉንም ሰርዝ' : 'Delete All'}
                    </button>
                    <button
                      onClick={() => exportComplaintsToPDF(filteredComplaints, lang)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-gov flex items-center gap-2 font-amharic"
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </button>
                    <button
                      onClick={() => exportComplaintsToCSV(filteredComplaints, lang)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-gov flex items-center gap-2 font-amharic"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Complaints — mobile cards */}
              <div className="md:hidden space-y-3">
                {filteredComplaints.length === 0 ? (
                  <div className="gov-card p-8 text-center text-mayor-navy/60 font-amharic">
                    {lang === 'am' ? 'ቅሬታ አልተገኘም' : 'No complaints found'}
                  </div>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <article
                      key={complaint.id}
                      className="gov-card p-4 border-l-4 border-l-mayor-royal-blue"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <label className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedComplaints.has(complaint.id)}
                            onChange={() => handleComplaintSelect(complaint.id)}
                            className="w-4 h-4 cursor-pointer shrink-0"
                          />
                          <span className="font-mono text-xs text-mayor-navy/70 truncate">{complaint.ticket_number}</span>
                        </label>
                        <span className={`px-2 py-1 rounded-gov text-white text-xs font-amharic shrink-0 ${getStatusColor(complaint.status)}`}>
                          {getStatusText(complaint.status)}
                        </span>
                      </div>
                      <p className="font-amharic font-semibold text-mayor-navy mb-1">{complaint.complainant_name}</p>
                      <p className="text-sm text-mayor-navy/70 mb-2">{complaint.complainant_phone}</p>
                      <p className="text-xs text-mayor-navy/55 font-amharic mb-2">
                        {getDepartmentDisplayName(complaint.assigned_department || complaint.department, lang)}
                        {' · '}
                        {formatDate(complaint.created_at)}
                      </p>
                      <ExpandableText
                        text={complaint.details}
                        lang={lang}
                        onExpand={() => setComplaintDetail(complaint)}
                        className="mb-3"
                      />
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-mayor-gray-divider">
                        <button
                          type="button"
                          onClick={() => setComplaintDetail(complaint)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-mayor-royal-blue font-amharic font-semibold hover:bg-mayor-royal-blue/5 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                          {lang === 'am' ? 'ዝርዝር' : 'Details'}
                        </button>
                        <button
                          type="button"
                          onClick={() => generateComplaintPDF(complaint, lang)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-mayor-navy font-amharic rounded-lg border border-mayor-gray-divider hover:bg-slate-50"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>

              {/* Complaints — desktop table */}
              <div className="gov-card overflow-hidden hidden md:block">
                <div className="portal-table-scroll">
                  <table className="w-full min-w-[640px] table-fixed">
                    <thead className="bg-mayor-royal-blue text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-12">
                          <input
                            type="checkbox"
                            checked={filteredComplaints.length > 0 && selectedComplaints.size === filteredComplaints.length}
                            onChange={handleSelectAllComplaints}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-28">{lang === 'am' ? 'ቲኬት' : 'Ticket'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-28">{lang === 'am' ? 'ስም' : 'Name'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-28">{lang === 'am' ? 'ስልክ' : 'Phone'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-32">{lang === 'am' ? 'የስራ ክፍል' : 'Department'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-24">{lang === 'am' ? 'ሁኔታ' : 'Status'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-14">{lang === 'am' ? 'ደረጃ' : 'Level'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-28">{lang === 'am' ? 'ቀን' : 'Date'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-40">{lang === 'am' ? 'ዝርዝር' : 'Details'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-20">{lang === 'am' ? 'ድርጊት' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComplaints.map((complaint) => (
                        <tr key={complaint.id} className="border-b border-mayor-gray-divider hover:bg-mayor-gray-divider/20">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedComplaints.has(complaint.id)}
                              onChange={() => handleComplaintSelect(complaint.id)}
                              className="w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3 font-mono text-sm truncate">{complaint.ticket_number}</td>
                          <td className="px-4 py-3 font-amharic text-sm truncate">{complaint.complainant_name}</td>
                          <td className="px-4 py-3 text-sm truncate">{complaint.complainant_phone}</td>
                          <td className="px-4 py-3 font-amharic text-sm align-top">
                            <ExpandableText
                              text={getDepartmentDisplayName(complaint.assigned_department || complaint.department, lang)}
                              lang={lang}
                              onExpand={() => setComplaintDetail(complaint)}
                              lineClamp={1}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-gov text-white text-xs font-amharic whitespace-nowrap ${getStatusColor(complaint.status)}`}>
                              {getStatusText(complaint.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm">{complaint.escalation_level || 1}</td>
                          <td className="px-4 py-3 font-amharic text-sm whitespace-nowrap">{formatDate(complaint.created_at)}</td>
                          <td className="px-4 py-3 align-top">
                            <ExpandableText
                              text={complaint.details}
                              lang={lang}
                              onExpand={() => setComplaintDetail(complaint)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setComplaintDetail(complaint)}
                                className="p-1 text-mayor-navy/50 hover:text-mayor-royal-blue"
                                title={lang === 'am' ? 'ዝርዝር' : 'View details'}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => generateComplaintPDF(complaint, lang)}
                                className="p-1 text-mayor-royal-blue hover:text-mayor-highlight-blue"
                                title={lang === 'am' ? 'PDF ያውርዱ' : 'Download PDF'}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredComplaints.length === 0 && (
                    <div className="p-8 text-center text-mayor-navy/60 font-amharic">
                      {lang === 'am' ? 'ቅሬታ አልተገኘም' : 'No complaints found'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {/* Filters and Export */}
              <div className="gov-card p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex-1 relative w-full min-w-0">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mayor-navy/40 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={lang === 'am' ? 'ፈልግ...' : 'Search...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-gov border border-mayor-gray-divider focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue font-amharic"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-gov border border-mayor-gray-divider focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue font-amharic"
                  >
                    <option value="all">{lang === 'am' ? 'ሁሉም ሁኔታዎች' : 'All Statuses'}</option>
                    <option value="Confirmed">{lang === 'am' ? 'በሂደት ላይ' : 'Confirmed'}</option>
                    <option value="Rescheduled">{lang === 'am' ? 'ቀኑ ተቀይሯል' : 'Rescheduled'}</option>
                    <option value="Completed">{lang === 'am' ? 'ተቀባይነት አግኝቷል' : 'Completed'}</option>
                    <option value="Missed">{lang === 'am' ? 'ተቀባይነት አላገኘም' : 'Missed'}</option>
                  </select>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-gov border border-mayor-gray-divider focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue font-amharic"
                  >
                    <option value="all">{lang === 'am' ? 'ሁሉም ክፍሎች' : 'All Departments'}</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{getDepartmentDisplayName(dept, lang)}</option>
                    ))}
                  </select>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full">
                    {selectedAppointments.size > 0 && (
                      <button
                        onClick={() => confirmDelete('appointments', false)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-gov flex items-center gap-2 font-amharic"
                      >
                        <Trash2 className="w-4 h-4" />
                        {lang === 'am' ? `የተመረጡትን ሰርዝ (${selectedAppointments.size})` : `Delete Selected (${selectedAppointments.size})`}
                      </button>
                    )}
                    <button
                      onClick={() => confirmDelete('appointments', true)}
                      className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-gov flex items-center gap-2 font-amharic"
                    >
                      <Trash2 className="w-4 h-4" />
                      {lang === 'am' ? 'ሁሉንም ሰርዝ' : 'Delete All'}
                    </button>
                    <button
                      onClick={() => exportAppointmentsToPDF(filteredAppointments, lang)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-gov flex items-center gap-2 font-amharic"
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </button>
                    <button
                      onClick={() => exportAppointmentsToCSV(filteredAppointments, lang)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-gov flex items-center gap-2 font-amharic"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Appointments — mobile cards */}
              <div className="md:hidden space-y-3">
                {filteredAppointments.length === 0 ? (
                  <div className="gov-card p-8 text-center text-mayor-navy/60 font-amharic">
                    {lang === 'am' ? 'ቀጠሮ አልተገኘም' : 'No appointments found'}
                  </div>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <article
                      key={appointment.id}
                      className="gov-card p-4 border-l-4 border-l-mayor-highlight-blue"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <label className="flex items-center gap-2 shrink-0">
                          <input
                            type="checkbox"
                            checked={selectedAppointments.has(appointment.id)}
                            onChange={() => handleAppointmentSelect(appointment.id)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span className="font-mono text-xs text-mayor-navy/70">{appointment.unique_code}</span>
                        </label>
                        <span className={`px-2 py-1 rounded-gov text-white text-xs font-amharic shrink-0 ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      <p className="font-amharic font-semibold text-mayor-navy mb-1">{appointment.citizen_name}</p>
                      <p className="text-sm text-mayor-navy/70 mb-2">{appointment.citizen_phone}</p>
                      <ExpandableText
                        text={appointment.service_type}
                        lang={lang}
                        onExpand={() => setAppointmentDetail(appointment)}
                        className="mb-2"
                      />
                      <p className="text-xs text-mayor-navy/60 font-amharic mb-3">
                        {formatDateTime(appointment.appointment_date)}
                        {' · '}
                        {getDepartmentDisplayName(appointment.assigned_department, lang)}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-mayor-gray-divider">
                        <button
                          type="button"
                          onClick={() => setAppointmentDetail(appointment)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-mayor-royal-blue font-amharic font-semibold hover:bg-mayor-royal-blue/5 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                          {lang === 'am' ? 'ዝርዝር' : 'Details'}
                        </button>
                        {(appointment.status === 'Confirmed' || appointment.status === 'Rescheduled') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setShowRescheduleModal(true)
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-mayor-navy font-amharic rounded-lg border border-mayor-gray-divider hover:bg-slate-50"
                          >
                            <Edit className="w-4 h-4" />
                            {lang === 'am' ? 'እንደገና ይዘጋጁ' : 'Reschedule'}
                          </button>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>

              {/* Appointments — desktop table */}
              <div className="gov-card overflow-hidden hidden md:block">
                <div className="portal-table-scroll">
                  <table className="w-full min-w-[640px] table-fixed">
                    <thead className="bg-mayor-royal-blue text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-12">
                          <input
                            type="checkbox"
                            checked={filteredAppointments.length > 0 && selectedAppointments.size === filteredAppointments.length}
                            onChange={handleSelectAllAppointments}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-24">{lang === 'am' ? 'ኮድ' : 'Code'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-28">{lang === 'am' ? 'ስም' : 'Name'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-28">{lang === 'am' ? 'ስልክ' : 'Phone'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-48">{lang === 'am' ? 'የአገልግሎት አይነት' : 'Service'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-36">{lang === 'am' ? 'የቀጠሮ ቀን' : 'Date'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-32">{lang === 'am' ? 'የስራ ክፍል' : 'Department'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-28">{lang === 'am' ? 'ሁኔታ' : 'Status'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm w-20">{lang === 'am' ? 'ድርጊት' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b border-mayor-gray-divider hover:bg-mayor-gray-divider/20">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedAppointments.has(appointment.id)}
                              onChange={() => handleAppointmentSelect(appointment.id)}
                              className="w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3 font-mono text-sm truncate">{appointment.unique_code}</td>
                          <td className="px-4 py-3 font-amharic text-sm truncate">{appointment.citizen_name}</td>
                          <td className="px-4 py-3 text-sm truncate">{appointment.citizen_phone}</td>
                          <td className="px-4 py-3 align-top">
                            <ExpandableText
                              text={appointment.service_type}
                              lang={lang}
                              onExpand={() => setAppointmentDetail(appointment)}
                            />
                          </td>
                          <td className="px-4 py-3 font-amharic text-sm whitespace-nowrap">{formatDateTime(appointment.appointment_date)}</td>
                          <td className="px-4 py-3 font-amharic text-sm align-top">
                            <ExpandableText
                              text={getDepartmentDisplayName(appointment.assigned_department, lang)}
                              lang={lang}
                              onExpand={() => setAppointmentDetail(appointment)}
                              lineClamp={1}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-gov text-white text-xs font-amharic whitespace-nowrap ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setAppointmentDetail(appointment)}
                                className="p-1 text-mayor-navy/50 hover:text-mayor-royal-blue"
                                title={lang === 'am' ? 'ዝርዝር' : 'View details'}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            {(appointment.status === 'Confirmed' || appointment.status === 'Rescheduled') && (
                              <button
                                onClick={() => {
                                  setSelectedAppointment(appointment)
                                  setShowRescheduleModal(true)
                                }}
                                className="p-1 text-mayor-royal-blue hover:text-mayor-highlight-blue"
                                title={lang === 'am' ? 'እንደገና ይዘጋጁ' : 'Reschedule'}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredAppointments.length === 0 && (
                    <div className="p-8 text-center text-mayor-navy/60 font-amharic">
                      {lang === 'am' ? 'ቀጠሮ አልተገኘም' : 'No appointments found'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {complaintDetail && (
            <AdminRecordDetailModal
              title={lang === 'am' ? 'የቅሬታ ዝርዝር' : 'Complaint details'}
              fields={getComplaintDetailFields(complaintDetail)}
              lang={lang}
              onClose={() => setComplaintDetail(null)}
            />
          )}

          {appointmentDetail && (
            <AdminRecordDetailModal
              title={lang === 'am' ? 'የቀጠሮ ዝርዝር' : 'Appointment details'}
              fields={getAppointmentDetailFields(appointmentDetail)}
              lang={lang}
              onClose={() => setAppointmentDetail(null)}
            />
          )}

          {/* Reschedule Modal */}
          {showRescheduleModal && selectedAppointment && (
            <AppointmentReschedule
              appointment={selectedAppointment}
              onClose={() => {
                setShowRescheduleModal(false)
                setSelectedAppointment(null)
              }}
              onSuccess={() => {
                fetchData()
                setShowRescheduleModal(false)
                setSelectedAppointment(null)
              }}
            />
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm.show && (
            <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
              <div className="bg-white rounded-t-2xl sm:rounded-gov-lg p-6 max-w-md w-full mx-0 sm:mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-mayor-navy mb-4 font-amharic">
                  {lang === 'am' ? 'ማረጋገጥ' : 'Confirm Delete'}
                </h3>
                <p className="text-mayor-navy mb-6 font-amharic">
                  {showDeleteConfirm.all
                    ? (lang === 'am' 
                        ? `እርግጠኛ ነዎት ሁሉንም ${showDeleteConfirm.count} ${showDeleteConfirm.type === 'complaints' ? 'ቅሬታዎች' : 'ቀጠሮዎች'} መሰረዝ ይፈልጋሉ?`
                        : `Are you sure you want to delete all ${showDeleteConfirm.count} ${showDeleteConfirm.type}?`)
                    : (lang === 'am'
                        ? `እርግጠኛ ነዎት ${showDeleteConfirm.count} ${showDeleteConfirm.type === 'complaints' ? 'ቅሬታ(ዎች)' : 'ቀጠሮ(ዎች)'} መሰረዝ ይፈልጋሉ?`
                        : `Are you sure you want to delete ${showDeleteConfirm.count} selected ${showDeleteConfirm.type}?`)}
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm({ show: false, type: null, count: 0, all: false })}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-mayor-navy rounded-gov font-amharic"
                  >
                    {lang === 'am' ? 'ተወው' : 'Cancel'}
                  </button>
                  <button
                    onClick={executeDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-gov font-amharic"
                  >
                    {lang === 'am' ? 'ሰርዝ' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
    </AdminLayout>
  )
}
