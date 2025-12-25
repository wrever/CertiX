import { createClient } from 'redis'

let client: ReturnType<typeof createClient> | null = null

export async function getRedisClient() {
  if (!client) {
    const redisUrl = process.env.REDIS_URL
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set')
    }

    client = createClient({ url: redisUrl })
    
    client.on('error', (err) => console.error('Redis Client Error', err))
    
    if (!client.isOpen) {
      await client.connect()
    }
  }
  
  if (!client.isOpen) {
    await client.connect()
  }
  
  return client
}

