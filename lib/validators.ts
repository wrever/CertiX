import { getRedisClient } from './redis-client'

const VALIDATORS_KEY = 'validators:list'

// Obtener lista de validadores
export async function getValidators(): Promise<string[]> {
  try {
    const client = await getRedisClient()
    const data = await client.get(VALIDATORS_KEY)
    if (!data) return []
    return JSON.parse(data) as string[]
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
      const client = await getRedisClient()
      await client.set(VALIDATORS_KEY, JSON.stringify(validators))
    }
  } catch (error) {
    console.error('Error adding validator:', error)
    throw error
  }
}

// Remover validador
export async function removeValidator(walletAddress: string): Promise<void> {
  try {
    let validators = await getValidators()
    validators = validators.filter(wallet => wallet !== walletAddress)
    const client = await getRedisClient()
    await client.set(VALIDATORS_KEY, JSON.stringify(validators))
  } catch (error) {
    console.error('Error removing validator:', error)
    throw error
  }
}

// Inicializar lista de validadores (puede estar vacía inicialmente)
export async function initializeValidators(): Promise<void> {
  try {
    const client = await getRedisClient()
    const existing = await client.get(VALIDATORS_KEY)
    if (!existing) {
      await client.set(VALIDATORS_KEY, JSON.stringify([]))
    }
  } catch (error) {
    console.error('Error initializing validators:', error)
  }
}