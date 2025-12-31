import { getRedisClient } from './redis-client'
import { Certificate, CertificateStatus, CertificateStats } from '@/types/certificate'

export async function saveCertificate(certificate: Certificate): Promise<void> {
  try {
    const client = await getRedisClient()
    
    // Validar que el certificado tenga todos los campos requeridos
    if (!certificate.id || !certificate.walletAddress || !certificate.hash || !certificate.txHash) {
      throw new Error('Certificate missing required fields')
    }
    
    // Guardar certificado individual
    await client.set(`cert:${certificate.id}`, JSON.stringify(certificate))
    
    // Verificar si ya existe en las listas antes de agregar (evitar duplicados)
    const userCerts = await client.lRange(`user:${certificate.walletAddress}:certs`, 0, -1)
    if (!userCerts.includes(certificate.id)) {
      await client.lPush(`user:${certificate.walletAddress}:certs`, certificate.id)
    }
    
    const userStatusCerts = await client.lRange(`user:${certificate.walletAddress}:status:${certificate.status}`, 0, -1)
    if (!userStatusCerts.includes(certificate.id)) {
      await client.lPush(`user:${certificate.walletAddress}:status:${certificate.status}`, certificate.id)
    }
    
    const globalStatusCerts = await client.lRange(`status:${certificate.status}`, 0, -1)
    if (!globalStatusCerts.includes(certificate.id)) {
      await client.lPush(`status:${certificate.status}`, certificate.id)
    }
  } catch (error: any) {
    console.error('Error in saveCertificate:', error)
    throw error
  }
}

export async function getCertificate(id: string): Promise<Certificate | null> {
  const client = await getRedisClient()
  const data = await client.get(`cert:${id}`)
  if (!data) return null
  return JSON.parse(data) as Certificate
}

export async function getUserCertificates(
  walletAddress: string, 
  status?: CertificateStatus | 'all'
): Promise<Certificate[]> {
  const client = await getRedisClient()
  let certIds: string[]
  
  if (status && status !== 'all') {
    certIds = await client.lRange(`user:${walletAddress}:status:${status}`, 0, -1)
  } else {
    certIds = await client.lRange(`user:${walletAddress}:certs`, 0, -1)
  }
  
  if (!certIds || certIds.length === 0) return []
  
  // Eliminar duplicados usando Set
  const uniqueIds = Array.from(new Set(certIds))
  
  const certificates = await Promise.all(
    uniqueIds.map(id => getCertificate(id))
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
  await saveCertificate(certificate)
  
  // Actualizar listas por estado
  if (oldStatus !== status) {
    const client = await getRedisClient()
    // Remover de lista anterior
    await client.lRem(`user:${certificate.walletAddress}:status:${oldStatus}`, 0, id)
    await client.lRem(`status:${oldStatus}`, 0, id)
    
    // Verificar si ya existe antes de agregar a lista nueva (evitar duplicados)
    const newUserStatusCerts = await client.lRange(`user:${certificate.walletAddress}:status:${status}`, 0, -1)
    if (!newUserStatusCerts.includes(id)) {
      await client.lPush(`user:${certificate.walletAddress}:status:${status}`, id)
    }
    
    const newGlobalStatusCerts = await client.lRange(`status:${status}`, 0, -1)
    if (!newGlobalStatusCerts.includes(id)) {
      await client.lPush(`status:${status}`, id)
    }
  }
  
  return certificate
}

export async function getCertificatesByStatus(status: CertificateStatus): Promise<Certificate[]> {
  const client = await getRedisClient()
  const certIds = await client.lRange(`status:${status}`, 0, -1)
  if (!certIds || certIds.length === 0) return []
  
  // Eliminar duplicados usando Set
  const uniqueIds = Array.from(new Set(certIds))

  const certificates = await Promise.all(
    uniqueIds.map((id: string) => getCertificate(id))
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