import { useState, useRef, useEffect } from 'react'
import {
  User, Camera, Save, Sun, Moon, Bell, Lock, Palette,
  Eye, EyeOff, CheckCircle2, AlertCircle, Trash2,
  Github, Linkedin, Mail, Code2,
} from 'lucide-react'
import { useApp, getInitials, getEffectiveAvatar } from '../context/AppContext'

// ─── Tab Button ───────────────────────────────────────────────────────────────
function Tab({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 whitespace-nowrap
                  ${active
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'text-slate-500 hover:text-slate-100 hover:bg-surface-hover border border-transparent'
                  }`}
    >
      <Icon size={15} />
      {label}
    </button>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, sub, children }) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="border-b border-surface-border pb-3">
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── Label + Input ────────────────────────────────────────────────────────────
function Field({ label, sub, children }) {
  return (
    <div className="space-y-1.5">
      <div>
        <label className="text-xs font-medium text-slate-400">{label}</label>
        {sub && <p className="text-[11px] text-slate-600 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── Toast notification ───────────────────────────────────────────────────────
function Toast({ message, type = 'success' }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
      <div className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border shadow-2xl backdrop-blur-md whitespace-nowrap
                       ${type === 'success'
                         ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-emerald-900/40'
                         : 'bg-red-950/80 border-red-500/50 text-red-300 shadow-red-900/40'}`}>
        {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  )
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab() {
  const { state, dispatch } = useApp()
  const profile = state.profile
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    name:       profile.name       || '',
    username:   profile.username   || '',
    email:      profile.email      || '',
    bio:        profile.bio        || '',
    role:       profile.role       || '',
    university: profile.university || '',
    links: {
      github:   profile.links?.github   || '',
      linkedin: profile.links?.linkedin || '',
      gmail:    profile.links?.gmail    || '',
      leetcode: profile.links?.leetcode || '',
    },
  })
  const [toast, setToast] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || null)
  const [uploading, setUploading] = useState(false)

  // Sync if profile changes externally
  useEffect(() => {
    setAvatarPreview(profile.avatar || null)
    setForm({
      name:       profile.name       || '',
      username:   profile.username   || '',
      email:      profile.email      || '',
      bio:        profile.bio        || '',
      role:       profile.role       || '',
      university: profile.university || '',
      links: {
        github:   profile.links?.github   || '',
        linkedin: profile.links?.linkedin || '',
        gmail:    profile.links?.gmail    || '',
        leetcode: profile.links?.leetcode || '',
      },
    })
  }, [profile])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file.', 'error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5 MB.', 'error')
      return
    }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target.result
      setAvatarPreview(base64)
      dispatch({ type: 'UPDATE_PROFILE', payload: { avatar: base64 } })
      setUploading(false)
      showToast('Profile photo updated!')
    }
    reader.readAsDataURL(file)
  }

  const removeAvatar = () => {
    setAvatarPreview(null)
    dispatch({ type: 'UPDATE_PROFILE', payload: { avatar: null } })
    showToast('Profile photo removed.')
  }

  const handleSave = () => {
    const username = form.username.startsWith('@') ? form.username : form.username ? `@${form.username}` : ''
    dispatch({ type: 'UPDATE_PROFILE', payload: { ...form, username } })
    showToast('Profile saved successfully!')
  }

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <Section title="Profile Photo" sub="Upload a profile picture visible to your collaborators.">
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            {(avatarPreview || getEffectiveAvatar(profile)) ? (
              <img
                src={avatarPreview || getEffectiveAvatar(profile)}
                alt="Profile"
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-brand-500/40"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-blue-600
                              flex items-center justify-center text-2xl font-bold text-white
                              ring-2 ring-brand-500/40">
                {getInitials(form.name || 'U')}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="btn-primary text-xs py-2 px-3"
            >
              <Camera size={13} /> Upload Photo
            </button>
            {avatarPreview && (
              <button
                onClick={removeAvatar}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 size={12} /> Remove Photo
              </button>
            )}
            <p className="text-[10px] text-slate-600">JPG, PNG or WebP · Max 5 MB</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </Section>

      {/* Info */}
      <Section title="Personal Information" sub="Update your name and public profile details.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name">
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Jane Doe"
              className="input-themed"
            />
          </Field>
          <Field label="Username">
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="@username"
              className="input-themed"
            />
          </Field>
          <Field label="Email Address">
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              className="input-themed"
            />
          </Field>
          <Field label="Role / Title">
            <input
              type="text"
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              placeholder="e.g. Full-Stack Developer"
              className="input-themed"
            />
          </Field>
          <Field label="University / College" sub="Your institution name">
            <input
              type="text"
              value={form.university}
              onChange={e => setForm(f => ({ ...f, university: e.target.value }))}
              placeholder="e.g. MIT"
              className="input-themed"
            />
          </Field>
        </div>
        <Field label="Bio">
          <textarea
            rows={3}
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Tell other developers about yourself…"
            className="input-themed resize-none"
          />
        </Field>
        <div className="flex justify-end">
          <button onClick={handleSave} className="btn-primary">
            <Save size={15} /> Save Profile
          </button>
        </div>
      </Section>

      {/* Social Links */}
      <Section title="Social Links" sub="Add your profile URLs so collaborators can connect with you.">
        <div className="space-y-3">
          {[
            { key: 'github',   label: 'GitHub URL',   Icon: Github,   placeholder: 'https://github.com/username',          color: 'text-slate-300'  },
            { key: 'linkedin', label: 'LinkedIn URL', Icon: Linkedin, placeholder: 'https://linkedin.com/in/username',       color: 'text-blue-400'   },
            { key: 'gmail',    label: 'Gmail Address',Icon: Mail,     placeholder: 'yourname@gmail.com',                   color: 'text-red-400'    },
            { key: 'leetcode', label: 'LeetCode URL', Icon: Code2,    placeholder: 'https://leetcode.com/u/username', color: 'text-yellow-400' },
          ].map(({ key, label, Icon, placeholder, color }) => (
            <Field key={key} label={label}>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Icon size={14} className={color} />
                </div>
                <input
                  type="text"
                  value={form.links[key]}
                  onChange={e => setForm(f => ({ ...f, links: { ...f.links, [key]: e.target.value } }))}
                  placeholder={placeholder}
                  className="input-themed pl-8"
                />
              </div>
            </Field>
          ))}
        </div>
        <div className="flex justify-end items-center gap-4">
          {toast && (
            <span className={`flex items-center gap-1.5 text-sm font-medium ${toast.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
              {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
              {toast.message}
            </span>
          )}
          <button onClick={handleSave} className="btn-primary">
            <Save size={15} /> Save Links
          </button>
        </div>
      </Section>

    </div>
  )
}

// ─── Appearance Tab ───────────────────────────────────────────────────────────
function AppearanceTab() {
  const { state, dispatch } = useApp()
  const theme = state.theme
  const [toast, setToast] = useState(null)

  const setTheme = (t) => {
    dispatch({ type: 'SET_THEME', payload: t })
    setToast({ message: `Switched to ${t} mode.` })
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="space-y-4">
      <Section title="Theme" sub="Choose between dark and light mode. Applied instantly across the entire app.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Dark Theme */}
          <button
            onClick={() => setTheme('dark')}
            className={`relative rounded-xl border p-4 flex items-center gap-4 transition-all duration-200
                        ${theme === 'dark'
                          ? 'border-brand-500/60 bg-brand-500/10 shadow-glow-sm'
                          : 'border-surface-border hover:border-brand-500/30 hover:bg-surface-hover'
                        }`}
          >
            <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-700
                            flex items-center justify-center flex-shrink-0">
              <Moon size={20} className="text-slate-300" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-100">Dark Mode</p>
              <p className="text-xs text-slate-500 mt-0.5">Elegant dark interface</p>
            </div>
            {theme === 'dark' && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                <CheckCircle2 size={13} className="text-white" />
              </div>
            )}
          </button>

          {/* Light Theme */}
          <button
            onClick={() => setTheme('light')}
            className={`relative rounded-xl border p-4 flex items-center gap-4 transition-all duration-200
                        ${theme === 'light'
                          ? 'border-brand-500/60 bg-brand-500/10 shadow-glow-sm'
                          : 'border-surface-border hover:border-brand-500/30 hover:bg-surface-hover'
                        }`}
          >
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-200
                            flex items-center justify-center flex-shrink-0">
              <Sun size={20} className="text-amber-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-100">Light Mode</p>
              <p className="text-xs text-slate-500 mt-0.5">Clean bright interface</p>
            </div>
            {theme === 'light' && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                <CheckCircle2 size={13} className="text-white" />
              </div>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-hover border border-surface-border">
          <div>
            <p className="text-sm font-medium text-slate-200">Current Theme</p>
            <p className="text-xs text-slate-500 mt-0.5 capitalize">{theme} mode is active</p>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn-ghost flex items-center gap-2 text-xs"
          >
            {theme === 'dark' ? <><Sun size={14}/> Switch to Light</> : <><Moon size={14}/> Switch to Dark</>}
          </button>
        </div>
      </Section>
      {toast && <Toast message={toast.message} />}
    </div>
  )
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const [settings, setSettings] = useState({
    collabRequests: true,
    projectUpdates: true,
    messages:       true,
    announcements:  false,
    emailDigest:    false,
  })
  const [toast, setToast] = useState(null)

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }))

  const items = [
    { key: 'collabRequests', label: 'Collaboration Requests',  sub: 'When someone invites you to collaborate' },
    { key: 'projectUpdates', label: 'Project Updates',         sub: 'Activity in projects you are part of' },
    { key: 'messages',       label: 'Messages',               sub: 'New direct messages' },
    { key: 'announcements',  label: 'Platform Announcements', sub: 'DevConnect news and updates' },
    { key: 'emailDigest',    label: 'Weekly Email Digest',    sub: 'Summary email every Monday' },
  ]

  return (
    <div className="space-y-4">
      <Section title="Notification Preferences" sub="Control what notifications you receive.">
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.key} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-500">{item.sub}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200
                            ${settings[item.key] ? 'bg-brand-500' : 'bg-surface-border'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
                                  ${settings[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => { setToast({ message: 'Preferences saved!' }); setTimeout(() => setToast(null), 2500) }}
            className="btn-primary"
          >
            <Save size={15} /> Save Preferences
          </button>
        </div>
      </Section>
      {toast && <Toast message={toast.message} />}
    </div>
  )
}

// ─── Privacy Tab ──────────────────────────────────────────────────────────────
function PrivacyTab() {
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [toast, setToast] = useState(null)

  const handleChange = () => {
    if (!form.current) { setToast({ message: 'Enter current password.', type: 'error' }); return }
    if (form.next.length < 8) { setToast({ message: 'New password must be 8+ chars.', type: 'error' }); return }
    if (form.next !== form.confirm) { setToast({ message: 'Passwords do not match.', type: 'error' }); return }
    setForm({ current: '', next: '', confirm: '' })
    setToast({ message: 'Password updated!', type: 'success' })
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="space-y-4">
      <Section title="Password" sub="Keep your account secure by updating your password regularly.">
        <div className="space-y-3 max-w-sm">
          {[
            { key: 'current', label: 'Current Password' },
            { key: 'next',    label: 'New Password' },
            { key: 'confirm', label: 'Confirm New Password' },
          ].map(({ key, label }) => (
            <Field key={key} label={label}>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder="••••••••"
                  className="input-themed pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>
          ))}
          <button onClick={handleChange} className="btn-primary w-full justify-center">
            <Lock size={15} /> Update Password
          </button>
        </div>
      </Section>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

// ─── Main SettingsPage ────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile',       icon: User,    label: 'Profile'       },
  { id: 'appearance',    icon: Palette, label: 'Appearance'    },
  { id: 'notifications', icon: Bell,    label: 'Notifications' },
  { id: 'privacy',       icon: Lock,    label: 'Privacy'       },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="page-transition px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your profile, appearance and preferences.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 hscroll">
        {TABS.map(t => (
          <Tab key={t.id} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} {...t} />
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'profile'       && <ProfileTab />}
      {activeTab === 'appearance'    && <AppearanceTab />}
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'privacy'       && <PrivacyTab />}
    </div>
  )
}
