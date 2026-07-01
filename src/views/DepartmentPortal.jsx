import { useState, useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { supabase } from '../lib/supabase'
import { getDepartmentDisplayName } from '../utils/routing'
import { logout } from '../utils/auth'
import { Calendar, AlertCircle, CheckCircle, Clock, Edit, Download, LayoutDashboard } from 'lucide-react'
import { showToast } from '../components/ToastContainer'
import AdminLayout from '../components/layout/AdminLayout'
import { gregorianToEthiopian, ethiopianMonths, ethiopianMonthsEn, formatEthiopianDate } from '../utils/ethiopianCalendar'
import AppointmentReschedule from '../components/AppointmentReschedule'
import ComplaintResponseForm from '../components/ComplaintResponseForm'
import ComplaintDetailModal from '../components/ComplaintDetailModal'
import { generateComplaintPDF } from '../utils/pdfGenerator'

export default function DepartmentPortal({ department, roleKey, onBack }) {
  const { t, lang } = useLanguage()
  const [activeTab, setActiveTab] = useState('overview')
  const [complaintsSubTab, setComplaintsSubTab] = useState('pending') // 'pending' or 'responses'
  const [complaints, setComplaints] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    todayAppointments: 0,
    upcomingAppointments: 0
  })
  const [expandedComplaints, setExpandedComplaints] = useState(new Set())
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailComplaint, setDetailComplaint] = useState(null)

  useEffect(() => {
    fetchData()
  }, [department, roleKey])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch complaints assigned to this department
      const { data: complaintsData, error: complaintsError } = await supabase
        .from('complaints')
        .select('*')
        .eq('assigned_department', department)
        .order('created_at', { ascending: false })

      if (complaintsError) throw complaintsError

      // Fetch appointments assigned to this department
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('assigned_department', department)
        .order('created_at', { ascending: false })

      if (appointmentsError) throw appointmentsError

      setComplaints(complaintsData || [])
      setAppointments(appointmentsData || [])

      // Calculate stats
      const pending = complaintsData?.filter(c => c.status === 'Pending').length || 0
      const inProgress = complaintsData?.filter(c => c.status === 'In Progress').length || 0
      const resolved = complaintsData?.filter(c => c.status === 'Resolved').length || 0

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todayApps = appointmentsData?.filter(a => {
        const appDate = new Date(a.appointment_date)
        return appDate >= today && appDate < tomorrow
      }).length || 0

      const upcomingApps = appointmentsData?.filter(a => {
        const appDate = new Date(a.appointment_date)
        return appDate >= tomorrow && (a.status === 'Confirmed' || a.status === 'Rescheduled')
      }).length || 0

      setStats({
        pendingComplaints: pending,
        inProgressComplaints: inProgress,
        resolvedComplaints: resolved,
        todayAppointments: todayApps,
        upcomingAppointments: upcomingApps
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateComplaintStatus = async (complaintId, newStatus, resolutionNote = null) => {
    try {
      const updateData = { status: newStatus }
      if (resolutionNote) {
        updateData.resolution_note = resolutionNote
      }

      const { error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', complaintId)

      if (error) throw error

      showToast(
        lang === 'am' ? 'ቅሬታው በተሳካ ሁኔታ ተዘምኗል' : lang === 'om' ? 'Komiin milkaa\'inaan haaromfameera' : 'Complaint updated successfully',
        'success',
        4000
      )
      fetchData()
    } catch (error) {
      console.error('Error updating complaint:', error)
      showToast(
        lang === 'am' ? 'ስህተት ተፈጥሯል' : lang === 'om' ? 'Dogongora uumameera' : 'An error occurred',
        'error',
        5000
      )
    }
  }

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId)

      if (error) throw error

      showToast(
        lang === 'am' ? 'ቀጠሮው በተሳካ ሁኔታ ተዘምኗል' : lang === 'om' ? 'Beellamni milkaa\'inaan haaromfameera' : 'Appointment updated successfully',
        'success',
        4000
      )
      fetchData()
    } catch (error) {
      console.error('Error updating appointment:', error)
      showToast(
        lang === 'am' ? 'ስህተት ተፈጥሯል' : lang === 'om' ? 'Dogongora uumameera' : 'An error occurred',
        'error',
        5000
      )
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
      case 'Completed':
        return 'bg-green-600'
      case 'In Progress':
      case 'Confirmed':
        return 'bg-mayor-royal-blue'
      case 'Rescheduled':
        return 'bg-amber-500'
      case 'Escalated':
        return 'bg-red-600'
      case 'Missed':
        return 'bg-gray-500'
      default:
        return 'bg-yellow-500'
    }
  }

  const getStatusTranslation = (status) => {
    const statusMap = {
      'Pending': 'pending',
      'In Progress': 'inProgress',
      'Resolved': 'resolved',
      'Escalated': 'escalated',
      'Confirmed': 'confirmed',
      'Rescheduled': 'rescheduled',
      'Completed': 'completed',
      'Missed': 'missed'
    }
    return t(statusMap[status] || 'pending')
  }

  // Get status in current language for cards
  const getStatusAmharic = (status) => {
    if (lang === 'om') {
      const statusMapOm = {
        'Pending': 'Eegaa jiru',
        'In Progress': 'Adeemsa irratti',
        'Resolved': 'Furmaata argateera',
        'Escalated': 'Gara olaanaatti ergameera',
        'Confirmed': 'Mirkaneeffameera',
        'Rescheduled': 'Irra deebi\'ii qindeeffameera',
        'Completed': 'Xumurameera',
        'Missed': 'Darbameera'
      }
      return statusMapOm[status] || 'Eegaa jiru'
    } else if (lang === 'en') {
      return status || 'Pending'
    } else {
      const statusMap = {
        'Pending': 'በመጠባበቅ ላይ',
        'In Progress': 'በሂደት ላይ',
        'Resolved': 'ተፈትቷል',
        'Escalated': 'ወደ ላይ ተላልፏል',
        'Confirmed': 'በሂደት ላይ',
        'Rescheduled': 'ቀኑ ተቀይሯል',
        'Completed': 'ተቀባይነት አግኝቷል',
        'Missed': 'ተቀርቷል'
      }
      return statusMap[status] || 'በመጠባበቅ ላይ'
    }
  }

  const formatDate = (dateString) => {
    const gregorianDate = new Date(dateString)
    const ethDate = gregorianToEthiopian(gregorianDate)

    // Get hour and minute from the date
    const hour = gregorianDate.getHours()
    const minute = gregorianDate.getMinutes()

    // Convert to Ethiopian time (6 hours behind)
    let ethHour = hour - 6
    if (ethHour < 0) ethHour += 24

    // Convert to 12-hour format
    let displayHour = ethHour
    let period = ''
    if (ethHour === 0) {
      displayHour = 12
      period = lang === 'am' ? 'ጠዋት' : lang === 'om' ? 'Ganama' : 'AM'
    } else if (ethHour >= 1 && ethHour <= 5) {
      period = lang === 'am' ? 'ጠዋት' : lang === 'om' ? 'Ganama' : 'AM'
    } else if (ethHour >= 6 && ethHour <= 11) {
      period = lang === 'am' ? 'ከሰአት' : lang === 'om' ? 'Galgala' : 'AM'
    } else if (ethHour === 12) {
      period = lang === 'am' ? 'ከሰአት' : lang === 'om' ? 'Galgala' : 'PM'
    } else if (ethHour >= 13 && ethHour <= 17) {
      displayHour = ethHour - 12
      period = lang === 'am' ? 'ከሰአት' : lang === 'om' ? 'Galgala' : 'PM'
    } else {
      displayHour = ethHour - 12
      period = lang === 'am' ? 'ማታ' : lang === 'om' ? 'Halkan' : 'PM'
    }

    const hourDisplay = displayHour.toString().padStart(2, '0')
    const minuteDisplay = minute.toString().padStart(2, '0')

    // Format the date
    const monthName = lang === 'am'
      ? ethiopianMonths[ethDate.month - 1]
      : ethiopianMonthsEn[ethDate.month - 1]

    if (lang === 'am') {
      return `${ethDate.day} ${monthName} ${ethDate.year} ${hourDisplay}:${minuteDisplay} ${period}`
    } else {
      return `${monthName} ${ethDate.day}, ${ethDate.year} ${hourDisplay}:${minuteDisplay} ${period}`
    }
  }

  // Format date only (without time) - for complaint submission dates
  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A'
    const gregorianDate = new Date(dateString)
    const ethDate = gregorianToEthiopian(gregorianDate)
    const monthName = lang === 'am'
      ? ethiopianMonths[ethDate.month - 1]
      : ethiopianMonthsEn[ethDate.month - 1]

    if (lang === 'am') {
      return `${ethDate.day} ${monthName} ${ethDate.year}`
    } else {
      return `${monthName} ${ethDate.day}, ${ethDate.year}`
    }
  }

  const formatAppointmentDate = (dateString) => {
    const gregorianDate = new Date(dateString)
    const ethDate = gregorianToEthiopian(gregorianDate)

    // Get hour and minute from UTC - the appointment time is stored with Ethiopian hours directly in UTC
    // So we read it directly without any conversion
    const hour = gregorianDate.getUTCHours()
    const minute = gregorianDate.getUTCMinutes()

    // Ethiopian time format: 3-7 ጠዋት, 8-11 ከሰአት
    let hourDisplay = hour
    let period = ''
    if (hour >= 3 && hour <= 7) {
      period = lang === 'am' ? 'ጠዋት' : 'AM'
    } else if (hour >= 8 && hour <= 11) {
      period = lang === 'am' ? 'ከሰአት' : 'PM'
    } else {
      // For hours outside 3-11, convert to 12-hour format
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

    // Format the date
    const monthName = lang === 'am'
      ? ethiopianMonths[ethDate.month - 1]
      : ethiopianMonthsEn[ethDate.month - 1]

    if (lang === 'am') {
      return `${ethDate.day} ${monthName} ${ethDate.year} ${hourDisplay}:${minuteDisplay} ${period}`
    } else {
      return `${monthName} ${ethDate.day}, ${ethDate.year} ${hourDisplay}:${minuteDisplay} ${period}`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-mayor-navy font-amharic">
          {lang === 'am' ? 'በመጫን ላይ...' : lang === 'om' ? 'Fe\'aa jira...' : 'Loading...'}
        </p>
      </div>
    )
  }

  const navItems = [
    { id: 'overview', label: lang === 'am' ? 'አጠቃላይ' : lang === 'om' ? 'Waliigala' : 'Overview', icon: LayoutDashboard },
    { id: 'complaints', label: lang === 'am' ? 'ቅሬታዎች' : lang === 'om' ? 'Komiiwwan' : 'Complaints', icon: AlertCircle, badge: complaints.length },
    { id: 'appointments', label: lang === 'am' ? 'ቀጠሮዎች' : lang === 'om' ? 'Beellamoota' : 'Appointments', icon: Calendar, badge: appointments.length },
  ]

  return (
    <AdminLayout
      title={getDepartmentDisplayName(department, lang)}
      subtitle={lang === 'am' ? 'የስራ ክፍል ፓንል' : 'Department portal'}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onBack={onBack}
      onLogout={() => { logout(); onBack() }}
    >
          {/* Stats Cards - overview tab */}
          {activeTab === 'overview' && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="gov-card p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-mayor-navy/70 font-amharic">{lang === 'am' ? 'በመጠባበቅ ላይ' : lang === 'om' ? 'Eegaa jiru' : 'Pending'}</p>
                  <p className="text-2xl font-bold text-mayor-navy">{stats.pendingComplaints}</p>
                </div>
              </div>
            </div>
            <div className="gov-card p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-mayor-royal-blue" />
                <div>
                  <p className="text-sm text-mayor-navy/70 font-amharic">{lang === 'am' ? 'በሂደት ላይ' : lang === 'om' ? 'Adeemsa irratti' : 'In Progress'}</p>
                  <p className="text-2xl font-bold text-mayor-navy">{stats.inProgressComplaints}</p>
                </div>
              </div>
            </div>
            <div className="gov-card p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-mayor-navy/70 font-amharic">{lang === 'am' ? 'ተፈትቷል' : lang === 'om' ? 'Furmaata argateera' : 'Resolved'}</p>
                  <p className="text-2xl font-bold text-mayor-navy">{stats.resolvedComplaints}</p>
                </div>
              </div>
            </div>
            <div className="gov-card p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-mayor-highlight-blue" />
                <div>
                  <p className="text-sm text-mayor-navy/70 font-amharic">{lang === 'am' ? 'ዛሬ ቀጠሮ' : lang === 'om' ? 'Har\'a' : 'Today'}</p>
                  <p className="text-2xl font-bold text-mayor-navy">{stats.todayAppointments}</p>
                </div>
              </div>
            </div>
            <div className="gov-card p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-mayor-deep-blue" />
                <div>
                  <p className="text-sm text-mayor-navy/70 font-amharic">{lang === 'am' ? 'የሚመጡ' : lang === 'om' ? 'Dhufaa jiru' : 'Upcoming'}</p>
                  <p className="text-2xl font-bold text-mayor-navy">{stats.upcomingAppointments}</p>
                </div>
              </div>
            </div>
          </div>
          )}

          {activeTab === 'complaints' && (
          <>
          {/* Complaints Sub-Tabs */}
            <div className="flex gap-2 mb-6 border-b border-mayor-gray-divider">
              <button
                onClick={() => setComplaintsSubTab('pending')}
                className={`px-6 py-3 font-amharic font-semibold transition-colors ${complaintsSubTab === 'pending'
                  ? 'text-mayor-royal-blue border-b-2 border-mayor-royal-blue'
                  : 'text-mayor-navy/60 hover:text-mayor-navy'
                  }`}
              >
                {lang === 'am' ? 'ቅሬታዎች' : lang === 'om' ? 'Komiiwwan' : 'Complaints'}
              </button>
              <button
                onClick={() => setComplaintsSubTab('responses')}
                className={`px-6 py-3 font-amharic font-semibold transition-colors ${complaintsSubTab === 'responses'
                  ? 'text-mayor-royal-blue border-b-2 border-mayor-royal-blue'
                  : 'text-mayor-navy/60 hover:text-mayor-navy'
                  }`}
              >
                {lang === 'am' ? 'መልሶች' : lang === 'om' ? 'Deebii' : 'Responses'}
              </button>
            </div>

          {/* Complaints Tab */}
            <div className="space-y-4">
              {(() => {
                // Filter complaints based on sub-tab
                let filteredComplaints = complaints

                if (complaintsSubTab === 'pending') {
                  // Show only complaints without responses (no summary_response)
                  filteredComplaints = complaints.filter(c => !c.summary_response)
                } else if (complaintsSubTab === 'responses') {
                  // Show only complaints with responses (has summary_response)
                  filteredComplaints = complaints.filter(c => c.summary_response)
                }

                if (filteredComplaints.length === 0) {
                  return (
                    <div className="gov-card p-12 text-center">
                      <p className="text-mayor-navy/70 font-amharic">
                        {complaintsSubTab === 'pending'
                          ? (lang === 'am' ? 'እስካሁን ምንም ቅሬታ የለም' : lang === 'om' ? 'Hanga ammaatti komiin hin jiru' : 'No complaints yet')
                          : (lang === 'am' ? 'እስካሁን ምንም መልስ የለም' : lang === 'om' ? 'Hanga ammaatti deebiin hin jiru' : 'No responses yet')
                        }
                      </p>
                    </div>
                  )
                }

                return filteredComplaints.map((complaint) => {
                  // Generate initials for avatar
                  const initials = complaint.complainant_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)

                  return (
                    <div key={complaint.id} className="gov-card p-6 hover:shadow-gov-md transition-all border-l-4 border-l-mayor-royal-blue">
                      <div className="flex gap-4">
                        {/* Photo/Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-mayor-royal-blue to-mayor-highlight-blue flex items-center justify-center shadow-gov">
                            <span className="text-white font-bold text-lg">
                              {initials}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <span className="text-mayor-navy/60 text-sm font-amharic">
                                  የትኬት ቁጥር: <span className="font-semibold text-mayor-navy">{complaint.ticket_number}</span>
                                </span>
                                {complaint.escalation_level > 1 && (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-amharic">
                                    {lang === 'am' ? `ደረጃ ${complaint.escalation_level}` : `Level ${complaint.escalation_level}`}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-xl font-bold text-mayor-navy font-amharic mb-1">
                                {complaint.complainant_name}
                              </h3>
                              <p className="text-mayor-navy/70 text-sm font-amharic mb-2">
                                <span className="font-semibold">{lang === 'am' ? 'ስልክ:' : lang === 'om' ? 'Bilbila:' : 'Phone:'}</span> {complaint.complainant_phone}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-gov text-white text-sm whitespace-nowrap ${getStatusColor(complaint.status)}`}>
                              {getStatusAmharic(complaint.status)}
                            </span>
                          </div>
                          <p className="text-mayor-navy/80 mb-2 font-amharic text-xs md:text-sm break-words">
                            <span className="font-semibold text-mayor-royal-blue">የቅሬታ ተቀባይ አመራር:</span> {complaint.target_official}
                          </p>
                          <div className="mb-3">
                            <p className={`text-mayor-navy/90 font-amharic text-sm md:text-base break-words overflow-wrap-anywhere leading-relaxed ${!expandedComplaints.has(complaint.id) ? 'line-clamp-2' : ''}`}>
                              {complaint.details}
                            </p>
                            {complaint.details && complaint.details.length > 100 && (
                              <button
                                onClick={() => {
                                  const newExpanded = new Set(expandedComplaints)
                                  if (newExpanded.has(complaint.id)) {
                                    newExpanded.delete(complaint.id)
                                  } else {
                                    newExpanded.add(complaint.id)
                                  }
                                  setExpandedComplaints(newExpanded)
                                }}
                                className="text-mayor-royal-blue hover:text-mayor-highlight-blue font-semibold text-xs md:text-sm mt-1 font-amharic"
                              >
                                {expandedComplaints.has(complaint.id)
                                  ? t('seeLess')
                                  : t('seeMore')
                                }
                              </button>
                            )}
                          </div>
                          <p className="text-mayor-navy/60 text-xs font-amharic">
                            {complaint.complaint_submission_date ? formatDateOnly(complaint.complaint_submission_date) : formatDate(complaint.created_at)}
                          </p>
                          {complaint.resolution_note && (
                            <div className="mt-4 pt-4 border-t border-mayor-gray-divider bg-green-50 p-3 rounded-gov">
                              <p className="text-green-800 font-semibold mb-1 font-amharic text-sm">
                                {t('resolutionNote')}:
                              </p>
                              <p className="text-green-700 font-amharic text-xs md:text-sm break-words overflow-wrap-anywhere leading-relaxed">{complaint.resolution_note}</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4 pt-4 border-t border-mayor-gray-divider flex-wrap">
                            <button
                              onClick={() => {
                                setDetailComplaint(complaint)
                                setShowDetailModal(true)
                              }}
                              className="px-4 py-2 bg-mayor-royal-blue text-white rounded-gov hover:bg-mayor-highlight-blue transition-colors text-sm font-amharic"
                            >
                              {t('viewDetails')}
                            </button>
                            <button
                              onClick={() => generateComplaintPDF(complaint, lang)}
                              className="px-4 py-2 bg-mayor-deep-blue text-white rounded-gov hover:bg-mayor-navy transition-colors text-sm font-amharic flex items-center gap-2"
                              title={lang === 'am' ? 'PDF ያውርዱ' : lang === 'om' ? 'PDF Bu\'uursaa' : 'Download PDF'}
                            >
                              <Download className="w-4 h-4" />
                              {lang === 'am' ? 'PDF' : 'PDF'}
                            </button>
                            {complaintsSubTab === 'pending' && (
                              <>
                                {complaint.status === 'Pending' && (
                                  <button
                                    onClick={() => updateComplaintStatus(complaint.id, 'In Progress')}
                                    className="px-4 py-2 bg-mayor-royal-blue text-white rounded-gov hover:bg-mayor-highlight-blue transition-colors text-sm font-amharic"
                                  >
                                    {lang === 'am' ? 'ጀምር' : lang === 'om' ? 'Jalqabi' : 'Start'}
                                  </button>
                                )}
                                {complaint.status === 'In Progress' && (
                                  <button
                                    onClick={() => {
                                      setSelectedComplaint(complaint)
                                      setShowResponseForm(true)
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-gov hover:bg-green-700 transition-colors text-sm font-amharic"
                                  >
                                    {lang === 'am' ? 'መልስ ስጥ' : lang === 'om' ? 'Deebii kenni' : 'Respond'}
                                  </button>
                                )}
                              </>
                            )}
                            {complaintsSubTab === 'responses' && (
                              <button
                                onClick={() => {
                                  setSelectedComplaint(complaint)
                                  setShowResponseForm(true)
                                }}
                                className="px-4 py-2 bg-mayor-royal-blue text-white rounded-gov hover:bg-mayor-highlight-blue transition-colors text-sm font-amharic"
                              >
                                {lang === 'am' ? 'መልስ አርም' : lang === 'om' ? 'Deebii Sirreessi' : 'Edit Response'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="gov-card p-12 text-center">
                  <p className="text-mayor-navy/70 font-amharic">
                    {lang === 'am' ? 'እስካሁን ምንም ቀጠሮ የለም' : lang === 'om' ? 'Hanga ammaatti beellamni hin jiru' : 'No appointments yet'}
                  </p>
                </div>
              ) : (
                appointments.map((appointment) => {
                  // Generate initials for avatar
                  const initials = appointment.citizen_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)

                  return (
                    <div key={appointment.id} className="gov-card p-6 hover:shadow-gov-md transition-all border-l-4 border-l-mayor-highlight-blue">
                      <div className="flex gap-4">
                        {/* Photo/Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-mayor-highlight-blue to-mayor-royal-blue flex items-center justify-center shadow-gov">
                            <span className="text-white font-bold text-lg">
                              {initials}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-mayor-navy font-amharic mb-1">
                                {appointment.citizen_name}
                              </h3>
                              {appointment.citizen_phone && (
                                <p className="text-mayor-navy/70 text-sm font-amharic mb-2">
                                  <span className="font-semibold">ስልክ:</span> {appointment.citizen_phone}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {(appointment.status === 'Confirmed' || appointment.status === 'Rescheduled') && (
                                <button
                                  onClick={() => {
                                    setSelectedAppointment(appointment)
                                    setShowRescheduleModal(true)
                                  }}
                                  className="p-2 bg-mayor-royal-blue hover:bg-mayor-highlight-blue text-white rounded-gov transition-colors"
                                  title={lang === 'am' ? 'እንደገና ይዘጋጁ' : lang === 'om' ? 'Irra deebi\'ii qindeessi' : 'Reschedule'}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              <span className={`px-3 py-1 rounded-gov text-white text-sm whitespace-nowrap ${getStatusColor(appointment.status)}`}>
                                {getStatusAmharic(appointment.status)}
                              </span>
                            </div>
                          </div>
                          <p className="text-mayor-navy/80 mb-2 font-amharic">
                            <span className="font-semibold text-mayor-royal-blue">{lang === 'am' ? 'የአገልግሎት አይነት:' : lang === 'om' ? 'Gosa Tajaajilaa:' : 'Service Type:'}</span> {appointment.service_type}
                          </p>
                          <p className="text-mayor-navy/80 mb-3 font-amharic">
                            <span className="font-semibold text-mayor-royal-blue">{lang === 'am' ? 'የቀጠሮ ቀን:' : lang === 'om' ? 'Guyyaa Beellamaa:' : 'Appointment Date:'}</span> {formatAppointmentDate(appointment.appointment_date)}
                          </p>
                          {/* Action Buttons */}
                          {(appointment.status === 'Confirmed' || appointment.status === 'Rescheduled') && (
                            <div className="flex gap-2 mt-4 pt-4 border-t border-mayor-gray-divider">
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, 'Completed')}
                                className="px-4 py-2 bg-green-600 text-white rounded-gov hover:bg-green-700 transition-colors text-sm font-amharic"
                              >
                                {lang === 'am' ? 'ተቀባይነት አግኝቷል' : lang === 'om' ? 'Xumurameera' : 'Complete'}
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, 'Missed')}
                                className="px-4 py-2 bg-gray-500 text-white rounded-gov hover:bg-gray-600 transition-colors text-sm font-amharic"
                              >
                                {lang === 'am' ? 'ተቀርቷል' : lang === 'om' ? 'Darbameera' : 'Missed'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
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

          {/* Complaint Response Form */}
          {showResponseForm && selectedComplaint && (
            <ComplaintResponseForm
              complaint={selectedComplaint}
              onClose={() => {
                setShowResponseForm(false)
                setSelectedComplaint(null)
              }}
              onSuccess={(updatedComplaint) => {
                if (updatedComplaint) {
                  setComplaints((prev) =>
                    prev.map((c) => (c.id === updatedComplaint.id ? { ...c, ...updatedComplaint } : c))
                  )
                }
                setComplaintsSubTab('responses')
                fetchData()
                setShowResponseForm(false)
                setSelectedComplaint(null)
              }}
            />
          )}

          {/* Complaint Detail Modal */}
          {showDetailModal && detailComplaint && (
            <ComplaintDetailModal
              complaint={detailComplaint}
              onClose={() => {
                setShowDetailModal(false)
                setDetailComplaint(null)
              }}
            />
          )}
    </AdminLayout>
  )
}

