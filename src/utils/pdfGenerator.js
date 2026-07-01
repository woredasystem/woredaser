import html2pdf from 'html2pdf.js'
import { gregorianToEthiopian, ethiopianMonths, ethiopianMonthsEn } from './ethiopianCalendar'
import { getDepartmentDisplayName } from './routing'
import { getWoredaLabel, getPdfFooterText } from '../config/site'

// Generate PDF for complaint using HTML to PDF conversion
export function generateComplaintPDF(complaint, lang = 'am') {
  // Format date helper - converts to Ethiopian time
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const createdDate = new Date(dateString)
    const ethDate = gregorianToEthiopian(createdDate)
    const monthName = lang === 'am' 
      ? ethiopianMonths[ethDate.month - 1]
      : ethiopianMonthsEn[ethDate.month - 1]
    const hour = createdDate.getHours()
    const minute = createdDate.getMinutes()
    
    // Convert to Ethiopian time (6 hours behind)
    let ethHour = hour - 6
    if (ethHour < 0) ethHour += 24
    
    // Convert to 12-hour format
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
    
    const hourDisplay = displayHour.toString().padStart(2, '0')
    const minuteDisplay = minute.toString().padStart(2, '0')
    if (lang === 'am') {
      return `${ethDate.day} ${monthName} ${ethDate.year} ${hourDisplay}:${minuteDisplay} ${period}`
    } else {
      return `${monthName} ${ethDate.day}, ${ethDate.year} ${hourDisplay}:${minuteDisplay} ${period}`
    }
  }

  // Format date only (without time) - for Form 2 submission dates
  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A'
    const createdDate = new Date(dateString)
    const ethDate = gregorianToEthiopian(createdDate)
    const monthName = lang === 'am' 
      ? ethiopianMonths[ethDate.month - 1]
      : ethiopianMonthsEn[ethDate.month - 1]
    
    if (lang === 'am') {
      return `${ethDate.day} ${monthName} ${ethDate.year}`
    } else {
      return `${monthName} ${ethDate.day}, ${ethDate.year}`
    }
  }

  // Format status
  const statusText = lang === 'am' 
    ? (complaint.status === 'Pending' ? 'በመጠባበቅ ላይ' :
       complaint.status === 'In Progress' ? 'በሂደት ላይ' :
       complaint.status === 'Resolved' ? 'ተፈትቷል' :
       complaint.status === 'Escalated' ? 'ወደ ላይ ተላልፏል' : complaint.status)
    : complaint.status

  const departmentName = getDepartmentDisplayName(complaint.department || complaint.assigned_department, lang)
  const targetOfficial = complaint.target_official || 'N/A'
  const description = complaint.complaint_main_content || complaint.details || 'N/A'

  // Create HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Noto Sans Ethiopic', 'Arial', sans-serif;
          color: #002d5c;
          line-height: 1.6;
          padding: 0;
          margin: 0;
        }
        
        .header {
          background: linear-gradient(135deg, #003875 0%, #004694 100%);
          color: white;
          padding: 30px 40px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .header h2 {
          font-size: 18px;
          font-weight: 400;
          margin-bottom: 5px;
          opacity: 0.95;
        }
        
        .header h3 {
          font-size: 16px;
          font-weight: 500;
          opacity: 0.9;
        }
        
        .content {
          padding: 30px 40px;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #003875;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #E3E3E3;
          page-break-after: avoid;
          break-after: avoid;
        }
        
        .form-break {
          page-break-before: always !important;
          break-before: page !important;
          page-break-after: avoid;
          break-after: avoid;
        }
        
        @media print {
          .form-break {
            page-break-before: always !important;
            break-before: page !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          
          .info-row, .description-box, .resolution-box, .group-members-box {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          .section-title {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
        
        .info-row {
          margin-bottom: 12px;
          display: flex;
          align-items: flex-start;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .description-box, .resolution-box, .group-members-box {
          page-break-inside: avoid;
          break-inside: avoid;
          orphans: 3;
          widows: 3;
        }
        
        .info-label {
          font-weight: 600;
          color: #002d5c;
          min-width: 180px;
          font-size: 13px;
        }
        
        .info-value {
          flex: 1;
          color: #002d5c;
          font-size: 13px;
          word-wrap: break-word;
        }
        
        .ticket-number {
          font-size: 22px;
          font-weight: 700;
          color: #003875;
          margin-bottom: 8px;
        }
        
        .unique-code {
          font-size: 16px;
          font-weight: 600;
          color: #004694;
          margin-bottom: 20px;
        }
        
        .description-box {
          background: #F5F5F5;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #004694;
          margin-top: 10px;
          font-size: 13px;
          line-height: 1.8;
          white-space: pre-wrap;
          word-wrap: break-word;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .resolution-box {
          background: #E8F5E9;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #4CAF50;
          margin-top: 10px;
          font-size: 13px;
          line-height: 1.8;
          white-space: pre-wrap;
          word-wrap: break-word;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .group-members-box {
          background: #FFF3E0;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #FF9800;
          margin-top: 10px;
          font-size: 13px;
          line-height: 1.8;
          white-space: pre-wrap;
          word-wrap: break-word;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .status-pending {
          background: #FFF3CD;
          color: #856404;
        }
        
        .status-progress {
          background: #D1ECF1;
          color: #0C5460;
        }
        
        .status-resolved {
          background: #D4EDDA;
          color: #155724;
        }
        
        .status-escalated {
          background: #F8D7DA;
          color: #721C24;
        }
        
        .divider {
          height: 1px;
          background: #E3E3E3;
          margin: 20px 0;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E3E3E3;
          text-align: center;
          font-size: 11px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${getWoredaLabel(lang)}</h1>
        <h3>${lang === 'am' ? 'ቅፅ-01: የቅሬታው/አቤቱታ ማቅረቢያ' : 'Form-01: Complaint/Appeal Submission'}</h3>
      </div>
      
      <div class="content">
        <div class="ticket-number">
          ${lang === 'am' ? 'የትኬት ቁጥር:' : 'Ticket Number:'} ${complaint.ticket_number || 'N/A'}
        </div>
        <div class="unique-code">
          ${lang === 'am' ? 'የልዩ ኮድ:' : 'Unique Code:'} ${complaint.unique_code || 'N/A'}
        </div>
        
        <div class="divider"></div>
        
        <!-- Form 01: Complainant Information -->
        <div class="section">
          <div class="section-title">${lang === 'am' ? '1) የቅሬታው/አቤቱታ አቅራቢው ሙሉ ስም' : '1) Complainant/Appellant Full Name'}</div>
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'ሙሉ ስም:' : 'Full Name:'}</div>
            <div class="info-value">${complaint.complainant_name || 'N/A'}</div>
          </div>
          ${complaint.complainant_age ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'ዕድሜ:' : 'Age:'}</div>
            <div class="info-value">${complaint.complainant_age}</div>
          </div>
          ` : ''}
          ${complaint.complainant_gender ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'ፆታ:' : 'Gender:'}</div>
            <div class="info-value">${complaint.complainant_gender === 'male' ? (lang === 'am' ? 'ወንድ' : 'Male') : (lang === 'am' ? 'ሴት' : 'Female')}</div>
          </div>
          ` : ''}
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'ስልክ:' : 'Phone:'}</div>
            <div class="info-value">${complaint.complainant_phone || 'N/A'}</div>
          </div>
          ${complaint.complainant_email ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'ኢ ሜይል:' : 'Email:'}</div>
            <div class="info-value">${complaint.complainant_email}</div>
          </div>
          ` : ''}
        </div>
        
        ${complaint.submission_type ? `
        <div class="divider"></div>
        <div class="section">
          <div class="section-title">${lang === 'am' ? '2) ቅሬታው/አቤቱታው የቀረበው' : '2) Complaint/Appeal Submitted By'}</div>
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'የቀረበው:' : 'Submitted By:'}</div>
            <div class="info-value">${complaint.submission_type === 'individual' ? (lang === 'am' ? 'በግል' : 'Individual') : (lang === 'am' ? 'በቡድን' : 'Group')}</div>
          </div>
          ${complaint.submission_type === 'group' && complaint.group_member_count ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'የአባል ብዛት:' : 'Number of Members:'}</div>
            <div class="info-value">${complaint.group_member_count}</div>
          </div>
          ` : ''}
          ${complaint.submission_type === 'group' && complaint.group_members_info ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'የቡድን አባላት:' : 'Group Members:'}</div>
            <div class="info-value">
              <div class="group-members-box">${complaint.group_members_info}</div>
            </div>
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        ${(complaint.complainant_subcity || complaint.complainant_woreda || complaint.complainant_house_number) ? `
        <div class="divider"></div>
        <div class="section">
          <div class="section-title">${lang === 'am' ? '3) የቅሬታ/አቤቱታ አቅራቢው አድራሻ' : '3) Complainant/Appellant Address'}</div>
          ${complaint.complainant_subcity ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'ክ/ከተማ:' : 'Sub-City:'}</div>
            <div class="info-value">${complaint.complainant_subcity}</div>
          </div>
          ` : ''}
          ${complaint.complainant_woreda ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'ወረዳ:' : 'Woreda:'}</div>
            <div class="info-value">${complaint.complainant_woreda}</div>
          </div>
          ` : ''}
          ${complaint.complainant_house_number ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'የቤት ቁጥር:' : 'House Number:'}</div>
            <div class="info-value">${complaint.complainant_house_number}</div>
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        ${complaint.submission_institution ? `
        <div class="divider"></div>
        <div class="section">
          <div class="section-title">${lang === 'am' ? '4) ቅሬታ/አቤቱታ የቀረበበት ተቋም ስም' : '4) Institution Where Complaint/Appeal Was Submitted'}</div>
          <div class="info-value">${complaint.submission_institution}</div>
        </div>
        ` : ''}
        
        ${complaint.previous_written_response ? `
        <div class="divider"></div>
        <div class="section">
          <div class="section-title">${lang === 'am' ? '5) ባለጉዳዩ መፍትሄ ለማግኘት በሄደባቸው መስሪያ ቤት የተስተናገደው የፅሁፍ ምላሽ' : '5) Written Response Received from Offices Visited'}</div>
          <div class="description-box">${complaint.previous_written_response}</div>
        </div>
        ` : ''}
        
        <div class="divider"></div>
        <div class="section">
          <div class="section-title">${lang === 'am' ? '6) የቅሬታው/የአቤቱታው ዋና ጭብጥ' : '6) Main Content of Complaint/Appeal'}</div>
          <div class="description-box">${description}</div>
        </div>
        
        ${complaint.requested_solution ? `
        <div class="divider"></div>
        <div class="section">
          <div class="section-title">${lang === 'am' ? '7) የቅሬታው/የአቤቱታው አቅራቢው እንዲደረግለት ወይም እንዲፈጸምለት የሚፈልገው መፍትሄ' : '7) Solution Requested by Complainant/Appellant'}</div>
          <div class="description-box">${complaint.requested_solution}</div>
        </div>
        ` : ''}
        
        <div class="divider"></div>
        <div class="section">
          <div class="section-title">${lang === 'am' ? 'የቅሬታ ዝርዝሮች' : 'Complaint Details'}</div>
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'የተጠቃሚ አመራር:' : 'Target Official:'}</div>
            <div class="info-value">${targetOfficial}</div>
          </div>
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'የስራ ክፍል:' : 'Department:'}</div>
            <div class="info-value">${departmentName}</div>
          </div>
          ${complaint.assigned_department && complaint.assigned_department !== complaint.department ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'የተመደበ ክፍል:' : 'Assigned Department:'}</div>
            <div class="info-value">${getDepartmentDisplayName(complaint.assigned_department, lang)}</div>
          </div>
          ` : ''}
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'ሁኔታ:' : 'Status:'}</div>
            <div class="info-value">
              <span class="status-badge status-${complaint.status.toLowerCase().replace(' ', '-')}">${statusText}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'የመጨመሪያ ደረጃ:' : 'Escalation Level:'}</div>
            <div class="info-value">${complaint.escalation_level || 1}</div>
          </div>
        </div>
        
        <div class="divider"></div>
        <div class="section">
          <div class="section-title">${lang === 'am' ? 'ቀናት' : 'Dates'}</div>
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'የቀረበበት ቀን:' : 'Submitted Date:'}</div>
            <div class="info-value">${formatDate(complaint.created_at)}</div>
          </div>
          ${complaint.complaint_submission_date ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'የቅሬታ የቀረበበት ቀን:' : 'Complaint Submission Date:'}</div>
            <div class="info-value">${formatDateOnly(complaint.complaint_submission_date)}</div>
          </div>
          ` : ''}
        </div>
        
        ${complaint.complainant_signature ? `
        <div class="divider"></div>
        <div class="section">
          <div class="section-title">${lang === 'am' ? '8) የቅሬታው/አቤቱታ አቅራቢው ሙሉ ስም' : '8) Complainant/Appellant Full Name'}</div>
          <div class="info-value">${complaint.complainant_signature}</div>
        </div>
        ` : ''}
        
        ${(complaint.appeal_content || complaint.properly_investigated !== null || complaint.investigation_findings || complaint.summary_response) ? `
        <div class="divider"></div>
        <div class="form-break">
          <div class="section">
            <div class="section-title">${lang === 'am' ? 'ቅፅ-02: የቅሬታ/አቤቱታ መልስ መስጪያ' : 'Form-02: Complaint/Appeal Response Provider'}</div>
          
          ${complaint.complaint_submission_institution ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'ቅሬታው የቀረበበት ተቋም:' : 'Institution Where Complaint Was Submitted:'}</div>
            <div class="info-value">${complaint.complaint_submission_institution}</div>
          </div>
          ` : ''}
          
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'ቅሬታው የቀረበበት ቀን:' : 'Date of Complaint Submission:'}</div>
            <div class="info-value">${complaint.complaint_submission_date ? formatDateOnly(complaint.complaint_submission_date) : formatDateOnly(complaint.created_at)}</div>
          </div>
          
          ${complaint.appeal_content ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'የአቤቱታው ጭብጥ:' : 'Content of Appeal:'}</div>
            <div class="info-value">
              <div class="description-box">${complaint.appeal_content}</div>
            </div>
          </div>
          ` : ''}
          
          ${complaint.properly_investigated !== null ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'አቤቱታው በሚገባ ስለ መጣራቱ:' : 'Whether Appeal Was Properly Investigated:'}</div>
            <div class="info-value">${complaint.properly_investigated ? (lang === 'am' ? 'በሚገባ ተጣርቷል' : 'Properly Investigated') : (lang === 'am' ? 'በሚገባ አልተጣራም' : 'Not Properly Investigated')}</div>
          </div>
          ` : ''}
          
          ${!complaint.properly_investigated && complaint.investigation_failure_reason ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'በሚገባ ካልተጣራ ምክንያቱ:' : 'Reason If Not Properly Investigated:'}</div>
            <div class="info-value">
              <div class="description-box">${complaint.investigation_failure_reason}</div>
            </div>
          </div>
          ` : ''}
          
          ${complaint.investigation_findings ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'በማጣራት ሂደቱ የተደረሰባቸው ግኝቶች:' : 'Findings Reached During Investigation:'}</div>
            <div class="info-value">
              <div class="description-box">${complaint.investigation_findings}</div>
            </div>
          </div>
          ` : ''}
          
          ${complaint.summary_response ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'ማጠቃለያ መልስ:' : 'Summary Response:'}</div>
            <div class="info-value">${complaint.summary_response === 'correct' ? (lang === 'am' ? 'ቅሬታው ትክክል ነው' : 'Complaint is Correct') : (lang === 'am' ? 'ቅሬታው ትክክል አደለም' : 'Complaint is Incorrect')}</div>
          </div>
          ` : ''}
          
          ${complaint.action_to_be_taken ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'ቅሬታው ትክክል ከሆነ የሚወሰደው እርምጃ:' : 'Action to Be Taken If Complaint is Correct:'}</div>
            <div class="info-value">
              <div class="description-box">${complaint.action_to_be_taken}</div>
            </div>
          </div>
          ` : ''}
          
          ${complaint.investigated_by_expert ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'ጉዳዩን ያጣራው ባለሙያ:' : 'Expert Who Investigated:'}</div>
            <div class="info-value">${complaint.investigated_by_expert}</div>
          </div>
          ${complaint.expert_investigation_date ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'የተጣራበት ቀን:' : 'Investigation Date:'}</div>
            <div class="info-value">${formatDateOnly(complaint.expert_investigation_date)}</div>
          </div>
          ` : ''}
          ` : ''}
          
          ${complaint.final_decision_by ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'በፅህፈት ቤቱ የመጨረሻው ውሳኔውን የሰጠው ሀላፊ:' : 'Responsible Person Who Gave Final Decision:'}</div>
            <div class="info-value">${complaint.final_decision_by}</div>
          </div>
          ${complaint.final_decision_date ? `
          <div class="info-row">
            <div class="info-label">${lang === 'am' ? 'የመጨረሻ ውሳኔ ቀን:' : 'Final Decision Date:'}</div>
            <div class="info-value">${formatDateOnly(complaint.final_decision_date)}</div>
          </div>
          ` : ''}
          ` : ''}
        </div>
        ` : ''}
        
        ${complaint.resolution_note ? `
        <div class="divider"></div>
        <div class="section">
          <div class="section-title">${lang === 'am' ? 'የመፍትሄ ማስታወሻ' : 'Resolution Note'}</div>
          <div class="resolution-box">${complaint.resolution_note}</div>
        </div>
        ` : ''}
        
        <div class="footer">
          ${getPdfFooterText(lang)}
        </div>
      </div>
    </body>
    </html>
  `

  // Create a temporary element
  const element = document.createElement('div')
  element.innerHTML = htmlContent
  
  // Configure PDF options
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `Complaint_${complaint.ticket_number || complaint.unique_code || 'Report'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true
    },
    pagebreak: { 
      mode: ['css', 'avoid-all'],
      before: '.form-break',
      avoid: ['.info-row', '.description-box', '.resolution-box', '.group-members-box', '.section-title'],
      after: []
    }
  }

  // Generate and download PDF
  html2pdf().set(opt).from(element).save()
}
