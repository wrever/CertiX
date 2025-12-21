import { kv } from '@vercel/kv'

const VALIDATORS_KEY = 'validators:list'

// Obtener lista de validadores
export async function getValidators(): Promise<string[]> {
  try {
    const validators = await kv.get<string[]>(VALIDATORS_KEY)
    return validators || []
  } catch (error) {
    console.error('Error getting validators:', error)
    return []
  }
}

// Verificar si una wallet es validadora
export async function isValidator(walletAddress: string): Promise<boolean> {
  try {
    const validators = await getValidators()
    return validators.includes(walletAddress)
  } catch (error) {
    console.error('Error checking validator:', error)
    return false
  }
}

// Agregar validador (solo para inicialización/admin)
export async function addValidator(walletAddress: string): Promise<void> {
  try {
    const validators = await getValidators()
    if (!validators.includes(walletAddress)) {
      validators.push(walletAddress)
      await kv.set(VALIDATORS_KEY, validators)
    }
  } catch (error) {
    console.error('Error adding validator:', error)
    throw error
  }
}

// Inicializar lista de validadores (puede estar vacía inicialmente)
export async function initializeValidators(): Promise<void> {
  try {
    const existing = await kv.get<string[]>(VALIDATORS_KEY)
    if (!existing) {
      await kv.set(VALIDATORS_KEY, [])
    }
  } catch (error) {
    console.error('Error initializing validators:', error)
  }
}

