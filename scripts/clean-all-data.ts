/**
 * Script para limpiar TODOS los datos de CertiX
 * 
 * Este script elimina:
 * 1. Todos los certificados de Redis
 * 2. Todos los archivos de Vercel Blob Storage
 * 
 * ⚠️ ADVERTENCIA: Esta operación es IRREVERSIBLE
 * 
 * Uso:
 *   npm run clean
 *   o
 *   npx tsx scripts/clean-all-data.ts
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { getRedisClient } from '../lib/redis-client'
import { list, del } from '@vercel/blob'

// Cargar variables de entorno desde .env.local
function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), '.env.local')
    const envFile = readFileSync(envPath, 'utf-8')
    
    envFile.split('\n').forEach(line => {
      const trimmedLine = line.trim()
      // Ignorar comentarios y líneas vacías
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '') // Remover comillas
          process.env[key.trim()] = value.trim()
        }
      }
    })
    
    console.log('✅ Variables de entorno cargadas desde .env.local')
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.warn('⚠️ Archivo .env.local no encontrado, usando variables de entorno del sistema')
    } else {
      console.error('❌ Error cargando .env.local:', error.message)
    }
  }
}

// Cargar variables de entorno antes de continuar
loadEnvFile()

async function cleanRedis() {
  console.log('🧹 Limpiando Redis...')
  
  const client = await getRedisClient()
  
  try {
    // Obtener todas las claves relacionadas con certificados
    const keys = await client.keys('*')
    
    console.log(`📋 Encontradas ${keys.length} claves en Redis`)
    
    // Eliminar todas las claves
    if (keys.length > 0) {
      await client.del(keys)
      console.log(`✅ Eliminadas ${keys.length} claves de Redis`)
    } else {
      console.log('ℹ️ No hay claves para eliminar en Redis')
    }
    
    console.log('✅ Redis limpiado completamente')
  } catch (error: any) {
    console.error('❌ Error limpiando Redis:', error.message)
    throw error
  }
}

async function cleanBlobStorage() {
  console.log('🧹 Limpiando Vercel Blob Storage...')
  
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      console.warn('⚠️ BLOB_READ_WRITE_TOKEN no configurado, saltando limpieza de Blob Storage')
      return
    }

    // Listar todos los blobs
    let cursor: string | undefined = undefined
    let totalDeleted = 0
    
    do {
      const { blobs, cursor: nextCursor } = await list({
        token,
        cursor,
        limit: 1000 // Máximo por página
      })
      
      console.log(`📋 Encontrados ${blobs.length} archivos en esta página`)
      
      // Eliminar cada archivo
      for (const blob of blobs) {
        try {
          await del(blob.url, { token })
          totalDeleted++
          console.log(`  ✅ Eliminado: ${blob.pathname || blob.url}`)
        } catch (error: any) {
          console.error(`  ❌ Error eliminando ${blob.pathname || blob.url}:`, error.message)
        }
      }
      
      cursor = nextCursor
    } while (cursor)
    
    console.log(`✅ Eliminados ${totalDeleted} archivos de Blob Storage`)
    console.log('✅ Blob Storage limpiado completamente')
  } catch (error: any) {
    console.error('❌ Error limpiando Blob Storage:', error.message)
    throw error
  }
}

async function main() {
  console.log('🚨 ADVERTENCIA: Este script eliminará TODOS los datos de CertiX')
  console.log('📋 Esto incluye:')
  console.log('   - Todos los certificados en Redis')
  console.log('   - Todos los archivos en Vercel Blob Storage')
  console.log('')
  console.log('⚠️ Esta operación es IRREVERSIBLE')
  console.log('')
  
  // En un entorno real, podrías pedir confirmación aquí
  // Por ahora, simplemente ejecutamos
  
  try {
    await cleanRedis()
    console.log('')
    await cleanBlobStorage()
    console.log('')
    console.log('🎉 ¡Limpieza completada exitosamente!')
    console.log('✅ La base de datos está lista para grabar un nuevo demo')
  } catch (error: any) {
    console.error('')
    console.error('❌ Error durante la limpieza:', error.message)
    process.exit(1)
  } finally {
    // Cerrar conexión Redis
    try {
      const client = await getRedisClient()
      if (client.isOpen) {
        await client.quit()
      }
    } catch (error) {
      // Ignorar errores al cerrar
    }
  }
}

// Ejecutar
main()

