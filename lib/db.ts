import { kv } from '@vercel/kv'
import { Certificate, CertificateStatus, CertificateStats } from '@/types/certificate'

export async function saveCertificate(certificate: Certificate): Promise<void> {
  // Guardar certificado individual
  await kv.set(`cert:${certificate.id}`, certificate)
  
  // Guardar en lista de certificados del usuario
  await kv.lpush(`user:${certificate.walletAddress}:certs`, certificate.id)
  
  // Guardar en lista por estado
  await kv.lpush(`user:${certificate.walletAddress}:status:${certificate.status}`, certificate.id)
  
  // Guardar en lista global por estado (para validadores)
  await kv.lpush(`status:${certificate.status}`, certificate.id)
}

export async function getCertificate(id: string): Promise<Certificate | null> {
  return await kv.get(`cert:${id}`)
}

export async function getUserCertificates(
  walletAddress: string, 
  status?: CertificateStatus
): Promise<Certificate[]> {
  let certIds: string[]
  
  if (status) {
    certIds = await kv.lrange(`user:${walletAddress}:status:${status}`, 0, -1) as string[]
  } else {
    certIds = await kv.lrange(`user:${walletAddress}:certs`, 0, -1) as string[]
  }
  
  if (!certIds || certIds.length === 0) return []
  
  const certificates = await Promise.all(
    certIds.map(id => kv.get<Certificate>(`cert:${id}`))
  )
  return certificates.filter(Boolean) as Certificate[]
}

export async function updateCertificateStatus(
  id: string,
  status: 'approved' | 'rejected',
  validatorWallet: string,
  reason?: string
): Promise<Certificate | null> {
  const certificate = await getCertificate(id)
  if (!certificate) return null
  
  const oldStatus = certificate.status
  
  // Actualizar certificado
  certificate.status = status
  certificate.validatorWallet = validatorWallet
  certificate.validatedAt = new Date().toISOString()
  if (reason) {
    certificate.rejectionReason = reason
  }
  
  // Guardar actualizado
  await kv.set(`cert:${id}`, certificate)
  
  // Actualizar listas por estado
  if (oldStatus !== status) {
    // Remover de lista anterior
    await kv.lrem(`user:${certificate.walletAddress}:status:${oldStatus}`, 0, id)
    await kv.lrem(`status:${oldStatus}`, 0, id)
    
    // Agregar a lista nueva
    await kv.lpush(`user:${certificate.walletAddress}:status:${status}`, id)
    await kv.lpush(`status:${status}`, id)
  }
  
  return certificate
}

export async function getCertificatesByStatus(status: CertificateStatus): Promise<Certificate[]> {
  const certIds = await kv.lrange(`status:${status}`, 0, -1) as string[]
  if (!certIds || certIds.length === 0) return []
  
  const certificates = await Promise.all(
    certIds.map(id => kv.get<Certificate>(`cert:${id}`))
  )
  return certificates.filter(Boolean) as Certificate[]
}

export async function getCertificateStats(walletAddress: string): Promise<CertificateStats> {
  const allCerts = await getUserCertificates(walletAddress)
  
  return {
    total: allCerts.length,
    pending: allCerts.filter(c => c.status === 'pending').length,
    approved: allCerts.filter(c => c.status === 'approved').length,
    rejected: allCerts.filter(c => c.status === 'rejected').length,
  }
}

