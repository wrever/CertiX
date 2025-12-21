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
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition ${
      certificate.status === 'approved' ? 'border-l-4 border-green-500' :
      certificate.status === 'rejected' ? 'border-l-4 border-red-500' :
      'border-l-4 border-yellow-500'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">{certificate.title}</h3>
          {certificate.issuer && (
            <p className="text-gray-600 text-sm mb-2">Emitido por: {certificate.issuer}</p>
          )}
          {showWallet && (
            <p className="text-gray-500 text-xs font-mono mb-2">
              {certificate.walletAddress}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 items-end">
          <CertificateStatusBadge status={certificate.status} />
          <VerifyBadge isValid={certificate.isValid || false} />
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-4 space-y-1">
        <p>Subido: {new Date(certificate.uploadedAt).toLocaleDateString('es-ES')}</p>
        {certificate.validatedAt && (
          <p>
            {certificate.status === 'approved' ? 'Aprobado' : 'Rechazado'}: {new Date(certificate.validatedAt).toLocaleDateString('es-ES')}
          </p>
        )}
        {certificate.validatorWallet && (
          <p className="text-xs font-mono">Validador: {certificate.validatorWallet.slice(0, 8)}...{certificate.validatorWallet.slice(-8)}</p>
        )}
        {certificate.rejectionReason && (
          <p className="text-red-600 text-xs">Razón: {certificate.rejectionReason}</p>
        )}
      </div>

      {showValidatorActions && certificate.status === 'pending' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800 mb-2">Este certificado está pendiente de revisión</p>
          <p className="text-xs text-yellow-600">Usa los botones de acción del validador para aprobar o rechazar</p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Link
          href={`/verify/${certificate.id}`}
          className="text-primary-600 hover:underline text-sm font-semibold"
        >
          Ver Detalles →
        </Link>
        {certificate.txHash && (
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${certificate.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline text-sm"
          >
            Stellar Explorer →
          </a>
        )}
        {certificate.fileUrl && (
          <a
            href={certificate.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline text-sm"
          >
            Ver Archivo →
          </a>
        )}
      </div>
    </div>
  )
}

