import { put } from '@vercel/blob'

export async function uploadFile(file: File, walletAddress: string): Promise<string> {
  const timestamp = Date.now()
  const extension = file.name.split('.').pop()
  const fileName = `${timestamp}-${walletAddress.slice(0, 8)}.${extension}`
  
  const blob = await put(fileName, file, {
    access: 'public',
  })
  return blob.url
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

