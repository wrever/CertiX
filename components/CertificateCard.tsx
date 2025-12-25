import Link from 'next/link'
import { Certificate } from '@/types/certificate'
import VerifyBadge from './VerifyBadge'
import CertificateStatusBadge from './CertificateStatusBadge'

interface CertificateCardProps {
  certificate: Certificate
  showWallet?: boolean
  showValidatorActions?: boolean
  onStatusChange?: () => void
}

export default function CertificateCard({ 
  certificate, 
  showWallet = false,
  showValidatorActions = false,
  onStatusChange
}: CertificateCardProps) {
  const statusColors = {
    approved: 'from-green-500 to-emerald-500',
    rejected: 'from-red-500 to-rose-500',
    pending: 'from-yellow-500 to-amber-500'
  }

  const statusGradients = {
    approved: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
    rejected: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200',
    pending: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
  }

  return (
    <div className={`glass rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 animate-fade-in border-l-4 ${
      certificate.status === 'approved' ? 'border-green-500' :
      certificate.status === 'rejected' ? 'border-red-500' :
      'border-yellow-500'
    }`}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-2xl font-bold text-gray-900 pr-4">{certificate.title}</h3>
            <div className="flex flex-col gap-2 items-end flex-shrink-0">
              <CertificateStatusBadge status={certificate.status} />
              <VerifyBadge isValid={certificate.isValid || false} />
            </div>
          </div>
          
          {certificate.issuer && (
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-gray-500">📜</span>
              <p className="text-gray-700 font-medium">Emitido por: <span className="text-gray-900">{certificate.issuer}</span></p>
            </div>
          )}
          
          {showWallet && (
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-gray-400">👤</span>
              <p className="text-gray-600 text-sm font-mono">
                {certificate.walletAddress}
              </p>
            </div>
          )}
          
          {certificate.contractId && (
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold mb-3">
              <span>📜</span>
              <span>Registrado en Smart Contract</span>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-2 mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Subido:</span>
          <span className="text-gray-900 font-medium">
            {new Date(certificate.uploadedAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
        {certificate.validatedAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {certificate.status === 'approved' ? 'Aprobado' : 'Rechazado'}:
            </span>
            <span className="text-gray-900 font-medium">
              {new Date(certificate.validatedAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        )}
        {certificate.validatorWallet && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Validador:</span>
            <span className="text-gray-900 font-mono text-xs">
              {certificate.validatorWallet.slice(0, 8)}...{certificate.validatorWallet.slice(-8)}
            </span>
          </div>
        )}
        {certificate.rejectionReason && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-semibold text-red-900 mb-1">Razón de rechazo:</p>
            <p className="text-sm text-red-700">{certificate.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* Validator Notice */}
      {showValidatorActions && certificate.status === 'pending' && (
        <div className={`mb-6 p-4 rounded-xl border-2 ${statusGradients.pending}`}>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-semibold text-amber-900 mb-1">Pendiente de revisión</p>
              <p className="text-sm text-amber-700">Este certificado está esperando tu aprobación o rechazo.</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/verify/${certificate.id}`}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Ver Detalles →
        </Link>
        {certificate.txHash && (
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${certificate.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-white text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-all duration-200 border-2 border-blue-200 hover:border-blue-300"
          >
            Stellar Explorer →
          </a>
        )}
        {certificate.fileUrl && (
          <a
            href={certificate.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
          >
            Ver Archivo →
          </a>
        )}
      </div>
    </div>
  )
}
