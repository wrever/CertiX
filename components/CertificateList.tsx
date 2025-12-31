import { Certificate } from '@/types/certificate'
import CertificateCard from './CertificateCard'
import ValidatorActions from './ValidatorActions'

interface CertificateListProps {
  certificates: Certificate[]
  showWallet?: boolean
  showValidatorActions?: boolean
  validatorWallet?: string
  onStatusChange?: () => void
}

export default function CertificateList({ 
  certificates, 
  showWallet = false,
  showValidatorActions = false,
  validatorWallet,
  onStatusChange
}: CertificateListProps) {
  if (certificates.length === 0) {
    return (
      <div className="glass-card rounded-lg shadow p-8 text-center border border-cyan-500/20">
        <p className="text-cyan-200/70">No hay certificados disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {certificates.map((cert) => (
        <div key={cert.id}>
          <CertificateCard
            certificate={cert}
            showWallet={showWallet}
            showValidatorActions={showValidatorActions}
            validatorWallet={validatorWallet}
            onStatusChange={onStatusChange}
          />
        </div>
      ))}
    </div>
  )
}
