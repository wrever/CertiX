import { put } from '@vercel/blob'

export async function uploadFile(file: File, walletAddress: string): Promise<string> {
  const timestamp = Date.now()
  const extension = file.name.split('.').pop() || 'bin'
  const fileName = `${timestamp}-${walletAddress.slice(0, 8)}.${extension}`
  
  // En producción (Vercel), el token se detecta automáticamente
  // En desarrollo, necesitamos el token en .env.local
  const token = process.env.BLOB_READ_WRITE_TOKEN
  
  try {
    // Si hay token, usarlo explícitamente (desarrollo)
    // Si no hay token, Vercel lo detecta automáticamente (producción)
    const blob = await put(fileName, file, {
      access: 'public',
      ...(token && { token }), // Solo pasar token si existe
    })
    return blob.url
  } catch (error: any) {
    if (error.message?.includes('token') || error.message?.includes('Token')) {
      throw new Error(
        'BLOB_READ_WRITE_TOKEN no configurado. ' +
        'En desarrollo: agrega BLOB_READ_WRITE_TOKEN a .env.local. ' +
        'En producción: Vercel lo detecta automáticamente si el store está conectado al proyecto.'
      )
    }
    throw error
  }
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File must be PDF, PNG, or JPG' }
  }
  
  return { valid: true }
}