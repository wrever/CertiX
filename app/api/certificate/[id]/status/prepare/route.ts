import { NextRequest, NextResponse } from 'next/server'
import { getCertificate, saveCertificate } from '@/lib/db'
import { validateStellarAddress } from '@/lib/stellar'
import { prepareApproveTransaction, prepareRejectTransaction } from '@/lib/soroban-admin'
import { Keypair } from '@stellar/stellar-sdk'

const ADMIN_ADDRESS = process.env.ADMIN_PUBLIC_KEY || 'GALR6D6JTE2C554HD2OOW5CDMUYBYZ43S4VLWPDAMJFLSF2GQW5GLCT3'
const CONTRACT_ID = process.env.SOROBAN_CONTRACT_ID || 'CBAEDSXVAUIT3M7JOW3ASF6POMVNMYXDWBJ45JUWXN6GGNHVLLM52VJP'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, adminWallet, reason } = body

    // Validaciones
    if (!status || (status !== 'approved' && status !== 'rejected')) {
      return NextResponse.json(
        { success: false, error: 'Status must be "approved" or "rejected"' },
        { status: 400 }
      )
    }

    if (!adminWallet || !validateStellarAddress(adminWallet)) {
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

    // Verificar que está pendiente
    if (certificate.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Certificate is already ${certificate.status}` },
        { status: 400 }
      )
    }

    // IMPORTANTE: Si el certificado no está registrado en el contrato, intentar registrarlo ahora
    if (!certificate.contractId || !certificate.txHash) {
      // Intentar registrar el certificado en el contrato si falta
      try {
        // Certificado no registrado, intentando registrar
        
        // Convertir hash a formato correcto
        const fileHash = certificate.hash.length === 64 
          ? certificate.hash 
          : certificate.hash.padStart(64, '0').substring(0, 64)
        
        // Convertir txHash a formato correcto
        const txHash = certificate.txHash.length === 64 
          ? certificate.txHash 
          : Buffer.from(certificate.txHash, 'hex').toString('hex').padStart(64, '0').substring(0, 64)

        // Usar el secret key del sistema para registrar (el usuario ya firmó la transacción original)
        const ownerKeypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY!)

        const { registerCertificateOnContract } = await import('@/lib/soroban')
        const contractTxHash = await registerCertificateOnContract(
          fileHash,
          txHash,
          certificate.walletAddress,
          ownerKeypair
        )

        // Actualizar el certificado con el contractId
        const { saveCertificate } = await import('@/lib/db')
        certificate.contractId = CONTRACT_ID
        await saveCertificate(certificate)
        
        // Certificado registrado en contrato
      } catch (registerError: any) {
        console.error('❌ Error registering certificate in contract:', registerError)
        return NextResponse.json(
          { 
            success: false, 
            error: `Certificate is not registered in the Smart Contract and registration failed: ${registerError.message || 'Unknown error'}. Please ensure the certificate was uploaded and signed correctly.` 
          },
          { status: 400 }
        )
      }
    }

    // Convertir hash a formato correcto
    const fileHash = certificate.hash.length === 64 
      ? certificate.hash 
      : certificate.hash.padStart(64, '0').substring(0, 64)
    
    const fileHashBytes = Buffer.from(fileHash, 'hex')
    
    if (fileHashBytes.length !== 32) {
      return NextResponse.json(
        { success: false, error: 'Invalid certificate hash format' },
        { status: 400 }
      )
    }

    // Usar funciones separadas de soroban-admin.ts para preparar la transacción
    // Esto NO afecta la subida porque es código completamente separado
    let result
    if (status === 'approved') {
      result = await prepareApproveTransaction(fileHash, adminWallet)
    } else {
      result = await prepareRejectTransaction(fileHash, adminWallet, reason || 'Rejected by admin')
    }

    const { txXdr, txHash } = result

    return NextResponse.json({
      success: true,
      txXdr,
      txHash,
      certificateId: id,
      status,
      needsSignature: true
    })
  } catch (error: any) {
    console.error('Error preparing transaction:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error preparing transaction' },
      { status: 500 }
    )
  }
}

