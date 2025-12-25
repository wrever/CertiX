import { NextRequest, NextResponse } from 'next/server'
import { validateStellarAddress } from '@/lib/stellar'
import { generateHash } from '@/lib/hash'
import { uploadFile, validateFile } from '@/lib/storage'
import { createCertificateTransaction, sendTransaction, getStellarExplorerUrl } from '@/lib/stellar'
import { saveCertificate } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const walletAddress = formData.get('walletAddress') as string
    const title = formData.get('title') as string
    const issuer = formData.get('issuer') as string | null

    // Validaciones
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      )
    }

    if (!walletAddress || !validateStellarAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Valid Stellar wallet address is required' },
        { status: 400 }
      )
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    // Validar archivo
    const fileValidation = validateFile(file)
    if (!fileValidation.valid) {
      return NextResponse.json(
        { success: false, error: fileValidation.error },
        { status: 400 }
      )
    }

    // Generar hash (necesitamos el buffer del archivo)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const hash = generateHash(buffer)

    // Subir archivo a Vercel Blob
    const fileUrl = await uploadFile(file, walletAddress)

    // Crear transacción Stellar (sin firmar - el usuario la firmará)
    const { txXdr, txHash } = await createCertificateTransaction(hash, walletAddress)

    // Generar ID del certificado (se guardará solo después de que la transacción sea exitosa)
    const certificateId = uuidv4()

    // NO guardar en DB todavía - solo se guardará después de que la transacción sea exitosa
    // Guardar temporalmente en memoria o usar el hash como referencia
    // Por ahora, solo devolvemos los datos necesarios para la firma

    // Devolver el XDR para que el usuario lo firme
    return NextResponse.json({
      success: true,
      certificateId,
      txXdr, // XDR para que el usuario lo firme
      txHash, // Hash previo para referencia
      hash,
      fileUrl, // Necesario para guardar después
      title: title.trim(),
      issuer: issuer?.trim() || undefined,
      status: 'pending',
      needsSignature: true // Indicar que necesita firma
    })
  } catch (error: any) {
    console.error('Error uploading certificate:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error uploading certificate' },
      { status: 500 }
    )
  }
}

