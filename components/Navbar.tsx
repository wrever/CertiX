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
        ? 'glass shadow-lg backdrop-blur-xl' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-10">
            <Link 
              href="/" 
              className="text-2xl font-bold gradient-text hover:scale-105 transition-transform duration-200"
            >
              CertiX
            </Link>
            <div className="hidden md:flex space-x-1">
              <Link
                href="/upload"
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200"
              >
                Subir
              </Link>
              {isConnected && (
                <Link
                  href="/my-certificates"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200"
                >
                  Mis Certificados
                </Link>
              )}
              {isValidator && (
                <Link
                  href="/validator/dashboard"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all duration-200 shadow-sm"
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
