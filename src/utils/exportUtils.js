// Export utilities for complaints and appointments

import html2pdf from 'html2pdf.js'
import { gregorianToEthiopian, ethiopianMonths, ethiopianMonthsEn } from './ethiopianCalendar'
import { getDepartmentDisplayName } from './routing'
import { getWoredaAdministration } from '../config/site'

// Format date for display
function formatDate(dateString, lang = 'am') {
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

// Format date with time
function formatDateTime(dateString, lang = 'am') {
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
  
  if (lang === 'am') {
    return `${ethDate.day} ${monthName} ${ethDate.year} ${hourDisplay}:${minuteDisplay} ${period}`
  } else {
    return `${monthName} ${ethDate.day}, ${ethDate.year} ${hourDisplay}:${minuteDisplay} ${period}`
  }
}

// Export complaints to CSV
export function exportComplaintsToCSV(complaints, lang = 'am') {
  const headers = lang === 'am' 
    ? ['ቲኬት ቁጥር', 'የቅሬታ ሰጪ ስም', 'ስልክ', 'የስራ ክፍል', 'የቅሬታ ዝርዝር', 'ሁኔታ', 'ደረጃ', 'የተፈጠረበት ቀን']
    : ['Ticket Number', 'Complainant Name', 'Phone', 'Department', 'Details', 'Status', 'Level', 'Created Date']
  
  const rows = complaints.map(complaint => [
    complaint.ticket_number || '',
    complaint.complainant_name || '',
    complaint.complainant_phone || '',
    getDepartmentDisplayName(complaint.assigned_department || complaint.department, lang),
    complaint.details || '',
    lang === 'am' 
      ? (complaint.status === 'Pending' ? 'በመጠባበቅ ላይ' :
         complaint.status === 'In Progress' ? 'በሂደት ላይ' :
         complaint.status === 'Resolved' ? 'ተፈትቷል' :
         complaint.status === 'Escalated' ? 'ወደ ላይ ተላልፏል' : complaint.status)
      : complaint.status,
    complaint.escalation_level || 1,
    formatDate(complaint.complaint_submission_date || complaint.created_at, lang)
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `complaints_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export appointments to CSV
export function exportAppointmentsToCSV(appointments, lang = 'am') {
  const headers = lang === 'am'
    ? ['ኮድ', 'የነዋሪ ስም', 'ስልክ', 'የአገልግሎት አይነት', 'የቀጠሮ ቀን', 'ሁኔታ', 'የስራ ክፍል', 'የተፈጠረበት ቀን']
    : ['Code', 'Citizen Name', 'Phone', 'Service Type', 'Appointment Date', 'Status', 'Department', 'Created Date']
  
  const rows = appointments.map(appointment => [
    appointment.unique_code || '',
    appointment.citizen_name || '',
    appointment.citizen_phone || '',
    appointment.service_type || '',
    formatDateTime(appointment.appointment_date, lang),
    lang === 'am'
      ? (appointment.status === 'Confirmed' ? 'በሂደት ላይ' :
         appointment.status === 'Rescheduled' ? 'ቀኑ ተቀይሯል' :
         appointment.status === 'Completed' ? 'ተቀባይነት አግኝቷል' :
         appointment.status === 'Missed' ? 'ተቀባይነት አላገኘም' : appointment.status)
      : appointment.status,
    getDepartmentDisplayName(appointment.assigned_department, lang),
    formatDate(appointment.created_at, lang)
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `appointments_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export complaints to PDF
export function exportComplaintsToPDF(complaints, lang = 'am') {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Noto Sans Ethiopic', 'Arial', sans-serif;
          color: #002d5c;
          line-height: 1.6;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #1E5A8E;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #1E5A8E;
          font-size: 24px;
          margin-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 11px;
        }
        th {
          background-color: #1E5A8E;
          color: white;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          padding-bottom: 10px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${lang === 'am' ? 'የቅሬታዎች ሪፖርት' : 'Complaints Report'}</h1>
        <p>${getWoredaAdministration(lang)}</p>
        <p>${formatDate(new Date().toISOString(), lang)}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>${lang === 'am' ? 'ቲኬት ቁጥር' : 'Ticket'}</th>
            <th>${lang === 'am' ? 'ስም' : 'Name'}</th>
            <th>${lang === 'am' ? 'ስልክ' : 'Phone'}</th>
            <th>${lang === 'am' ? 'የስራ ክፍል' : 'Department'}</th>
            <th>${lang === 'am' ? 'ሁኔታ' : 'Status'}</th>
            <th>${lang === 'am' ? 'ደረጃ' : 'Level'}</th>
            <th>${lang === 'am' ? 'ቀን' : 'Date'}</th>
          </tr>
        </thead>
        <tbody>
          ${complaints.map(complaint => `
            <tr>
              <td>${complaint.ticket_number || ''}</td>
              <td>${complaint.complainant_name || ''}</td>
              <td>${complaint.complainant_phone || ''}</td>
              <td>${getDepartmentDisplayName(complaint.assigned_department || complaint.department, lang)}</td>
              <td>${lang === 'am' 
                ? (complaint.status === 'Pending' ? 'በመጠባበቅ ላይ' :
                   complaint.status === 'In Progress' ? 'በሂደት ላይ' :
                   complaint.status === 'Resolved' ? 'ተፈትቷል' :
                   complaint.status === 'Escalated' ? 'ወደ ላይ ተላልፏል' : complaint.status)
                : complaint.status}</td>
              <td>${complaint.escalation_level || 1}</td>
              <td>${formatDate(complaint.created_at, lang)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p style="margin: 5px 0; white-space: nowrap;">${lang === 'am' ? 'ጠቅላላ ቅሬታዎች' : 'Total Complaints'}: ${complaints.length}</p>
      </div>
    </body>
    </html>
  `
  
  const opt = {
    margin: [10, 10, 15, 10],
    filename: `complaints_report_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  }
  
  html2pdf().set(opt).from(htmlContent).save()
}

// Export appointments to PDF
export function exportAppointmentsToPDF(appointments, lang = 'am') {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Noto Sans Ethiopic', 'Arial', sans-serif;
          color: #002d5c;
          line-height: 1.6;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #1E5A8E;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #1E5A8E;
          font-size: 24px;
          margin-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 10px;
        }
        th {
          background-color: #1E5A8E;
          color: white;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          padding-bottom: 10px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${lang === 'am' ? 'የቀጠሮዎች ሪፖርት' : 'Appointments Report'}</h1>
        <p>${getWoredaAdministration(lang)}</p>
        <p>${formatDate(new Date().toISOString(), lang)}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>${lang === 'am' ? 'ኮድ' : 'Code'}</th>
            <th>${lang === 'am' ? 'ስም' : 'Name'}</th>
            <th>${lang === 'am' ? 'ስልክ' : 'Phone'}</th>
            <th>${lang === 'am' ? 'የአገልግሎት አይነት' : 'Service'}</th>
            <th>${lang === 'am' ? 'የቀጠሮ ቀን' : 'Date'}</th>
            <th>${lang === 'am' ? 'ሁኔታ' : 'Status'}</th>
            <th>${lang === 'am' ? 'የስራ ክፍል' : 'Department'}</th>
          </tr>
        </thead>
        <tbody>
          ${appointments.map(appointment => `
            <tr>
              <td>${appointment.unique_code || ''}</td>
              <td>${appointment.citizen_name || ''}</td>
              <td>${appointment.citizen_phone || ''}</td>
              <td>${appointment.service_type || ''}</td>
              <td>${formatDateTime(appointment.appointment_date, lang)}</td>
              <td>${lang === 'am'
                ? (appointment.status === 'Confirmed' ? 'በሂደት ላይ' :
                   appointment.status === 'Rescheduled' ? 'ቀኑ ተቀይሯል' :
                   appointment.status === 'Completed' ? 'ተቀባይነት አግኝቷል' :
                   appointment.status === 'Missed' ? 'ተቀባይነት አላገኘም' : appointment.status)
                : appointment.status}</td>
              <td>${getDepartmentDisplayName(appointment.assigned_department, lang)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p style="margin: 5px 0; white-space: nowrap;">${lang === 'am' ? 'ጠቅላላ ቀጠሮዎች' : 'Total Appointments'}: ${appointments.length}</p>
      </div>
    </body>
    </html>
  `
  
  const opt = {
    margin: [10, 10, 15, 10],
    filename: `appointments_report_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  }
  
  html2pdf().set(opt).from(htmlContent).save()
}






