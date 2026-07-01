import { useState } from 'react'
import { Menu, X, LogOut, ArrowLeft, PanelLeftClose, PanelLeft } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export default function AdminLayout({
  title,
  subtitle,
  navItems,
  activeTab,
  onTabChange,
  onBack,
  onLogout,
  children,
}) {
  const { lang } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const sidebarWidth = collapsed ? 'lg:w-[72px]' : 'lg:w-64'

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col bg-mayor-navy text-white transition-all duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 ${sidebarWidth} shadow-xl lg:shadow-none`}
      >
        <div className={`flex items-center border-b border-white/10 p-4 ${collapsed ? 'lg:justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-amharic font-bold text-sm truncate">
                {lang === 'am' ? 'የአስተዳደር ፓንል' : 'Admin Portal'}
              </p>
              <p className="text-white/50 text-xs truncate">
                {lang === 'am' ? 'ስርዓት አስተዳደር' : 'System management'}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-white/10 text-white/70"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onTabChange(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all font-amharic
                  ${isActive
                    ? 'bg-mayor-royal-blue text-white shadow-md'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }
                  ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="truncate text-left flex-1">{item.label}</span>
                )}
                {!collapsed && item.badge != null && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-white/10 p-3 space-y-2">
          <button
            type="button"
            onClick={onBack}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/75 hover:bg-white/10 hover:text-white transition-colors font-amharic ${collapsed ? 'lg:justify-center' : ''}`}
          >
            <ArrowLeft className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{lang === 'am' ? 'ወደ ገጽ ተመለስ' : 'Back to site'}</span>}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/20 transition-colors font-amharic ${collapsed ? 'lg:justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{lang === 'am' ? 'ውጣ' : 'Logout'}</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-mayor-gray-divider px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-mayor-navy"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-mayor-navy font-amharic truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-mayor-navy/60 font-amharic truncate">{subtitle}</p>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
