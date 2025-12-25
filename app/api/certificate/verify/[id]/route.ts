import { NextRequest, NextResponse } from 'next/server'
import { getCertificate, saveCertificate } from '@/lib/db'
import { getTransaction, getStellarExplorerUrl } from '@/lib/stellar'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Obtener certificado de DB
    const certificate = await getCertificate(id)
    if (!certificate) {
      return NextResponse.json(
        { success: false, error: 'Certificate not found' },
        { status: 404 }
      )
    }

    // Buscar transacción en Stellar
    const transaction = await getTransaction(certificate.txHash)
    const memo = transaction.memo || ''
    const memoText = typeof memo === 'string' ? memo : String(memo)

    // Comparar hash (primeros 28 caracteres por límite de memo)
    const isValid = memoText === certificate.hash.substring(0, 28)

    // Actualizar estado si es válido
    if (isValid && !certificate.isValid) {
      certificate.isValid = true
      certificate.verifiedAt = new Date().toISOString()
      // Guardar actualización
      await saveCertificate(certificate)
    }

    return NextResponse.json({
      success: true,
      isValid,
      certificate,
      stellarExplorerUrl: getStellarExplorerUrl(certificate.txHash)
    })
  } catch (error: any) {
    console.error('Error verifying certificate:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error verifying certificate' },
      { status: 500 }
    )
  }
}

