import { CertificateStatus } from '@/types/certificate'

interface CertificateStatusBadgeProps {
  status: CertificateStatus
}

export default function CertificateStatusBadge({ status }: CertificateStatusBadgeProps) {
  if (status === 'approved') {
    return (
      <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-bold shadow-md">
        <span className="mr-1.5">✅</span>
        Aprobado
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg text-xs font-bold shadow-md">
        <span className="mr-1.5">❌</span>
        Rechazado
      </div>
    )
  }

  return (
    <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg text-xs font-bold shadow-md">
      <span className="mr-1.5 animate-pulse">⏳</span>
      En Revisión
    </div>
  )
}
