import { NextRequest, NextResponse } from 'next/server'
import { getCertificate } from '@/lib/db'
import { getCertificateFromContract, isCertificateApproved } from '@/lib/soroban'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Obtener certificado de Redis
    const certificate = await getCertificate(id)
    if (!certificate) {
      return NextResponse.json(
        { success: false, error: 'Certificate not found' },
        { status: 404 }
      )
    }

    // Si no tiene contractId, no está en el contrato
    if (!certificate.contractId) {
      return NextResponse.json({
        success: true,
        inContract: false,
        message: 'Certificate not registered in Smart Contract'
      })
    }

    // Convertir hash a formato correcto
    const fileHash = certificate.hash.length === 64 
      ? certificate.hash 
      : certificate.hash.padStart(64, '0').substring(0, 64)

    try {
      // Consultar estado desde Smart Contract
      const contractData = await getCertificateFromContract(fileHash)
      const isApproved = await isCertificateApproved(fileHash)

      return NextResponse.json({
        success: true,
        inContract: true,
        contractId: certificate.contractId,
        contractStatus: contractData.status,
        isApproved,
        contractData
      })
    } catch (contractError: any) {
      console.error('Error reading from contract:', contractError)
      return NextResponse.json({
        success: false,
        error: 'Error reading from Smart Contract',
        details: contractError.message
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error getting certificate contract status:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error getting certificate contract status' },
      { status: 500 }
    )
  }
}

