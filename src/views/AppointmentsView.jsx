import { useState, useEffect } from 'react'
import { CalendarPlus, Search, Calendar, Clock, Building2 } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { supabase } from '../lib/supabase'
import AppointmentForm from '../components/AppointmentForm'
import PublicPageLayout from '../components/layout/PublicPageLayout'
import CitizenPortalFrame from '../components/citizen/CitizenPortalFrame'
import UniqueCodeSearch from '../components/citizen/UniqueCodeSearch'
import { showToast } from '../components/ToastContainer'
import { gregorianToEthiopian, ethiopianMonths, ethiopianMonthsEn } from '../utils/ethiopianCalendar'
import { getDepartmentDisplayName } from '../utils/routing'

function AppointmentResultCard({ appointment, lang, t, formatDate, getStatusColor, getStatusAmharic }) {
  return (
    <div className="bg-white border-2 border-mayor-gray-divider rounded-2xl overflow-hidden">
      <div className="h-1.5 bg-mayor-deep-blue" />

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 px-5 sm:px-6 py-5 border-b border-mayor-navy/8">
        <div>
          <p className="text-xs text-mayor-navy/45 font-amharic uppercase tracking-wide mb-1">{t('uniqueCode')}</p>
          <p className="font-mono text-lg font-bold text-mayor-navy tracking-wider">{appointment.unique_code}</p>
        </div>
        <span className={`inline-flex self-start px-3 py-1 rounded-full text-white text-xs font-semibold font-amharic ${getStatusColor(appointment.status)}`}>
          {getStatusAmharic(appointment.status)}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="text-xl font-bold text-mayor-navy font-amharic mb-1">{appointment.citizen_name}</h3>
        <p className="text-sm text-mayor-navy/55 font-amharic mb-5">
          {t('phone')}: {appointment.citizen_phone}
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex gap-3 rounded-xl border-2 border-mayor-gray-divider p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mayor-deep-blue/10">
              <Calendar className="w-5 h-5 text-mayor-deep-blue" />
            </div>
            <div>
              <p className="text-xs text-mayor-navy/45 font-amharic">{t('appointmentDate')}</p>
              <p className="text-sm font-semibold text-mayor-navy font-amharic mt-0.5">{formatDate(appointment.appointment_date)}</p>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border-2 border-mayor-gray-divider p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mayor-royal-blue/10">
              <Clock className="w-5 h-5 text-mayor-royal-blue" />
            </div>
            <div>
              <p className="text-xs text-mayor-navy/45 font-amharic">{t('serviceType')}</p>
              <p className="text-sm font-semibold text-mayor-navy font-amharic mt-0.5 line-clamp-2">{appointment.service_type}</p>
            </div>
          </div>

          {appointment.assigned_department && (
            <div className="flex gap-3 rounded-xl border-2 border-mayor-gray-divider p-4 sm:col-span-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mayor-navy/10">
                <Building2 className="w-5 h-5 text-mayor-navy" />
              </div>
              <div>
                <p className="text-xs text-mayor-navy/45 font-amharic">{t('department')}</p>
                <p className="text-sm font-semibold text-mayor-navy font-amharic mt-0.5">
                  {getDepartmentDisplayName(appointment.assigned_department, lang)}
                </p>
              </div>
            </div>
          )}
        </div>

        {appointment.rescheduled_at && (
          <div className="mt-4 rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
            <p className="font-semibold text-amber-900 font-amharic text-sm mb-2">
              {lang === 'am' ? 'ቀጠሮው ቀኑ ተቀይሯል' : 'Appointment Rescheduled'}
            </p>
            {appointment.original_appointment_date && (
              <p className="text-amber-800 text-sm font-amharic">
                <span className="font-medium">{lang === 'am' ? 'ከ' : 'From'}:</span>{' '}
                {formatDate(appointment.original_appointment_date)}
              </p>
            )}
            <p className="text-amber-800 text-sm font-amharic">
              <span className="font-medium">{lang === 'am' ? 'ወደ' : 'To'}:</span>{' '}
              {formatDate(appointment.appointment_date)}
            </p>
            {appointment.reschedule_note && (
              <p className="text-amber-700 text-sm font-amharic mt-2 pt-2 border-t border-amber-200">
                {appointment.reschedule_note}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AppointmentsView({ onBack }) {
  const { t, lang } = useLanguage()
  const [mode, setMode] = useState('file')
  const [uniqueCode, setUniqueCode] = useState('')
  const [appointment, setAppointment] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)

  const steps = [
    {
      title: lang === 'am' ? 'ቀጠሮ ይዘዙ' : 'Book a slot',
      description: lang === 'am' ? 'አገልግሎት፣ ቀን እና ሰዓት ይምረጡ' : 'Choose service, date and time',
    },
    {
      title: lang === 'am' ? 'ኮድ ያስቀምጡ' : 'Save your code',
      description: lang === 'am' ? 'የመከታተያ ኮድዎን በደህንነት ያስቀምጡ' : 'Keep your tracking code safe',
    },
    {
      title: lang === 'am' ? 'ቀጠሮ ይከታተሉ' : 'Check booking',
      description: lang === 'am' ? 'በኮድ ሁኔታውን ይመልከቱ' : 'View status anytime with your code',
    },
  ]

  const lookupAppointment = async (code) => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      setAppointment(null)
      return
    }

    setSearchLoading(true)
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('unique_code', trimmed)
        .single()

      if (error) {
        if (error.code === 'PGRST116') setAppointment(null)
        else throw error
      } else {
        setAppointment(data)
      }
    } catch (error) {
      console.error('Error searching appointment:', error)
      showToast(t('errorOccurred'), 'error', 5000)
      setAppointment(null)
    } finally {
      setSearchLoading(false)
    }
  }

  const searchByUniqueCode = async (e) => {
    e.preventDefault()
    await lookupAppointment(uniqueCode)
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (code) {
      setMode('track')
      setUniqueCode(code.toUpperCase())
      lookupAppointment(code)
    }
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-600'
      case 'Confirmed': return 'bg-mayor-royal-blue'
      case 'Rescheduled': return 'bg-amber-500'
      case 'Missed': return 'bg-red-600'
      default: return 'bg-yellow-500'
    }
  }

  const getStatusAmharic = (status) => {
    const statusMap = {
      Confirmed: 'በሂደት ላይ',
      Rescheduled: 'ቀኑ ተቀይሯል',
      Completed: 'ተቀባይነት አግኝቷል',
      Missed: 'ተቀባይነት አላገኘም',
    }
    return statusMap[status] || 'በሂደት ላይ'
  }

  const formatDate = (dateString) => {
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
    const monthName = lang === 'am' ? ethiopianMonths[ethDate.month - 1] : ethiopianMonthsEn[ethDate.month - 1]
    if (lang === 'am') {
      return `${ethDate.day} ${monthName} ${ethDate.year} ${hourDisplay}:${minuteDisplay} ${period}`
    }
    return `${monthName} ${ethDate.day}, ${ethDate.year} ${hourDisplay}:${minuteDisplay} ${period}`
  }

  const handleModeChange = (next) => {
    setMode(next)
    if (next === 'file') {
      setAppointment(null)
      setUniqueCode('')
    }
  }

  return (
    <PublicPageLayout
      title={t('appointments')}
      subtitle={
        lang === 'am'
          ? 'ቀጠሮ ያስይዙ ወይም የቀጠሮዎን ሁኔታ ይከታተሉ'
          : 'Book an appointment or track your booking'
      }
      onBack={onBack}
      maxWidth="max-w-5xl"
    >
      <CitizenPortalFrame
        mode={mode}
        onModeChange={handleModeChange}
        accentClass="bg-mayor-deep-blue"
        fileOption={{ label: t('bookAppointment'), icon: CalendarPlus }}
        trackOption={{ label: t('followUpAppointment'), icon: Search }}
        steps={steps}
      >
        {mode === 'file' ? (
          <AppointmentForm
            embedded
            onClose={() => setMode('track')}
            onSuccess={async (code) => {
              setMode('track')
              if (code) {
                setUniqueCode(code)
                await lookupAppointment(code)
              }
            }}
          />
        ) : (
          <UniqueCodeSearch
            value={uniqueCode}
            onChange={setUniqueCode}
            onSubmit={searchByUniqueCode}
            loading={searchLoading}
            prompt={t('enterUniqueCodePromptAppointment')}
            notFound={t('appointmentNotFound')}
            showNotFound={!searchLoading && !appointment && uniqueCode.trim().length > 0}
          >
            {appointment && (
              <AppointmentResultCard
                appointment={appointment}
                lang={lang}
                t={t}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
                getStatusAmharic={getStatusAmharic}
              />
            )}
          </UniqueCodeSearch>
        )}
      </CitizenPortalFrame>
    </PublicPageLayout>
  )
}
