'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function ClientOnlyParticles() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // Don't render on server
  }

  // Use fixed positions to avoid hydration mismatch
  const positions = [
    { x: 100, y: 200 }, { x: 300, y: 150 }, { x: 500, y: 300 },
    { x: 700, y: 100 }, { x: 900, y: 250 }, { x: 1100, y: 180 },
    { x: 200, y: 400 }, { x: 400, y: 350 }, { x: 600, y: 500 },
    { x: 800, y: 450 }, { x: 1000, y: 380 }, { x: 1200, y: 420 },
    { x: 150, y: 600 }, { x: 350, y: 550 }, { x: 550, y: 700 },
    { x: 750, y: 650 }, { x: 950, y: 580 }, { x: 1150, y: 620 },
    { x: 250, y: 800 }, { x: 450, y: 750 }
  ]

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {positions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary-400 rounded-full opacity-20"
          initial={{
            x: pos.x,
            y: pos.y,
          }}
          animate={{
            y: [pos.y, pos.y + 100, pos.y],
            x: [pos.x, pos.x + 50, pos.x],
          }}
          transition={{
            duration: 10 + (i % 5) * 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      ))}
    </div>
  )
}





