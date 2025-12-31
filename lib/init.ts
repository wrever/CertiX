import { initializeValidators } from './validators'

// Inicializar sistema al arrancar
export async function initializeSystem() {
  try {
    await initializeValidators()
    console.log('✅ Sistema inicializado correctamente')
  } catch (error) {
    console.error('❌ Error al inicializar sistema:', error)
  }
}