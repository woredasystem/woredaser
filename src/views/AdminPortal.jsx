import { useState, useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { supabase } from '../lib/supabase'
import { getDepartmentDisplayName } from '../utils/routing'
import { gregorianToEthiopian, ethiopianMonths, ethiopianMonthsEn } from '../utils/ethiopianCalendar'
import { logout } from '../utils/auth'
import { BarChart3, AlertTriangle, Users, Calendar, Edit, Download, FileText, FileSpreadsheet, TrendingUp, Search, Trash2, Building2, Settings, FolderKanban, BookOpen, BarChart2, KeyRound } from 'lucide-react'
import AppointmentReschedule from '../components/AppointmentReschedule'
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
    leadership: { title: lang === 'am' ? 'አመራሮች' : 'Leadership', subtitle: lang === 'am' ? 'በመነሻ ገጽ የሚታዩ አመራሮች' : 'Leaders shown on the public homepage' },
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
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mayor-navy/40 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={lang === 'am' ? 'ፈልግ...' : 'Search...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-gov border border-mayor-gray-divider focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue font-amharic"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-gov border border-mayor-gray-divider focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue font-amharic"
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
                    className="px-4 py-2 rounded-gov border border-mayor-gray-divider focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue font-amharic"
                  >
                    <option value="all">{lang === 'am' ? 'ሁሉም ክፍሎች' : 'All Departments'}</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{getDepartmentDisplayName(dept, lang)}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
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

              {/* Complaints Table */}
              <div className="gov-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
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
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm">{lang === 'am' ? 'ቲኬት' : 'Ticket'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm">{lang === 'am' ? 'ስም' : 'Name'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm">{lang === 'am' ? 'ስልክ' : 'Phone'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm">{lang === 'am' ? 'የስራ ክፍል' : 'Department'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm">{lang === 'am' ? 'ሁኔታ' : 'Status'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm">{lang === 'am' ? 'ደረጃ' : 'Level'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm">{lang === 'am' ? 'ቀን' : 'Date'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm">{lang === 'am' ? 'ድርጊት' : 'Action'}</th>
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
                          <td className="px-4 py-3 font-mono text-sm">{complaint.ticket_number}</td>
                          <td className="px-4 py-3 font-amharic">{complaint.complainant_name}</td>
                          <td className="px-4 py-3">{complaint.complainant_phone}</td>
                          <td className="px-4 py-3 font-amharic text-sm">
                            {getDepartmentDisplayName(complaint.assigned_department || complaint.department, lang)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-gov text-white text-xs font-amharic ${getStatusColor(complaint.status)}`}>
                              {getStatusText(complaint.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">{complaint.escalation_level || 1}</td>
                          <td className="px-4 py-3 font-amharic text-sm">{formatDate(complaint.created_at)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => generateComplaintPDF(complaint, lang)}
                              className="p-1 text-mayor-royal-blue hover:text-mayor-highlight-blue"
                              title={lang === 'am' ? 'PDF ያውርዱ' : 'Download PDF'}
                            >
                              <Download className="w-4 h-4" />
                            </button>
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
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mayor-navy/40 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={lang === 'am' ? 'ፈልግ...' : 'Search...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-gov border border-mayor-gray-divider focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue font-amharic"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-gov border border-mayor-gray-divider focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue font-amharic"
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
                    className="px-4 py-2 rounded-gov border border-mayor-gray-divider focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue font-amharic"
                  >
                    <option value="all">{lang === 'am' ? 'ሁሉም ክፍሎች' : 'All Departments'}</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{getDepartmentDisplayName(dept, lang)}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
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

              {/* Appointments Table */}
              <div className="gov-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
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
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm">{lang === 'am' ? 'ኮድ' : 'Code'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm">{lang === 'am' ? 'ስም' : 'Name'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm">{lang === 'am' ? 'ስልክ' : 'Phone'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm">{lang === 'am' ? 'የአገልግሎት አይነት' : 'Service'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm">{lang === 'am' ? 'የቀጠሮ ቀን' : 'Date'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm">{lang === 'am' ? 'የስራ ክፍል' : 'Department'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm">{lang === 'am' ? 'ሁኔታ' : 'Status'}</th>
                        <th className="px-4 py-3 text-left font-semibold font-amharic text-sm">{lang === 'am' ? 'ድርጊት' : 'Action'}</th>
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
                          <td className="px-4 py-3 font-mono text-sm">{appointment.unique_code}</td>
                          <td className="px-4 py-3 font-amharic">{appointment.citizen_name}</td>
                          <td className="px-4 py-3">{appointment.citizen_phone}</td>
                          <td className="px-4 py-3 font-amharic text-sm">{appointment.service_type}</td>
                          <td className="px-4 py-3 font-amharic text-sm">{formatDateTime(appointment.appointment_date)}</td>
                          <td className="px-4 py-3 font-amharic text-sm">
                            {getDepartmentDisplayName(appointment.assigned_department, lang)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-gov text-white text-xs font-amharic ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
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
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-gov-lg p-6 max-w-md w-full mx-4">
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
