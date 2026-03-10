import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DevConnectLogo from '../components/DevConnectLogo'
import { useAuth } from '../context/AuthContext'

/* ─────── Icons ─────── */
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
)
const EyeIcon = ({ open }) => open ? (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
function Spinner({ white }) {
  return (
    <svg className={`w-5 h-5 animate-spin ${white ? 'text-white' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  )
}

/* ─────── OAuth ID Modal ─────── */
const PROVIDER_CFG = {
  github: {
    label: 'GitHub',
    field: 'GitHub Username',
    placeholder: 'e.g. octocat',
    inputType: 'text',
    validate: v => v.trim().length >= 1 && /^[a-zA-Z0-9-]+$/.test(v.trim()),
    errorMsg: 'Enter a valid GitHub username (letters, numbers, hyphens)',
    icon: <GitHubIcon/>,
    color: 'from-[#161b22] to-[#21262d]',
  },
  google: {
    label: 'Google',
    field: 'Google Email',
    placeholder: 'you@gmail.com',
    inputType: 'email',
    validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    errorMsg: 'Enter a valid Google email address',
    icon: <GoogleIcon/>,
    color: 'from-[#1a1a2e] to-[#16213e]',
  },
  apple: {
    label: 'Apple',
    field: 'Apple ID (Email)',
    placeholder: 'you@icloud.com',
    inputType: 'email',
    validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    errorMsg: 'Enter a valid Apple ID email address',
    icon: <AppleIcon/>,
    color: 'from-[#1c1c1e] to-[#2c2c2e]',
  },
}

function OAuthModal({ provider, onConfirm, onClose, loading, apiError }) {
  const [value, setValue] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [errs, setErrs] = useState({})
  const cfg = PROVIDER_CFG[provider]
  if (!cfg) return null

  const submit = e => {
    e.preventDefault()
    const newErrs = {}
    if (!cfg.validate(value)) newErrs.id = cfg.errorMsg
    if (!password) newErrs.password = 'Password is required'
    else if (password.length < 6) newErrs.password = 'Password must be at least 6 characters'
    if (Object.keys(newErrs).length) { setErrs(newErrs); return }
    setErrs({})
    onConfirm(value.trim(), password)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)'}}>
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#020617] shadow-2xl p-6" style={{animation:'slideUp .25s ease both'}}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${cfg.color} border border-white/10`}>
            {cfg.icon}
          </div>
          <div>
            <p className="text-sm font-bold text-white">Sign in with {cfg.label}</p>
            <p className="text-[11px] text-slate-500">Enter your {cfg.label} account details</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* ID / Username / Email */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{cfg.field}</label>
            <input
              autoFocus
              type={cfg.inputType}
              value={value}
              onChange={e => { setValue(e.target.value); setErrs(p => ({...p, id:''})) }}
              placeholder={cfg.placeholder}
              className={`w-full rounded-xl border px-4 py-3 bg-white/[0.04] text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 ${
                errs.id ? 'border-red-500/60' : 'border-white/10 focus:border-cyan-500/70 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]'
              }`}
            />
            {errs.id && <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1"><span>⚠</span>{errs.id}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
            <div className={`flex items-center rounded-xl border transition-all duration-200 ${
              errs.password ? 'border-red-500/60 bg-red-500/5' : 'border-white/10 bg-white/[0.04] focus-within:border-cyan-500/70 focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]'
            }`}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setErrs(p => ({...p, password:''})) }}
                placeholder="••••••••••"
                className="w-full bg-transparent py-3 px-4 text-sm text-white placeholder-slate-600 outline-none"
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="pr-3.5 pl-2 text-slate-500 hover:text-slate-300 transition-colors">
                <EyeIcon open={showPw}/>
              </button>
            </div>
            {errs.password && <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1"><span>⚠</span>{errs.password}</p>}
          </div>

          {apiError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl px-3 py-2.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {apiError}
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
            style={{background:'linear-gradient(135deg,#22d3ee 0%,#3b82f6 50%,#8b5cf6 100%)'}}>
            {loading ? <Spinner white/> : `Continue with ${cfg.label}`}
          </button>
        </form>

        <p className="text-[10px] text-slate-600 text-center mt-4">Your credentials are never stored on our servers.</p>
      </div>
    </div>
  )
}

/* ─────── Left panel ─────── */
const features = [
  { icon: '⚡', title: 'Real-time Collaboration', desc: 'Socket.io powered team workspaces' },
  { icon: '🔐', title: 'Secure by Design',        desc: 'JWT auth + bcrypt encryption' },
  { icon: '🚀', title: 'Project Showcase',        desc: 'Portfolio meets open-source culture' },
  { icon: '🤝', title: 'Find Teammates',          desc: 'Match by skills, branch & year' },
]
const terminalLines = [
  { delay: 0,    text: '$ devconnect init',         color: 'text-emerald-400' },
  { delay: 600,  text: '  ✓ Auth system ready',     color: 'text-slate-400'  },
  { delay: 1200, text: '  ✓ Socket.io connected',   color: 'text-slate-400'  },
  { delay: 1800, text: '  ✓ MongoDB Atlas synced',  color: 'text-slate-400'  },
  { delay: 2400, text: '  ✓ Cloudinary configured', color: 'text-slate-400'  },
  { delay: 3000, text: '  ▶ Ready on :5173',        color: 'text-cyan-400' },
]

function TerminalCard() {
  const [visible, setVisible] = useState([])
  useEffect(() => {
    const timers = terminalLines.map(({ delay }, i) =>
      setTimeout(() => setVisible(p => [...p, i]), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])
  return (
    <div className="bg-[#0d0d1a] border border-white/[0.08] rounded-xl p-4 font-mono text-xs shadow-2xl">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"/>
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"/>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"/>
        <span className="ml-2 text-[9px] text-slate-600">devconnect — bash</span>
      </div>
      {terminalLines.map((line, i) => (
        <div key={i} className={`leading-6 transition-opacity duration-300 ${visible.includes(i) ? 'opacity-100' : 'opacity-0'} ${line.color}`}>
          {line.text}
          {i === terminalLines.length - 1 && visible.includes(i) && (
            <span className="ml-0.5 inline-block w-1.5 h-3.5 bg-cyan-400 align-middle animate-pulse"/>
          )}
        </div>
      ))}
    </div>
  )
}

function LeftPanel() {
  return (
    <div
      className="hidden lg:flex flex-col justify-between w-[52%] min-h-screen relative overflow-hidden p-12"
      style={{ background: 'linear-gradient(145deg,#020617 0%,#0a1628 55%,#020617 100%)' }}
    >
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none"/>
      <div className="absolute top-[-8%] left-[-8%] w-[420px] h-[420px] bg-cyan-500/20 rounded-full blur-[130px] animate-blob pointer-events-none"/>
      <div className="absolute bottom-[-10%] right-[-5%] w-[350px] h-[350px] bg-blue-500/15 rounded-full blur-[110px] animate-blob pointer-events-none" style={{animationDelay:'2.5s'}}/>
      <div className="absolute top-[40%] left-[30%] w-[260px] h-[260px] bg-blue-500/10 rounded-full blur-[90px] animate-blob pointer-events-none" style={{animationDelay:'1.2s'}}/>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-16">
          <DevConnectLogo size="sm" animate={false} />
        </div>

        <div className="mb-12">
          <p className="text-xs font-mono text-cyan-400/80 mb-3 tracking-widest uppercase">Student developer platform</p>
          <h1 className="text-4xl font-extrabold text-white leading-[1.15] mb-4">
            Where student<br/>
            <span className="text-gradient">developers thrive.</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Build real projects, find the right teammates and grow your engineering career — all in one place.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 group">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.07] text-base group-hover:border-cyan-500/30 transition-colors">
                {icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-white/90">{title}</p>
                <p className="text-xs text-slate-500 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <TerminalCard/>
      </div>

      <div className="relative z-10 flex items-center gap-8 pt-8 border-t border-white/[0.06]">
        {[{v:'1.2K+',l:'Students'},{v:'200+',l:'Projects'},{v:'50+',l:'Teams'}].map(({v,l}) => (
          <div key={l}><p className="text-2xl font-extrabold text-white">{v}</p><p className="text-xs text-slate-500">{l}</p></div>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-600">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>Live now
        </div>
      </div>
    </div>
  )
}

/* ─────── Validation helpers ─────── */
function validateEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

/* ─────── Main component ─────── */
export default function LoginPage() {
  const navigate = useNavigate()
  const { user, loginWithGithub, loginWithGoogle, handleAuthSuccess, error: authError, isAuthenticated } = useAuth()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(null)
  const [focused, setFocused]   = useState('')
  const [oauthModal, setOauthModal] = useState(null)
  const [oauthError, setOauthError] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated || localStorage.getItem('dc_user')) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Listen for GitHub/Google OAuth success from popup
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return
      if (event.data.type === 'AUTH_SUCCESS') {
        const token = localStorage.getItem('authToken')
        if (token) {
          handleAuthSuccess(token).then(() => navigate('/dashboard'))
        } else {
          navigate('/dashboard')
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [navigate, handleAuthSuccess])

  const set = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: '' }))
    setApiError('')
  }
  const fo = name => ({ onFocus: () => setFocused(name), onBlur: () => setFocused('') })

  const validate = () => {
    const errs = {}
    if (!form.email)                 errs.email    = 'Email is required'
    else if (!validateEmail(form.email)) errs.email = 'Enter a valid email address'
    if (!form.password)              errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    return errs
  }

  const handleSubmit = e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading('email')
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('dc_users') || '[]')
      const match = users.find(u => u.email === form.email && !u.provider)
      if (!match) {
        setApiError('No account found with this email. Please register first.')
        setLoading(null)
        return
      }
      if (match.password !== form.password) {
        setApiError('Incorrect password. Please try again.')
        setLoading(null)
        return
      }
      const { password: _pw, ...sessionUser } = match
      localStorage.setItem('dc_user', JSON.stringify(sessionUser))
      window.dispatchEvent(new CustomEvent('dc_local_login'))
      setLoading(null)
      navigate('/dashboard')
    }, 1200)
  }

  const handleOAuth = async (provider) => {
    if (provider === 'github') {
      setLoading('github')
      await loginWithGithub()
      // Loading state will be cleared when popup closes or on success
      setTimeout(() => setLoading(null), 1000)
    } else if (provider === 'google') {
      setLoading('google')
      await loginWithGoogle()
      setTimeout(() => setLoading(null), 1000)
    } else {
      setApiError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth is not yet implemented.`)
    }
  }

  const inputClass = name => `relative flex items-center rounded-xl border transition-all duration-200 ${
    errors[name]
      ? 'border-red-500/60 bg-red-500/5'
      : focused === name
        ? 'border-cyan-500/70 bg-cyan-500/5 shadow-[0_0_0_3px_rgba(34,211,238,0.12)]'
        : 'border-white/10 bg-white/[0.04] hover:border-white/20'
  }`

  return (
    <div className="flex min-h-screen">
      <LeftPanel/>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center bg-[#020617] overflow-y-auto py-12 px-6 relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none"/>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/8 rounded-full blur-[80px] pointer-events-none"/>

        <div className="relative w-full max-w-[400px]" style={{animation:'slideUp .45s ease both'}}>

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-6">
            <DevConnectLogo size="sm" animate={false} />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-white">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your developer workspace</p>
          </div>

          {/* API error banner */}
          {apiError && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-0.5">Email Address</label>
              <div className={inputClass('email')}>
                <div className="pl-3.5 pr-2 text-slate-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <input type="email" name="email" value={form.email} onChange={set} {...fo('email')}
                  placeholder="you@engineering.edu"
                  className="w-full bg-transparent py-3 pr-4 text-sm text-white placeholder-slate-600 outline-none"/>
              </div>
              {errors.email && <p className="text-[11px] text-red-400 mt-1.5 ml-0.5 flex items-center gap-1"><span>⚠</span>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-400 ml-0.5">Password</label>
                <Link to="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className={inputClass('password')}>
                <div className="pl-3.5 pr-2 text-slate-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={set} {...fo('password')}
                  placeholder="••••••••••"
                  className="w-full bg-transparent py-3 text-sm text-white placeholder-slate-600 outline-none"/>
                <button type="button" onClick={() => setShowPass(v => !v)} className="pr-3.5 pl-2 text-slate-500 hover:text-slate-300 transition-colors">
                  <EyeIcon open={showPass}/>
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-400 mt-1.5 ml-0.5 flex items-center gap-1"><span>⚠</span>{errors.password}</p>}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 accent-cyan-500"/>
              <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Keep me signed in</span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={!!loading}
              className="relative w-full py-3 px-4 rounded-xl font-semibold text-sm text-white overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
              style={{background:'linear-gradient(135deg,#22d3ee 0%,#3b82f6 50%,#8b5cf6 100%)'}}>
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"/>
              <span className="relative flex items-center justify-center gap-2">
                {loading === 'email'
                  ? <Spinner white/>
                  : <><span>Sign In</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12"/></svg></>
                }
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mt-6 mb-5">
            <div className="flex-1 h-px bg-white/10"/>
            <span className="text-[10px] font-mono text-slate-500">or continue with</span>
            <div className="flex-1 h-px bg-white/10"/>
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { id:'github', label:'GitHub', Ico:GitHubIcon, bg:'bg-[#161b22] hover:bg-[#1a2130]' },
              { id:'google', label:'Google', Ico:GoogleIcon, bg:'bg-white/[0.04] hover:bg-white/[0.08]' },
              { id:'apple',  label:'Apple',  Ico:AppleIcon,  bg:'bg-white/[0.04] hover:bg-white/[0.08]' },
            ].map(({ id, label, Ico, bg }) => (
              <button key={id} onClick={() => handleOAuth(id)} disabled={!!loading}
                className={`flex flex-col items-center justify-center gap-1.5 ${bg} border border-white/10 hover:border-white/25 text-white py-3.5 px-3 rounded-xl transition-all duration-200 disabled:opacity-60 hover:scale-[1.03] active:scale-95`}>
                {loading === id ? <Spinner/> : <><Ico/><span className="text-[9px] text-slate-400 font-medium">{label}</span></>}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500">
            New to DevConnect?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors underline underline-offset-2 decoration-cyan-400/40">
              Create your account
            </Link>
          </p>

          <div className="flex items-center justify-center gap-5 mt-8 flex-wrap">
            {['JWT Secured','OAuth 2.0','bcrypt Encrypted'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-slate-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 text-emerald-500/80">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
