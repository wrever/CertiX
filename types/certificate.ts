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
}

export interface CertificateUploadResponse {
  success: boolean
  certificateId: string
  txHash: string
  hash: string
  stellarExplorerUrl: string
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

