import { useState } from 'react'
import { Link } from 'react-router-dom'
import DevConnectLogo from '../components/DevConnectLogo'

function Spinner() {
  return (
    <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  )
}

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [focused, setFocused] = useState(false)

  const handleSubmit = e => {
    e.preventDefault()
    if (!email.trim()) return setError('Email is required')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address')
    setError('')
    setLoading(true)
    setTimeout(() => { setLoading(false); setSent(true) }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none"/>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none"/>
      <div className="absolute bottom-0 left-0 w-[300px] h-[250px] bg-blue-500/8 rounded-full blur-[100px] pointer-events-none"/>

      <div className="relative z-10 w-full max-w-sm" style={{animation:'slideUp .4s ease both'}}>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <DevConnectLogo size="md" animate={false} />
          </div>
          {!sent && (
            <>
              <h1 className="text-2xl font-extrabold text-white mb-1">Forgot Password</h1>
              <p className="text-sm text-slate-500 text-center leading-relaxed">
                Enter the email tied to your account and we'll send a reset link.
              </p>
            </>
          )}
        </div>

        {!sent ? (
          <div className="glass rounded-2xl p-6">
            <form onSubmit={handleSubmit} noValidate>
              {/* Field */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-0.5">Email Address</label>
                <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
                  error
                    ? 'border-red-500/60 bg-red-500/5'
                    : focused
                      ? 'border-cyan-500/70 bg-cyan-500/5 shadow-[0_0_0_3px_rgba(34,211,238,0.1)]'
                      : 'border-white/10 bg-white/[0.04] hover:border-white/20'
                }`}>
                  <div className="pl-3.5 pr-2 text-slate-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <input type="email" value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    placeholder="you@engineering.edu"
                    className="w-full bg-transparent py-3 pr-4 text-sm text-white placeholder-slate-600 outline-none"/>
                </div>
                {error && <p className="text-[11px] text-red-400 mt-1.5 ml-0.5 flex items-center gap-1"><span>⚠</span>{error}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="relative w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                style={{background:'linear-gradient(135deg,#22d3ee 0%,#3b82f6 50%,#8b5cf6 100%)'}}>
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"/>
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? <Spinner/> : (
                    <>
                      Send Reset Link
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 group-hover:translate-x-0.5 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12"/>
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

              <div className="flex items-center gap-3 mt-5">
              <div className="flex-1 h-px bg-white/[0.06]"/>
              <Link to="/login" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors font-medium">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
                Back to Login
              </Link>
              <div className="flex-1 h-px bg-white/[0.06]"/>
            </div>
          </div>
        ) : (
          /* Success state */
          <div className="glass rounded-2xl p-8 text-center" style={{animation:'slideUp .4s ease both'}}>
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute w-20 h-20 bg-cyan-500/15 rounded-full animate-ping" style={{animationDuration:'1.6s'}}/>
              <div className="absolute w-16 h-16 bg-cyan-500/10 rounded-full animate-pulse"/>
              <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-500/30">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0L9.75 14.5"/>
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-white mb-2">Check your inbox</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-1">We sent a password reset link to</p>
            <p className="text-sm font-semibold text-cyan-300 mb-5 break-all">{email}</p>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Didn't receive it? Check your spam folder or try again in a few minutes.
            </p>

            <div className="space-y-3">
              <button onClick={() => { setSent(false); setEmail('') }}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-slate-400 bg-white/[0.04] border border-white/10 hover:border-white/20 hover:text-white transition-all">
                Try another email
              </button>
              <Link to="/login"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{background:'linear-gradient(135deg,#22d3ee 0%,#3b82f6 50%,#8b5cf6 100%)'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
                Back to Login
              </Link>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-700 mt-6">
          © {new Date().getFullYear()} DevConnect · Campus Developer Network
        </p>
      </div>
    </div>
  )
}
