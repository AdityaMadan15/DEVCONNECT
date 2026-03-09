import { useEffect, useRef } from 'react'

const DOT_COUNT   = 70
const MAX_CONNECT = 130   // px – max distance to draw a line
const BASE_SPEED  = 0.25  // px per frame (very slow)

export default function NetworkCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas  = canvasRef.current
    const ctx     = canvas.getContext('2d')

    let W = window.innerWidth
    let H = window.innerHeight
    let animId
    let scrollVelocity = 0
    let lastScrollY    = window.scrollY

    canvas.width  = W
    canvas.height = H

    // ── resize ──────────────────────────────────────────────────────────────
    const onResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width  = W
      canvas.height = H
    }
    window.addEventListener('resize', onResize)

    // ── scroll velocity ──────────────────────────────────────────────────────
    const onScroll = () => {
      const sy = window.scrollY
      scrollVelocity = sy - lastScrollY
      lastScrollY = sy
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // ── seed dots ────────────────────────────────────────────────────────────
    const dots = Array.from({ length: DOT_COUNT }, () => ({
      x  : Math.random() * W,
      y  : Math.random() * H,
      vx : (Math.random() - 0.5) * BASE_SPEED * 2,
      vy : (Math.random() - 0.5) * BASE_SPEED * 2,
      r  : Math.random() * 1.4 + 0.5,
    }))
    // make sure every dot moves at least BASE_SPEED
    for (const d of dots) {
      if (Math.abs(d.vx) < 0.05) d.vx = BASE_SPEED * (Math.random() > 0.5 ? 1 : -1)
      if (Math.abs(d.vy) < 0.05) d.vy = BASE_SPEED * (Math.random() > 0.5 ? 1 : -1)
    }

    // ── render loop ───────────────────────────────────────────────────────────
    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // decay scroll velocity each frame
      scrollVelocity *= 0.88
      if (Math.abs(scrollVelocity) < 0.05) scrollVelocity = 0

      const boost     = Math.min(Math.abs(scrollVelocity) * 0.12, 4)
      const showLines = boost > 0.25

      // update positions
      for (const d of dots) {
        d.x += d.vx * (1 + boost)
        d.y += d.vy * (1 + boost)
        // wrap edges
        if (d.x < -8)  d.x = W + 8
        if (d.x > W+8) d.x = -8
        if (d.y < -8)  d.y = H + 8
        if (d.y > H+8) d.y = -8
      }

      // draw connecting lines while scrolling
      if (showLines) {
        for (let i = 0; i < dots.length; i++) {
          for (let j = i + 1; j < dots.length; j++) {
            const dx   = dots[i].x - dots[j].x
            const dy   = dots[i].y - dots[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < MAX_CONNECT) {
              const alpha = (1 - dist / MAX_CONNECT) * boost * 0.18
              ctx.beginPath()
              ctx.moveTo(dots[i].x, dots[i].y)
              ctx.lineTo(dots[j].x, dots[j].y)
              ctx.strokeStyle = `rgba(34,211,238,${alpha.toFixed(3)})`
              ctx.lineWidth   = 0.6
              ctx.stroke()
            }
          }
        }
      }

      // draw dots (always visible, brighter when scrolling)
      for (const d of dots) {
        const baseAlpha = 0.18 + boost * 0.05
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r + boost * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59,130,246,${baseAlpha.toFixed(3)})`
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
