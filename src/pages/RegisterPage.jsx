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
            <p className="text-sm font-bold text-white">Sign up with {cfg.label}</p>
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

/* ─────── Password strength ─────── */
function getStrength(pw) {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const sCfg = [
  { label:'Too short', bar:'bg-red-500',     txt:'text-red-400'     },
  { label:'Weak',      bar:'bg-orange-500',  txt:'text-orange-400'  },
  { label:'Fair',      bar:'bg-yellow-400',  txt:'text-yellow-400'  },
  { label:'Good',      bar:'bg-blue-400',    txt:'text-blue-400'    },
  { label:'Strong',    bar:'bg-emerald-500', txt:'text-emerald-400' },
]
function PasswordStrength({ password }) {
  if (!password) return null
  const score = getStrength(password)
  const c = sCfg[score]
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? c.bar : 'bg-white/10'}`}/>
        ))}
      </div>
      <p className={`text-[10px] font-medium ${c.txt}`}>{c.label}</p>
    </div>
  )
}

const SKILLS   = ['React','Node.js','Python','TypeScript','MongoDB','TailwindCSS','Next.js','GraphQL','AWS','Docker','C++','Java','Flutter','Firebase','Git']
const BRANCHES = ['CSE','IT','ECE','EEE','Mechanical','Civil','Data Science','AI/ML']
const YEARS    = ['1st Year','2nd Year','3rd Year','4th Year','5th Year']

/* ─────── Step indicator ─────── */
function StepIndicator({ step }) {
  const steps = ['Account','Profile','Done']
  return (
    <div className="flex items-center mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i+1 < step  ? 'bg-cyan-500 text-white' :
              i+1 === step ? 'bg-cyan-500 text-white ring-4 ring-cyan-500/25' :
              'bg-white/[0.06] text-slate-500 border border-white/10'
            }`}>
              {i+1 < step
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                : i+1
              }
            </div>
            <span className={`text-[9px] font-medium ${i+1 === step ? 'text-cyan-400' : 'text-slate-600'}`}>{s}</span>
          </div>
          {i < steps.length-1 && (
            <div className={`w-14 h-px mx-2 mb-3.5 transition-all duration-500 ${i+1 < step ? 'bg-cyan-500' : 'bg-white/10'}`}/>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─────── Input wrapper ─────── */
function InputRow({ label, icon, focused, name, error, children }) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-0.5">{label}</label>}
      <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
        error
          ? 'border-red-500/60 bg-red-500/5'
          : focused === name
            ? 'border-cyan-500/70 bg-cyan-500/5 shadow-[0_0_0_3px_rgba(34,211,238,0.1)]'
            : 'border-white/10 bg-white/[0.04] hover:border-white/20'
      }`}>
        {icon && <div className="pl-3.5 pr-2 text-slate-500 flex-shrink-0">{icon}</div>}
        {children}
      </div>
      {error && <p className="text-[11px] text-red-400 mt-1.5 ml-0.5 flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
  )
}

/* ─────── Left panel ─────── */
const perks = [
  { icon:'🎯', title:'Smart Matching',    desc:'AI-powered teammate suggestions based on your stack' },
  { icon:'📦', title:'Project Showcase',  desc:'Portfolio that gets you discovered by peers & recruiters' },
  { icon:'💬', title:'Real-time Rooms',   desc:'Socket.io powered team channels & DMs' },
  { icon:'🏆', title:'Dev Leaderboard',   desc:'Rise in rankings as you contribute and ship' },
]

function LeftPanel() {
  return (
    <div
      className="hidden lg:flex flex-col justify-between w-[52%] min-h-screen relative overflow-hidden p-12"
      style={{background:'linear-gradient(145deg,#020617 0%,#0a1628 55%,#020617 100%)'}}
    >
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none"/>
      <div className="absolute top-[-8%] right-[-8%] w-[420px] h-[420px] bg-cyan-500/20 rounded-full blur-[130px] animate-blob pointer-events-none"/>
      <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] bg-blue-500/15 rounded-full blur-[110px] animate-blob pointer-events-none" style={{animationDelay:'2s'}}/>
      <div className="absolute top-[35%] right-[15%] w-[250px] h-[250px] bg-blue-500/10 rounded-full blur-[80px] animate-blob pointer-events-none" style={{animationDelay:'1s'}}/>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-16">
          <DevConnectLogo size="sm" animate={false} />
        </div>

        <div className="mb-12">
          <p className="text-xs font-mono text-cyan-400/80 mb-3 tracking-widest uppercase">Join the community</p>
          <h1 className="text-4xl font-extrabold text-white leading-[1.15] mb-4">
            Build. Grow.<br/><span className="text-gradient">Together.</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Create your profile in 2 minutes and gain access to the most active campus developer network.
          </p>
        </div>

        <div className="space-y-4">
          {perks.map(({icon,title,desc}) => (
            <div key={title} className="flex items-start gap-3 group">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.07] text-base group-hover:border-cyan-500/30 transition-colors">{icon}</span>
              <div>
                <p className="text-sm font-semibold text-white/90">{title}</p>
                <p className="text-xs text-slate-500 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-8 pt-8 border-t border-white/[0.06]">
        {[{v:'1.2K+',l:'Students'},{v:'340+',l:'Projects'},{v:'80+',l:'Teams'}].map(({v,l}) => (
          <div key={l}><p className="text-2xl font-extrabold text-white">{v}</p><p className="text-xs text-slate-500">{l}</p></div>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-600">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>Live platform
        </div>
      </div>
    </div>
  )
}

/* ─────── Main ─────── */
export default function RegisterPage() {
  const navigate = useNavigate()
  const { loginWithGithub, loginWithGoogle, handleAuthSuccess, isAuthenticated } = useAuth()
  const [step, setStep]         = useState(1)
  const [focused, setFocused]   = useState('')
  const [loading, setLoading]   = useState(null)
  const [oauthModal, setOauthModal] = useState(null)
  const [oauthError, setOauthError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [skills, setSkills]     = useState([])
  const [errors, setErrors]     = useState({})
  const [form, setForm]         = useState({
    fullName:'', email:'', password:'', confirm:'', branch:'', year:'', bio:'',
  })

  const set = e => {
    setForm(p => ({...p, [e.target.name]: e.target.value}))
    setErrors(p => ({...p, [e.target.name]: ''}))
  }
  const fo = name => ({ onFocus: () => setFocused(name), onBlur: () => setFocused('') })

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
  const toggleSkill = s => setSkills(p => p.includes(s) ? p.filter(x => x !== s) : p.length < 8 ? [...p, s] : p)

  /* Step 1 validation */
  const validateStep1 = () => {
    const errs = {}
    if (!form.fullName.trim())            errs.fullName = 'Full name is required'
    if (!form.email.trim())               errs.email    = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password)                   errs.password = 'Password is required'
    else if (form.password.length < 8)   errs.password = 'Password must be at least 8 characters'
    else if (getStrength(form.password) < 2) errs.password = 'Password is too weak — add uppercase, numbers or symbols'
    if (!form.confirm)                    errs.confirm  = 'Please confirm your password'
    else if (form.password !== form.confirm) errs.confirm = "Passwords don't match"
    return errs
  }

  /* Step 2 validation */
  const validateStep2 = () => {
    const errs = {}
    if (!form.branch) errs.branch = 'Please select your branch'
    if (!form.year)   errs.year   = 'Please select your year'
    if (skills.length === 0) errs.skills = 'Select at least one skill'
    return errs
  }

  const handleNext = e => {
    e.preventDefault()
    const errs = validateStep1()
    if (!errs.email) {
      const users = JSON.parse(localStorage.getItem('dc_users') || '[]')
      if (users.find(u => u.email === form.email && !u.provider)) {
        errs.email = 'An account with this email already exists. Please sign in.'
      }
    }
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep(2)
    window.scrollTo({top:0,behavior:'smooth'})
  }

  const handleSubmit = e => {
    e.preventDefault()
    const errs = validateStep2()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading('submit')
    setTimeout(() => {
      const user = {
        fullName: form.fullName,
        email:    form.email,
        password: form.password,
        branch:   form.branch,
        year:     form.year,
        bio:      form.bio,
        skills,
        joinedAt: new Date().toISOString(),
      }
      const users = JSON.parse(localStorage.getItem('dc_users') || '[]')
      users.push(user)
      localStorage.setItem('dc_users', JSON.stringify(users))
      const { password: _pw, ...sessionUser } = user
      localStorage.setItem('dc_user', JSON.stringify(sessionUser))
      setLoading(null)
      setStep(3)
      setTimeout(() => navigate('/dashboard'), 2500)
    }, 1600)
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
      setOauthError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth is not yet implemented.`)
    }
  }

  /* ─── Step 3: Success screen ─── */
  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-cyan-500/12 rounded-full blur-[140px] pointer-events-none"/>
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"/>

        <div className="relative z-10 max-w-md w-full text-center" style={{animation:'slideUp .45s ease both'}}>
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-24 h-24 bg-cyan-500/20 rounded-full animate-ping" style={{animationDuration:'1.5s'}}/>
            <div className="absolute w-20 h-20 bg-cyan-500/10 rounded-full animate-pulse"/>
            <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-2">You're in! 🎉</h2>
          <p className="text-slate-400 text-sm mb-2 leading-relaxed">
            Welcome to DevConnect, <span className="text-cyan-400 font-semibold">{form.fullName}</span>.
          </p>
          <p className="text-slate-600 text-xs mb-8">Redirecting to your dashboard in a moment…</p>

          {/* Profile snapshot */}
          <div className="glass rounded-2xl p-6 mb-6 text-left">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-2xl font-extrabold text-white uppercase shadow-lg shadow-cyan-500/20">
                {form.fullName[0]}
              </div>
              <div>
                <p className="font-bold text-white">{form.fullName}</p>
                <p className="text-xs text-slate-400">{form.email}</p>
                <p className="text-xs text-slate-500 mt-0.5">{[form.branch,form.year].filter(Boolean).join(' · ')}</p>
              </div>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skills.map(s => (
                  <span key={s} className="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 px-2 py-0.5 rounded-full font-medium">{s}</span>
                ))}
              </div>
            )}
            {form.bio && <p className="text-xs text-slate-500 mt-3 border-t border-white/[0.07] pt-3 leading-relaxed">{form.bio}</p>}
          </div>

          <button onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:scale-[1.02] active:scale-95 transition-all duration-200"
            style={{background:'linear-gradient(135deg,#22d3ee 0%,#3b82f6 50%,#8b5cf6 100%)'}}>
            Go to Dashboard
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12"/>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  /* ─── Steps 1 & 2 ─── */
  return (
    <div className="flex min-h-screen">
      <LeftPanel/>

      <div className="flex-1 flex items-start lg:items-center justify-center bg-[#020617] overflow-y-auto py-10 px-6 relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"/>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/8 rounded-full blur-[80px] pointer-events-none"/>

        <div className="relative w-full max-w-[420px]" style={{animation:'slideUp .45s ease both'}}>

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-6">
            <DevConnectLogo size="sm" animate={false} />
          </div>

          <StepIndicator step={step}/>

          <div className="mb-7">
            <h2 className="text-2xl font-extrabold text-white">
              {step === 1 ? 'Create your account' : 'Complete your profile'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {step === 1 ? 'Step 1 of 2 — set up credentials' : 'Step 2 of 2 — tell the community about you'}
            </p>
          </div>

          {/* ════ STEP 1 ════ */}
          {step === 1 && (
            <div className="space-y-5">
              {/* OAuth */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  {id:'github',label:'GitHub',Ico:GitHubIcon,bg:'bg-[#161b22] hover:bg-[#1a2130]'},
                  {id:'google',label:'Google',Ico:GoogleIcon,bg:'bg-white/[0.04] hover:bg-white/[0.08]'},
                  {id:'apple', label:'Apple', Ico:AppleIcon, bg:'bg-white/[0.04] hover:bg-white/[0.08]'},
                ].map(({id,label,Ico,bg}) => (
                  <button key={id} onClick={() => handleOAuth(id)} disabled={!!loading}
                    className={`flex flex-col items-center justify-center gap-1.5 ${bg} border border-white/10 hover:border-white/25 text-white py-3 rounded-xl transition-all duration-200 disabled:opacity-60 hover:scale-[1.03] active:scale-95`}>
                    {loading === id ? <Spinner/> : <><Ico/><span className="text-[9px] text-slate-400 font-medium">{label}</span></>}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10"/>
                <span className="text-[10px] font-mono text-slate-500">or with email</span>
                <div className="flex-1 h-px bg-white/10"/>
              </div>

              <form onSubmit={handleNext} className="space-y-4" noValidate>
                <InputRow label="Full Name" icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                } focused={focused} name="fullName" error={errors.fullName}>
                  <input type="text" name="fullName" value={form.fullName} onChange={set} {...fo('fullName')}
                    placeholder="Alex Johnson"
                    className="w-full bg-transparent py-3 pr-4 text-sm text-white placeholder-slate-600 outline-none"/>
                </InputRow>

                <InputRow label="College Email" icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                } focused={focused} name="email" error={errors.email}>
                  <input type="email" name="email" value={form.email} onChange={set} {...fo('email')}
                    placeholder="you@engineering.edu"
                    className="w-full bg-transparent py-3 pr-4 text-sm text-white placeholder-slate-600 outline-none"/>
                </InputRow>

                <div>
                  <InputRow label="Password" icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  } focused={focused} name="password" error={errors.password}>
                    <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={set} {...fo('password')}
                      placeholder="Min 8 chars, include uppercase & number"
                      className="w-full bg-transparent py-3 text-sm text-white placeholder-slate-600 outline-none"/>
                    <button type="button" onClick={() => setShowPass(v => !v)} className="pr-3.5 pl-2 text-slate-500 hover:text-slate-300 transition-colors">
                      <EyeIcon open={showPass}/>
                    </button>
                  </InputRow>
                  <PasswordStrength password={form.password}/>
                </div>

                <div>
                  <InputRow label="Confirm Password" icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                  } focused={focused} name="confirm" error={errors.confirm}>
                    <input type={showConf ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={set} {...fo('confirm')}
                      placeholder="Same as above"
                      className="w-full bg-transparent py-3 text-sm text-white placeholder-slate-600 outline-none"/>
                    <button type="button" onClick={() => setShowConf(v => !v)} className="pr-3.5 pl-2 text-slate-500 hover:text-slate-300 transition-colors">
                      <EyeIcon open={showConf}/>
                    </button>
                  </InputRow>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  By creating an account you agree to our{' '}
                  <span className="text-cyan-400 cursor-pointer hover:text-cyan-300">Terms of Service</span> and{' '}
                  <span className="text-cyan-400 cursor-pointer hover:text-cyan-300">Privacy Policy</span>.
                </p>

                <button type="submit"
                  className="relative w-full py-3 rounded-xl font-semibold text-sm text-white overflow-hidden group"
                  style={{background:'linear-gradient(135deg,#22d3ee 0%,#3b82f6 50%,#8b5cf6 100%)'}}>
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"/>
                  <span className="relative flex items-center justify-center gap-2">
                    Continue to Profile
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 group-hover:translate-x-0.5 transition-transform">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12"/>
                    </svg>
                  </span>
                </button>
              </form>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Sign in</Link>
              </p>
            </div>
          )}

          {/* ════ STEP 2 ════ */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Branch + Year */}
              <div className="grid grid-cols-2 gap-3">
                {[{name:'branch',label:'Branch',opts:BRANCHES},{name:'year',label:'Year',opts:YEARS}].map(({name,label,opts}) => (
                  <div key={name}>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-0.5">{label}</label>
                    <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
                      errors[name]
                        ? 'border-red-500/60 bg-red-500/5'
                        : focused === name
                          ? 'border-cyan-500/70 bg-cyan-500/5'
                          : 'border-white/10 bg-white/[0.04] hover:border-white/20'
                    }`}>
                      <select name={name} value={form[name]} onChange={set} {...fo(name)}
                        className="w-full bg-transparent py-3 pl-3.5 pr-8 text-sm text-white outline-none appearance-none cursor-pointer">
                        <option value="" className="bg-[#0f0b1f]">Select</option>
                        {opts.map(o => <option key={o} value={o} className="bg-[#0f0b1f]">{o}</option>)}
                      </select>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="absolute right-3 w-3.5 h-3.5 text-slate-500 pointer-events-none">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                    {errors[name] && <p className="text-[11px] text-red-400 mt-1.5 ml-0.5 flex items-center gap-1"><span>⚠</span>{errors[name]}</p>}
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 ml-0.5">
                  Skills <span className="text-slate-600 font-normal">(up to 8 · {skills.length}/8)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SKILLS.map(s => {
                    const on = skills.includes(s)
                    return (
                      <button key={s} type="button" onClick={() => toggleSkill(s)}
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all duration-150 ${
                          on ? 'bg-cyan-500/25 border-cyan-500/55 text-cyan-300' : 'bg-white/[0.04] border-white/10 text-slate-500 hover:border-white/25 hover:text-slate-300'
                        }`}>
                        {on && <span className="mr-1 text-[9px] text-cyan-400">✓</span>}{s}
                      </button>
                    )
                  })}
                </div>
                {errors.skills && <p className="text-[11px] text-red-400 mt-2 ml-0.5 flex items-center gap-1"><span>⚠</span>{errors.skills}</p>}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-0.5">
                  Bio <span className="text-slate-600 font-normal">({form.bio.length}/200)</span>
                </label>
                <div className={`relative rounded-xl border transition-all duration-200 ${
                  focused === 'bio' ? 'border-cyan-500/70 bg-cyan-500/5' : 'border-white/10 bg-white/[0.04] hover:border-white/20'
                }`}>
                  <textarea name="bio" value={form.bio} onChange={set} {...fo('bio')}
                    maxLength={200} rows={3}
                    placeholder="e.g. Full-stack dev passionate about open source and hackathons..."
                    className="w-full bg-transparent p-3.5 text-sm text-white placeholder-slate-600 outline-none resize-none"/>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(1); setErrors({}) }}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 bg-white/[0.04] border border-white/10 hover:border-white/25 hover:text-white transition-all duration-200">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                  </svg>
                  Back
                </button>
                <button type="submit" disabled={!!loading}
                  className="relative flex-1 py-3 rounded-xl font-semibold text-sm text-white overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{background:'linear-gradient(135deg,#22d3ee 0%,#3b82f6 50%,#8b5cf6 100%)'}}>
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"/>
                  <span className="relative flex items-center justify-center gap-2">
                    {loading === 'submit'
                      ? <Spinner white/>
                      : <><span>Create Account</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></>
                    }
                  </span>
                </button>
              </div>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Sign in</Link>
              </p>
            </form>
          )}

          {/* Trust bar */}
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
