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
      <div className="pt-20 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Mis Certificados
            </h1>
            <p className="text-lg text-gray-600">
              Conecta tu wallet para ver tus certificados registrados
            </p>
          </div>
          
          <div className="glass rounded-3xl p-8 md:p-12 shadow-2xl animate-slide-up max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <span className="text-4xl">🔗</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Wallet Requerida</h2>
              <p className="text-gray-600 mb-8">
                Conecta tu wallet Freighter para acceder a tus certificados
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

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Mis Certificados
          </h1>
          <p className="text-lg text-gray-600">
            Gestiona y verifica todos tus certificados registrados en la blockchain
          </p>
        </div>
        
        <div className="mb-6 flex items-center justify-center">
          <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Wallet: <span className="font-mono text-blue-600">{address?.slice(0, 8)}...{address?.slice(-8)}</span>
            </span>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
            <div className="glass rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <p className="text-sm text-gray-600 mb-2 font-medium">Total</p>
              <p className="text-4xl font-bold gradient-text">{stats.total}</p>
            </div>
            <div className="glass rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-yellow-500">
              <p className="text-sm text-gray-600 mb-2 font-medium">Pendientes</p>
              <p className="text-4xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="glass rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-green-500">
              <p className="text-sm text-gray-600 mb-2 font-medium">Aprobados</p>
              <p className="text-4xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="glass rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-red-500">
              <p className="text-sm text-gray-600 mb-2 font-medium">Rechazados</p>
              <p className="text-4xl font-bold text-red-600">{stats.rejected}</p>
            </div>
          </div>
        )}

        <div className="mb-8 animate-slide-up">
          <StatusFilter currentStatus={filterStatus} onFilterChange={setFilterStatus} />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="glass rounded-2xl p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 animate-scale-in">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-semibold text-red-900 mb-1">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : certificates.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center shadow-xl animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-5xl">📜</span>
            </div>
            <p className="text-xl font-bold text-gray-900 mb-2">No hay certificados</p>
            <p className="text-gray-600 mb-6">Aún no has subido ningún certificado</p>
            <a
              href="/upload"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Subir Primer Certificado →
            </a>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <CertificateList certificates={certificates} showWallet={false} />
          </div>
        )}
      </div>
    </div>
  )
}
