'use client'

import { ReactNode } from 'react'

interface FloatingElementProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export default function FloatingElement({ 
  children, 
  delay = 0,
  duration = 3,
  className = '' 
}: FloatingElementProps) {
  return (
    <div
      className={className}
      style={{
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`
      }}
    >
      {children}
    </div>
  )
}

