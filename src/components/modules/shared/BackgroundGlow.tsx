"use client"

import { m } from "motion/react"

export const BackgroundGlow = () => {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Primary glow - moves up and down slowly */}
      <m.div
        className="absolute left-1/4 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full opacity-30 blur-[120px]"
        style={{
          background: "radial-gradient(ellipse at center, rgb(var(--a) / 0.4) 0%, transparent 70%)",
        }}
        animate={{
          y: [0, 100, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Secondary glow - moves in opposite direction */}
      <m.div
        className="absolute right-1/4 top-[20%] h-[500px] w-[600px] translate-x-1/2 rounded-full opacity-25 blur-[100px]"
        style={{
          background: "radial-gradient(ellipse at center, rgb(var(--a) / 0.3) 0%, transparent 70%)",
        }}
        animate={{
          y: [50, -50, 50],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Tertiary subtle glow */}
      <m.div
        className="absolute left-1/2 top-[40%] h-[400px] w-[500px] -translate-x-1/2 rounded-full opacity-15 blur-[80px]"
        style={{
          background: "radial-gradient(ellipse at center, rgb(var(--a) / 0.2) 0%, transparent 60%)",
        }}
        animate={{
          y: [-30, 80, -30],
        }}
        transition={{
          duration: 18,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}
