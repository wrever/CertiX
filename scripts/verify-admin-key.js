#!/usr/bin/env node

/**
 * Script para verificar que una Secret Key corresponde a la wallet admin
 * 
 * Uso:
 *   node scripts/verify-admin-key.js <SECRET_KEY>
 * 
 * Ejemplo:
 *   node scripts/verify-admin-key.js SC3FVXSBS5OJCGQNO6FWIMGIILKTV6Q26SYQHN5ZHZRSMIEUSXMJAMNY
 */

const { Keypair } = require('@stellar/stellar-sdk');

const EXPECTED_PUBLIC_KEY = 'GDIN7HCR4PKKWS6MO57N7NF7VLGPO27GUQDR64TIK3CYRMPBCKUQDCT5';

function verifyKeypair(secretKey) {
  try {
    const kp = Keypair.fromSecret(secretKey.trim());
    const publicKey = kp.publicKey();
    
    console.log('\n🔍 Verificando Secret Key...\n');
    console.log('Public Key obtenida:', publicKey);
    console.log('Public Key esperada:', EXPECTED_PUBLIC_KEY);
    console.log('');
    
    if (publicKey === EXPECTED_PUBLIC_KEY) {
      console.log('✅ ¡CORRECTO! Esta Secret Key corresponde a la wallet admin.');
      console.log('✅ Puedes usarla para aprobar/rechazar certificados.\n');
      return true;
    } else {
      console.log('❌ INCORRECTO: Esta Secret Key NO corresponde a la wallet admin.');
      console.log('❌ La wallet admin debe ser:', EXPECTED_PUBLIC_KEY);
      console.log('❌ Pero esta key es de:', publicKey, '\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Error al verificar:', error.message);
    console.log('   Asegúrate de que la Secret Key sea válida (debe empezar con "S" y tener 56 caracteres)\n');
    return false;
  }
}

// Ejecutar si se pasa como argumento
if (process.argv.length > 2) {
  const secretKey = process.argv[2];
  verifyKeypair(secretKey);
} else {
  console.log('📋 Script de Verificación de Secret Key Admin\n');
  console.log('Uso:');
  console.log('  node scripts/verify-admin-key.js <SECRET_KEY>\n');
  console.log('Ejemplo:');
  console.log('  node scripts/verify-admin-key.js SC3FVXSBS5OJCGQNO6FWIMGIILKTV6Q26SYQHN5ZHZRSMIEUSXMJAMNY\n');
  console.log('⚠️  IMPORTANTE: No compartas tu Secret Key con nadie.\n');
}

