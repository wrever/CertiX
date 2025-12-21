'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useWallet } from '@/hooks/useWallet'
import WalletConnect from './WalletConnect'

export default function Navbar() {
  const { address, isConnected } = useWallet()
  const [isValidator, setIsValidator] = useState(false)

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
      const res = await fetch(`/api/validators/check/${address}`)
      const data = await res.json()
      setIsValidator(data.success && data.isValidator)
    } catch (err) {
      setIsValidator(false)
    }
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-primary-600">
              CertiX
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                href="/upload"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Subir
              </Link>
              {isConnected && (
                <Link
                  href="/my-certificates"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Mis Certificados
                </Link>
              )}
              {isValidator && (
                <Link
                  href="/validator/dashboard"
                  className="text-purple-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium font-semibold"
                >
                  Dashboard Validador
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

