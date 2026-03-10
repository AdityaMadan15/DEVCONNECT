import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DevConnectLogo from '../components/DevConnectLogo'

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home',      active: true  },
  { icon: '📦', label: 'Projects',  active: false },
  { icon: '👥', label: 'Teams',     active: false },
  { icon: '💬', label: 'Messages',  active: false },
  { icon: '🏆', label: 'Rankings',  active: false },
]

const FEED = [
  { avatar: 'R', name: 'Riya Patel',  role: 'ML Engineer',   msg: 'Looking for a UI/UX dev to join our hackathon team this weekend 🚀',   time: '2m ago',  skills: ['ML','Python']     },
  { avatar: 'S', name: 'Saurav M.',   role: 'Backend Dev',   msg: 'Just shipped v2 of my REST API boilerplate — open-source, check it out!', time: '18m ago', skills: ['Node.js','MongoDB']},
  { avatar: 'A', name: 'Ananya K.',   role: 'Full Stack Dev',msg: 'Anyone building with Next.js 14? Would love to collaborate on a SaaS idea.', time: '1h ago',  skills: ['React','Next.js'] },
]

const SUGGESTED = [
  { avatar: 'K', name: 'Kartik B.',  role: 'DevOps · CSE 3rd',    skills: ['Docker','AWS'],        match: 92 },
  { avatar: 'P', name: 'Priya S.',   role: 'Frontend · IT 2nd',   skills: ['React','TailwindCSS'], match: 88 },
  { avatar: 'M', name: 'Mihail T.',  role: 'AI/ML · CSE 4th',     skills: ['Python','PyTorch'],    match: 85 },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const [user, setUser]           = useState(null)
  const [loggingOut, setLogging]  = useState(false)
  const [navActive, setNavActive] = useState('Home')
  const [toast, setToast]         = useState('')
  const [logoAnimated, setLogoAnimated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('dc_user')
    if (!stored) { navigate('/login', { replace: true }); return }
    setUser(JSON.parse(stored))
    // Trigger logo animation on mount, then disable after 2 seconds
    setTimeout(() => setLogoAnimated(true), 2000)
  }, [navigate])

  const handleLogout = () => {
    setLogging(true)
    setTimeout(() => {
      localStorage.removeItem('dc_user')
      window.dispatchEvent(new CustomEvent('dc_local_login'))
      navigate('/login', { replace: true })
    }, 900)
  }

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  if (!user) return null

  const initials = (user.fullName || user.email || 'U')
    .split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning,'
    if (hour < 18) return 'Good afternoon,'
    return 'Good evening,'
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col relative overflow-hidden">
      {/* BG blobs */}
      <div className="fixed top-[-8%] left-[-8%] w-[420px] h-[420px] bg-cyan-500/20 rounded-full blur-[130px] animate-blob pointer-events-none"/>
      <div className="fixed bottom-[-10%] right-[-5%] w-[350px] h-[350px] bg-blue-500/15 rounded-full blur-[110px] animate-blob pointer-events-none" style={{animationDelay:'2.5s'}}/>
      <div className="fixed top-[40%] left-[30%] w-[260px] h-[260px] bg-blue-500/10 rounded-full blur-[90px] animate-blob pointer-events-none" style={{animationDelay:'1.2s'}}/>
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none"/>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm px-5 py-2.5 rounded-xl shadow-xl" style={{animation:'slideUp .35s ease both'}}>
          {toast}
        </div>
      )}

      {/* ─── Top nav ─── */}
      <header className="z-20 border-b border-white/[0.06] backdrop-blur-xl sticky top-0" style={{background:'rgba(2,6,23,0.8)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <DevConnectLogo size="sm" animate={!logoAnimated} />
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV_ITEMS.map(({ icon, label }) => (
              <button key={label} onClick={() => { setNavActive(label); if (label !== 'Home') showToast(`${label} — coming soon!`) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  navActive === label ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                }`}>
                <span className="text-sm">{icon}</span>{label}
              </button>
            ))}
          </nav>

          {/* Right */}
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => showToast('Notifications — coming soon!')}
              className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full"/>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white select-none shadow-lg shadow-cyan-500/20">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight">{user.fullName || 'Developer'}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{user.branch || 'Campus Dev'}</p>
              </div>
            </div>

            <button onClick={handleLogout} disabled={loggingOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/8 border border-transparent hover:border-red-500/20 transition-all duration-200 disabled:opacity-50">
              {loggingOut ? (
                <svg className="w-4 h-4 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  <span className="hidden sm:block">Logout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">

        {/* Hero greeting */}
        <div className="glass rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4" style={{animation:'slideUp .4s ease both'}}>
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-2xl font-extrabold text-white shadow-xl shadow-cyan-500/20 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-cyan-400/80 mb-0.5">{getGreeting()}</p>
            <h1 className="text-2xl font-extrabold text-white mb-1">
              {user.fullName || 'Developer'} 👋
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              {[user.branch, user.year].filter(Boolean).join(' · ') || 'Full-Stack Developer'}
            </p>
            {user.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {user.skills.map(s => (
                  <span key={s} className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            )}
          </div>
          <div className="hidden sm:flex flex-col items-end gap-2 flex-shrink-0">
            <div className="text-right">
              <p className="text-2xl font-extrabold text-white">0</p>
              <p className="text-xs text-slate-500">Projects</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-white">Community Feed</h2>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>Live
              </span>
            </div>

            {/* Post input */}
            <div className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {initials}
              </div>
              <button onClick={() => showToast('Post feature — coming soon!')}
                className="flex-1 text-left text-sm text-slate-500 bg-white/[0.04] border border-white/10 hover:border-white/20 rounded-lg px-3.5 py-2 transition-colors">
                Share something with the community…
              </button>
            </div>

            {/* Posts */}
            {FEED.map((p, i) => (
              <div key={i} className="glass rounded-xl p-4 hover:border-white/15 transition-colors" style={{animation:`slideUp .4s ${i*0.07+0.1}s ease both`}}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {p.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{p.name}</span>
                      <span className="text-xs text-slate-500">{p.role}</span>
                      <span className="text-xs text-slate-600 ml-auto">{p.time}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">{p.msg}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.skills.map(s => (
                        <span key={s} className="text-[10px] bg-white/[0.03] text-slate-500 border border-white/[0.06] px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-3 pt-3 border-t border-white/[0.06]">
                  {['👍 Like','💬 Reply','🔗 Share'].map(a => (
                    <button key={a} onClick={() => showToast(`${a.split(' ')[1]} — coming soon!`)}
                      className="text-[11px] text-slate-600 hover:text-slate-300 transition-colors">{a}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Stats */}
            <div className="glass rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Your Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                {[{v:'0',l:'Projects'},{v:'0',l:'Teammates'},{v:'0',l:'Likes',},{v:user.skills?.length||0,l:'Skills'}].map(({v,l}) => (
                  <div key={l} className="bg-white/[0.03] rounded-lg p-2.5 text-center border border-white/[0.06]">
                    <p className="text-xl font-extrabold text-white">{v}</p>
                    <p className="text-[10px] text-slate-500">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested */}
            <div className="glass rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Suggested Teammates</h3>
              <div className="space-y-3">
                {SUGGESTED.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {s.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white">{s.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{s.role}</p>
                      <div className="flex gap-1 mt-0.5">
                        {s.skills.map(sk => (
                          <span key={sk} className="text-[9px] text-slate-600 border border-white/[0.07] px-1.5 py-px rounded-full">{sk}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] font-bold text-cyan-400">{s.match}%</p>
                      <p className="text-[9px] text-slate-600">match</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => showToast('Discover — coming soon!')}
                className="w-full mt-3 text-xs text-slate-600 hover:text-cyan-400 transition-colors py-1.5 border border-white/[0.06] hover:border-cyan-500/30 rounded-lg">
                Discover more →
              </button>
            </div>

            {/* Quick actions */}
            <div className="glass rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { icon:'📦', label:'Create a Project' },
                  { icon:'👥', label:'Find a Team'      },
                  { icon:'✏️', label:'Edit Profile'     },
                ].map(({ icon, label }) => (
                  <button key={label} onClick={() => showToast(`${label} — coming soon!`)}
                    className="w-full flex items-center gap-2.5 text-left text-xs text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/15 px-3 py-2.5 rounded-lg transition-all">
                    <span>{icon}</span>{label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-[#020617]/95 backdrop-blur-sm border-t border-white/[0.06] flex">
        {NAV_ITEMS.map(({ icon, label }) => (
          <button key={label} onClick={() => { setNavActive(label); if (label !== 'Home') showToast(`${label} — coming soon!`) }}
            className={`flex-1 flex flex-col items-center justify-center gap-px py-3 text-[9px] font-medium transition-colors ${navActive === label ? 'text-cyan-400' : 'text-slate-600'}`}>
            <span className="text-base">{icon}</span>{label}
          </button>
        ))}
      </nav>
    </div>
  )
}
