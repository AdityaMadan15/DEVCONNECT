import { motion } from 'framer-motion'

/**
 * DevConnectLogo – animated futuristic logo with neon glow.
 * Props:
 *   size   — 'sm' | 'md' | 'lg' | 'xl'  (default 'md')
 *   animate — boolean  (default true)  enables floating + pulse
 *   showText — boolean (default true)
 */
export default function DevConnectLogo({ size = 'md', animate = true, showText = true }) {
  const sizes = {
    sm: { icon: 28, text: 'text-base',  gap: 'gap-2' },
    md: { icon: 38, text: 'text-xl',   gap: 'gap-2.5' },
    lg: { icon: 52, text: 'text-3xl',  gap: 'gap-3' },
    xl: { icon: 72, text: 'text-5xl',  gap: 'gap-4' },
  }
  const s = sizes[size] ?? sizes.md
  const w = s.icon
  const h = s.icon

  const floatVariants = {
    animate: {
      y: [0, -6, 0],
      transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
    },
    static: {},
  }

  const glowVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      scale:   [1, 1.15, 1],
      transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
    },
    static: {},
  }

  const fadeIn = {
    initial:  { opacity: 0, scale: 0.85 },
    animate:  { opacity: 1, scale: 1,  transition: { duration: 0.7, ease: 'easeOut' } },
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className={`inline-flex items-center ${s.gap} relative select-none`}
    >
      {/* ── Icon mark ─────────────────────────────────────────── */}
      <motion.div
        variants={floatVariants}
        animate={animate ? 'animate' : 'static'}
        className="relative flex-shrink-0"
        style={{ width: w, height: h }}
      >
        {/* Ambient glow */}
        <motion.div
          variants={glowVariants}
          animate={animate ? 'animate' : 'static'}
          className="absolute inset-0 rounded-xl"
          style=  {{
            background: 'radial-gradient(circle, rgba(34,211,238,0.4) 0%, rgba(59,130,246,0.25) 60%, transparent 80%)',
            filter: 'blur(8px)',
            transform: 'scale(1.4)',
          }}
        />

        {/* SVG icon */}
        <svg
          width={w}
          height={h}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <defs>
            <linearGradient id="dc-grad-main" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#22d3ee" />
              <stop offset="50%"  stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="dc-grad-nodes" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <filter id="dc-glow">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer hexagonal ring */}
          <path
            d="M24 4 L40 13 L40 31 L24 40 L8 31 L8 13 Z"
            stroke="url(#dc-grad-main)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
            filter="url(#dc-glow)"
          />

          {/* Inner hex */}
          <path
            d="M24 12 L33 17 L33 27 L24 32 L15 27 L15 17 Z"
            stroke="url(#dc-grad-main)"
            strokeWidth="1"
            fill="rgba(34,211,238,0.06)"
            opacity="0.7"
          />

          {/* Code brackets < > */}
          <path
            d="M19 19 L14 22 L19 25"
            stroke="url(#dc-grad-nodes)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#dc-glow)"
          />
          <path
            d="M29 19 L34 22 L29 25"
            stroke="url(#dc-grad-nodes)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#dc-glow)"
          />

          {/* Slash separator */}
          <line
            x1="25" y1="18" x2="23" y2="26"
            stroke="#22d3ee"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.9"
            filter="url(#dc-glow)"
          />

          {/* Network node dots — corners */}
          <circle cx="24" cy="4"  r="2" fill="#22d3ee" opacity="0.85" filter="url(#dc-glow)" />
          <circle cx="40" cy="13" r="2" fill="#3b82f6" opacity="0.75" filter="url(#dc-glow)" />
          <circle cx="40" cy="31" r="2" fill="#3b82f6" opacity="0.75" filter="url(#dc-glow)" />
          <circle cx="24" cy="40" r="2" fill="#a855f7" opacity="0.85" filter="url(#dc-glow)" />
          <circle cx="8"  cy="31" r="2" fill="#a855f7" opacity="0.75" filter="url(#dc-glow)" />
          <circle cx="8"  cy="13" r="2" fill="#22d3ee" opacity="0.75" filter="url(#dc-glow)" />

          {/* Center node */}
          <circle cx="24" cy="22" r="2.5" fill="url(#dc-grad-main)" filter="url(#dc-glow)" />

          {/* Connection lines from center to 3 nodes */}
          <line x1="24" y1="22" x2="24" y2="4"  stroke="url(#dc-grad-main)" strokeWidth="0.8" opacity="0.3" />
          <line x1="24" y1="22" x2="40" y2="31" stroke="url(#dc-grad-main)" strokeWidth="0.8" opacity="0.3" />
          <line x1="24" y1="22" x2="8"  y2="31" stroke="url(#dc-grad-main)" strokeWidth="0.8" opacity="0.3" />
        </svg>
      </motion.div>

      {/* ── Wordmark ──────────────────────────────────────────── */}
      {showText && (
        <div className={`font-bold ${s.text} leading-none font-sans tracking-tight`}>
          <span
            style={{
              background: 'linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Dev
          </span>
          <span className="text-slate-100">Connect</span>
        </div>
      )}
    </motion.div>
  )
}
