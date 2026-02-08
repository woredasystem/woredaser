import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { getDepartmentDisplayName, roleToDepartment } from '../utils/routing'
import { officials } from '../data/officials'
import { Building2, Shield, ArrowRight, Home } from 'lucide-react'

export default function PortalAccess({ onSelectPortal }) {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState(null)

  const departments = [
    { key: 'Trade Office', roleKey: 'trade_head' },
    { key: 'Civil Registration', roleKey: 'civil_head' },
    { key: 'Labor & Skills', roleKey: 'labor_head' },
    { key: 'Chief Executive Office', roleKey: 'ceo_office_head' },
    { key: 'Chief Executive', roleKey: 'ceo' },
    { key: 'Woreda Council', roleKey: 'council_speaker' }
  ]

  const handlePortalAccess = (department, roleKey) => {
    // Show login for this department
    onSelectPortal({ type: 'login', department, roleKey })
  }

  const handleAdminAccess = () => {
    // Show login for admin
    onSelectPortal({ type: 'login', department: 'Admin', roleKey: 'admin' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mayor-deep-blue via-mayor-royal-blue to-mayor-highlight-blue flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="gov-card p-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-mayor-navy hover:text-mayor-royal-blue hover:bg-mayor-royal-blue/10 rounded-gov transition-colors font-amharic"
            >
              <Home className="w-5 h-5" />
              <span>{lang === 'am' ? 'ወደ መነሻ ተመለስ' : lang === 'om' ? 'Gara Jalqabaatti Deebi\'i' : 'Back to Home'}</span>
            </button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-mayor-navy mb-2 font-amharic">
              {lang === 'am' ? 'የመዳረሻ ፓነል' : lang === 'om' ? 'Paanelii Dhaqqabummaa' : 'Portal Access'}
            </h1>
            <p className="text-mayor-navy/70 font-amharic">
              {lang === 'am' ? 'የስራ ክፍል ወይም አስተዳደር ፓነል ይምረጡ' : lang === 'om' ? 'Kutaa Hojii ykn Paanelii Bulchiinsaa Filadhu' : 'Select Department or Admin Portal'}
            </p>
          </div>

          {/* Department Portals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {departments.map((dept) => {
              const official = officials.find(o => o.role_key === dept.roleKey)
              return (
                <button
                  key={dept.key}
                  onClick={() => handlePortalAccess(dept.key, dept.roleKey)}
                  className="gov-card p-6 hover:shadow-gov-md transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-mayor-royal-blue/10 rounded-gov-lg group-hover:bg-mayor-royal-blue/20 transition-colors">
                      <Building2 className="w-8 h-8 text-mayor-royal-blue" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-mayor-navy font-amharic mb-1">
                        {getDepartmentDisplayName(dept.key, lang)}
                      </h3>
                      {official && (
                        <p className="text-sm text-mayor-navy/70 font-amharic">
                          {lang === 'am' ? official.full_name_am : lang === 'om' ? (official.full_name_om || official.full_name_en) : official.full_name_en}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-mayor-navy/40 group-hover:text-mayor-royal-blue group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Admin Portal */}
          <button
            onClick={handleAdminAccess}
            className="w-full gov-card p-6 hover:shadow-gov-md transition-all text-left group border-2 border-mayor-royal-blue"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-mayor-royal-blue/20 rounded-gov-lg group-hover:bg-mayor-royal-blue/30 transition-colors">
                <Shield className="w-8 h-8 text-mayor-royal-blue" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-mayor-navy font-amharic mb-1">
                  {lang === 'am' ? 'የአስተዳደር ፓነል' : lang === 'om' ? 'Paanelii Bulchiinsaa' : 'Admin Portal'}
                </h3>
                <p className="text-sm text-mayor-navy/70 font-amharic">
                  {lang === 'am' ? 'የስርዓቱ አጠቃላይ እይታ' : lang === 'om' ? 'Ilaalcha Waliigalaa Sirna' : 'System-wide overview'}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-mayor-navy/40 group-hover:text-mayor-royal-blue group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

