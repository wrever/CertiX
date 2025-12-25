import { NextRequest, NextResponse } from 'next/server'
import { getCertificate, updateCertificateStatus } from '@/lib/db'
import { validateStellarAddress } from '@/lib/stellar'
import { approveCertificateOnContract, rejectCertificateOnContract } from '@/lib/soroban'
import { Keypair } from '@stellar/stellar-sdk'

// Admin address del Smart Contract
const ADMIN_ADDRESS = process.env.ADMIN_PUBLIC_KEY || 'GALR6D6JTE2C554HD2OOW5CDMUYBYZ43S4VLWPDAMJFLSF2GQW5GLCT3'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
        { success: false, error: 'Valid admin wallet address is required' },
        { status: 400 }
      )
    }

    // Verificar que es admin del Smart Contract
    if (validatorWallet !== ADMIN_ADDRESS) {
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

    // NUEVO: Actualizar en Smart Contract primero
    // Usar ADMIN_SECRET_KEY si está configurada, sino usar STELLAR_SECRET_KEY
    const adminSecretKey = process.env.ADMIN_SECRET_KEY || process.env.STELLAR_SECRET_KEY!
    const adminKeypair = Keypair.fromSecret(adminSecretKey)
    
    try {
      // Convertir hash a formato correcto (32 bytes = 64 hex chars)
      const fileHash = certificate.hash.length === 64 
        ? certificate.hash 
        : certificate.hash.padStart(64, '0').substring(0, 64)

      if (status === 'approved') {
        await approveCertificateOnContract(fileHash, adminKeypair)
      } else {
        await rejectCertificateOnContract(
          fileHash,
          reason || 'Rejected by admin',
          adminKeypair
        )
      }
    } catch (contractError: any) {
      console.error('Error updating certificate in contract:', contractError)
      // No fallar si el contrato falla, pero loguear
      // En producción, decidir si esto debe ser crítico
    }

    // Actualizar estado en Redis (para queries rápidas y cache)
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

