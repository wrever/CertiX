import crypto from 'crypto'

export function generateHash(fileBuffer: Buffer): string {
  return crypto.createHash('sha256').update(fileBuffer).digest('hex')
}

// Para memo de Stellar (máximo 28 bytes)
export function generateShortHash(fileBuffer: Buffer): string {
  const fullHash = generateHash(fileBuffer)
  return fullHash.substring(0, 28)
}