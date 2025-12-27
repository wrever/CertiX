'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@/hooks/useWallet'
import WalletConnect from '@/components/WalletConnect'
import CertificateList from '@/components/CertificateList'
import LoadingSpinner from '@/components/LoadingSpinner'
import ValidatorActions from '@/components/ValidatorActions'
import ScrollReveal from '@/components/ScrollReveal'
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
          <ScrollReveal direction="up" delay={0}>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black mb-4 gradient-text-animated text-glow">
                Dashboard Admin
              </h1>
              <p className="text-lg text-cyan-200/70">
                Conecta tu wallet admin para gestionar certificados
              </p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={100}>
            <div className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                  <span className="text-4xl">🛡️</span>
                </div>
                <h2 className="text-2xl font-bold mb-3 text-white">Wallet Requerida</h2>
                <p className="text-cyan-200/70 mb-8">
                  Conecta tu wallet admin para acceder al dashboard
                </p>
              </div>
              <div className="flex justify-center">
                <WalletConnect />
              </div>
            </div>
          </ScrollReveal>
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
          <ScrollReveal direction="up" delay={0}>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black mb-4 gradient-text-animated text-glow">
                Dashboard Admin
              </h1>
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={100}>
            <div className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl max-w-2xl mx-auto border-2 border-red-500/30 bg-red-500/10">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center border border-red-500/30">
                  <span className="text-4xl">⛔</span>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-red-300">Acceso Denegado</h2>
                <p className="text-cyan-200/70 mb-2">
                  Tu wallet <span className="font-mono font-semibold text-white">{address?.slice(0, 8)}...{address?.slice(-8)}</span> no es el admin del Smart Contract.
                </p>
                <p className="text-sm text-cyan-200/60 mt-4">
                  Solo el admin configurado en el contrato puede aprobar/rechazar certificados.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 gradient-text-animated text-glow">
              Dashboard Admin
            </h1>
            <p className="text-lg text-cyan-200/70">
              Gestiona y valida certificados desde el Smart Contract
            </p>
          </div>
        </ScrollReveal>
        
        <ScrollReveal direction="up" delay={100}>
          <div className="mb-8 glass-card rounded-2xl p-6 border border-cyan-500/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-button flex items-center justify-center shadow-glow-arcusx">
                <span className="text-2xl">🛡️</span>
              </div>
              <div>
                <p className="font-bold text-white mb-1">Admin del Smart Contract</p>
                <p className="text-sm text-cyan-200/70">
                  Wallet: <span className="font-mono text-cyan-300">{address?.slice(0, 8)}...{address?.slice(-8)}</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-cyan-200/60 pl-16">
              Puedes aprobar o rechazar certificados directamente en el Smart Contract de Stellar
            </p>
          </div>
        </ScrollReveal>

        {error ? (
          <ScrollReveal direction="up" delay={200}>
            <div className="glass-card rounded-2xl p-6 border-2 border-red-500/50 bg-red-500/10 mb-8">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">❌</span>
                <div>
                  <p className="font-semibold text-red-300 mb-1">Error</p>
                  <p className="text-sm text-red-200/70">{error}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <>
            <ScrollReveal direction="up" delay={200}>
              <div className="mb-8 glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-2">
                      Certificados Pendientes
                    </h2>
                    <p className="text-cyan-200/70">
                      Revisa y aprueba o rechaza los certificados pendientes de validación
                    </p>
                  </div>
                  <div className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl font-black text-2xl shadow-lg shadow-yellow-500/30">
                    {certificates.length}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {certificates.length === 0 ? (
              <ScrollReveal direction="up" delay={300}>
                <div className="glass-card rounded-2xl p-12 text-center shadow-xl">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
                    <span className="text-5xl">🎉</span>
                  </div>
                  <p className="text-xl font-black text-white mb-2">¡Excelente trabajo!</p>
                  <p className="text-cyan-200/70">No hay certificados pendientes de revisión en este momento.</p>
                </div>
              </ScrollReveal>
            ) : (
              <div className="space-y-6">
                {certificates.map((cert, index) => (
                  <ScrollReveal key={`${cert.id}-${index}`} direction="up" delay={300 + (index * 100)}>
                    <CertificateList 
                      certificates={[cert]} 
                      showWallet={true}
                      showValidatorActions={true}
                      validatorWallet={address!}
                      onStatusChange={loadPendingCertificates}
                    />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
