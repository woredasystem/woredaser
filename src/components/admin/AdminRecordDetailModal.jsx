import { X, User } from 'lucide-react'

export default function AdminRecordDetailModal({
  title,
  fields,
  photoUrl,
  photoAlt = '',
  onClose,
  lang = 'en',
  showPhotoPlaceholder = false,
}) {
  if (!title) return null

  const showPhotoBlock = photoUrl || showPhotoPlaceholder

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-detail-title"
      >
        <div className="sticky top-0 z-10 bg-white border-b border-mayor-gray-divider px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <h3 id="admin-detail-title" className="text-lg font-bold text-mayor-navy font-amharic min-w-0">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-mayor-navy shrink-0"
            aria-label={lang === 'am' ? 'ዝጋ' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showPhotoBlock && (
          photoUrl ? (
            <div className="px-4 sm:px-6 pt-5 flex justify-center">
              <img
                src={photoUrl}
                alt={photoAlt}
                className="h-36 w-36 sm:h-44 sm:w-44 rounded-2xl object-cover border-2 border-mayor-gray-divider shadow-md"
              />
            </div>
          ) : (
            <div className="px-4 sm:px-6 pt-5 flex justify-center">
              <div className="h-36 w-36 sm:h-44 sm:w-44 rounded-2xl bg-mayor-royal-blue/10 border-2 border-mayor-gray-divider flex items-center justify-center text-mayor-royal-blue/40">
                <User className="w-16 h-16" strokeWidth={1.25} />
              </div>
            </div>
          )
        )}

        <dl className="px-4 sm:px-6 py-4 space-y-4">
          {fields.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs font-bold uppercase tracking-wide text-mayor-navy/45 font-amharic mb-1">
                {label}
              </dt>
              <dd className="text-sm text-mayor-navy font-amharic break-words leading-relaxed whitespace-pre-wrap">
                {value ?? '—'}
              </dd>
            </div>
          ))}
        </dl>
        <div className="px-4 sm:px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-mayor-navy text-white font-semibold font-amharic hover:bg-mayor-deep-blue transition-colors"
          >
            {lang === 'am' ? 'ዝጋ' : lang === 'om' ? 'Cufi' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}
