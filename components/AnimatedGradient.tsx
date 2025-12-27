'use client'

import { useEffect, useRef } from 'react'

interface AnimatedGradientProps {
  children: React.ReactNode
  className?: string
}

export default function AnimatedGradient({ children, className = '' }: AnimatedGradientProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    let animationFrame: number

    const animate = () => {
      const time = Date.now() * 0.001
      const x = Math.sin(time) * 50 + 50
      const y = Math.cos(time * 0.7) * 50 + 50
      
      element.style.backgroundPosition = `${x}% ${y}%`
      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        backgroundSize: '400% 400%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}
    >
      {children}
    </div>
  )
}

