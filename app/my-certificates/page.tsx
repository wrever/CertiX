'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@/hooks/useWallet'
import WalletConnect from '@/components/WalletConnect'
import CertificateList from '@/components/CertificateList'
import LoadingSpinner from '@/components/LoadingSpinner'
import StatusFilter from '@/components/StatusFilter'
import { CertificateListResponse, CertificateStatus } from '@/types/certificate'

export default function MyCertificatesPage() {
  const { address, isConnected } = useWallet()
  const [certificates, setCertificates] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<CertificateStatus | 'all'>('all')

  const loadCertificates = useCallback(async () => {
    if (!address) return

    setLoading(true)
    setError(null)

    try {
      const url = filterStatus === 'all' 
        ? `/api/certificate/user/${address}`
        : `/api/certificate/user/${address}?status=${filterStatus}`
      
      const res = await fetch(url)
      const data: CertificateListResponse = await res.json()
      
      if (data.success) {
        setCertificates(data.certificates)
        if (data.stats) {
          setStats(data.stats)
        }
      } else {
        setError(data.error || 'Error al cargar certificados')
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }, [address, filterStatus])

  useEffect(() => {
    if (isConnected && address) {
      loadCertificates()
    }
  }, [isConnected, address, loadCertificates])

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Mis Certificados</h1>
        <div className="bg-yellow-100 border border-yellow-400 p-4 rounded mb-4">
          <p className="text-yellow-800">
            Debes conectar tu wallet Freighter para ver tus certificados
          </p>
        </div>
        <WalletConnect />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Mis Certificados</h1>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Wallet: <span className="font-mono">{address?.slice(0, 8)}...{address?.slice(-8)}</span>
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Aprobados</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-600">Rechazados</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>
      )}

      <StatusFilter currentStatus={filterStatus} onFilterChange={setFilterStatus} />

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

