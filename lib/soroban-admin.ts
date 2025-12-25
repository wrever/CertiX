/**
 * Funciones separadas para operaciones de Admin (Aprobar/Rechazar)
 * Este archivo es completamente independiente de lib/soroban.ts
 * para evitar que los cambios afecten la subida de certificados
 */

import { 
  Contract, 
  Networks, 
  xdr, 
  Horizon, 
  TransactionBuilder,
  Address as StellarAddress,
  SorobanRpc
} from '@stellar/stellar-sdk'

const CONTRACT_ID = process.env.SOROBAN_CONTRACT_ID || 'CBAEDSXVAUIT3M7JOW3ASF6POMVNMYXDWBJ45JUWXN6GGNHVLLM52VJP'
const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'
const SOROBAN_RPC_URL = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org'
const NETWORK_PASSPHRASE = Networks.TESTNET

/**
 * Helper para convertir Address a ScVal
 */
function addressToScVal(address: string): xdr.ScVal {
  const addr = StellarAddress.fromString(address)
  return addr.toScVal()
}

/**
 * Helper para convertir Buffer a ScVal Bytes
 */
function bufferToScVal(buffer: Buffer): xdr.ScVal {
  if (buffer.length !== 32) {
    throw new Error(`Buffer must be exactly 32 bytes, got ${buffer.length}`)
  }
  return xdr.ScVal.scvBytes(buffer)
}

/**
 * Preparar transacción de aprobación (sin firmar)
 * Retorna XDR preparado para que el admin lo firme
 */
export async function prepareApproveTransaction(
  fileHash: string,
  adminWallet: string
): Promise<{ txXdr: string; txHash: string }> {
  console.log('🔧 [ADMIN] Preparing approve transaction...', {
    fileHash: fileHash.substring(0, 16) + '...',
    adminWallet
  })

  const contract = new Contract(CONTRACT_ID)
  const server = new Horizon.Server(HORIZON_URL)
  const rpc = new SorobanRpc.Server(SOROBAN_RPC_URL)

  // Convertir fileHash a Buffer (32 bytes = 64 hex chars)
  let fileHashBytes: Buffer
  try {
    if (fileHash.length === 64) {
      fileHashBytes = Buffer.from(fileHash, 'hex')
    } else {
      fileHashBytes = Buffer.from(fileHash.padStart(64, '0').substring(0, 64), 'hex')
    }
    
    if (fileHashBytes.length !== 32) {
      throw new Error('File hash must be 32 bytes (64 hex characters)')
    }
  } catch (e: any) {
    throw new Error(`Invalid hash format: ${e.message}`)
  }

  // Crear operación de aprobación
  const operation = contract.call(
    'approve_certificate',
    addressToScVal(adminWallet),
    bufferToScVal(fileHashBytes)
  )

  // Cargar cuenta del admin
  const sourceAccount = await server.loadAccount(adminWallet)

  // Crear transacción sin firmar
  let transaction = new TransactionBuilder(sourceAccount, {
    fee: '10000', // Fee más alto para Soroban
    networkPassphrase: NETWORK_PASSPHRASE
  })
    .addOperation(operation)
    .setTimeout(300) // 5 minutos
    .build()

  // IMPORTANTE: Preparar la transacción con Soroban RPC ANTES de que el admin la firme
  console.log('🔧 [ADMIN] Simulating transaction...')
  const simulation = await rpc.simulateTransaction(transaction)

  if (SorobanRpc.Api.isSimulationError(simulation)) {
    console.error('❌ [ADMIN] Simulation error:', simulation)
    throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation)}`)
  }

  console.log('✅ [ADMIN] Transaction simulated successfully, cost:', simulation.cost)

  // Preparar la transacción (esto actualiza el fee y otros parámetros)
  transaction = await rpc.prepareTransaction(transaction)
  console.log('✅ [ADMIN] Transaction prepared for Soroban')

  // NO firmar - devolver XDR para que el admin firme
  const txXdr = transaction.toXDR()
  const txHash = transaction.hash().toString('hex')

  return { txXdr, txHash }
}

/**
 * Preparar transacción de rechazo (sin firmar)
 * Retorna XDR preparado para que el admin lo firme
 */
export async function prepareRejectTransaction(
  fileHash: string,
  adminWallet: string,
  reason: string
): Promise<{ txXdr: string; txHash: string }> {
  console.log('🔧 [ADMIN] Preparing reject transaction...', {
    fileHash: fileHash.substring(0, 16) + '...',
    adminWallet,
    reason: reason.substring(0, 50) + '...'
  })

  const contract = new Contract(CONTRACT_ID)
  const server = new Horizon.Server(HORIZON_URL)
  const rpc = new SorobanRpc.Server(SOROBAN_RPC_URL)

  // Convertir fileHash a Buffer (32 bytes = 64 hex chars)
  let fileHashBytes: Buffer
  try {
    if (fileHash.length === 64) {
      fileHashBytes = Buffer.from(fileHash, 'hex')
    } else {
      fileHashBytes = Buffer.from(fileHash.padStart(64, '0').substring(0, 64), 'hex')
    }
    
    if (fileHashBytes.length !== 32) {
      throw new Error('File hash must be 32 bytes (64 hex characters)')
    }
  } catch (e: any) {
    throw new Error(`Invalid hash format: ${e.message}`)
  }

  // Crear operación de rechazo
  const operation = contract.call(
    'reject_certificate',
    addressToScVal(adminWallet),
    bufferToScVal(fileHashBytes),
    xdr.ScVal.scvString(reason)
  )

  // Cargar cuenta del admin
  const sourceAccount = await server.loadAccount(adminWallet)

  // Crear transacción sin firmar
  let transaction = new TransactionBuilder(sourceAccount, {
    fee: '10000', // Fee más alto para Soroban
    networkPassphrase: NETWORK_PASSPHRASE
  })
    .addOperation(operation)
    .setTimeout(300) // 5 minutos
    .build()

  // IMPORTANTE: Preparar la transacción con Soroban RPC ANTES de que el admin la firme
  console.log('🔧 [ADMIN] Simulating transaction...')
  const simulation = await rpc.simulateTransaction(transaction)

  if (SorobanRpc.Api.isSimulationError(simulation)) {
    console.error('❌ [ADMIN] Simulation error:', simulation)
    throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation)}`)
  }

  console.log('✅ [ADMIN] Transaction simulated successfully, cost:', simulation.cost)

  // Preparar la transacción (esto actualiza el fee y otros parámetros)
  transaction = await rpc.prepareTransaction(transaction)
  console.log('✅ [ADMIN] Transaction prepared for Soroban')

  // NO firmar - devolver XDR para que el admin firme
  const txXdr = transaction.toXDR()
  const txHash = transaction.hash().toString('hex')

  return { txXdr, txHash }
}

/**
 * Enviar transacción de admin firmada al contrato
 * La transacción ya debe estar preparada y firmada
 */
export async function submitAdminTransaction(
  signedTxXdr: string
): Promise<string> {
  console.log('📤 [ADMIN] Submitting signed transaction to Soroban RPC...')

  const rpc = new SorobanRpc.Server(SOROBAN_RPC_URL)

  // Reconstruir la transacción desde el XDR firmado
  const transaction = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE)

  // Verificar si es una transacción normal o FeeBump
  if ('operations' in transaction) {
    console.log('📋 [ADMIN] Transaction operations:', transaction.operations.length)
  } else {
    console.log('📋 [ADMIN] FeeBump transaction detected')
  }

  // La transacción ya fue preparada en prepareApproveTransaction/prepareRejectTransaction
  // y firmada por el admin. Solo necesitamos enviarla directamente.
  console.log('📤 [ADMIN] Sending prepared and signed transaction to Soroban RPC...')
  const response = await rpc.sendTransaction(transaction)

  console.log('📋 [ADMIN] Response from RPC:', {
    status: (response as any).status,
    hash: (response as any).hash,
    errorResultXdr: (response as any).errorResultXdr
  })

  if ((response as any).hash) {
    const txHash = (response as any).hash
    console.log('✅ [ADMIN] Transaction submitted successfully, hash:', txHash)
    return txHash
  } else {
    console.error('❌ [ADMIN] Transaction submission failed:', response)
    throw new Error(`Transaction submission failed: ${JSON.stringify(response)}`)
  }
}

