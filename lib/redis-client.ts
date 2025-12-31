import { createClient, RedisClientType } from 'redis'

let redisClient: RedisClientType | null = null

/**
 * Obtener cliente Redis (singleton)
 * Reutiliza la misma conexión si ya existe
 */
export async function getRedisClient(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    return redisClient
  }

  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    throw new Error('❌ REDIS_URL environment variable is not set')
  }

  // Crear nuevo cliente
  redisClient = createClient({
    url: redisUrl
  })

  // Manejar errores de conexión
  redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err)
  })

  // Conectar al servidor Redis
  if (!redisClient.isOpen) {
    await redisClient.connect()
  }

  return redisClient
}

/**
 * Cerrar conexión Redis (útil para scripts)
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit()
    redisClient = null
  }
}
