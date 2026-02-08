import { useEffect, useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { X, CheckCircle, AlertCircle, Info, Copy, Check } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose, duration = 5000, showCopyButton = false, copyText = '' }) {
  const { lang } = useLanguage()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleCopy = async () => {
    if (copyText) {
      try {
        await navigator.clipboard.writeText(copyText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle
  }

  const colors = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    }
  }

  const Icon = icons[type] || Info
  const colorScheme = colors[type] || colors.info

  return (
    <div className={`w-full ${colorScheme.bg} ${colorScheme.border} border-2 rounded-gov-lg shadow-gov-md p-3 md:p-4 animate-slide-in`}>
      <div className="flex items-start gap-2 md:gap-3">
        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${colorScheme.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className={`${colorScheme.text} font-amharic whitespace-pre-line text-sm md:text-base`}>
            {message}
          </div>
          {showCopyButton && copyText && (
            <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-gov font-mono text-xs md:text-sm font-semibold break-all">
                {copyText}
              </div>
              <button
                onClick={handleCopy}
                className={`px-3 md:px-4 py-2 ${colorScheme.button} text-white rounded-gov flex items-center justify-center gap-2 transition-colors font-amharic text-xs md:text-sm whitespace-nowrap`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="font-amharic">{lang === 'am' ? 'ተገልብፇል!' : lang === 'om' ? 'Garagalfameera!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="font-amharic">{lang === 'am' ? 'ቅዳ' : lang === 'om' ? 'Garagalchi' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className={`${colorScheme.text} hover:opacity-70 transition-opacity flex-shrink-0`}
        >
          <X className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  )
}

