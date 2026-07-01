import { useState, useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { supabase } from '../lib/supabase'
import { X } from 'lucide-react'
import { showToast } from './ToastContainer'
import { 
  ethiopianMonths, 
  ethiopianMonthsEn, 
  getCurrentEthiopianDate, 
  ethiopianToGregorian,
  gregorianToEthiopian,
  getDaysInEthiopianMonth 
} from '../utils/ethiopianCalendar'

export default function AppointmentReschedule({ appointment, onClose, onSuccess }) {
  const { t, lang } = useLanguage()
  const currentEthDate = getCurrentEthiopianDate()
  
  // Initialize state from appointment if available
  const getInitialState = () => {
    if (appointment) {
      const appointmentDate = new Date(appointment.appointment_date)
      const ethDate = gregorianToEthiopian(appointmentDate)
      return {
        ethiopianDate: {
          year: ethDate.year,
          month: ethDate.month,
          day: ethDate.day
        },
        appointmentTime: {
          hour: appointmentDate.getUTCHours().toString().padStart(2, '0'),
          minute: appointmentDate.getUTCMinutes().toString().padStart(2, '0')
        }
      }
    }
    return {
      ethiopianDate: currentEthDate,
      appointmentTime: {
        hour: '03',
        minute: '00'
      }
    }
  }

  const initialState = getInitialState()
  const [ethiopianDate, setEthiopianDate] = useState(initialState.ethiopianDate)
  const [appointmentTime, setAppointmentTime] = useState(initialState.appointmentTime)
  const [rescheduleNote, setRescheduleNote] = useState('')
  const [loading, setLoading] = useState(false)

  // Get available days for selected month
  const maxDays = getDaysInEthiopianMonth(ethiopianDate.month, ethiopianDate.year)
  const daysArray = Array.from({ length: maxDays }, (_, i) => i + 1)

  // Generate hours (3-11) - Ethiopian time format
  const hoursArray = Array.from({ length: 9 }, (_, i) => {
    const hour = i + 3
    return hour.toString().padStart(2, '0')
  })
  const minutesArray = ['00', '15', '30', '45']

  // Convert Ethiopian date and time to Gregorian datetime for database
  const convertToGregorianDateTime = () => {
    const gregorianDate = ethiopianToGregorian(
      ethiopianDate.year,
      ethiopianDate.month,
      ethiopianDate.day
    )
    
    // Get the date components to preserve the exact date
    const year = gregorianDate.getFullYear()
    const month = gregorianDate.getMonth() // 0-11 for Date constructor
    const day = gregorianDate.getDate()
    const hour = parseInt(appointmentTime.hour)
    const minute = parseInt(appointmentTime.minute)
    
    // Store the time as UTC, treating the selected hour as UTC
    // When we read it back with getUTCHours(), we'll get the same hour
    // This avoids timezone conversion issues
    const utcDate = new Date(Date.UTC(year, month, day, hour, minute, 0, 0))
    
    return utcDate.toISOString()
  }

  // Update day when month changes
  useEffect(() => {
    const maxDays = getDaysInEthiopianMonth(ethiopianDate.month, ethiopianDate.year)
    if (ethiopianDate.day > maxDays) {
      setEthiopianDate({ ...ethiopianDate, day: maxDays })
    }
  }, [ethiopianDate.month, ethiopianDate.year])

  if (!appointment) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="gov-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="gov-header rounded-t-gov-xl p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold font-amharic">
            {lang === 'am' ? 'ቀጠሮ እንደገና ይዘጋጁ' : 'Reschedule Appointment'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-white/70">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4 bg-white">
          {/* Current Appointment Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-gov p-4 mb-4">
            <p className="text-sm font-semibold text-yellow-800 font-amharic mb-2">
              {lang === 'am' ? 'የአሁኑ ቀጠሮ:' : 'Current Appointment:'}
            </p>
            <p className="text-yellow-900 font-amharic">
              {appointment.citizen_name} - {appointment.service_type}
            </p>
            <p className="text-yellow-900 font-amharic text-sm mt-1">
              {(() => {
                const appointmentDate = new Date(appointment.appointment_date)
                const ethDate = gregorianToEthiopian(appointmentDate)
                const hour = appointmentDate.getUTCHours()
                const minute = appointmentDate.getUTCMinutes()
                
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
                
                const monthName = lang === 'am' 
                  ? ethiopianMonths[ethDate.month - 1]
                  : ethiopianMonthsEn[ethDate.month - 1]
                
                if (lang === 'am') {
                  return `${lang === 'am' ? 'ቀን:' : 'Date:'} ${ethDate.day} ${monthName} ${ethDate.year} ${hourDisplay.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`
                } else {
                  return `${lang === 'am' ? 'ቀን:' : 'Date:'} ${monthName} ${ethDate.day}, ${ethDate.year} ${hourDisplay.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`
                }
              })()}
            </p>
          </div>

          {/* New Date Selection */}
          <div>
            <label className="block text-mayor-navy mb-3 font-amharic font-semibold">
              {lang === 'am' ? 'አዲስ የቀጠሮ ቀን' : 'New Appointment Date'} * ({lang === 'am' ? 'የኢትዮጵያ ዘመን' : 'Ethiopian Calendar'})
            </label>
            
            {/* Ethiopian Date Selection */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* Day */}
              <div>
                <label className="block text-sm text-mayor-navy/70 mb-1 font-amharic">
                  {lang === 'am' ? 'ቀን' : 'Day'}
                </label>
                <select
                  required
                  value={ethiopianDate.day}
                  onChange={(e) => setEthiopianDate({ ...ethiopianDate, day: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                >
                  {daysArray.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div>
                <label className="block text-sm text-mayor-navy/70 mb-1 font-amharic">
                  {lang === 'am' ? 'ወር' : 'Month'}
                </label>
                <select
                  required
                  value={ethiopianDate.month}
                  onChange={(e) => setEthiopianDate({ ...ethiopianDate, month: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                >
                  {(lang === 'am' ? ethiopianMonths : ethiopianMonthsEn).map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm text-mayor-navy/70 mb-1 font-amharic">
                  {lang === 'am' ? 'ዓመት' : 'Year'}
                </label>
                <input
                  type="number"
                  required
                  min={currentEthDate.year}
                  max={currentEthDate.year + 2}
                  value={ethiopianDate.year}
                  onChange={(e) => setEthiopianDate({ ...ethiopianDate, year: parseInt(e.target.value) || currentEthDate.year })}
                  className="w-full px-3 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                />
              </div>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-3">
              {/* Hour */}
              <div>
                <label className="block text-sm text-mayor-navy/70 mb-1 font-amharic">
                  {lang === 'am' ? 'ሰዓት' : 'Hour'}
                </label>
                <select
                  required
                  value={appointmentTime.hour}
                  onChange={(e) => setAppointmentTime({ ...appointmentTime, hour: e.target.value })}
                  className="w-full px-3 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                >
                  {hoursArray.map((hour) => {
                    const hourNum = parseInt(hour)
                    // Ethiopian time format: 3-7 ጠዋት, 8-11 ከሰአት
                    let period = ''
                    if (hourNum >= 3 && hourNum <= 7) {
                      period = lang === 'am' ? 'ጠዋት' : 'AM'
                    } else if (hourNum >= 8 && hourNum <= 11) {
                      period = lang === 'am' ? 'ከሰአት' : 'PM'
                    } else {
                      // For hours outside 3-11, use standard 12-hour format
                      let hour12 = hourNum
                      if (hourNum === 0) {
                        hour12 = 12
                        period = lang === 'am' ? 'ማታ' : 'AM'
                      } else if (hourNum < 12) {
                        hour12 = hourNum
                        period = lang === 'am' ? 'ጠዋት' : 'AM'
                      } else if (hourNum === 12) {
                        hour12 = 12
                        period = lang === 'am' ? 'ከሰአት' : 'PM'
                      } else {
                        hour12 = hourNum - 12
                        period = lang === 'am' ? 'ከሰአት' : 'PM'
                      }
                      return (
                        <option key={hour} value={hour}>
                          {hour12} {period}
                        </option>
                      )
                    }
                    return (
                      <option key={hour} value={hour}>
                        {hourNum} {period}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Minute */}
              <div>
                <label className="block text-sm text-mayor-navy/70 mb-1 font-amharic">
                  {lang === 'am' ? 'ደቂቃ' : 'Minute'}
                </label>
                <select
                  required
                  value={appointmentTime.minute}
                  onChange={(e) => setAppointmentTime({ ...appointmentTime, minute: e.target.value })}
                  className="w-full px-3 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                >
                  {minutesArray.map((minute) => (
                    <option key={minute} value={minute}>{minute}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reschedule Note */}
          <div>
            <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
              {lang === 'am' ? 'የመለወጥ ምክንያት/ማስታወሻ' : 'Reschedule Reason/Note'} *
            </label>
            <textarea
              required
              value={rescheduleNote}
              onChange={(e) => setRescheduleNote(e.target.value)}
              rows={3}
              placeholder={lang === 'am' ? 'ቀጠሮውን ለምን እንደገና እያዘጋጁ እንደሆነ ያብራሩ...' : 'Explain why you are rescheduling...'}
              className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue font-amharic"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={async () => {
                setLoading(true)
                try {
                  const newDate = convertToGregorianDateTime()
                  
                  // Get current update history
                  const currentHistory = appointment.update_history || []
                  
                  // Add new update entry
                  const newUpdate = {
                    type: 'reschedule',
                    old_date: appointment.appointment_date,
                    new_date: newDate,
                    note: rescheduleNote,
                    updated_at: new Date().toISOString(),
                    updated_by: 'Admin'
                  }
                  
                  const { error } = await supabase
                    .from('appointments')
                    .update({
                      appointment_date: newDate,
                      status: 'Rescheduled',
                      original_appointment_date: appointment.original_appointment_date || appointment.appointment_date,
                      reschedule_note: rescheduleNote,
                      rescheduled_at: new Date().toISOString(),
                      rescheduled_by: 'Admin',
                      update_history: [...currentHistory, newUpdate]
                    })
                    .eq('id', appointment.id)

                  if (error) throw error

                  showToast(
                    lang === 'am' ? 'ቀጠሮው በተሳካ ሁኔታ ቀኑ ተቀይሯል!' : 'Appointment rescheduled successfully!',
                    'success',
                    6000
                  )

                  onSuccess?.()
                  onClose()
                } catch (error) {
                  console.error('Error rescheduling appointment:', error)
                  showToast(
                    lang === 'am' ? 'ስህተት ተፈጥሯል። እባክዎ ይሞክሩ።' : 'An error occurred. Please try again.',
                    'error',
                    6000
                  )
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading || !rescheduleNote.trim()}
              className="flex-1 gov-button py-3 disabled:opacity-50"
            >
              {loading ? (lang === 'am' ? 'በመላክ ላይ...' : 'Rescheduling...') : (lang === 'am' ? 'እንደገና ይዘጋጁ' : 'Reschedule')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white border border-mayor-gray-divider text-mayor-navy rounded-gov hover:bg-mayor-gray-divider transition-all"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

