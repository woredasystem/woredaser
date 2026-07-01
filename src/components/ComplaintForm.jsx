import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { supabase } from '../lib/supabase'
import { useOfficials } from '../hooks/useOfficials'
import { X, Check } from 'lucide-react'
import ImageModal from './ImageModal'
import ComplaintSuccessModal from './ComplaintSuccessModal'
import { getDepartmentFromOfficial, getRoleKeyFromOfficial } from '../utils/routing'
import { showToast } from './ToastContainer'
import { isValidEthiopianMobile, formatPhoneHint } from '../utils/phone'

export default function ComplaintForm({ onClose, onSuccess, embedded = false }) {
  const { t, lang } = useLanguage()
  const { complaintOfficials } = useOfficials()
  const [formData, setFormData] = useState({
    // Section 1: Complainant Information
    complainant_name: '',
    complainant_age: '',
    complainant_gender: '',
    submission_type: 'individual',
    group_member_count: 1,
    group_members_info: '',
    complainant_subcity: '',
    complainant_woreda: '',
    complainant_house_number: '',
    complainant_phone: '',
    complainant_email: '',
    submission_institution: '',
    previous_written_response: '',
    complaint_main_content: '',
    requested_solution: '',
    complainant_signature: '',
    complainant_signature_verified: false,
    target_official: '',
  })
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submittedData, setSubmittedData] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate that an official is selected
    if (!formData.target_official) {
      showToast(
        lang === 'am' ? 'እባክዎ አመራር ይምረጡ' : 'Please select an official',
        'warning',
        4000
      )
      return
    }

    // Validate signature
    if (!formData.complainant_signature_verified) {
      showToast(
        lang === 'am' ? 'እባክዎ ፊርማ ያረጋግጡ' : 'Please verify your signature',
        'warning',
        4000
      )
      return
    }

    if (!isValidEthiopianMobile(formData.complainant_phone)) {
      showToast(
        lang === 'am'
          ? `ትክክለኛ ስልክ ያስገቡ (${formatPhoneHint(lang)})`
          : lang === 'om'
            ? `Lakkoofsa bilbila sirrii galchaa (${formatPhoneHint(lang)})`
            : `Enter a valid phone number (${formatPhoneHint(lang)})`,
        'warning',
        5000
      )
      return
    }
    
    setLoading(true)

    try {
      // Generate ticket number
      const year = new Date().getFullYear()
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      const ticket_number = `GRV-${year}-${randomNum}`

      // Generate unique code for follow-up (8 characters: 4 letters + 4 numbers)
      const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
      const numbers = '0123456789'
      let uniqueCode = ''
      for (let i = 0; i < 4; i++) {
        uniqueCode += letters.charAt(Math.floor(Math.random() * letters.length))
      }
      for (let i = 0; i < 4; i++) {
        uniqueCode += numbers.charAt(Math.floor(Math.random() * numbers.length))
      }

      // Determine department and role key from target official
      const assignedDepartment = getDepartmentFromOfficial(formData.target_official, lang, complaintOfficials)
      const assignedToRoleKey = getRoleKeyFromOfficial(formData.target_official, lang, complaintOfficials)

      console.log('Complaint routing:', {
        target_official: formData.target_official,
        assignedDepartment,
        assignedToRoleKey,
        lang
      })

      const insertData = {
        complainant_name: formData.complainant_name,
        complainant_phone: formData.complainant_phone.replace(/\s/g, ''),
        complainant_age: formData.complainant_age ? parseInt(formData.complainant_age) : null,
        complainant_gender: formData.complainant_gender || null,
        submission_type: formData.submission_type,
        group_member_count: formData.submission_type === 'group' ? parseInt(formData.group_member_count) : 1,
        group_members_info: formData.submission_type === 'group' ? formData.group_members_info : null,
        complainant_subcity: formData.complainant_subcity || null,
        complainant_woreda: formData.complainant_woreda || null,
        complainant_house_number: formData.complainant_house_number || null,
        complainant_email: formData.complainant_email || null,
        submission_institution: formData.submission_institution || null,
        previous_written_response: formData.previous_written_response || null,
        complaint_main_content: formData.complaint_main_content || formData.complaint_main_content,
        requested_solution: formData.requested_solution || null,
        complainant_signature: formData.complainant_signature_verified ? formData.complainant_name : null,
        target_official: formData.target_official,
        details: formData.complaint_main_content, // Keep for backward compatibility
        ticket_number,
        unique_code: uniqueCode,
        status: 'Pending',
        escalation_level: 1,
        department: assignedDepartment,
        assigned_department: assignedDepartment,
        assigned_to_role_key: assignedToRoleKey,
        complaint_submission_date: new Date().toISOString(),
        preferred_lang: lang === 'om' ? 'om' : lang === 'en' ? 'en' : 'am',
      }

      console.log('Submitting complaint with data:', insertData)

      const { error: insertError } = await supabase
        .from('complaints')
        .insert([insertData])

      if (insertError) {
        console.error('Insert error:', insertError)
        throw insertError
      }

      // Then fetch the inserted record using unique_code
      const { data, error: selectError } = await supabase
        .from('complaints')
        .select('*')
        .eq('unique_code', uniqueCode)
        .single()

      if (selectError) {
        console.error('Select error:', selectError)
        console.warn('Insert succeeded but could not fetch record:', selectError)
      }

      // Reset loading state
      setLoading(false)

      // Show success modal with unique code (don't close form yet)
      setSubmittedData({ ticket_number, unique_code: uniqueCode })
      setShowSuccessModal(true)

      // Don't call onSuccess yet - let user close modal first
      // onSuccess?.(uniqueCode)
      
      // Reset form
      setFormData({
        complainant_name: '',
        complainant_age: '',
        complainant_gender: '',
        submission_type: 'individual',
        group_member_count: 1,
        group_members_info: '',
        complainant_subcity: '',
        complainant_woreda: '',
        complainant_house_number: '',
        complainant_phone: '',
        complainant_email: '',
        submission_institution: '',
        previous_written_response: '',
        complaint_main_content: '',
        requested_solution: '',
        complainant_signature_verified: false,
        target_official: '',
      })
    } catch (error) {
      console.error('Error submitting complaint:', error)
      setLoading(false)
      
      // Show impressive error toast
      const errorMessage = error.message || error.code || 'Unknown error'
      const errorText = lang === 'am' 
        ? `ስህተት ተፈጥሯል።\n\n${errorMessage}\n\nእባክዎ ይሞክሩ።`
        : `An error occurred.\n\n${errorMessage}\n\nPlease try again.`
      
      showToast(errorText, 'error', 8000)
    }
  }

  const formCard = (
      <div className={`${embedded ? 'bg-white border-2 border-mayor-gray-divider rounded-2xl overflow-hidden' : 'gov-card max-w-4xl w-full max-h-[90vh] overflow-y-auto'}`}>
        <div className={`${embedded ? 'px-6 py-5 border-b border-mayor-navy/10 flex justify-between items-center bg-slate-50/80' : 'gov-header rounded-t-gov-xl p-6 flex justify-between items-center'}`}>
          <div>
            <h2 className={`text-xl sm:text-2xl font-bold font-amharic ${embedded ? 'text-mayor-navy' : ''}`}>
              {t('form01Title')}
            </h2>
            {embedded && (
              <p className="mt-1 text-sm text-mayor-navy/50 font-amharic">
                {lang === 'am' ? 'ሁሉንም አስፈላጊ መረጃዎችን በትክክል ይሙሉ' : 'Fill in all required information accurately'}
              </p>
            )}
          </div>
          {!embedded && (
            <button onClick={onClose} className="text-white hover:text-white/70">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className={`p-6 sm:p-8 space-y-6 bg-white ${embedded ? '' : 'max-h-[70vh] overflow-y-auto'}`}>
          {/* Section 1: Complainant Information */}
          <div className="border-b-2 border-mayor-gray-divider pb-4">
            <h3 className="text-lg font-bold text-mayor-navy mb-4 font-amharic">
              {lang === 'am' ? '1) የቅሬታው/አቤቱታ አቅራቢው ሙሉ ስም' : '1) Complainant/Appellant Full Name'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                  {t('complainantFullName')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.complainant_name}
                  onChange={(e) => setFormData({ ...formData, complainant_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                />
              </div>
              <div>
                <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                  {t('complainantAge')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.complainant_age}
                  onChange={(e) => setFormData({ ...formData, complainant_age: e.target.value })}
                  className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                />
              </div>
              <div>
                <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                  {t('complainantGender')}
                </label>
                <select
                  value={formData.complainant_gender}
                  onChange={(e) => setFormData({ ...formData, complainant_gender: e.target.value })}
                  className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                >
                  <option value="">{lang === 'am' ? '-- ይምረጡ --' : '-- Select --'}</option>
                  <option value="male">{t('genderMale')}</option>
                  <option value="female">{t('genderFemale')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Submission Type */}
          <div className="border-b-2 border-mayor-gray-divider pb-4">
            <h3 className="text-lg font-bold text-mayor-navy mb-4 font-amharic">
              {lang === 'am' ? '2) ቅሬታው/አቤቱታው የቀረበው' : '2) Complaint/Appeal Submitted By'}
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="submission_type"
                    value="individual"
                    checked={formData.submission_type === 'individual'}
                    onChange={(e) => setFormData({ ...formData, submission_type: e.target.value })}
                    className="w-4 h-4 text-mayor-royal-blue"
                  />
                  <span className="font-amharic">{t('submissionTypeIndividual')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="submission_type"
                    value="group"
                    checked={formData.submission_type === 'group'}
                    onChange={(e) => setFormData({ ...formData, submission_type: e.target.value })}
                    className="w-4 h-4 text-mayor-royal-blue"
                  />
                  <span className="font-amharic">{t('submissionTypeGroup')}</span>
                </label>
              </div>
              {formData.submission_type === 'group' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                      {t('groupMemberCount')} *
                    </label>
                    <input
                      type="number"
                      min="2"
                      required={formData.submission_type === 'group'}
                      value={formData.group_member_count}
                      onChange={(e) => setFormData({ ...formData, group_member_count: e.target.value })}
                      className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                      {t('groupMembersInfo')}
                    </label>
                    <textarea
                      rows={4}
                      value={formData.group_members_info}
                      onChange={(e) => setFormData({ ...formData, group_members_info: e.target.value })}
                      placeholder={lang === 'am' 
                        ? 'ምሳሌ:\n1. ስም - ስልክ\n2. ስም - ስልክ\n3. ስም - ስልክ'
                        : 'Example:\n1. Name - Phone\n2. Name - Phone\n3. Name - Phone'}
                      className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue resize-none"
                    />
                    <p className="text-mayor-navy/60 text-xs mt-1 font-amharic">
                      {lang === 'am' 
                        ? 'እባክዎ የአባላትን ስሞች እና ስልክ ቁጥሮች አንድ በአንድ ይጻፉ'
                        : 'Please list member names and phone numbers, one per line'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Address */}
          <div className="border-b-2 border-mayor-gray-divider pb-4">
            <h3 className="text-lg font-bold text-mayor-navy mb-4 font-amharic">
              {lang === 'am' ? '3) የቅሬታ/አቤቱታ አቅራቢው አድራሻ' : '3) Complainant/Appellant Address'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                  {t('subcity')}
                </label>
                <input
                  type="text"
                  value={formData.complainant_subcity}
                  onChange={(e) => setFormData({ ...formData, complainant_subcity: e.target.value })}
                  className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                />
              </div>
              <div>
                <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                  {t('woreda')}
                </label>
                <input
                  type="text"
                  value={formData.complainant_woreda}
                  onChange={(e) => setFormData({ ...formData, complainant_woreda: e.target.value })}
                  className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                />
              </div>
              <div>
                <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                  {t('houseNumber')}
                </label>
                <input
                  type="text"
                  value={formData.complainant_house_number}
                  onChange={(e) => setFormData({ ...formData, complainant_house_number: e.target.value })}
                  className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                />
              </div>
              <div>
                <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                  {t('phone')} *
                </label>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  pattern="09[0-9]{8}"
                  placeholder={formatPhoneHint(lang)}
                  value={formData.complainant_phone}
                  onChange={(e) => setFormData({ ...formData, complainant_phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-mayor-navy mb-2 font-amharic font-semibold">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={formData.complainant_email}
                  onChange={(e) => setFormData({ ...formData, complainant_email: e.target.value })}
                  className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Submission Institution */}
          <div className="border-b-2 border-mayor-gray-divider pb-4">
            <h3 className="text-lg font-bold text-mayor-navy mb-4 font-amharic">
              {lang === 'am' ? '4) ቅሬታ/አቤቱታ የቀረበበት ተቋም ስም' : '4) Institution Where Complaint/Appeal Was Submitted'}
            </h3>
            <div>
              <input
                type="text"
                value={formData.submission_institution}
                onChange={(e) => setFormData({ ...formData, submission_institution: e.target.value })}
                className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue"
              />
            </div>
          </div>

          {/* Section 5: Previous Written Response */}
          <div className="border-b-2 border-mayor-gray-divider pb-4">
            <h3 className="text-lg font-bold text-mayor-navy mb-4 font-amharic">
              {lang === 'am' ? '5) ባለጉዳዩ መፍትሄ ለማግኘት በሄደባቸው መስሪያ ቤት የተስተናገደው የፅሁፍ ምላሽ' : '5) Written Response Received from Offices Visited'}
            </h3>
            <div>
              <textarea
                rows={3}
                value={formData.previous_written_response}
                onChange={(e) => setFormData({ ...formData, previous_written_response: e.target.value })}
                className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue resize-none"
              />
            </div>
          </div>

          {/* Section 6: Main Content */}
          <div className="border-b-2 border-mayor-gray-divider pb-4">
            <h3 className="text-lg font-bold text-mayor-navy mb-4 font-amharic">
              {lang === 'am' ? '6) የቅሬታው/የአቤቱታው ዋና ጭብጥ' : '6) Main Content of Complaint/Appeal'}
            </h3>
            <div>
              <textarea
                required
                rows={5}
                value={formData.complaint_main_content}
                onChange={(e) => setFormData({ ...formData, complaint_main_content: e.target.value })}
                className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue resize-none"
              />
            </div>
          </div>

          {/* Section 7: Requested Solution */}
          <div className="border-b-2 border-mayor-gray-divider pb-4">
            <h3 className="text-lg font-bold text-mayor-navy mb-4 font-amharic">
              {lang === 'am' ? '7) የቅሬታው/የአቤቱታው አቅራቢው እንዲደረግለት ወይም እንዲፈጸምለት የሚፈልገው መፍትሄ' : '7) Solution Requested by Complainant/Appellant'}
            </h3>
            <div>
              <textarea
                rows={4}
                value={formData.requested_solution}
                onChange={(e) => setFormData({ ...formData, requested_solution: e.target.value })}
                className="w-full px-4 py-2 rounded-gov bg-white border border-mayor-gray-divider text-mayor-navy placeholder-mayor-navy/40 focus:outline-none focus:ring-2 focus:ring-mayor-royal-blue focus:border-mayor-royal-blue resize-none"
              />
            </div>
          </div>

          {/* Section 8: Target Official */}
          <div className="border-b-2 border-mayor-gray-divider pb-4">
            <h3 className="text-lg font-bold text-mayor-navy mb-4 font-amharic">
              {t('targetOfficial')} *
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {complaintOfficials.map((official) => {
                const isSelected = formData.target_official === (lang === 'am' ? official.full_name_am : official.full_name_en)
                return (
                  <button
                    key={official.id}
                    type="button"
                    onClick={() => setFormData({ 
                      ...formData, 
                      target_official: lang === 'am' ? official.full_name_am : official.full_name_en 
                    })}
                    className={`relative p-4 rounded-gov-lg border-2 transition-all ${
                      isSelected 
                        ? 'border-mayor-royal-blue bg-mayor-highlight-blue/10 shadow-gov-md' 
                        : 'border-mayor-gray-divider bg-white hover:border-mayor-royal-blue hover:shadow-gov'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-mayor-royal-blue text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-20 h-20 rounded-gov-lg overflow-hidden mb-3 border-2 border-mayor-gray-divider cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (official.image_url) {
                            setSelectedImage(official.image_url)
                          }
                        }}
                      >
                        {official.image_url ? (
                          <img 
                            src={official.image_url} 
                            alt={lang === 'am' ? official.full_name_am : official.full_name_en}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-mayor-royal-blue to-mayor-highlight-blue flex items-center justify-center">
                            <span className="text-white font-bold text-xl">
                              {lang === 'am' 
                                ? official.full_name_am.split(' ').map(n => n[0]).join('')
                                : official.full_name_en.split(' ').map(n => n[0]).join('')
                              }
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-mayor-navy font-amharic text-center">
                        {lang === 'am' ? official.full_name_am : official.full_name_en}
                      </p>
                      <p className="text-xs text-mayor-navy/70 font-amharic text-center mt-1">
                        {lang === 'am' ? official.title_am : official.title_en}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
            {!formData.target_official && (
              <p className="text-red-500 text-sm mt-2 font-amharic">
                {lang === 'am' ? 'እባክዎ አመራር ይምረጡ' : 'Please select an official'}
              </p>
            )}
          </div>

          {/* Section 9: Signature */}
          <div className="pb-4">
            <h3 className="text-lg font-bold text-mayor-navy mb-4 font-amharic">
              {lang === 'am' ? '8) የቅሬታው/አቤቱታ አቅራቢው ሙሉ ስም ፊርማ' : '8) Complainant/Appellant Full Name and Signature'}
            </h3>
            <div className="bg-mayor-royal-blue/5 p-4 rounded-gov border-l-4 border-mayor-royal-blue">
              <p className="text-mayor-navy font-semibold font-amharic mb-3">
                {formData.complainant_name || (lang === 'am' ? 'ስም ያስገቡ' : 'Enter name')}
              </p>
              <label className="flex items-center gap-3 cursor-pointer relative z-10">
                <input
                  type="checkbox"
                  checked={formData.complainant_signature_verified}
                  onChange={(e) => setFormData({ ...formData, complainant_signature_verified: e.target.checked })}
                  className="w-5 h-5 text-mayor-royal-blue rounded border-mayor-gray-divider focus:ring-mayor-royal-blue cursor-pointer relative z-10 pointer-events-auto"
                />
                <span className="text-mayor-navy font-amharic pointer-events-none">
                  {t('iVerifySignature')}
                </span>
              </label>
              {formData.complainant_signature_verified && (
                <p className="text-green-600 text-sm font-amharic mt-2 flex items-center gap-2">
                  <span>✓</span> {t('signatureVerified')}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-1 border-t border-mayor-navy/8 -mx-6 sm:-mx-8 px-6 sm:px-8 pt-5">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-mayor-navy hover:bg-mayor-deep-blue text-white py-3 rounded-xl font-semibold font-amharic transition-colors disabled:opacity-50"
            >
              {loading ? (lang === 'am' ? 'በመላክ ላይ...' : 'Submitting...') : t('submit')}
            </button>
            {!embedded && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-white border-2 border-mayor-gray-divider text-mayor-navy rounded-xl hover:bg-slate-50 transition-all font-amharic"
              >
                {t('cancel')}
              </button>
            )}
          </div>
        </form>
      </div>
  )

  const modals = (
    <>
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          alt={lang === 'am' ? 'አመራር' : 'Official'}
          onClose={() => setSelectedImage(null)}
        />
      )}
      {showSuccessModal && submittedData && (
        <ComplaintSuccessModal
          ticketNumber={submittedData.ticket_number}
          uniqueCode={submittedData.unique_code}
          onClose={() => {
            setShowSuccessModal(false)
            setSubmittedData(null)
            onSuccess?.(submittedData.unique_code)
            if (!embedded) {
              setTimeout(() => onClose(), 100)
            }
          }}
        />
      )}
    </>
  )

  if (embedded) {
    return (
      <>
        {formCard}
        {modals}
      </>
    )
  }

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${showSuccessModal ? 'hidden' : ''}`}>
        {formCard}
      </div>
      {modals}
    </>
  )
}
