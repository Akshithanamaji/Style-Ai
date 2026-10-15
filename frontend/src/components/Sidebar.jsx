import { useState } from 'react'
import { Home, User, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'

const COLLAPSE_KEY = 'afs_sidebar_collapsed'

export default function Sidebar({ step, userName, onHome, onProfile, onSettings, onLogout }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1')

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      return next
    })
  }

  const items = [
    { id: 'landing', label: 'Home', Icon: Home, onClick: onHome },
    { id: 'profile', label: 'Profile', Icon: User, onClick: onProfile },
    { id: 'settings', label: 'Settings', Icon: Settings, onClick: onSettings },
  ]

  return (
    <aside
      className={`shrink-0 min-h-screen bg-[#14151B] border-r border-white/10 flex flex-col py-6 sticky top-0 transition-all duration-200 ${
        collapsed ? 'w-[68px] px-2' : 'w-56 px-3'
      }`}
    >
      <div className={`flex items-center mb-8 ${collapsed ? 'justify-center px-0' : 'justify-between px-3'}`}>
        {!collapsed && (
          <p className="text-[11px] uppercase tracking-widest text-white/40 font-semibold truncate">{userName}</p>
        )}
        <button
          onClick={toggleCollapsed}
          className="flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map(({ id, label, Icon, onClick }) => {
          const active = step === id
          return (
            <button
              key={id}
              onClick={onClick}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                collapsed ? 'justify-center px-0' : 'px-3 text-left'
              } ${
                active
                  ? 'bg-[#F4845F]/15 text-[#F4845F]'
                  : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && label}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/10">
        <button
          onClick={onLogout}
          title={collapsed ? 'Log Out' : undefined}
          className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer w-full ${
            collapsed ? 'justify-center px-0' : 'px-3 text-left'
          }`}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && 'Log Out'}
        </button>
      </div>
    </aside>
  )
}
