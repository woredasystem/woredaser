import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'

export default function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete = 'current-password',
  required = false,
  id,
  className = '',
  lang = 'en',
}) {
  const [visible, setVisible] = useState(false)

  const showLabel =
    lang === 'am' ? 'የይለፍ ቃል አሳይ' : lang === 'om' ? 'Jecha icciitii agarsiisi' : 'Show password'
  const hideLabel =
    lang === 'am' ? 'የይለፍ ቃል ደብቅ' : lang === 'om' ? 'Jecha icciitii dhoksi' : 'Hide password'

  return (
    <div className={`relative group ${className}`}>
      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-mayor-navy/30 group-focus-within:text-mayor-royal-blue transition-colors pointer-events-none" />
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-50 border-2 border-mayor-gray-divider text-mayor-navy focus:outline-none focus:border-mayor-royal-blue focus:bg-white transition-colors"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg text-mayor-navy/40 hover:text-mayor-royal-blue hover:bg-mayor-royal-blue/5 transition-colors"
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
      >
        {visible ? (
          <EyeOff className="w-5 h-5" strokeWidth={1.75} />
        ) : (
          <Eye className="w-5 h-5" strokeWidth={1.75} />
        )}
      </button>
    </div>
  )
}
