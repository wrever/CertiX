import { NextRequest, NextResponse } from 'next/server'
import { getUserCertificates, getCertificateStats, saveCertificate } from '@/lib/db'
import { validateStellarAddress } from '@/lib/stellar'
import { isCertificateApproved } from '@/lib/soroban'
import { CertificateStatus } from '@/types/certificate'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as CertificateStatus | null

    if (!validateStellarAddress(wallet)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Stellar wallet address' },
        { status: 400 }
      )
    }

    const certificates = await getUserCertificates(wallet, status || undefined)
    
    // Verificar estado de aprobación en el Smart Contract para cada certificado
    // y actualizar isValid basado en si está aprobado en el contrato
    for (const cert of certificates) {
      if (cert.contractId && cert.hash) {
        try {
          // Verificar si el certificado está aprobado en el contrato
          const isApproved = await isCertificateApproved(cert.hash)
          
          // Si está aprobado en el contrato, debe estar verificado
          if (isApproved && !cert.isValid) {
            cert.isValid = true
            cert.verifiedAt = new Date().toISOString()
            await saveCertificate(cert)
          } else if (!isApproved && cert.isValid) {
            // Si no está aprobado pero estaba marcado como válido, corregir
            cert.isValid = false
            await saveCertificate(cert)
          }
        } catch (error: any) {
          // Si hay error al verificar el contrato, no actualizar
          // pero loguear el error para debugging
          console.error(`Error verifying certificate ${cert.id} in contract:`, error.message)
        }
      }
    }
    
    const stats = await getCertificateStats(wallet)

    return NextResponse.json({
      success: true,
      certificates,
      stats
    })
  } catch (error: any) {
    console.error('Error getting user certificates:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error getting certificates' },
      { status: 500 }
    )
  }
}
