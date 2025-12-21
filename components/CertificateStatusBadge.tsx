import { CertificateStatus } from '@/types/certificate'

interface CertificateStatusBadgeProps {
  status: CertificateStatus
}

export default function CertificateStatusBadge({ status }: CertificateStatusBadgeProps) {
  if (status === 'approved') {
    return (
      <div className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-400 text-green-800 rounded-lg">
        <span className="mr-2">✅</span>
        Aprobado
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="inline-flex items-center px-4 py-2 bg-red-100 border border-red-400 text-red-800 rounded-lg">
        <span className="mr-2">❌</span>
        Rechazado
      </div>
    )
  }

  return (
    <div className="inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
      <span className="mr-2">⏳</span>
      En Revisión
    </div>
  )
}

