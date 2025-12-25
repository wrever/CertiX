import { NextRequest, NextResponse } from 'next/server'
import { sendTransaction, getStellarExplorerUrl } from '@/lib/stellar'
import { saveCertificate } from '@/lib/db'
import { registerCertificateOnContract } from '@/lib/soroban'
import { Keypair } from '@stellar/stellar-sdk'
import { Certificate } from '@/types/certificate'

const CONTRACT_ID = process.env.SOROBAN_CONTRACT_ID || 'CBAEDSXVAUIT3M7JOW3ASF6POMVNMYXDWBJ45JUWXN6GGNHVLLM52VJP'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { certificateId, signedTxXdr, walletAddress, hash, fileUrl, title, issuer } = body

    console.log('📝 Sign endpoint called with:', {
      certificateId: !!certificateId,
      signedTxXdr: !!signedTxXdr,
      walletAddress: !!walletAddress,
      hash: !!hash,
      fileUrl: !!fileUrl,
      title: !!title
    })

    if (!certificateId || !signedTxXdr || !walletAddress || !hash || !fileUrl || !title) {
      console.error('❌ Missing required fields:', {
        certificateId: !certificateId,
        signedTxXdr: !signedTxXdr,
        walletAddress: !walletAddress,
        hash: !hash,
        fileUrl: !fileUrl,
        title: !title
      })
      return NextResponse.json(
        { success: false, error: 'Certificate ID, signed transaction XDR, wallet address, hash, fileUrl, and title are required' },
        { status: 400 }
      )
    }

    // Enviar transacción firmada a Stellar PRIMERO
    // Solo si la transacción es exitosa, guardamos el certificado
    let finalTxHash: string
    try {
      finalTxHash = await sendTransaction(signedTxXdr)
    } catch (txError: any) {
      console.error('Error sending transaction to Stellar:', txError)
      return NextResponse.json(
        { success: false, error: `Transaction failed: ${txError.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    // IMPORTANTE: Registrar en Smart Contract PRIMERO
    // Solo si el registro es exitoso, guardamos el certificado en la DB
    let contractTxHash: string
    try {
      console.log('📝 Registering certificate in Smart Contract...')
      // Convertir hash a formato correcto (32 bytes = 64 hex chars)
      const fileHash = hash.length === 64 
        ? hash 
        : hash.padStart(64, '0').substring(0, 64)
      
      // Convertir txHash a formato correcto
      const txHash = finalTxHash.length === 64 
        ? finalTxHash 
        : Buffer.from(finalTxHash, 'hex').toString('hex').padStart(64, '0').substring(0, 64)

      // Obtener keypair del sistema para registrar (el usuario ya firmó la transacción original)
      const ownerKeypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY!)

      contractTxHash = await registerCertificateOnContract(
        fileHash,
        txHash,
        walletAddress,
        ownerKeypair
      )

      console.log('✅ Certificate registered in Smart Contract, tx:', contractTxHash)
    } catch (contractError: any) {
      console.error('❌ Error registering certificate in contract:', contractError)
      // NO guardar el certificado si falla el registro en el contrato
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to register certificate in Smart Contract: ${contractError.message || 'Unknown error'}. The certificate was not saved. Please try again.` 
        },
        { status: 500 }
      )
    }

    // SOLO si el registro en el contrato fue exitoso, crear y guardar el certificado
    const certificate: Certificate = {
      id: certificateId,
      walletAddress,
      title: title.trim(),
      hash,
      txHash: finalTxHash,
      fileUrl,
      issuer: issuer?.trim() || undefined,
      status: 'pending',
      isValid: false,
      uploadedAt: new Date().toISOString(),
      contractId: CONTRACT_ID // Ya está registrado en el contrato
    }

    // Guardar certificado SOLO después de que el registro en el contrato sea exitoso
    try {
      console.log('💾 Saving certificate to DB...')
      await saveCertificate(certificate)
      console.log('✅ Certificate saved successfully')
    } catch (dbError: any) {
      console.error('❌ Error saving certificate to DB:', dbError)
      return NextResponse.json(
        { success: false, error: `Error saving certificate: ${dbError.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      certificateId,
      txHash: finalTxHash,
      contractId: certificate.contractId,
      stellarExplorerUrl: getStellarExplorerUrl(finalTxHash),
      message: 'Transaction signed and submitted successfully'
    })
  } catch (error: any) {
    console.error('❌ Error signing and submitting transaction:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { success: false, error: error.message || 'Error signing transaction' },
      { status: 500 }
    )
  }
}

