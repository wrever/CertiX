'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@/hooks/useWallet'
import WalletConnect from '@/components/WalletConnect'
import CertificateList from '@/components/CertificateList'
import LoadingSpinner from '@/components/LoadingSpinner'
import StatusFilter from '@/components/StatusFilter'
import ScrollReveal from '@/components/ScrollReveal'
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
          <ScrollReveal direction="up" delay={0}>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black mb-4 gradient-text-animated text-glow">
                Mis Certificados
              </h1>
              <p className="text-lg text-cyan-200/70">
                Conecta tu wallet para ver tus certificados registrados
              </p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={100}>
            <div className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                  <span className="text-4xl">🔗</span>
                </div>
                <h2 className="text-2xl font-bold mb-3 text-white">Wallet Requerida</h2>
                <p className="text-cyan-200/70 mb-8">
                  Conecta tu wallet Freighter para acceder a tus certificados
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

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 gradient-text-animated text-glow">
              Mis Certificados
            </h1>
            <p className="text-lg text-cyan-200/70">
              Gestiona y verifica tus certificaciones registradas en blockchain
            </p>
          </div>
        </ScrollReveal>

        {/* Stats Cards */}
        {stats && (
          <ScrollReveal direction="up" delay={100}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="glass-card rounded-2xl p-6 text-center border border-cyan-500/20">
                <div className="text-3xl font-black gradient-text-animated mb-2">{stats.total}</div>
                <div className="text-cyan-200/70 text-sm font-semibold">Total</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center border border-green-500/20">
                <div className="text-3xl font-black text-green-400 mb-2">{stats.approved}</div>
                <div className="text-cyan-200/70 text-sm font-semibold">Aprobados</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center border border-yellow-500/20">
                <div className="text-3xl font-black text-yellow-400 mb-2">{stats.pending}</div>
                <div className="text-cyan-200/70 text-sm font-semibold">Pendientes</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center border border-red-500/20">
                <div className="text-3xl font-black text-red-400 mb-2">{stats.rejected}</div>
                <div className="text-cyan-200/70 text-sm font-semibold">Rechazados</div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Filter */}
        <ScrollReveal direction="up" delay={200}>
          <div className="mb-8">
            <StatusFilter 
              currentStatus={filterStatus} 
              onFilterChange={setFilterStatus} 
            />
          </div>
        </ScrollReveal>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="glass-card border-2 border-red-500/50 rounded-xl p-6 mb-8 bg-red-500/10">
            <p className="text-red-300 font-semibold">❌ {error}</p>
          </div>
        )}

        {/* Certificates List */}
        {!loading && !error && (
          <ScrollReveal direction="up" delay={300}>
            {certificates.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center">
                <div className="text-6xl mb-6">📜</div>
                <h3 className="text-2xl font-bold text-white mb-3">No hay certificados</h3>
                <p className="text-cyan-200/70 mb-8">
                  {filterStatus === 'all' 
                    ? 'Aún no has subido ningún certificado'
                    : `No tienes certificados con estado "${filterStatus}"`
                  }
                </p>
                <a
                  href="/upload"
                  className="inline-block px-6 py-3 gradient-button text-white rounded-xl font-semibold transition-all duration-200 shadow-glow-arcusx hover:shadow-glow-strong hover:scale-105"
                >
                  Subir Primer Certificado →
                </a>
              </div>
            ) : (
              <CertificateList 
                certificates={certificates} 
                onStatusChange={loadCertificates}
              />
            )}
          </ScrollReveal>
        )}
      </div>
    </div>
  )
}
