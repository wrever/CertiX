'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CertificateVerifyResponse } from '@/types/certificate'
import VerifyBadge from '@/components/VerifyBadge'
import CertificateStatusBadge from '@/components/CertificateStatusBadge'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function VerifyPage() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<CertificateVerifyResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`/api/certificate/verify/${id}`)
        const result = await res.json()
        
        if (result.success) {
          setData(result)
        } else {
          setError(result.error || 'Error al verificar certificado')
        }
      } catch (err: any) {
        setError(err.message || 'Error inesperado')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      verify()
    }
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glass-card border-2 border-red-500/50 rounded-xl p-6 bg-red-500/10">
            <p className="text-red-300 font-semibold">⚠️ {error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data || !data.certificate) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glass-card border-2 border-yellow-500/50 rounded-xl p-6 bg-yellow-500/10">
            <p className="text-yellow-300 font-semibold">📜 Certificado no encontrado</p>
          </div>
        </div>
      </div>
    )
  }

  const { certificate, isValid, stellarExplorerUrl } = data

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 gradient-text-animated text-glow">
            Verificar Certificado
          </h1>
          <p className="text-lg text-cyan-200/70">
            Verificación blockchain inmutable y transparente
          </p>
        </div>
        
        <div className="glass-card rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="mb-6 flex flex-wrap gap-4 justify-center">
            <CertificateStatusBadge status={certificate.status} />
            <VerifyBadge isValid={isValid} />
          </div>

          <div className="space-y-6">
            <div className="p-4 glass-card rounded-xl border border-cyan-500/20">
              <h3 className="font-bold text-cyan-300 mb-2 text-sm uppercase tracking-wide">Título</h3>
              <p className="text-xl text-white font-semibold">{certificate.title}</p>
            </div>

            {certificate.issuer && (
              <div className="p-4 glass-card rounded-xl border border-cyan-500/20">
                <h3 className="font-bold text-cyan-300 mb-2 text-sm uppercase tracking-wide">Emisor</h3>
                <p className="text-white">{certificate.issuer}</p>
              </div>
            )}

            <div className="p-4 glass-card rounded-xl border border-cyan-500/20">
              <h3 className="font-bold text-cyan-300 mb-2 text-sm uppercase tracking-wide">Dirección de Wallet</h3>
              <p className="font-mono text-sm text-cyan-200 break-all">{certificate.walletAddress}</p>
            </div>

            <div className="p-4 glass-card rounded-xl border border-cyan-500/20">
              <h3 className="font-bold text-cyan-300 mb-2 text-sm uppercase tracking-wide">Hash SHA256</h3>
              <p className="font-mono text-xs text-cyan-200 break-all">{certificate.hash}</p>
            </div>

            <div className="p-4 glass-card rounded-xl border border-cyan-500/20">
              <h3 className="font-bold text-cyan-300 mb-2 text-sm uppercase tracking-wide">Hash de Transacción</h3>
              <p className="font-mono text-xs text-cyan-200 break-all">{certificate.txHash}</p>
            </div>

            <div className="p-4 glass-card rounded-xl border border-cyan-500/20">
              <h3 className="font-bold text-cyan-300 mb-2 text-sm uppercase tracking-wide">Estado</h3>
              <p className="text-white font-semibold">
                {certificate.status === 'pending' ? 'En Revisión' : certificate.status === 'approved' ? 'Aprobado' : 'Rechazado'}
              </p>
            </div>

            {certificate.validatedAt && (
              <div className="p-4 glass-card rounded-xl border border-cyan-500/20">
                <h3 className="font-bold text-cyan-300 mb-2 text-sm uppercase tracking-wide">
                  {certificate.status === 'approved' ? 'Fecha de Aprobación' : 'Fecha de Rechazo'}
                </h3>
                <p className="text-white">{new Date(certificate.validatedAt).toLocaleString('es-ES')}</p>
              </div>
            )}

            {certificate.validatorWallet && (
              <div className="p-4 glass-card rounded-xl border border-cyan-500/20">
                <h3 className="font-bold text-cyan-300 mb-2 text-sm uppercase tracking-wide">Validador</h3>
                <p className="font-mono text-sm text-cyan-200 break-all">{certificate.validatorWallet}</p>
              </div>
            )}

            {certificate.rejectionReason && (
              <div className="p-4 glass-card rounded-xl border border-red-500/30 bg-red-500/10">
                <h3 className="font-bold text-red-300 mb-2 text-sm uppercase tracking-wide">Razón de Rechazo</h3>
                <p className="text-red-200">{certificate.rejectionReason}</p>
              </div>
            )}

            <div className="p-4 glass-card rounded-xl border border-cyan-500/20">
              <h3 className="font-bold text-cyan-300 mb-2 text-sm uppercase tracking-wide">Fecha de Subida</h3>
              <p className="text-white">{new Date(certificate.uploadedAt).toLocaleString('es-ES')}</p>
            </div>

            {certificate.contractId && (
              <div className="p-6 glass-card rounded-xl border-2 border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                <div className="flex items-start space-x-3 mb-4">
                  <span className="text-3xl">📜</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-cyan-300 mb-2 text-lg">Smart Contract Soroban</h3>
                    <p className="text-sm text-cyan-200/80 mb-3">
                      Este certificado está registrado de forma inmutable en el Smart Contract de Stellar
                    </p>
                    <p className="font-mono text-xs text-cyan-200 break-all mb-4 p-3 glass-card rounded border border-cyan-500/30">
                      {certificate.contractId}
                    </p>
                    <a
                      href={`https://stellar.expert/explorer/testnet/contract/${certificate.contractId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 gradient-button text-white rounded-lg text-sm font-semibold hover:scale-105 transition-all duration-200 shadow-glow-arcusx"
                    >
                      Ver Contrato en Stellar Explorer →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {certificate.fileUrl && (
              <div className="p-4 glass-card rounded-xl border border-cyan-500/20">
                <h3 className="font-bold text-cyan-300 mb-2 text-sm uppercase tracking-wide">Archivo Original</h3>
                <a
                  href={certificate.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 glass-card border border-cyan-500/30 text-cyan-200 rounded-lg text-sm font-semibold hover:bg-cyan-500/20 transition-all duration-200 hover:scale-105"
                >
                  Ver Archivo Original →
                </a>
              </div>
            )}

            <div className="pt-6 border-t border-cyan-500/20 space-y-3">
              <a
                href={stellarExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-6 py-3 glass-card border border-cyan-500/30 text-cyan-200 rounded-xl font-semibold hover:bg-cyan-500/20 transition-all duration-200 hover:scale-105"
              >
                Ver Transacción en Stellar Explorer →
              </a>
              <a
                href={`/user/${certificate.walletAddress}`}
                className="flex items-center justify-center px-6 py-3 glass-card border border-cyan-500/30 text-cyan-200 rounded-xl font-semibold hover:bg-cyan-500/20 transition-all duration-200 hover:scale-105"
              >
                Ver Todos los Certificados de esta Wallet →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

