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
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No hay certificados disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {certificates.map((cert) => (
        <div key={cert.id}>
          <CertificateCard
            certificate={cert}
            showWallet={showWallet}
            showValidatorActions={showValidatorActions}
            onStatusChange={onStatusChange}
          />
          {showValidatorActions && validatorWallet && cert.status === 'pending' && (
            <div className="mt-4 -mt-2">
              <ValidatorActions
                certificate={cert}
                validatorWallet={validatorWallet}
                onStatusChange={onStatusChange || (() => {})}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

