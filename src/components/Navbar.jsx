import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Search,
  User,
  ChevronDown,
  Edit3,
  Command,
  Menu,
  X,
  Github,
  Linkedin,
  Mail,
  Code2,
  FileText,
  Settings,
  ExternalLink,
} from 'lucide-react'
import { useApp, getInitials, getEffectiveAvatar } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

// ─── Notification bell ───────────────────────────────────────────────────────
function NotifBell() {
  const { state } = useApp()
  const count = state.notifications.filter(n => !n.read).length
  const navigate = useNavigate()
  return (
    <button
      className="relative btn-ghost rounded-xl w-9 h-9 flex items-center justify-center text-slate-400
                 hover:text-slate-100 transition-colors"
      title="Notifications"
      onClick={() => navigate('/notifications')}
    >
      <Bell size={18} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center
                         rounded-full bg-brand-500 text-[9px] font-bold text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}

// ─── Avatar Dropdown ──────────────────────────────────────────────────────────
function AvatarDropdown() {
  const [open, setOpen] = useState(false)
  const ref             = useRef(null)
  const navigate        = useNavigate()
  const { state, dispatch } = useApp()
  const { user: authUser } = useAuth()
  const user            = state.profile

  // Detect which provider was used to log in
  const provider = authUser?.githubId ? 'github' : authUser?.googleId ? 'google' : null

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const [profileOpen, setProfileOpen] = useState(false)
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const [skillsInput, setSkillsInput] = useState('')

  // Sync local skills text whenever the modal is opened
  useEffect(() => {
    if (descriptionOpen) setSkillsInput((user.skills || []).join(', '))
  }, [descriptionOpen])

  const menuItems = [
    { icon: FileText, label: 'Profile Description', desc: 'Edit your extended profile', action: () => { setOpen(false); setDescriptionOpen(true) } },
    { icon: User,  label: 'View Profile', desc: 'See your public profile', action: () => { setOpen(false); setProfileOpen(true) } },
    { icon: ExternalLink,  label: 'View My Page', desc: 'Visit your public profile page', action: () => { setOpen(false); navigate(`/user/${user.username || 'profile'}`) } },
    { icon: Settings, label: 'Edit Profile', desc: 'Update info & avatar',    action: () => navigate('/settings') },
  ]

  const displayName = user.name || authUser?.name || ''
  const displayUsername = user.username || (authUser?.username ? `@${authUser.username}` : '')
  const effectiveAvatar = getEffectiveAvatar(user)

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5
                   hover:bg-surface-hover transition-colors duration-200 group"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="relative">
          {effectiveAvatar ? (
            <img
              src={effectiveAvatar}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover avatar-ring"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500
                            flex items-center justify-center text-xs font-bold text-white avatar-ring">
              {getInitials(displayName)}
            </div>
          )}
          {user.online && (
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400
                             ring-2 ring-[#0a0a14]" />
          )}
        </div>
        <div className="hidden sm:block text-left leading-none">
          <p className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
            {displayName}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{displayUsername}</p>
        </div>
        <ChevronDown
          size={14}
          className={`hidden sm:block text-slate-500 transition-transform duration-200
                      ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ── View Profile Modal ───────────────────────────────────────── */}
      {profileOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.78)' }}
          onClick={() => setProfileOpen(false)}
        >
          <div
            className="glass-card w-full max-w-md overflow-hidden shadow-2xl relative my-8"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setProfileOpen(false)}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-lg flex items-center justify-center
                         text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
            >
              <X size={15} />
            </button>

            {/* Banner */}
            <div className="h-24 bg-gradient-to-br from-brand-500/50 via-blue-600/30 to-cyan-500/20 relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.35),transparent)]" />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0d0d1a] to-transparent" />
            </div>

            <div className="px-5 pb-5">
              {/* Avatar row — overlaps banner */}
              <div className="-mt-10 mb-3 flex items-end justify-between">
                <div className="relative">
                  {effectiveAvatar ? (
                    <img
                      src={effectiveAvatar}
                      alt={displayName}
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#0d0d1a]"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500
                                    flex items-center justify-center text-2xl font-bold text-white ring-4 ring-[#0d0d1a]">
                      {getInitials(displayName)}
                    </div>
                  )}
                  {user.online && (
                    <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#0d0d1a]" />
                  )}
                </div>

                {/* Provider badge */}
                {provider && (
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
                    ${ provider === 'github'
                      ? 'bg-slate-700/80 text-slate-200 border-slate-600'
                      : 'bg-blue-500/15 text-blue-300 border-blue-500/30' }`}>
                    {provider === 'github' ? <Github size={11} /> : <Mail size={11} />}
                    {provider === 'github' ? 'Signed in via GitHub' : 'Signed in via Google'}
                  </div>
                )}
              </div>

              {/* Name / role / username */}
              <h2 className="text-xl font-bold text-slate-100 leading-tight">{displayName}</h2>
              {(user.role || authUser?.role) && (
                <p className="text-sm text-brand-300 mt-0.5">{user.role || authUser?.role || ''}</p>
              )}
              {displayUsername && (
                <p className="text-xs text-slate-500 mt-0.5">{displayUsername}</p>
              )}
              {user.university && (
                <p className="text-xs text-slate-600 mt-0.5">🎓 {user.university}</p>
              )}

              {/* Bio */}
              {user.bio && (
                <p className="text-xs text-slate-400 mt-3 leading-relaxed border-t border-surface-border pt-3">
                  {user.bio}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center p-2.5 rounded-xl bg-surface-hover border border-surface-border">
                  <p className="text-lg font-bold text-slate-100">{state.projects.length}</p>
                  <p className="text-[10px] text-slate-500">Projects</p>
                </div>
                <div className="text-center p-2.5 rounded-xl bg-surface-hover border border-surface-border">
                  <p className="text-lg font-bold text-slate-100">
                    {state.collabRequests.filter(r => r.status === 'accepted').length}
                  </p>
                  <p className="text-[10px] text-slate-500">Collabs</p>
                </div>
                <div className="text-center p-2.5 rounded-xl bg-surface-hover border border-surface-border">
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <p className="text-xs font-bold text-emerald-400">Online</p>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Status</p>
                </div>
              </div>

              {/* Social Links */}
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-4 mb-2">Social Links</p>
              <div className="space-y-1.5">
                {[
                  { key: 'github',   label: 'GitHub',   Icon: Github,   accent: 'text-slate-300',  bg: 'bg-slate-700/40'  },
                  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin, accent: 'text-blue-400',   bg: 'bg-blue-500/10'   },
                  { key: 'gmail',    label: 'Gmail',    Icon: Mail,     accent: 'text-red-400',    bg: 'bg-red-500/10'    },
                  { key: 'leetcode', label: 'LeetCode', Icon: Code2,    accent: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                ].map(({ key, label, Icon, accent, bg }) => {
                  const val = user.links?.[key]
                  const isEmail = val && val.includes('@') && !val.startsWith('http')
                  const href = val ? (isEmail ? `mailto:${val}` : val.startsWith('http') ? val : `https://${val}`) : null
                  return (
                    <div key={key}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-surface-border
                                  transition-colors ${ val ? 'hover:border-brand-500/30 cursor-pointer' : '' } ${bg}`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                        <Icon size={13} className={accent} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-slate-500">{label}</p>
                        {val ? (
                          <a
                            href={href}
                            target={isEmail ? '_self' : '_blank'}
                            rel="noopener noreferrer"
                            className={`text-xs ${accent} hover:brightness-125 truncate block transition-all`}
                          >
                            {val}
                          </a>
                        ) : (
                          <p className="text-xs text-slate-600 italic">Not added yet</p>
                        )}
                      </div>
                      {val && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                             className="w-3 h-3 text-slate-600 flex-shrink-0">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Edit Profile button */}
              <button
                onClick={() => { setProfileOpen(false); navigate('/settings') }}
                className="mt-4 w-full btn-primary py-2.5 gap-2 justify-center text-sm"
              >
                <Edit3 size={13} /> Edit Profile
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Profile Description Modal ───────────────────────────────────────── */}
      {descriptionOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.78)' }}
          onClick={() => setDescriptionOpen(false)}
        >
          <div
            className="glass-card w-full max-w-2xl overflow-hidden shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setDescriptionOpen(false)}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-lg flex items-center justify-center
                         text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
            >
              <X size={15} />
            </button>

            {/* Header */}
            <div className="px-6 py-4 border-b border-surface-border">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" />
                Edit Profile Description
              </h2>
              <p className="text-sm text-slate-400 mt-1">Update your extended profile information</p>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                <input
                  type="text"
                  value={user.location || ''}
                  onChange={(e) => dispatch({ type: 'UPDATE_PROFILE', payload: { location: e.target.value } })}
                  placeholder="e.g., San Francisco, CA"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200
                           placeholder-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50
                           outline-none transition-all"
                />
              </div>

              {/* Profile Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Profile Description</label>
                <textarea
                  value={user.profileDescription || ''}
                  onChange={(e) => dispatch({ type: 'UPDATE_PROFILE', payload: { profileDescription: e.target.value } })}
                  placeholder="Tell others about yourself, your interests, and what you're working on..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200
                           placeholder-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50
                           outline-none transition-all resize-none"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g., React, Node.js, Python, Docker"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200
                           placeholder-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50
                           outline-none transition-all"
                />
                {skillsInput.trim() && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skillsInput.split(',').map(s => s.trim()).filter(Boolean).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10
                                 border border-cyan-500/20 text-cyan-300 text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => {
                    dispatch({ type: 'UPDATE_PROFILE', payload: { skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean) } })
                    setDescriptionOpen(false)
                    dispatch({
                      type: 'ADD_NOTIFICATION',
                      payload: {
                        id: Date.now(),
                        type: 'success',
                        message: 'Profile description updated successfully',
                        read: false,
                        createdAt: new Date().toISOString()
                      }
                    })
                  }}
                  className="flex-1 btn-primary py-2.5 justify-center"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setDescriptionOpen(false)}
                  className="px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10
                           text-slate-300 hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Dropdown panel */}
      {open && (
        <div
          className="dropdown-enter absolute right-0 mt-2 w-64
                     glass-card border border-surface-border
                     shadow-glow overflow-hidden z-50"
        >
          {/* User info header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border">
            {effectiveAvatar ? (
              <img src={effectiveAvatar} alt={displayName} className="w-10 h-10 rounded-full object-cover avatar-ring" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500
                              flex items-center justify-center text-sm font-bold text-white avatar-ring">
                {getInitials(displayName)}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-100">{displayName}</p>
              <p className="text-xs text-slate-500">{user.role || 'Developer'}</p>
              <p className="text-xs text-brand-400 mt-0.5">{user.university || ''}</p>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {menuItems.map(({ icon: Icon, label, desc, action }) => (
              <button
                key={label}
                className="w-full flex items-start gap-3 px-4 py-2.5
                           hover:bg-surface-hover transition-colors group text-left"
                onClick={() => { setOpen(false); action?.() }}
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-brand-500/10 flex items-center
                                justify-center mt-0.5 group-hover:bg-brand-500/20 transition-colors">
                  <Icon size={13} className="text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                    {label}
                  </p>
                  <p className="text-[11px] text-slate-500">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Search bar ───────────────────────────────────────────────────────────────
function SearchBar() {
  const [focused, setFocused] = useState(false)
  return (
    <div
      className={`hidden md:flex items-center gap-2 rounded-xl px-3 py-2
                  bg-surface-card border transition-all duration-200
                  ${focused ? 'border-brand-500/60 shadow-glow-sm w-64' : 'border-surface-border w-48'}
                  `}
    >
      <Search size={14} className="text-slate-500 flex-shrink-0" />
      <input
        type="text"
        placeholder="Search projects, people…"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="bg-transparent text-sm text-slate-300 placeholder-slate-600
                   outline-none w-full"
      />
      <div className="flex-shrink-0 hidden lg:flex items-center gap-0.5
                      text-[10px] font-mono text-slate-600 border border-surface-border
                      rounded px-1 py-0.5">
        <Command size={9} /> K
      </div>
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar({ pageTitle = 'Dashboard', onMenuToggle }) {
  return (
    <header
      className="fixed top-0 right-0 left-0 lg:left-64 z-30
                 border-b border-surface-border
                 bg-[rgba(10,10,20,0.88)] backdrop-blur-xl"
    >
      <div className="px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Left: hamburger (mobile) + page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl
                         text-slate-400 hover:text-slate-100 hover:bg-surface-hover transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">{pageTitle}</h1>
          </div>

          {/* Right: search + notifications + avatar */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <SearchBar />
            <NotifBell />
            <div className="hidden sm:block w-px h-6 bg-surface-border mx-1" />
            <AvatarDropdown />
          </div>

        </div>
      </div>
    </header>
  )
}
