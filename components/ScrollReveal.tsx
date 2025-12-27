'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
  duration?: number
  className?: string
  distance?: number
}

export default function ScrollReveal({ 
  children, 
  delay = 0, 
  direction = 'up',
  duration = 0.4,
  className = '',
  distance = 60
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setTimeout(() => {
            setIsVisible(true)
            setHasAnimated(true)
          }, delay)
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [delay, hasAnimated])

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return `translateY(${distance}px)`
      case 'down':
        return `translateY(-${distance}px)`
      case 'left':
        return `translateX(${distance}px)`
      case 'right':
        return `translateX(-${distance}px)`
      case 'fade':
        return 'none'
      default:
        return `translateY(${distance}px)`
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : getTransform(),
        transition: `opacity ${duration}s cubic-bezier(0.4, 0, 0.2, 1), transform ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`,
        willChange: isVisible ? 'auto' : 'transform, opacity'
      }}
    >
      {children}
    </div>
  )
}
