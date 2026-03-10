import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderGit2,
  Users,
  MessageSquare,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  X,
} from 'lucide-react'
import { useApp, getInitials } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import DevConnectLogo from './DevConnectLogo'

// ── Nav items config ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/projects',      icon: FolderGit2,      label: 'Projects'      },
  { to: '/teams',         icon: Users,           label: 'Teams'         },
  { to: '/messages',      icon: MessageSquare,   label: 'Messages'      },
  { to: '/resources',     icon: BookOpen,        label: 'Resources'     },
  { to: '/notifications', icon: Bell,            label: 'Notifications' },
]

const BOTTOM_ITEMS = [
  { to: '/settings', icon: Settings, label: 'Settings' },
]

// ── Single link ───────────────────────────────────────────────────────────────
function NavItem({ to, icon: Icon, label, exact, onClick }) {
  return (
    <NavLink
      to={to}
      end={exact}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
         transition-all duration-200 group
         ${isActive
           ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
           : 'text-slate-500 hover:text-slate-100 hover:bg-surface-hover border border-transparent'
         }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={17}
            className={`flex-shrink-0 transition-colors ${isActive ? 'text-brand-400' : 'text-slate-600 group-hover:text-slate-300'}`}
          />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────
export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const { state } = useApp()
  const { logout } = useAuth()
  const profile = state.profile

  const handleLogout = async () => {
    onClose?.()
    await logout()
    localStorage.removeItem('dc_user')
    window.dispatchEvent(new CustomEvent('dc_local_login'))
    navigate('/')
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed left-0 top-0 h-full z-40 w-64 flex flex-col
          bg-[#0c0c1a] border-r border-surface-border
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* ── Logo area ── */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-surface-border flex-shrink-0">
          <div className="logo-glow-always">
            <DevConnectLogo size="sm" animate={true} showText={true} />
          </div>
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg
                       text-slate-500 hover:text-slate-200 hover:bg-surface-hover transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable nav ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-widest px-3 mb-3">
            Navigation
          </p>
          {NAV_ITEMS.map(item => (
            <NavItem
              key={item.to}
              {...item}
              exact={item.to === '/dashboard'}
              onClick={onClose}
            />
          ))}
        </nav>

        {/* ── Bottom pinned section ── */}
        <div className="flex-shrink-0 border-t border-surface-border px-3 py-3 space-y-1">
          {BOTTOM_ITEMS.map(item => (
            <NavItem key={item.to} {...item} onClick={onClose} />
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                       text-slate-500 hover:text-red-400 hover:bg-red-500/10
                       border border-transparent transition-all duration-200 group"
          >
            <LogOut size={17} className="flex-shrink-0 text-slate-600 group-hover:text-red-400 transition-colors" />
            <span>Logout</span>
          </button>


        </div>
      </aside>
    </>
  )
}
