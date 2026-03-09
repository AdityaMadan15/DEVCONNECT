import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useAnimation,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion'
import DevConnectLogo from '../components/DevConnectLogo'
import SplashScreen   from '../components/SplashScreen'

/* ─────────────────────── helpers ─────────────────────── */

function useFadeUp(delay = 0) {
  const ref  = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return {
    ref,
    animate: inView ? 'visible' : 'hidden',
    variants: {
      hidden:  { opacity: 0, y: 32 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1], delay } },
    },
  }
}

/* animated counter ---------------------------------------- */
function Counter({ to, suffix = '', duration = 2 }) {
  const ref     = useRef(null)
  const inView  = useInView(ref, { once: true })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start   = 0
    const end   = to
    const step  = duration * 1000 / end
    const timer = setInterval(() => {
      start += 1
      setVal(start)
      if (start >= end) clearInterval(timer)
    }, step)
    return () => clearInterval(timer)
  }, [inView, to, duration])

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

/* tilt card ----------------------------------------------- */
function TiltCard({ children, className = '' }) {
  const ref = useRef(null)
  const x   = useMotionValue(0)
  const y   = useMotionValue(0)
  const sx  = useSpring(x, { stiffness: 300, damping: 30 })
  const sy  = useSpring(y, { stiffness: 300, damping: 30 })
  const rx  = useTransform(sy, [-0.5, 0.5], ['8deg', '-8deg'])
  const ry  = useTransform(sx, [-0.5, 0.5], ['-8deg', '8deg'])

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width  - 0.5)
    y.set((e.clientY - rect.top)  / rect.height - 0.5)
  }
  const handleLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────── data ────────────────────────── */

const NAV_LINKS = [
  { label: 'Features',     href: '#features'    },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Projects',     href: '#projects'     },
  { label: 'About',        href: '#about'        },
]

const STATS = [
  { value: 10000, suffix: '+', label: 'Projects Shared' },
  { value: 5000,  suffix: '+', label: 'Developers'       },
  { value: 500,   suffix: '+', label: 'Teams Created'    },
]

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M8 12h8M8 8h5M8 16h3"/>
      </svg>
    ),
    title: 'Project Showcase',
    desc:  'Publish your builds with rich descriptions, tech stacks, and live demo links. Get discovered by developers worldwide.',
    color: 'from-cyan-500/20 to-blue-500/10',
    border: 'hover:border-cyan-500/40',
    glow: 'rgba(34,211,238,0.15)',
    accent: 'text-cyan-400',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="9"  cy="7"  r="4"/><circle cx="17" cy="7" r="4"/>
        <path d="M1 21c0-4 3.6-7 8-7h6c4.4 0 8 3 8 7"/>
      </svg>
    ),
    title: 'Team Collaboration',
    desc:  'Form squads, assign roles, and iterate together. Request collaborators or join open projects seeking your expertise.',
    color: 'from-blue-500/20 to-indigo-500/10',
    border: 'hover:border-blue-500/40',
    glow: 'rgba(59,130,246,0.15)',
    accent: 'text-blue-400',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'Real-time Chat',
    desc:  'Message teammates instantly with threaded channels, code snippet sharing, and live project discussion rooms.',
    color: 'from-violet-500/20 to-purple-500/10',
    border: 'hover:border-violet-500/40',
    glow: 'rgba(139,92,246,0.15)',
    accent: 'text-violet-400',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    title: 'Resource Sharing',
    desc:  'Curate and share tutorials, docs, repos, and tools. Build a community knowledge base that levels everyone up.',
    color: 'from-pink-500/20 to-rose-500/10',
    border: 'hover:border-pink-500/40',
    glow: 'rgba(236,72,153,0.15)',
    accent: 'text-pink-400',
  },
]

const STEPS = [
  { num: '01', title: 'Create Profile',           desc: 'Set up your developer profile with skills, bio, and links to your work.' },
  { num: '02', title: 'Post Your Project',         desc: 'Showcase what you are building with a rich project page and demo link.' },
  { num: '03', title: 'Build With Developers',     desc: 'Find collaborators, join teams, and ship together with real-time chat.' },
]

/* ═══════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [splash,     setSplash]     = useState(true)
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Splash – sits on top until animation completes */}
      <AnimatePresence>
        {splash && <SplashScreen key="splash" onDone={() => setSplash(false)} />}
      </AnimatePresence>

      {/* Main page – fades in as splash exits */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: splash ? 0 : 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative min-h-screen bg-[#020617] text-slate-100 overflow-x-hidden"
      >
      {/* ── Global background ─────────────────────────── */}
      <BackgroundLayers />

      {/* ── Navbar ────────────────────────────────────── */}
      <Navbar scrolled={scrolled} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* ── Main content ──────────────────────────────── */}
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>

      <Footer />
      </motion.div>
    </>
  )
}

/* ─────────────────────── Background ──────────────────── */
function BackgroundLayers() {
  return (
    <>
      {/* Subtle grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Floating orbs */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full z-0"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none fixed bottom-[-20%] right-[-10%] w-[55vw] h-[55vw] rounded-full z-0"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none fixed top-[40%] left-[40%] w-[40vw] h-[40vw] rounded-full z-0"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)' }}
      />
    </>
  )
}

/* ─────────────────────── Navbar ──────────────────────── */
function Navbar({ scrolled, mobileOpen, setMobileOpen }) {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between rounded-2xl transition-all duration-300 ${
          scrolled
            ? 'bg-[#020617]/80 backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
            : 'bg-transparent'
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <DevConnectLogo size="sm" animate={false} />
        </Link>

        {/* Center links – desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative px-4 py-2 text-sm text-slate-400 font-medium rounded-xl transition-all duration-200
                         hover:text-slate-100 group"
            >
              {link.label}
              <span className="absolute inset-x-3 bottom-1 h-px bg-gradient-to-r from-cyan-400 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </a>
          ))}
        </nav>

        {/* Right – auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-xl border border-white/10
                       hover:border-white/20 hover:bg-white/5 transition-all duration-200"
          >
            Login
          </Link>
          <GradientButton to="/register" size="sm">
            Register
          </GradientButton>
        </div>

        {/* Hamburger – mobile */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1,  y: 0  }}
            exit={{    opacity: 0,  y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mx-4 mt-2 p-4 rounded-2xl bg-[#0f172a]/95 backdrop-blur-xl border border-white/[0.06]"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 px-4 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 mt-4 pt-4 border-t border-white/[0.06]">
              <Link to="/login"    className="flex-1 text-center py-2.5 text-sm rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-all">Login</Link>
              <Link to="/register" className="flex-1 text-center py-2.5 text-sm rounded-xl font-medium text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#06b6d4,#3b82f6,#8b5cf6)' }}>
                Register
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

/* ─────────────────────── Hero ────────────────────────── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-4 overflow-hidden">
      {/* Radial glow behind hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 60%, rgba(34,211,238,0.08) 0%, rgba(59,130,246,0.06) 40%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
        {/* ── Left copy ── */}
        <div className="text-center lg:text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1   }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-medium mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Now in Beta — Join the Community
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-bold leading-[1.08] tracking-tight"
          >
            <span className="block text-5xl sm:text-6xl lg:text-7xl text-white mb-2">
              Build Projects
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-7xl">
              <span
                style={{
                  background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 45%, #a855f7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Together.
              </span>
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-lg sm:text-xl font-semibold"
            style={{
              background: 'linear-gradient(90deg,#67e8f9,#818cf8,#c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Collaborate. Showcase. Ship.
          </motion.p>

          {/* Body text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-4 text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0"
          >
            DevConnect is a collaboration platform where developers showcase projects,
            find teammates, chat in real time, and share technical resources.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start"
          >
            <GradientButton to="/register">
              Get Started
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </GradientButton>

            <Link
              to="/"
              className="group flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-slate-300 border border-white/10
                         hover:border-white/25 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              Explore Projects
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </motion.div>

          {/* Social proof mini */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-10 flex items-center gap-4 justify-center lg:justify-start"
          >
            <div className="flex -space-x-2">
              {['#22d3ee','#3b82f6','#8b5cf6','#ec4899','#f59e0b'].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-[#020617] flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: `radial-gradient(circle, ${c}, ${c}88)` }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              Trusted by <span className="text-white font-semibold">5,000+</span> developers
            </p>
          </motion.div>
        </div>

        {/* ── Right — animated logo visual ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1,  scale: 1    }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex items-center justify-center relative"
        >
          <HeroLogoVisual />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-10 bg-gradient-to-b from-slate-600 to-transparent"
        />
      </motion.div>
    </section>
  )
}

/* animated hero logo visual */
function HeroLogoVisual() {
  return (
    <div className="relative w-[420px] h-[420px] flex items-center justify-center">
      {/* Outer rotating ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border border-cyan-500/10"
        style={{ background: 'transparent' }}
      >
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <div
            key={deg}
            className="absolute w-2.5 h-2.5 rounded-full"
            style={{
              top:  '50%',
              left: '50%',
              transform: `rotate(${deg}deg) translateX(195px) translateY(-50%)`,
              background: deg % 120 === 0 ? '#22d3ee' : '#8b5cf6',
              boxShadow: `0 0 8px ${deg % 120 === 0 ? '#22d3ee' : '#8b5cf6'}`,
            }}
          />
        ))}
      </motion.div>

      {/* Middle rotating ring (reverse) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute rounded-full border border-blue-500/15"
        style={{ width: 280, height: 280 }}
      >
        {[45, 135, 225, 315].map((deg) => (
          <div
            key={deg}
            className="absolute w-2 h-2 rounded-full bg-blue-400"
            style={{
              top:  '50%',
              left: '50%',
              transform: `rotate(${deg}deg) translateX(135px) translateY(-50%)`,
              boxShadow: '0 0 6px #3b82f6',
            }}
          />
        ))}
      </motion.div>

      {/* Inner glow disk */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute rounded-full"
        style={{
          width: 180, height: 180,
          background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, rgba(59,130,246,0.12) 40%, rgba(139,92,246,0.08) 70%, transparent 100%)',
          filter: 'blur(16px)',
        }}
      />

      {/* Center logo */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10"
      >
        <DevConnectLogo size="xl" animate={false} showText={false} />
      </motion.div>

      {/* Floating code snippets */}
      <FloatingBadge text="const dev = new Team()" top="8%" left="-4%" delay={0} />
      <FloatingBadge text="git push origin main"   top="75%" left="-2%" delay={0.8} />
      <FloatingBadge text="npm run ship 🚀"        top="15%" right="0%" delay={1.2} />
      <FloatingBadge text="PR merged ✓"            top="78%" right="2%" delay={0.4} />
    </div>
  )
}

function FloatingBadge({ text, top, left, right, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale:   { duration: 0.5, delay },
        y:       { duration: 3 + delay, repeat: Infinity, ease: 'easeInOut', delay },
      }}
      className="absolute flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#0f172a]/90 backdrop-blur-sm text-[10px] font-mono text-slate-400 whitespace-nowrap"
      style={{ top, left, right }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
      {text}
    </motion.div>
  )
}

/* ─────────────────────── Stats ───────────────────────── */
function StatsSection() {
  const fu = useFadeUp()

  return (
    <section id="projects" className="relative py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div ref={fu.ref} variants={fu.variants} animate={fu.animate} initial="hidden">
          {/* Label */}
          <p className="text-center text-sm font-semibold tracking-widest uppercase text-cyan-400 mb-3">
            Built for Student Developers
          </p>
          <h2 className="text-center text-3xl sm:text-4xl font-bold text-white mb-14">
            Developers trust DevConnect
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STATS.map((s, i) => (
            <StatCard key={s.label} stat={s} delay={i * 0.15} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatCard({ stat, delay }) {
  const fu = useFadeUp(delay)
  return (
    <motion.div
      ref={fu.ref}
      variants={fu.variants}
      animate={fu.animate}
      initial="hidden"
      className="relative group flex flex-col items-center p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden text-center
                 hover:border-cyan-500/30 transition-all duration-300"
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(34,211,238,0.08), transparent 70%)' }} />

      <p className="text-5xl font-bold tracking-tight mb-2"
        style={{
          background: 'linear-gradient(135deg,#22d3ee,#3b82f6,#a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
        <Counter to={stat.value} suffix={stat.suffix} />
      </p>
      <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
    </motion.div>
  )
}

/* ─────────────────────── Features ────────────────────── */
function FeaturesSection() {
  const fu = useFadeUp()
  return (
    <section id="features" className="relative py-24 px-4">
      {/* Section top gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent via-blue-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <motion.div ref={fu.ref} variants={fu.variants} animate={fu.animate} initial="hidden" className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase text-blue-400 mb-3">Platform Features</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
            Everything you need to{' '}
            <span style={{ background:'linear-gradient(90deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              ship together
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            From project discovery to real-time collaboration — every tool built specifically for the developer workflow.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature: f, delay }) {
  const fu = useFadeUp(delay)
  return (
    <TiltCard>
      <motion.div
        ref={fu.ref}
        variants={fu.variants}
        animate={fu.animate}
        initial="hidden"
        className={`relative group h-full p-6 rounded-2xl border border-white/[0.07] bg-gradient-to-br ${f.color}
                    backdrop-blur-sm overflow-hidden cursor-default transition-all duration-300 ${f.border}`}
        style={{ transformStyle: 'preserve-3d' }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
          style={{ boxShadow: `inset 0 0 40px ${f.glow}` }}
        />

        {/* Icon */}
        <div className={`mb-5 flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 ${f.accent}`}>
          {f.icon}
        </div>

        <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>

        {/* Bottom accent line */}
        <div className={`absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          style={{ background: `linear-gradient(90deg, transparent, ${f.glow.replace('0.15', '0.6')}, transparent)` }} />
      </motion.div>
    </TiltCard>
  )
}

/* ─────────────────────── How It Works ────────────────── */
function HowItWorksSection() {
  const fu = useFadeUp()
  return (
    <section id="how-it-works" className="relative py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div ref={fu.ref} variants={fu.variants} animate={fu.animate} initial="hidden" className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase text-violet-400 mb-3">Process</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            Get started in{' '}
            <span style={{ background:'linear-gradient(90deg,#8b5cf6,#ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              3 steps
            </span>
          </h2>
        </motion.div>

        <div className="relative grid md:grid-cols-3 gap-8">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px"
            style={{ background: 'linear-gradient(90deg, #22d3ee33, #3b82f666, #8b5cf633)' }} />

          {STEPS.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StepCard({ step, index }) {
  const fu = useFadeUp(index * 0.15)
  const gradients = [
    'from-cyan-500 to-blue-600',
    'from-blue-500 to-violet-600',
    'from-violet-500 to-purple-600',
  ]
  return (
    <motion.div
      ref={fu.ref}
      variants={fu.variants}
      animate={fu.animate}
      initial="hidden"
      className="relative flex flex-col items-center text-center group"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Step number circle */}
      <div className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${gradients[index]} flex items-center justify-center mb-6
                       shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300`}>
        <span className="text-white font-bold text-lg font-mono">{step.num}</span>
        {/* Pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.4 }}
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradients[index]}`}
        />
      </div>

      <h3 className="text-white font-semibold text-lg mb-3">{step.title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
    </motion.div>
  )
}

/* ─────────────────────── CTA ─────────────────────────── */
function CTASection() {
  const fu = useFadeUp()
  return (
    <section id="about" className="relative py-28 px-4">
      <div className="max-w-4xl mx-auto relative">
        {/* Animated glow bg */}
        <motion.div
          animate={{
            background: [
              'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(34,211,238,0.12) 0%, rgba(59,130,246,0.08) 50%, transparent 100%)',
              'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.08) 50%, transparent 100%)',
              'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(34,211,238,0.12) 0%, rgba(59,130,246,0.08) 50%, transparent 100%)',
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-3xl pointer-events-none"
        />

        {/* Card */}
        <div className="relative p-px rounded-3xl overflow-hidden">
          <div className="absolute inset-0 rounded-3xl"
            style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.4), rgba(59,130,246,0.3), rgba(139,92,246,0.4))' }} />
          <div className="relative rounded-3xl p-12 sm:p-16 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(2,6,23,0.95), rgba(15,23,42,0.95))' }}>

            <motion.div ref={fu.ref} variants={fu.variants} animate={fu.animate} initial="hidden">
              <p className="text-sm font-semibold tracking-widest uppercase text-cyan-400 mb-4">Get Started Today</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
                Start Building With{' '}
                <span style={{ background:'linear-gradient(90deg,#22d3ee,#3b82f6,#a855f7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  Developers
                </span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
                Join thousands of student developers already shipping amazing projects together on DevConnect.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <GradientButton to="/register">
                  Create Account
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </GradientButton>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-medium text-slate-300 border border-white/15
                             hover:border-white/30 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────── Footer ──────────────────────── */
function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <DevConnectLogo size="md" animate={false} />
            <p className="mt-4 text-slate-500 text-sm leading-relaxed max-w-xs">
              A collaboration platform for student developers to showcase projects, form teams, and ship together.
            </p>
            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 text-sm text-slate-400 hover:text-white transition-colors group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span className="group-hover:underline">View on GitHub</span>
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-slate-500 text-sm hover:text-slate-200 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Account</h3>
            <ul className="space-y-3">
              <li><Link to="/login"    className="text-slate-500 text-sm hover:text-slate-200 transition-colors">Login</Link></li>
              <li><Link to="/register" className="text-slate-500 text-sm hover:text-slate-200 transition-colors">Register</Link></li>
              <li><a href="#about"     className="text-slate-500 text-sm hover:text-slate-200 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} DevConnect. All rights reserved.
          </p>
          <p className="text-slate-700 text-xs">
            Built for student developers everywhere.
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────── Shared UI ───────────────────── */
function GradientButton({ to, children, size = 'default' }) {
  const base  = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 overflow-hidden group'
  const sizes = {
    sm:      'px-4 py-2 text-sm',
    default: 'px-8 py-3.5 text-sm',
  }

  return (
    <Link to={to} className={`${base} ${sizes[size]}`}>
      {/* Animated background */}
      <span
        className="absolute inset-0 transition-all duration-300 group-hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)' }}
      />
      {/* Glow */}
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-300 blur-xl"
        style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)' }}
      />
      {/* Shimmer */}
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
      <span className="relative z-10 text-white flex items-center gap-1">{children}</span>
    </Link>
  )
}
