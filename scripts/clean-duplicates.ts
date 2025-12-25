/**
 * Script para limpiar certificados duplicados en Redis
 * Ejecutar con: npx tsx scripts/clean-duplicates.ts
 */

import { getRedisClient } from '../lib/redis-client'

async function cleanDuplicates() {
  const client = await getRedisClient()
  
  console.log('🧹 Limpiando duplicados en Redis...')
  
  // Obtener todas las listas de estado
  const statuses = ['pending', 'approved', 'rejected']
  
  for (const status of statuses) {
    const key = `status:${status}`
    const certIds = await client.lRange(key, 0, -1)
    
    if (certIds.length === 0) continue
    
    // Encontrar duplicados
    const seen = new Set<string>()
    const duplicates: number[] = []
    
    certIds.forEach((id, index) => {
      if (seen.has(id)) {
        duplicates.push(index)
      } else {
        seen.add(id)
      }
    })
    
    if (duplicates.length > 0) {
      console.log(`  📋 ${key}: ${duplicates.length} duplicados encontrados`)
      
      // Eliminar duplicados (de atrás hacia adelante para no afectar índices)
      for (let i = duplicates.length - 1; i >= 0; i--) {
        const index = duplicates[i]
        await client.lSet(key, index, '__DELETED__')
      }
      
      // Remover todos los marcados como eliminados
      await client.lRem(key, 0, '__DELETED__')
      
      console.log(`  ✅ ${key}: Duplicados eliminados`)
    } else {
      console.log(`  ✓ ${key}: Sin duplicados`)
    }
  }
  
  // Limpiar listas de usuarios también
  // Esto es más complejo, necesitaríamos obtener todas las keys de usuario
  // Por ahora solo limpiamos las listas globales
  
  console.log('✨ Limpieza completada!')
  process.exit(0)
}

cleanDuplicates().catch(console.error)

