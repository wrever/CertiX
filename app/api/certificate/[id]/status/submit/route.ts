import { NextRequest, NextResponse } from 'next/server'
import { getCertificate, updateCertificateStatus } from '@/lib/db'
import { getStellarExplorerUrl, validateStellarAddress } from '@/lib/stellar'
import { submitAdminTransaction } from '@/lib/soroban-admin'

const ADMIN_ADDRESS = process.env.ADMIN_PUBLIC_KEY || 'GALR6D6JTE2C554HD2OOW5CDMUYBYZ43S4VLWPDAMJFLSF2GQW5GLCT3'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { signedTxXdr, adminWallet, status, reason } = body

    console.log('📝 Submit endpoint called with:', {
      id,
      hasSignedTxXdr: !!signedTxXdr,
      adminWallet: !!adminWallet,
      status: !!status
    })

    if (!signedTxXdr || !adminWallet || !status) {
      console.error('❌ Missing required fields:', {
        signedTxXdr: !signedTxXdr,
        adminWallet: !adminWallet,
        status: !status
      })
      return NextResponse.json(
        { success: false, error: 'Signed transaction XDR, admin wallet, and status are required' },
        { status: 400 }
      )
    }

    if (!validateStellarAddress(adminWallet)) {
      return NextResponse.json(
        { success: false, error: 'Valid admin wallet address is required' },
        { status: 400 }
      )
    }

    // Verificar que es admin
    if (adminWallet !== ADMIN_ADDRESS) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Wallet is not the admin of the Smart Contract' },
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

    // Enviar transacción firmada usando función separada de soroban-admin.ts
    // Esto NO afecta la subida porque es código completamente separado
    let finalTxHash: string
    try {
      console.log('📤 [SUBMIT] Sending signed transaction using soroban-admin...')
      finalTxHash = await submitAdminTransaction(signedTxXdr)
      console.log('✅ [SUBMIT] Transaction sent successfully, hash:', finalTxHash)
    } catch (txError: any) {
      console.error('❌ Error sending transaction to Soroban RPC:', txError)
      console.error('Error details:', {
        message: txError.message,
        response: txError.response?.data,
        status: txError.response?.status,
        statusText: txError.response?.statusText,
        error: txError.error
      })
      console.error('Transaction XDR (first 100 chars):', signedTxXdr?.substring(0, 100))
      
      // Extraer mensaje de error más descriptivo
      let errorMessage = txError.message || 'Unknown error'
      if (txError.response?.data?.extras?.result_codes) {
        errorMessage = `Stellar error: ${JSON.stringify(txError.response.data.extras.result_codes)}`
      } else if (txError.error) {
        errorMessage = `Soroban RPC error: ${JSON.stringify(txError.error)}`
      }
      
      return NextResponse.json(
        { success: false, error: `Error sending transaction: ${errorMessage}` },
        { status: 500 }
      )
    }

    // Actualizar estado en Redis
    let updated
    try {
      updated = await updateCertificateStatus(
        id,
        status,
        adminWallet,
        reason
      )
    } catch (dbError: any) {
      console.error('Error updating certificate status in DB:', dbError)
      // Aún así retornar éxito porque la transacción ya se envió a Stellar
      return NextResponse.json({
        success: true,
        certificate: certificate, // Retornar certificado original
        txHash: finalTxHash,
        stellarExplorerUrl: getStellarExplorerUrl(finalTxHash),
        message: `Certificate ${status} successfully (transaction sent, but DB update failed)`,
        warning: 'Transaction sent to blockchain, but database update failed'
      })
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Error updating certificate status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      certificate: updated,
      txHash: finalTxHash,
      stellarExplorerUrl: getStellarExplorerUrl(finalTxHash),
      message: `Certificate ${status} successfully`
    })
  } catch (error: any) {
    console.error('Error submitting signed transaction:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error submitting transaction' },
      { status: 500 }
    )
  }
}

