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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          ⚠️ {error}
        </div>
      </div>
    )
  }

  if (!data || !data.certificate) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded">
          Certificado no encontrado
        </div>
      </div>
    )
  }

  const { certificate, isValid, stellarExplorerUrl } = data

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Verificar Certificado</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6 flex gap-4">
          <CertificateStatusBadge status={certificate.status} />
          <VerifyBadge isValid={isValid} />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700">Título</h3>
            <p className="text-lg">{certificate.title}</p>
          </div>

          {certificate.issuer && (
            <div>
              <h3 className="font-semibold text-gray-700">Emisor</h3>
              <p>{certificate.issuer}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-700">Wallet Address</h3>
            <p className="font-mono text-sm">{certificate.walletAddress}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700">Hash</h3>
            <p className="font-mono text-sm break-all">{certificate.hash}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700">TX Hash</h3>
            <p className="font-mono text-sm break-all">{certificate.txHash}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700">Estado</h3>
            <p className="capitalize">{certificate.status === 'pending' ? 'En Revisión' : certificate.status === 'approved' ? 'Aprobado' : 'Rechazado'}</p>
          </div>

          {certificate.validatedAt && (
            <div>
              <h3 className="font-semibold text-gray-700">
                {certificate.status === 'approved' ? 'Fecha de Aprobación' : 'Fecha de Rechazo'}
              </h3>
              <p>{new Date(certificate.validatedAt).toLocaleString('es-ES')}</p>
            </div>
          )}

          {certificate.validatorWallet && (
            <div>
              <h3 className="font-semibold text-gray-700">Validador</h3>
              <p className="font-mono text-sm">{certificate.validatorWallet}</p>
            </div>
          )}

          {certificate.rejectionReason && (
            <div>
              <h3 className="font-semibold text-gray-700">Razón de Rechazo</h3>
              <p className="text-red-600">{certificate.rejectionReason}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-700">Fecha de Subida</h3>
            <p>{new Date(certificate.uploadedAt).toLocaleString('es-ES')}</p>
          </div>

          {certificate.fileUrl && (
            <div>
              <h3 className="font-semibold text-gray-700">Archivo</h3>
              <a
                href={certificate.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                Ver archivo original →
              </a>
            </div>
          )}

          <div className="pt-4 border-t space-y-2">
            <a
              href={stellarExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline block"
            >
              Ver transacción en Stellar Explorer →
            </a>
            <a
              href={`/user/${certificate.walletAddress}`}
              className="text-primary-600 hover:underline block"
            >
              Ver todos los certificados de esta wallet →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

