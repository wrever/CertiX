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
      const res = await fetch(`/api/validators/check/${address}`)
      const data = await res.json()
      return data.success && data.isValidator
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Dashboard de Validador</h1>
        <div className="bg-yellow-100 border border-yellow-400 p-4 rounded mb-4">
          <p className="text-yellow-800">
            Debes conectar tu wallet Freighter para acceder al dashboard
          </p>
        </div>
        <WalletConnect />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isValidator) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Dashboard de Validador</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded">
          <p className="font-semibold mb-2">⛔ Acceso Denegado</p>
          <p>
            Tu wallet ({address?.slice(0, 8)}...{address?.slice(-8)}) no está autorizada como validador.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Dashboard de Validador</h1>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Wallet Validador: <span className="font-mono">{address?.slice(0, 8)}...{address?.slice(-8)}</span>
        </p>
      </div>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-4">
          ⚠️ {error}
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-lg font-semibold mb-2">
              Certificados Pendientes: {certificates.length}
            </p>
            <p className="text-sm text-gray-600">
              Revisa y aprueba o rechaza los certificados pendientes de validación
            </p>
          </div>

          {certificates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg mb-2">🎉 ¡Excelente trabajo!</p>
              <p className="text-gray-600">No hay certificados pendientes de revisión en este momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="bg-white rounded-lg shadow-md p-6">
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
  )
}

