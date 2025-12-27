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
    approved: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30',
    rejected: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/30',
    pending: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30'
  }

  return (
    <div className={`glass-card rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 animate-fade-in border-l-4 hover-lift ${
      certificate.status === 'approved' ? 'border-green-500' :
      certificate.status === 'rejected' ? 'border-red-500' :
      'border-yellow-500'
    }`}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-2xl font-bold text-white pr-4">{certificate.title}</h3>
            <div className="flex flex-col gap-2 items-end flex-shrink-0">
              <CertificateStatusBadge status={certificate.status} />
              <VerifyBadge isValid={certificate.isValid || false} />
            </div>
          </div>
          
          {certificate.issuer && (
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-cyan-300">📜</span>
              <p className="text-cyan-200/80 font-medium">Emitido por: <span className="text-white">{certificate.issuer}</span></p>
            </div>
          )}
          
          {showWallet && (
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-cyan-400/60">👤</span>
              <p className="text-cyan-200/60 text-sm font-mono">
                {certificate.walletAddress}
              </p>
            </div>
          )}
          
          {certificate.contractId && (
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 glass-card border border-cyan-500/30 text-cyan-200 rounded-lg text-xs font-semibold mb-3">
              <span>📜</span>
              <span>Registrado en Smart Contract</span>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-2 mb-6 p-4 glass-card rounded-xl border border-cyan-500/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-cyan-200/60">Subido:</span>
          <span className="text-white font-medium">
            {new Date(certificate.uploadedAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
        {certificate.validatedAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-cyan-200/60">
              {certificate.status === 'approved' ? 'Aprobado' : 'Rechazado'}:
            </span>
            <span className="text-white font-medium">
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
            <span className="text-cyan-200/60">Validador:</span>
            <span className="text-white font-mono text-xs">
              {certificate.validatorWallet.slice(0, 8)}...{certificate.validatorWallet.slice(-8)}
            </span>
          </div>
        )}
        {certificate.rejectionReason && (
          <div className="mt-3 p-3 glass-card border border-red-500/30 rounded-lg bg-red-500/10">
            <p className="text-xs font-semibold text-red-300 mb-1">Razón de rechazo:</p>
            <p className="text-sm text-red-200/70">{certificate.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* Validator Notice */}
      {showValidatorActions && certificate.status === 'pending' && (
        <div className={`mb-6 p-4 rounded-xl border-2 ${statusGradients.pending}`}>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-semibold text-yellow-300 mb-1">Pendiente de revisión</p>
              <p className="text-sm text-yellow-200/70">Este certificado está esperando tu aprobación o rechazo.</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/verify/${certificate.id}`}
          className="px-5 py-2.5 gradient-button text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-glow-arcusx hover:shadow-glow-strong hover:scale-105"
        >
          Ver Detalles →
        </Link>
        {certificate.txHash && (
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${certificate.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 glass-card border border-cyan-500/30 text-cyan-200 rounded-lg text-sm font-semibold hover:bg-cyan-500/20 transition-all duration-200 hover:scale-105"
          >
            Stellar Explorer →
          </a>
        )}
        {certificate.fileUrl && (
          <a
            href={certificate.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 glass-card border border-cyan-500/30 text-cyan-200 rounded-lg text-sm font-semibold hover:bg-cyan-500/20 transition-all duration-200 hover:scale-105"
          >
            Ver Archivo →
          </a>
        )}
      </div>
    </div>
  )
}
