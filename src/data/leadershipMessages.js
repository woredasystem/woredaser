import { getDigitalTransformationSpeech } from '../config/site'

/** Generic leadership copy — no person names; officials come from the database. */
export const leadershipSpeech = {
  am: [
    getDigitalTransformationSpeech('am'),
    'በዚህ የዲጂታል ፖርታል በኩል፣ ነዋሪዎች አገልግሎቶችን በቀላሉ፣ በፍጥነት እና በብቃት ማግኘት ይችላሉ።',
    'ቡድናችን በየቀኑ የተሻለ አገልግሎት ለመስጠት እየተጋ ነው። ቅሬታዎችን በቅልጥፍና እንቀበላለን እና እንፈታለን። ቀጠሮዎችን በመስመር ላይ ማዘዝ ይችላሉ።',
  ],
  om: [
    getDigitalTransformationSpeech('om'),
    'Karaa paanelii dijitaalaa kanaan, jiraattoonni tajaajila salphaatti, saffisaan fi gahumsaan argachuu danda\'u.',
    'Gareen keenya guyyaa guyyaan tajaajila fooyya\'aa kennuuf hojjechaa jira. Komii gahumsaan fudhanna fi ni furra.',
  ],
  en: [
    getDigitalTransformationSpeech('en'),
    'Through this digital portal, residents can access services easily, quickly, and efficiently.',
    'Our team works every day to provide better service. We receive and resolve complaints efficiently. Appointments can be booked online.',
  ],
}
