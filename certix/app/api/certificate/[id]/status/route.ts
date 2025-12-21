import { NextRequest, NextResponse } from 'next/server'
import { getCertificate, updateCertificateStatus } from '@/lib/db'
import { isValidator } from '@/lib/validators'
import { validateStellarAddress } from '@/lib/stellar'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, validatorWallet, reason } = body

    // Validaciones
    if (!status || (status !== 'approved' && status !== 'rejected')) {
      return NextResponse.json(
        { success: false, error: 'Status must be "approved" or "rejected"' },
        { status: 400 }
      )
    }

    if (!validatorWallet || !validateStellarAddress(validatorWallet)) {
      return NextResponse.json(
        { success: false, error: 'Valid validator wallet address is required' },
        { status: 400 }
      )
    }

    // Verificar que es validador
    const isVal = await isValidator(validatorWallet)
    if (!isVal) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Wallet is not a validator' },
        { status: 403 }
      )
    }

    // Obtener certificado
    const certificate = await getCertificate(id)
    if (!certificate) {
      return NextResponse.json(
        { success: false, error: 'Certificate not found' },
        { status: 404 }
      )
    }

    // Verificar que está pendiente
    if (certificate.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Certificate is already ${certificate.status}` },
        { status: 400 }
      )
    }

    // Actualizar estado
    const updated = await updateCertificateStatus(
      id,
      status,
      validatorWallet,
      reason
    )

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Error updating certificate status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      certificate: updated,
      message: `Certificate ${status} successfully`
    })
  } catch (error: any) {
    console.error('Error updating certificate status:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error updating certificate status' },
      { status: 500 }
    )
  }
}

