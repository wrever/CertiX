'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import CertificateList from '@/components/CertificateList'
import LoadingSpinner from '@/components/LoadingSpinner'
import { CertificateListResponse } from '@/types/certificate'

// Validar wallet address (versión cliente)
function validateStellarAddress(address: string): boolean {
  return address.startsWith('G') && address.length === 56 && /^G[A-Z0-9]{55}$/.test(address)
}

export default function UserCertificatesPage() {
  const params = useParams()
  const wallet = params.wallet as string
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCertificates = useCallback(async () => {
    if (!wallet || !validateStellarAddress(wallet)) {
      setError('Dirección de wallet inválida')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/certificate/user/${wallet}`)
      const data: CertificateListResponse = await res.json()
      
      if (data.success) {
        setCertificates(data.certificates)
      } else {
        setError(data.error || 'Error al cargar certificados')
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }, [wallet])

  useEffect(() => {
    loadCertificates()
  }, [loadCertificates])

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Certificados</h1>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Wallet: <span className="font-mono">{wallet?.slice(0, 8)}...{wallet?.slice(-8)}</span>
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          ⚠️ {error}
        </div>
      ) : (
        <CertificateList certificates={certificates} showWallet={false} />
      )}
    </div>
  )
}
