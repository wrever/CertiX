'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useWallet } from '@/hooks/useWallet'
import WalletConnect from './WalletConnect'

export default function Navbar() {
  const { address, isConnected } = useWallet()
  const [isValidator, setIsValidator] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isConnected && address) {
      checkValidator()
    } else {
      setIsValidator(false)
    }
  }, [isConnected, address])

  const checkValidator = async () => {
    if (!address) return
    
    try {
      const res = await fetch(`/api/admin/check?wallet=${address}`)
      const data = await res.json()
      setIsValidator(data.success && data.isAdmin)
    } catch (err) {
      setIsValidator(false)
    }
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'glass-dark shadow-2xl backdrop-blur-2xl border-b border-cyan-500/30' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center space-x-12">
            <Link 
              href="/" 
              className="text-3xl font-black gradient-text-animated hover:scale-110 transition-transform duration-300 text-glow"
            >
              CertiX
            </Link>
            <div className="hidden md:flex space-x-2">
              <Link
                href="/upload"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-cyan-200/80 hover:text-[#28c0f0] hover:bg-cyan-500/10 transition-all duration-200 hover:scale-105"
              >
                Subir
              </Link>
              {isConnected && (
                <Link
                  href="/my-certificates"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-cyan-200/80 hover:text-[#28c0f0] hover:bg-cyan-500/10 transition-all duration-200 hover:scale-105"
                >
                  Mis Certificados
                </Link>
              )}
              {isValidator && (
                <Link
                  href="/validator/dashboard"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-cyan-500/30"
                >
                  🛡️ Dashboard Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <WalletConnect />
          </div>
        </div>
      </div>
    </nav>
  )
}
