import { useState, useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { supabase } from '../lib/supabase'
import { X } from 'lucide-react'
import { showToast } from './ToastContainer'
import { gregorianToEthiopian, ethiopianToGregorian, ethiopianMonths, ethiopianMonthsEn, getCurrentEthiopianDate, formatEthiopianDate } from '../utils/ethiopianCalendar'
import { getDepartmentDisplayName } from '../utils/routing'

export default function ComplaintResponseForm({ complaint, onClose, onSuccess }) {
  const { t, lang } = useLanguage()
  const [formData, setFormData] = useState({
    complaint_submission_date: '',
    complaint_submission_institution: '',
    appeal_content: '',
    properly_investigated: null,
    investigation_failure_reason: '',
    investigation_findings: '',
    summary_response: '',
    action_to_be_taken: '',
    investigated_by_expert: '',
    expert_signature_verified: false,
    expert_investigation_date: '',
    final_decision_by: '',
    final_decision_signature_verified: false,
    final_decision_date: '',
  })
  const [loading, setLoading] = useState(false)

  // Helper function to format date to Ethiopian format
  const formatToEthiopianDate = (dateString) => {
    if (!dateString) return ''
    try {
      const gregorianDate = new Date(dateString)
      const ethDate = gregorianToEthiopian(gregorianDate)
      const monthName = lang === 'am' 
        ? ethiopianMonths[ethDate.month - 1]
        : ethiopianMonthsEn[ethDate.month - 1]
      return lang === 'am'
        ? `${ethDate.day} ${monthName} ${ethDate.year}`
        : `${monthName} ${ethDate.day}, ${ethDate.year}`
    } catch (e) {
      return ''
    }
  }

  // Helper function to parse Ethiopian date string to Gregorian Date
  const parseEthiopianDate = (ethDateString) => {
    if (!ethDateString || !ethDateString.trim()) return null
    
    try {
      // Try to parse Ethiopian date format: "15 መስከረም 2016" or "15 Meskerem 2016"
      const trimmed = ethDateString.trim()
      const parts = trimmed.split(/\s+/)
      
      if (parts.length >= 3) {
        const day = parseInt(parts[0])
        const monthName = parts[1]
        const year = parseInt(parts[2])
        
        // Find month index (try both Amharic and English)
        let monthIndex = ethiopianMonths.findIndex(m => m === monthName)
        if (monthIndex < 0) {
          monthIndex = ethiopianMonthsEn.findIndex(m => m.toLowerCase() === monthName.toLowerCase())
        }
        
        if (monthIndex >= 0 && !isNaN(day) && day > 0 && day <= 30 && !isNaN(year) && year > 0) {
          const gregorianDate = ethiopianToGregorian(year, monthIndex + 1, day)
          return gregorianDate.toISOString()
        }
      }
      
      // If parsing fails, return null (don't try ISO fallback to avoid confusion)
      return null
    } catch (e) {
      console.error('Error parsing Ethiopian date:', e)
      return null
    }
  }

  useEffect(() => {
    if (complaint) {
      // Auto-fill form with complaint data
      const todayEthDate = getCurrentEthiopianDate()
      const todayFormatted = formatEthiopianDate(todayEthDate.year, todayEthDate.month, todayEthDate.day, lang)
      
      // Get department name in Amharic for auto-fill (prioritize Amharic translation)
      const departmentName = complaint.assigned_department 
        ? getDepartmentDisplayName(complaint.assigned_department, 'am')
        : ''
      // Use Amharic department name if available, otherwise use submission_institution
      const submissionInstitution = departmentName || complaint.submission_institution || ''
      
      setFormData({
        // Auto-fill: Complaint submission date (from complaint creation date)
        complaint_submission_date: complaint.complaint_submission_date 
          ? formatToEthiopianDate(complaint.complaint_submission_date)
          : complaint.created_at 
            ? formatToEthiopianDate(complaint.created_at)
            : todayFormatted, // Auto-fill with today if not set
        // Auto-fill: Submission institution (in Amharic)
        complaint_submission_institution: submissionInstitution,
        // Auto-fill: Appeal content (from complaint main content)
        appeal_content: complaint.appeal_content || complaint.complaint_main_content || complaint.details || '',
        properly_investigated: complaint.properly_investigated ?? null,
        investigation_failure_reason: complaint.investigation_failure_reason || '',
        investigation_findings: complaint.investigation_findings || '',
        summary_response: complaint.summary_response || '',
        action_to_be_taken: complaint.action_to_be_taken || '',
        investigated_by_expert: complaint.investigated_by_expert || '',
        expert_signature_verified: !!complaint.expert_signature,
        expert_investigation_date: complaint.expert_investigation_date
          ? formatToEthiopianDate(complaint.expert_investigation_date)
          : todayFormatted, // Auto-fill with today
        final_decision_by: complaint.final_decision_by || '',
        final_decision_signature_verified: !!complaint.final_decision_signature,
        final_decision_date: complaint.final_decision_date
          ? formatToEthiopianDate(complaint.final_decision_date)
          : todayFormatted, // Auto-fill with today
      })
    }
  }, [complaint, lang])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (formData.properly_investigated === null) {
      showToast(
        lang === 'am' ? 'እባክዎ የጣርታ ሁኔታ ይምረጡ' : 'Please select investigation status',
        'warning',
        4000
      )
      return
    }

    if (!formData.summary_response) {
      showToast(
        lang === 'am' ? 'እባክዎ ማጠቃለያ መልስ ይምረጡ' : 'Please select summary response',
        'warning',
        4000
      )
      return
    }

    setLoading(true)

    // Validate Ethiopian dates before submission
    if (formData.complaint_submission_date && !parseEthiopianDate(formData.complaint_submission_date)) {
      showToast(
        lang === 'am' 
          ? 'እባክዎ ትክክለኛ ኢትዮጵያዊ ቀን ያስገቡ (ምሳሌ: 15 መስከረም 2016)'
          : 'Please enter a valid Ethiopian date (Example: 15 Meskerem 2016)',
        'warning',
        4000
      )
      setLoading(false)
      return
    }

    if (formData.expert_investigation_date && !parseEthiopianDate(formData.expert_investigation_date)) {
      showToast(
        lang === 'am' 
          ? 'እባክዎ ትክክለኛ ኢትዮጵያዊ ቀን ያስገቡ (ምሳሌ: 15 መስከረም 2016)'
          : 'Please enter a valid Ethiopian date (Example: 15 Meskerem 2016)',
        'warning',
        4000
      )
      setLoading(false)
      return
    }

    if (formData.final_decision_date && !parseEthiopianDate(formData.final_decision_date)) {
      showToast(
        lang === 'am' 
          ? 'እባክዎ ትክክለኛ ኢትዮጵያዊ ቀን ያስገቡ (ምሳሌ: 15 መስከረም 2016)'
          : 'Please enter a valid Ethiopian date (Example: 15 Meskerem 2016)',
        'warning',
        4000
      )
      setLoading(false)
      return
    }

    try {
      const updateData = {
        complaint_submission_date: formData.complaint_submission_date 
          ? parseEthiopianDate(formData.complaint_submission_date)
          : null,
        complaint_submission_institution: formData.complaint_submission_institution || null,
        appeal_content: formData.appeal_content || null,
        properly_investigated: formData.properly_investigated,
        investigation_failure_reason: formData.properly_investigated === false 
          ? formData.investigation_failure_reason 
          : null,
        investigation_findings: formData.investigation_findings || null,
        summary_response: formData.summary_response,
        action_to_be_taken: formData.summary_response === 'correct' 
          ? formData.action_to_be_taken 
          : null,
        investigated_by_expert: formData.investigated_by_expert || null,
        expert_signature: formData.expert_signature_verified && formData.investigated_by_expert 
          ? formData.investigated_by_expert 
          : null,
        expert_investigation_date: formData.expert_investigation_date
          ? parseEthiopianDate(formData.expert_investigation_date)
          : null,
        final_decision_by: formData.final_decision_by || null,
        final_decision_signature: formData.final_decision_signature_verified && formData.final_decision_by
          ? formData.final_decision_by
          : null,
        final_decision_date: formData.final_decision_date
          ? parseEthiopianDate(formData.final_decision_date)
          : null,
        // Form 02 submission closes the case — both valid and invalid outcomes are resolved
        status: 'Resolved',
        resolution_note: formData.investigation_findings || formData.action_to_be_taken || null,
      }

      const { data: updatedComplaint, error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', complaint.id)
        .select()
        .single()

      if (error) {
        console.error('Supabase error details:', error)
        console.error('Update data being sent:', updateData)
        throw error
      }

      showToast(
        lang === 'am' ? 'ቅሬታው መልስ በተሳካ ሁኔታ ተመዝግቧል' : 'Complaint response submitted successfully',
        'success',
        5000
      )

      onSuccess?.(updatedComplaint)
      onClose()
    } catch (error) {
      console.error('Error submitting response:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      // Show more detailed error message
      let errorMessage = lang === 'am' ? 'ስህተት ተፈጥሯል' : 'An error occurred'
      if (error.message) {
        errorMessage += `: ${error.message}`
      }
      
      showToast(
        errorMessage,
        'error',
        6000
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="gov-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="gov-header rounded-t-gov-xl p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold font-amharic">
            {t('form02Title')}
          </h2>
          <button onClick={onClose} className="text-white hover:text-white/70">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white">
          {/* Section 1: Complainant Information */}
          <div className="border-b-2 border-mayor-gray-divider pb-4">
            <h3 className="text-lg font-bold text-mayor-navy mb-4 font-amharic">
              {lang === 'am' ? '1) የቅሬታው/አቤቱታ አቅራቢው ሙሉ ስም' : '1) Complainant/Appellant Full Name'}
            </h3>
            <div className="bg-mayor-royal-blue/5 p-4 rounded-gov">
              <p className="text-mayor-navy font-amharic font-semibold">
                {complaint?.complainant_name || 'N/A'}
              </p>
              {complaint?.complainant_age && (
                <p className="text-mayor-navy/70 text-sm mt-1">
                  {t('complainantAge')}: {complaint.complainant_age}
                </p>
              )}
              {complaint?.complainant_gender && (
                <p className="text-mayor-navy/70 text-sm">
                  {t('complainantGender')}: {complaint.complainant_gender === 'male' ? t('genderMale') : t('genderFemale')}
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Submission Date and Institution */}
          <div className="border-b-2 border-mayor-gray-divider pb-4">
            <h3 className="text-lg font-bold text-mayor-navy mb-4 font-amharic">
              {lang === 'am' ? '2) ቅሬታው የቀረበበት ቀን እና ተቋም' : '2) Date and Institution Where Complaint Was Submitted'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                  {t('complaintSubmissionDate')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.complaint_submission_date}
                  onChange={(e) => setFormData({ ...formData, complaint_submission_date: e.target.value })}
                  placeholder={(() => {
                    const today = getCurrentEthiopianDate()
                    return formatEthiopianDate(today.year, today.month, today.day, lang)
                  })()}
                  className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue font-amharic"
                />
                <p className="text-mayor-navy/60 text-xs mt-1 font-amharic">
                  {lang === 'am' 
                    ? `ኢትዮጵያዊ ቀን ያስገቡ (ምሳሌ: ${formatEthiopianDate(getCurrentEthiopianDate().year, getCurrentEthiopianDate().month, getCurrentEthiopianDate().day, 'am')})`
                    : `Enter Ethiopian date (Example: ${formatEthiopianDate(getCurrentEthiopianDate().year, getCurrentEthiopianDate().month, getCurrentEthiopianDate().day, 'en')})`}
                </p>
              </div>
              <div>
                <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                  {t('complaintSubmissionInstitution')}
                </label>
                <input
                  type="text"
                  value={formData.complaint_submission_institution}
                  onChange={(e) => setFormData({ ...formData, complaint_submission_institution: e.target.value })}
                  className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Appeal Content */}
          <div className="border-b-2 border-mayor-gray-divider pb-4">
            <h3 className="text-lg font-bold text-mayor-navy mb-4 font-amharic">
              {lang === 'am' ? '3) የአቤቱታው ጭብጥ' : '3) Content of Appeal'}
            </h3>
            <div>
              <textarea
                rows={4}
                value={formData.appeal_content}
                onChange={(e) => setFormData({ ...formData, appeal_content: e.target.value })}
                className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue resize-none"
              />
            </div>
          </div>

          {/* Section 4: Investigation Status */}
          <div className="border-b-2 border-mayor-gray-divider pb-4">
            <h3 className="text-lg font-bold text-mayor-navy mb-4 font-amharic">
              {lang === 'am' ? 'አቤቱታው በሚገባ ስለ መጣራቱ' : 'Whether Appeal Was Properly Investigated'}
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="properly_investigated"
                    value="true"
                    checked={formData.properly_investigated === true}
                    onChange={() => setFormData({ ...formData, properly_investigated: true })}
                    className="w-4 h-4 text-mayor-royal-blue"
                  />
                  <span className="font-amharic">{t('properlyInvestigated')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="properly_investigated"
                    value="false"
                    checked={formData.properly_investigated === false}
                    onChange={() => setFormData({ ...formData, properly_investigated: false })}
                    className="w-4 h-4 text-mayor-royal-blue"
                  />
                  <span className="font-amharic">{t('notProperlyInvestigated')}</span>
                </label>
              </div>
              {formData.properly_investigated === false && (
                <div>
                  <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                    {t('investigationFailureReason')} *
                  </label>
                  <textarea
                    required={formData.properly_investigated === false}
                    rows={3}
                    value={formData.investigation_failure_reason}
                    onChange={(e) => setFormData({ ...formData, investigation_failure_reason: e.target.value })}
                    className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Investigation Findings */}
          <div className="border-b-2 border-mayor-gray-divider pb-4">
            <h3 className="text-lg font-bold text-mayor-navy mb-4 font-amharic">
              {lang === 'am' ? '5) በማጣራት ሂደቱ የተደረሰባቸው ግኝቶች' : '5) Findings Reached During Investigation'}
            </h3>
            <div>
              <textarea
                rows={5}
                value={formData.investigation_findings}
                onChange={(e) => setFormData({ ...formData, investigation_findings: e.target.value })}
                className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue resize-none"
              />
            </div>
          </div>

          {/* Section 6: Summary Response */}
          <div className="border-b-2 border-mayor-gray-divider pb-4">
            <h3 className="text-lg font-bold text-mayor-navy mb-4 font-amharic">
              {lang === 'am' ? '6) ማጠቃለያ መልስ' : '6) Summary Response'}
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="summary_response"
                    value="incorrect"
                    checked={formData.summary_response === 'incorrect'}
                    onChange={() => setFormData({ ...formData, summary_response: 'incorrect' })}
                    className="w-4 h-4 text-mayor-royal-blue"
                  />
                  <span className="font-amharic">{t('complaintIncorrect')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="summary_response"
                    value="correct"
                    checked={formData.summary_response === 'correct'}
                    onChange={() => setFormData({ ...formData, summary_response: 'correct' })}
                    className="w-4 h-4 text-mayor-royal-blue"
                  />
                  <span className="font-amharic">{t('complaintCorrect')}</span>
                </label>
              </div>
              {formData.summary_response === 'correct' && (
                <div>
                  <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                    {t('actionToBeTaken')} *
                  </label>
                  <textarea
                    required={formData.summary_response === 'correct'}
                    rows={4}
                    value={formData.action_to_be_taken}
                    onChange={(e) => setFormData({ ...formData, action_to_be_taken: e.target.value })}
                    className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 7: Expert Information */}
          <div className="border-b-2 border-mayor-gray-divider pb-4">
            <h3 className="text-lg font-bold text-mayor-navy mb-4 font-amharic">
              {lang === 'am' ? '8) ጉዳዩን ያጣራው ባለሙያ' : '8) Expert Who Investigated'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                  {t('investigatedByExpert')}
                </label>
                <input
                  type="text"
                  value={formData.investigated_by_expert}
                  onChange={(e) => setFormData({ ...formData, investigated_by_expert: e.target.value })}
                  className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                />
              </div>
              <div>
                <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                  {t('expertInvestigationDate')}
                </label>
                <input
                  type="text"
                  value={formData.expert_investigation_date}
                  onChange={(e) => setFormData({ ...formData, expert_investigation_date: e.target.value })}
                  placeholder={lang === 'am' ? 'ምሳሌ: 15 መስከረም 2016' : 'Example: 15 Meskerem 2016'}
                  className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue font-amharic"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                  {t('expertSignature')}
                </label>
                <div className="bg-mayor-royal-blue/5 p-4 rounded-gov border-l-4 border-mayor-royal-blue">
                  <p className="text-mayor-navy font-semibold font-amharic mb-3">
                    {formData.investigated_by_expert || (lang === 'am' ? 'ባለሙያ ስም ያስገቡ' : 'Enter expert name')}
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer relative z-10">
                    <input
                      type="checkbox"
                      checked={formData.expert_signature_verified}
                      onChange={(e) => setFormData({ ...formData, expert_signature_verified: e.target.checked })}
                      disabled={!formData.investigated_by_expert}
                      className="w-5 h-5 text-mayor-royal-blue rounded border-mayor-gray-divider focus:ring-mayor-royal-blue disabled:opacity-50 cursor-pointer relative z-10 pointer-events-auto"
                    />
                    <span className="text-mayor-navy font-amharic pointer-events-none">
                      {t('iVerifySignature')}
                    </span>
                  </label>
                  {formData.expert_signature_verified && (
                    <p className="text-green-600 text-sm font-amharic mt-2 flex items-center gap-2">
                      <span>✓</span> {t('signatureVerified')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: Final Decision */}
          <div className="pb-4">
            <h3 className="text-lg font-bold text-mayor-navy mb-4 font-amharic">
              {lang === 'am' ? '9) በፅህፈት ቤቱ የመጨረሻው ውሳኔ' : '9) Final Decision by Writing Office'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                  {t('finalDecisionBy')}
                </label>
                <input
                  type="text"
                  value={formData.final_decision_by}
                  onChange={(e) => setFormData({ ...formData, final_decision_by: e.target.value })}
                  className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                />
              </div>
              <div>
                <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                  {t('finalDecisionDate')}
                </label>
                <input
                  type="text"
                  value={formData.final_decision_date}
                  onChange={(e) => setFormData({ ...formData, final_decision_date: e.target.value })}
                  placeholder={lang === 'am' ? 'ምሳሌ: 15 መስከረም 2016' : 'Example: 15 Meskerem 2016'}
                  className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue font-amharic"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                  {t('finalDecisionSignature')}
                </label>
                <div className="bg-mayor-royal-blue/5 p-4 rounded-gov border-l-4 border-mayor-royal-blue">
                  <p className="text-mayor-navy font-semibold font-amharic mb-3">
                    {formData.final_decision_by || (lang === 'am' ? 'ሀላፊ ስም ያስገቡ' : 'Enter responsible person name')}
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer relative z-10">
                    <input
                      type="checkbox"
                      checked={formData.final_decision_signature_verified}
                      onChange={(e) => setFormData({ ...formData, final_decision_signature_verified: e.target.checked })}
                      disabled={!formData.final_decision_by}
                      className="w-5 h-5 text-mayor-royal-blue rounded border-mayor-gray-divider focus:ring-mayor-royal-blue disabled:opacity-50 cursor-pointer relative z-10 pointer-events-auto"
                    />
                    <span className="text-mayor-navy font-amharic pointer-events-none">
                      {t('iVerifySignature')}
                    </span>
                  </label>
                  {formData.final_decision_signature_verified && (
                    <p className="text-green-600 text-sm font-amharic mt-2 flex items-center gap-2">
                      <span>✓</span> {t('signatureVerified')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 gov-button py-3 disabled:opacity-50"
            >
              {loading ? (lang === 'am' ? 'በመላክ ላይ...' : 'Submitting...') : t('submit')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white border border-mayor-gray-divider text-mayor-navy rounded-gov hover:bg-mayor-gray-divider transition-all"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

