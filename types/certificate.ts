export type CertificateStatus = 'pending' | 'approved' | 'rejected'

export interface Certificate {
  id: string
  walletAddress: string
  title: string
  hash: string
  txHash: string
  fileUrl: string
  issuer?: string
  status: CertificateStatus
  isValid: boolean
  uploadedAt: string
  verifiedAt?: string
  validatedAt?: string
  validatorWallet?: string
  rejectionReason?: string
  contractId?: string // ID del Smart Contract Soroban
}

export interface CertificateUploadResponse {
  success: boolean
  certificateId: string
  txHash: string
  txXdr?: string // XDR para que el usuario lo firme
  hash: string
  fileUrl?: string // URL del archivo subido (necesario para guardar después)
  title?: string // Título del certificado (necesario para guardar después)
  issuer?: string // Emisor del certificado (opcional)
  stellarExplorerUrl?: string
  needsSignature?: boolean // Indica que necesita firma del usuario
  status?: CertificateStatus
  error?: string
}

export interface CertificateVerifyResponse {
  success: boolean
  isValid: boolean
  certificate: Certificate
  stellarExplorerUrl: string
  error?: string
}

export interface CertificateListResponse {
  success: boolean
  certificates: Certificate[]
  stats?: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  error?: string
}

export interface CertificateStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export interface UpdateStatusRequest {
  status: 'approved' | 'rejected'
  validatorWallet: string
  reason?: string
}

