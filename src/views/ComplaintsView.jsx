import { useState, useEffect } from 'react'
import { FilePlus, Search, Download } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { supabase } from '../lib/supabase'
import ComplaintForm from '../components/ComplaintForm'
import ComplaintDetailModal from '../components/ComplaintDetailModal'
import PublicPageLayout from '../components/layout/PublicPageLayout'
import CitizenPortalFrame from '../components/citizen/CitizenPortalFrame'
import UniqueCodeSearch from '../components/citizen/UniqueCodeSearch'
import { showToast } from '../components/ToastContainer'
import { gregorianToEthiopian, ethiopianMonths, ethiopianMonthsEn } from '../utils/ethiopianCalendar'
import { getDepartmentDisplayName } from '../utils/routing'
import { generateComplaintPDF } from '../utils/pdfGenerator'

function ComplaintResultCard({
  complaint,
  lang,
  t,
  expanded,
  onToggleExpand,
  onViewDetails,
  onDownload,
  getStatusColor,
  getStatusAmharic,
  formatDateOnly,
  formatDate,
}) {
  return (
    <div className="bg-white border-2 border-mayor-gray-divider rounded-2xl overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 bg-slate-50/80 border-b border-mayor-navy/8">
        <div>
          <p className="text-xs text-mayor-navy/45 font-amharic uppercase tracking-wide">
            {lang === 'am' ? 'የትኬት ቁጥር' : 'Ticket'}
          </p>
          <p className="font-mono font-bold text-mayor-navy">{complaint.ticket_number}</p>
        </div>
        <span className={`inline-flex self-start px-3 py-1 rounded-full text-white text-xs font-semibold font-amharic ${getStatusColor(complaint.status)}`}>
          {getStatusAmharic(complaint.status)}
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-mayor-navy font-amharic">{complaint.complainant_name}</h3>
          <p className="text-sm text-mayor-navy/55 font-amharic mt-1">
            {t('phone')}: {complaint.complainant_phone}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-mayor-royal-blue/5 px-4 py-3">
            <p className="text-xs text-mayor-navy/45 font-amharic mb-1">{t('complaintRecipient')}</p>
            <p className="font-semibold text-mayor-navy font-amharic">{complaint.target_official}</p>
          </div>
          <div className="rounded-xl bg-mayor-royal-blue/5 px-4 py-3">
            <p className="text-xs text-mayor-navy/45 font-amharic mb-1">{t('department')}</p>
            <p className="font-semibold text-mayor-navy font-amharic">
              {complaint.assigned_department ? getDepartmentDisplayName(complaint.assigned_department, lang) : 'N/A'}
            </p>
          </div>
        </div>

        <div>
          <p className={`text-mayor-navy/80 font-amharic text-sm leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>
            {complaint.details}
          </p>
          {complaint.details && complaint.details.length > 150 && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="text-mayor-royal-blue hover:text-mayor-deep-blue font-semibold text-sm mt-2 font-amharic"
            >
              {expanded ? t('seeLess') : t('seeMore')}
            </button>
          )}
        </div>

        <p className="text-xs text-mayor-navy/45 font-amharic">
          {t('submittedDate')}: {complaint.complaint_submission_date ? formatDateOnly(complaint.complaint_submission_date) : formatDate(complaint.created_at)}
        </p>

        {complaint.resolution_note && (
          <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
            <p className="text-green-800 font-semibold mb-2 font-amharic text-sm">{t('resolutionNote')}</p>
            <p className="text-green-700 font-amharic text-sm leading-relaxed">{complaint.resolution_note}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onViewDetails}
            className="flex-1 px-4 py-2.5 bg-mayor-navy hover:bg-mayor-deep-blue text-white rounded-xl text-sm font-amharic transition-colors"
          >
            {t('viewDetails')}
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-mayor-gray-divider text-mayor-navy rounded-xl hover:bg-slate-50 text-sm font-amharic transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ComplaintsView({ onBack }) {
  const { t, lang } = useLanguage()
  const [mode, setMode] = useState('file')
  const [uniqueCode, setUniqueCode] = useState('')
  const [complaint, setComplaint] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [expandedComplaints, setExpandedComplaints] = useState(new Set())
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailComplaint, setDetailComplaint] = useState(null)

  const steps = [
    {
      title: lang === 'am' ? 'ቅሬታ ያስገቡ' : 'Submit your complaint',
      description: lang === 'am' ? 'የግል መረጃዎን እና የቅሬታ ጭብጥ ይሙሉ' : 'Fill in your details and describe the issue',
    },
    {
      title: lang === 'am' ? 'ኮድ ያስቀምጡ' : 'Save your code',
      description: lang === 'am' ? 'ከተላከ በኋላ የልዩ ኮድ ይቀበሉ' : 'Receive a unique tracking code after submission',
    },
    {
      title: lang === 'am' ? 'ሁኔታ ይከታተሉ' : 'Track progress',
      description: lang === 'am' ? 'በኮድ መሰረት ሁኔታውን ይመልከቱ' : 'Check status anytime using your code',
    },
  ]

  const lookupComplaint = async (code) => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      setComplaint(null)
      return
    }

    setSearchLoading(true)
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('unique_code', trimmed)
        .single()

      if (error) {
        if (error.code === 'PGRST116') setComplaint(null)
        else throw error
      } else {
        setComplaint(data)
      }
    } catch (error) {
      console.error('Error searching complaint:', error)
      showToast(t('errorOccurred'), 'error', 5000)
      setComplaint(null)
    } finally {
      setSearchLoading(false)
    }
  }

  const searchByUniqueCode = async (e) => {
    e.preventDefault()
    await lookupComplaint(uniqueCode)
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (code) {
      setMode('track')
      setUniqueCode(code.toUpperCase())
      lookupComplaint(code)
    }
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-green-600'
      case 'In Progress': return 'bg-mayor-royal-blue'
      case 'Escalated': return 'bg-red-600'
      default: return 'bg-yellow-500'
    }
  }

  const getStatusAmharic = (status) => {
    const statusMap = {
      Pending: 'በመጠባበቅ ላይ',
      'In Progress': 'በሂደት ላይ',
      Resolved: 'ተፈትቷል',
      Escalated: 'ወደ ላይ ተላልፏል',
    }
    return statusMap[status] || 'በመጠባበቅ ላይ'
  }

  const formatDate = (dateString) => {
    const gregorianDate = new Date(dateString)
    const ethDate = gregorianToEthiopian(gregorianDate)
    const hour = gregorianDate.getHours()
    const minute = gregorianDate.getMinutes()
    let ethHour = hour - 6
    if (ethHour < 0) ethHour += 24
    let displayHour = ethHour
    let period = ''
    if (ethHour === 0) {
      displayHour = 12
      period = lang === 'am' ? 'ጠዋት' : 'AM'
    } else if (ethHour >= 1 && ethHour <= 5) {
      period = lang === 'am' ? 'ጠዋት' : 'AM'
    } else if (ethHour >= 6 && ethHour <= 11) {
      period = lang === 'am' ? 'ከሰአት' : 'AM'
    } else if (ethHour === 12) {
      period = lang === 'am' ? 'ከሰአት' : 'PM'
    } else if (ethHour >= 13 && ethHour <= 17) {
      displayHour = ethHour - 12
      period = lang === 'am' ? 'ከሰአት' : 'PM'
    } else {
      displayHour = ethHour - 12
      period = lang === 'am' ? 'ማታ' : 'PM'
    }
    const monthName = lang === 'am' ? ethiopianMonths[ethDate.month - 1] : ethiopianMonthsEn[ethDate.month - 1]
    const hourDisplay = displayHour.toString().padStart(2, '0')
    const minuteDisplay = minute.toString().padStart(2, '0')
    if (lang === 'am') {
      return `${ethDate.day} ${monthName} ${ethDate.year} ${hourDisplay}:${minuteDisplay} ${period}`
    }
    return `${monthName} ${ethDate.day}, ${ethDate.year} ${hourDisplay}:${minuteDisplay} ${period}`
  }

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A'
    const gregorianDate = new Date(dateString)
    const ethDate = gregorianToEthiopian(gregorianDate)
    const monthName = lang === 'am' ? ethiopianMonths[ethDate.month - 1] : ethiopianMonthsEn[ethDate.month - 1]
    if (lang === 'am') return `${ethDate.day} ${monthName} ${ethDate.year}`
    return `${monthName} ${ethDate.day}, ${ethDate.year}`
  }

  const handleModeChange = (next) => {
    setMode(next)
    if (next === 'file') {
      setComplaint(null)
      setUniqueCode('')
    }
  }

  return (
    <PublicPageLayout
      title={t('complaints')}
      subtitle={
        lang === 'am'
          ? 'ቅሬታ ያስገቡ ወይም ሁኔታ ይከታተሉ'
          : 'File a complaint or track your case status'
      }
      onBack={onBack}
      maxWidth="max-w-5xl"
    >
      <CitizenPortalFrame
        mode={mode}
        onModeChange={handleModeChange}
        accentClass="bg-mayor-royal-blue"
        fileOption={{ label: t('fileComplaint'), icon: FilePlus }}
        trackOption={{ label: t('followUpComplaint'), icon: Search }}
        steps={steps}
      >
        {mode === 'file' ? (
          <ComplaintForm
            embedded
            onClose={() => setMode('track')}
            onSuccess={async (code) => {
              setMode('track')
              if (code) {
                setUniqueCode(code)
                await lookupComplaint(code)
              }
            }}
          />
        ) : (
          <UniqueCodeSearch
            value={uniqueCode}
            onChange={setUniqueCode}
            onSubmit={searchByUniqueCode}
            loading={searchLoading}
            prompt={t('enterUniqueCodePrompt')}
            notFound={t('complaintNotFound')}
            showNotFound={!searchLoading && !complaint && uniqueCode.trim().length > 0}
          >
            {complaint && (
              <ComplaintResultCard
                complaint={complaint}
                lang={lang}
                t={t}
                expanded={expandedComplaints.has(complaint.id)}
                onToggleExpand={() => {
                  const next = new Set(expandedComplaints)
                  if (next.has(complaint.id)) next.delete(complaint.id)
                  else next.add(complaint.id)
                  setExpandedComplaints(next)
                }}
                onViewDetails={() => {
                  setDetailComplaint(complaint)
                  setShowDetailModal(true)
                }}
                onDownload={() => generateComplaintPDF(complaint, lang)}
                getStatusColor={getStatusColor}
                getStatusAmharic={getStatusAmharic}
                formatDateOnly={formatDateOnly}
                formatDate={formatDate}
              />
            )}
          </UniqueCodeSearch>
        )}
      </CitizenPortalFrame>

      {showDetailModal && detailComplaint && (
        <ComplaintDetailModal
          complaint={detailComplaint}
          onClose={() => {
            setShowDetailModal(false)
            setDetailComplaint(null)
          }}
        />
      )}
    </PublicPageLayout>
  )
}
