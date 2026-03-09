import { motion } from 'framer-motion'

export default function SplashScreen({ onDone }) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]"
      /* after 1.7 s start fading out, gone by 2.1 s */
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 2.1, times: [0, 0.8, 1], ease: 'easeInOut' }}
      onAnimationComplete={onDone}
    >
      {/* ── ambient grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* ── outermost slow-expanding ring ── */}
      <motion.div
        className="absolute rounded-full border border-cyan-500/10"
        initial={{ width: 120, height: 120, opacity: 0 }}
        animate={{ width: 560, height: 560, opacity: [0, 0.4, 0] }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />

      {/* ── second ring ── */}
      <motion.div
        className="absolute rounded-full border border-blue-500/15"
        initial={{ width: 80, height: 80, opacity: 0 }}
        animate={{ width: 380, height: 380, opacity: [0, 0.5, 0] }}
        transition={{ duration: 2, ease: 'easeOut', delay: 0.1 }}
      />

      {/* ── inner glow disk ── */}
      <motion.div
        className="absolute rounded-full"
        initial={{ width: 40, height: 40, opacity: 0 }}
        animate={{
          width:   [40,  240, 260, 240],
          height:  [40,  240, 260, 240],
          opacity: [0,   0.6, 0.9, 0.5],
        }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
        style={{
          background:
            'radial-gradient(circle, rgba(34,211,238,0.25) 0%, rgba(59,130,246,0.18) 40%, rgba(59,130,246,0.10) 70%, transparent 100%)',
          filter: 'blur(18px)',
        }}
      />

      {/* ── logo ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-5"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{
          opacity: [0, 1,   1,   1  ],
          scale:   [0.6, 1.08, 1, 1 ],
        }}
        transition={{ duration: 1.4, times: [0, 0.45, 0.65, 1], ease: [0.16, 1, 0.3, 1] }}
      >
        {/* icon only, large */}
        <LogoIcon />

        {/* wordmark fades in slightly after icon */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1,  y: 0 }}
          transition={{ delay: 0.55, duration: 0.5, ease: 'easeOut' }}
          className="text-3xl font-bold tracking-tight"
        >
          <span
            style={{
              background: 'linear-gradient(90deg,#22d3ee 0%,#3b82f6 50%,#a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Dev
          </span>
          <span className="text-slate-100">Connect</span>
        </motion.div>

        {/* tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.4 }}
          className="text-xs tracking-[0.25em] uppercase text-slate-500"
        >
          Collaborate · Showcase · Ship
        </motion.p>
      </motion.div>

      {/* ── bottom loading bar ── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-40 h-px bg-white/5 overflow-hidden rounded-full">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg,#22d3ee,#3b82f6,#a855f7)',
          }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.7, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </motion.div>
  )
}

/* ── standalone icon (no framer-motion float here — handled by parent) ── */
function LogoIcon() {
  const w = 72, h = 72
  return (
    <div className="relative" style={{ width: w, height: h }}>
      {/* glow behind */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        animate={{
          opacity: [0.5, 1, 0.5],
          scale:   [1,   1.2, 1  ],
        }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(circle, rgba(34,211,238,0.45) 0%, rgba(59,130,246,0.3) 60%, transparent 80%)',
          filter: 'blur(10px)',
          transform: 'scale(1.5)',
        }}
      />

      <svg
        width={w}
        height={h}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <defs>
          <linearGradient id="sp-main" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#22d3ee" />
            <stop offset="50%"  stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="sp-nodes" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <filter id="sp-glow">
            <feGaussianBlur stdDeviation="1.2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <path d="M24 4 L40 13 L40 31 L24 40 L8 31 L8 13 Z" stroke="url(#sp-main)" strokeWidth="1.5" fill="none" opacity="0.6" filter="url(#sp-glow)"/>
        <path d="M24 12 L33 17 L33 27 L24 32 L15 27 L15 17 Z" stroke="url(#sp-main)" strokeWidth="1" fill="rgba(34,211,238,0.06)" opacity="0.7"/>
        <path d="M19 19 L14 22 L19 25" stroke="url(#sp-nodes)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#sp-glow)"/>
        <path d="M29 19 L34 22 L29 25" stroke="url(#sp-nodes)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#sp-glow)"/>
        <line x1="25" y1="18" x2="23" y2="26" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" filter="url(#sp-glow)"/>
        <circle cx="24" cy="4"  r="2" fill="#22d3ee" opacity="0.85" filter="url(#sp-glow)"/>
        <circle cx="40" cy="13" r="2" fill="#3b82f6" opacity="0.75" filter="url(#sp-glow)"/>
        <circle cx="40" cy="31" r="2" fill="#3b82f6" opacity="0.75" filter="url(#sp-glow)"/>
        <circle cx="24" cy="40" r="2" fill="#a855f7" opacity="0.85" filter="url(#sp-glow)"/>
        <circle cx="8"  cy="31" r="2" fill="#a855f7" opacity="0.75" filter="url(#sp-glow)"/>
        <circle cx="8"  cy="13" r="2" fill="#22d3ee" opacity="0.75" filter="url(#sp-glow)"/>
        <circle cx="24" cy="22" r="2.5" fill="url(#sp-main)" filter="url(#sp-glow)"/>
        <line x1="24" y1="22" x2="24" y2="4"  stroke="url(#sp-main)" strokeWidth="0.8" opacity="0.3"/>
        <line x1="24" y1="22" x2="40" y2="31" stroke="url(#sp-main)" strokeWidth="0.8" opacity="0.3"/>
        <line x1="24" y1="22" x2="8"  y2="31" stroke="url(#sp-main)" strokeWidth="0.8" opacity="0.3"/>
      </svg>
    </div>
  )
}
