export default function AdminFormTip({ children, className = '' }) {
  return (
    <p
      className={`text-sm text-mayor-navy/70 bg-slate-50 border border-mayor-gray-divider rounded-lg px-4 py-3 font-amharic leading-relaxed ${className}`}
    >
      {children}
    </p>
  )
}
