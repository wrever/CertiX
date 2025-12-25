'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@/hooks/useWallet'
import WalletConnect from '@/components/WalletConnect'
import CertificateList from '@/components/CertificateList'
import LoadingSpinner from '@/components/LoadingSpinner'
import ValidatorActions from '@/components/ValidatorActions'
import { Certificate } from '@/types/certificate'

export default function ValidatorDashboardPage() {
  const { address, isConnected } = useWallet()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isValidator, setIsValidator] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkValidator = useCallback(async () => {
    if (!address) return false

    try {
      // Verificar si es admin del Smart Contract
      const res = await fetch(`/api/admin/check?wallet=${address}`)
      const data = await res.json()
      return data.success && data.isAdmin
    } catch (err) {
      return false
    }
  }, [address])

  const loadPendingCertificates = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/certificate/pending')
      const data = await res.json()
      
      if (data.success) {
        setCertificates(data.certificates || [])
      } else {
        setError(data.error || 'Error al cargar certificados')
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isConnected && address) {
      checkValidator().then((isVal) => {
        setIsValidator(isVal)
        if (isVal) {
          loadPendingCertificates()
        } else {
          setLoading(false)
        }
      })
    }
  }, [isConnected, address, checkValidator, loadPendingCertificates])

  if (!isConnected) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Dashboard Admin
            </h1>
            <p className="text-lg text-gray-600">
              Conecta tu wallet admin para gestionar certificados
            </p>
          </div>
          
          <div className="glass rounded-3xl p-8 md:p-12 shadow-2xl animate-slide-up max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                <span className="text-4xl">🛡️</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Wallet Requerida</h2>
              <p className="text-gray-600 mb-8">
                Conecta tu wallet admin para acceder al dashboard
              </p>
            </div>
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isValidator) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Dashboard Admin
            </h1>
          </div>
          
          <div className="glass rounded-3xl p-8 md:p-12 shadow-2xl animate-scale-in max-w-2xl mx-auto bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                <span className="text-4xl">⛔</span>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-red-900">Acceso Denegado</h2>
              <p className="text-gray-700 mb-2">
                Tu wallet <span className="font-mono font-semibold">{address?.slice(0, 8)}...{address?.slice(-8)}</span> no es el admin del Smart Contract.
              </p>
              <p className="text-sm text-gray-600 mt-4">
                Solo el admin configurado en el contrato puede aprobar/rechazar certificados.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Dashboard Admin
          </h1>
          <p className="text-lg text-gray-600">
            Gestiona y valida certificados desde el Smart Contract
          </p>
        </div>
        
        <div className="mb-8 glass rounded-2xl p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 animate-slide-up">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <p className="font-bold text-purple-900 mb-1">Admin del Smart Contract</p>
              <p className="text-sm text-gray-700">
                Wallet: <span className="font-mono text-purple-700">{address?.slice(0, 8)}...{address?.slice(-8)}</span>
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 pl-16">
            Puedes aprobar o rechazar certificados directamente en el Smart Contract de Stellar
          </p>
        </div>

        {error ? (
          <div className="glass rounded-2xl p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 animate-scale-in mb-8">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-semibold text-red-900 mb-1">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 glass rounded-2xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Certificados Pendientes
                  </h2>
                  <p className="text-gray-600">
                    Revisa y aprueba o rechaza los certificados pendientes de validación
                  </p>
                </div>
                <div className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl font-bold text-2xl shadow-lg">
                  {certificates.length}
                </div>
              </div>
            </div>

            {certificates.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center shadow-xl animate-fade-in">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <span className="text-5xl">🎉</span>
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">¡Excelente trabajo!</p>
                <p className="text-gray-600">No hay certificados pendientes de revisión en este momento.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {certificates.map((cert, index) => (
                  <div key={`${cert.id}-${index}`} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CertificateList 
                      certificates={[cert]} 
                      showWallet={true}
                      showValidatorActions={true}
                      validatorWallet={address!}
                      onStatusChange={loadPendingCertificates}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
