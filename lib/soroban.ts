import { 
  Contract, 
  Networks, 
  xdr, 
  Horizon, 
  TransactionBuilder,
  Keypair,
  Address as StellarAddress,
  SorobanRpc
} from '@stellar/stellar-sdk'

const CONTRACT_ID = process.env.SOROBAN_CONTRACT_ID || 'CBAEDSXVAUIT3M7JOW3ASF6POMVNMYXDWBJ45JUWXN6GGNHVLLM52VJP'
const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'
const SOROBAN_RPC_URL = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org'
const NETWORK_PASSPHRASE = Networks.TESTNET

/**
 * Helper para convertir Address a ScVal
 * Usar el método toScVal() directamente del Address (igual que en status/prepare/route.ts)
 */
function addressToScVal(address: string): xdr.ScVal {
  try {
    const addr = StellarAddress.fromString(address)
    // Usar toScVal() directamente (igual que en status/prepare/route.ts que funciona)
    return addr.toScVal()
  } catch (e: any) {
    console.error('Error converting address to ScVal:', e)
    throw new Error(`Invalid address format: ${e.message}`)
  }
}

/**
 * Helper para convertir Buffer a ScVal BytesN<32>
 * Para Soroban, necesitamos crear un BytesN<32> que es un tipo específico
 */
function bufferToScVal(buffer: Buffer): xdr.ScVal {
  if (buffer.length !== 32) {
    throw new Error(`Buffer must be exactly 32 bytes, got ${buffer.length}`)
  }
  // Crear BytesN<32> usando xdr.ScVal.scvBytes con el buffer
  // Soroban espera BytesN<32> que es un tipo específico de 32 bytes
  return xdr.ScVal.scvBytes(buffer)
}

/**
 * Registrar certificado en Smart Contract
 */
export async function registerCertificateOnContract(
  fileHash: string,
  txHash: string,
  ownerAddress: string,
  ownerKeypair: Keypair
): Promise<string> {
  // Registrando certificado en contrato

  const contract = new Contract(CONTRACT_ID)
  const server = new Horizon.Server(HORIZON_URL)
  const rpc = new SorobanRpc.Server(SOROBAN_RPC_URL)
  
  // Convertir hashes a Buffer (32 bytes = 64 hex chars)
  let fileHashBytes: Buffer
  let txHashBytes: Buffer
  
  try {
    if (fileHash.length === 64) {
      fileHashBytes = Buffer.from(fileHash, 'hex')
    } else {
      fileHashBytes = Buffer.from(fileHash.padStart(64, '0').substring(0, 64), 'hex')
    }
    
    if (txHash.length === 64) {
      txHashBytes = Buffer.from(txHash, 'hex')
    } else {
      txHashBytes = Buffer.from(txHash.padStart(64, '0').substring(0, 64), 'hex')
    }
    
    if (fileHashBytes.length !== 32 || txHashBytes.length !== 32) {
      throw new Error(`Hash must be 32 bytes. fileHash: ${fileHashBytes.length}, txHash: ${txHashBytes.length}`)
    }
    
    // Hashes convertidos correctamente
  } catch (e: any) {
    console.error('❌ Error converting hashes:', e)
    throw new Error(`Invalid hash format: ${e.message}`)
  }
  
  // Convertir Address a ScVal usando la función helper
  let ownerScVal: xdr.ScVal
  try {
    ownerScVal = addressToScVal(ownerAddress)
    // Owner address convertido a ScVal
  } catch (e: any) {
    console.error('❌ Error converting owner address:', e)
    throw new Error(`Invalid owner address: ${e.message}`)
  }
  
  // Crear operación para invocar el contrato
  let operation
  try {
    // Crear operación de llamada al contrato
    operation = contract.call(
      'register_certificate',
      ownerScVal,
      bufferToScVal(fileHashBytes),
      bufferToScVal(txHashBytes)
    )
  } catch (e: any) {
    console.error('❌ Error creating contract call:', e)
    console.error('Error stack:', e.stack)
    throw new Error(`Error creating contract call: ${e.message}`)
  }
  
  // Cargar cuenta del owner
  let sourceAccount
  try {
    sourceAccount = await server.loadAccount(ownerKeypair.publicKey())
  } catch (e: any) {
    console.error('❌ Error loading source account:', e)
    throw new Error(`Error loading account: ${e.message}`)
  }
  
  // Crear transacción SIN firmar todavía
  // IMPORTANTE: Para Soroban, debemos preparar ANTES de firmar
  let transaction
  try {
    // Para transacciones Soroban, usar fee más alto (10000 stroops = 0.001 XLM)
    transaction = new TransactionBuilder(sourceAccount, {
      fee: '10000',
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(operation)
      .setTimeout(300)
      .build()
  } catch (e: any) {
    console.error('❌ Error building transaction:', e)
    throw new Error(`Error building transaction: ${e.message}`)
  }
  
  // Para transacciones Soroban, necesitamos preparar la transacción usando el RPC
  // ANTES de firmarla
  try {
    // Simular la transacción para obtener el fee correcto
    const simulation = await rpc.simulateTransaction(transaction)
    
    if (SorobanRpc.Api.isSimulationError(simulation)) {
      const errorStr = JSON.stringify(simulation)
      if (errorStr.includes('already registered') || errorStr.includes('Certificate already')) {
        throw new Error('Certificate already registered in the Smart Contract')
      }
      throw new Error(`Transaction simulation failed: ${errorStr.substring(0, 200)}`)
    }
    
    // Preparar la transacción con el fee correcto
    transaction = await rpc.prepareTransaction(transaction)
    
    // Firmar la transacción preparada
    transaction.sign(ownerKeypair)
    
    // Enviar transacción firmada
    const response = await rpc.sendTransaction(transaction)
    
    // Verificar si la transacción fue exitosa
    if ((response as any).hash) {
      return (response as any).hash
    } else {
      throw new Error(`Transaction submission failed: ${JSON.stringify(response)}`)
    }
  } catch (e: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error submitting transaction:', e)
    }
    
    // Extraer mensaje de error más descriptivo
    let errorMessage = e.message || 'Unknown error'
    if (e.response?.data?.extras?.result_codes) {
      errorMessage = `Stellar error: ${JSON.stringify(e.response.data.extras.result_codes)}`
    } else if (e.response?.data?.detail) {
      errorMessage = `Stellar error: ${e.response.data.detail}`
    } else if (e.response?.data?.title) {
      errorMessage = `Stellar error: ${e.response.data.title}`
    } else if (e.response?.data?.type) {
      errorMessage = `Stellar error: ${e.response.data.type} - ${e.response.data.detail || e.message}`
    }
    
    throw new Error(errorMessage)
  }
}

/**
 * Aprobar certificado (solo admin)
 */
export async function approveCertificateOnContract(
  fileHash: string,
  adminKeypair: Keypair
): Promise<string> {
  const contract = new Contract(CONTRACT_ID)
  const server = new Horizon.Server(HORIZON_URL)
  
  let fileHashBytes: Buffer
  try {
    if (fileHash.length === 64) {
      fileHashBytes = Buffer.from(fileHash, 'hex')
    } else {
      fileHashBytes = Buffer.from(fileHash.padStart(64, '0').substring(0, 64), 'hex')
    }
    
    if (fileHashBytes.length !== 32) {
      throw new Error('Hash must be 32 bytes (64 hex characters)')
    }
  } catch (e: any) {
    throw new Error(`Invalid hash format: ${e.message}`)
  }
  
  const operation = contract.call(
    'approve_certificate',
    addressToScVal(adminKeypair.publicKey()),
    bufferToScVal(fileHashBytes)
  )
  
  const sourceAccount = await server.loadAccount(adminKeypair.publicKey())
  
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE
  })
    .addOperation(operation)
    .setTimeout(30)
    .build()
  
  transaction.sign(adminKeypair)
  
  const response = await server.submitTransaction(transaction)
  return response.hash
}

/**
 * Rechazar certificado (solo admin)
 */
export async function rejectCertificateOnContract(
  fileHash: string,
  reason: string,
  adminKeypair: Keypair
): Promise<string> {
  const contract = new Contract(CONTRACT_ID)
  const server = new Horizon.Server(HORIZON_URL)
  
  let fileHashBytes: Buffer
  try {
    if (fileHash.length === 64) {
      fileHashBytes = Buffer.from(fileHash, 'hex')
    } else {
      fileHashBytes = Buffer.from(fileHash.padStart(64, '0').substring(0, 64), 'hex')
    }
    
    if (fileHashBytes.length !== 32) {
      throw new Error('Hash must be 32 bytes (64 hex characters)')
    }
  } catch (e: any) {
    throw new Error(`Invalid hash format: ${e.message}`)
  }
  
  const operation = contract.call(
    'reject_certificate',
    addressToScVal(adminKeypair.publicKey()),
    bufferToScVal(fileHashBytes),
    xdr.ScVal.scvString(reason)
  )
  
  const sourceAccount = await server.loadAccount(adminKeypair.publicKey())
  
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE
  })
    .addOperation(operation)
    .setTimeout(30)
    .build()
  
  transaction.sign(adminKeypair)
  
  const response = await server.submitTransaction(transaction)
  return response.hash
}

/**
 * Obtener certificado desde Smart Contract (lectura)
 * Usa Soroban RPC simulateTransaction para leer del contrato
 */
export async function getCertificateFromContract(fileHash: string): Promise<{
  file_hash: string
  owner: string
  tx_hash: string
  status: 'pending' | 'approved' | 'rejected'
  admin?: string
  validated_at?: number
  rejection_reason?: string
}> {
  const contract = new Contract(CONTRACT_ID)
  const rpc = new SorobanRpc.Server(SOROBAN_RPC_URL)
  const server = new Horizon.Server(HORIZON_URL)

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

  try {
    // Usar la cuenta del sistema para la simulación (solo lectura, no se envía)
    const systemKeypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY || '')
    const systemAccount = await server.loadAccount(systemKeypair.publicKey())
    
    // Crear operación de contrato para lectura
    const operation = contract.call(
      'get_certificate',
      bufferToScVal(fileHashBytes)
    )

    // Crear transacción de solo lectura (no se envía)
    const transaction = new TransactionBuilder(systemAccount, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(operation)
      .setTimeout(30)
      .build()

    // Simular la transacción para obtener el resultado (no se envía a la blockchain)
    const simulation = await rpc.simulateTransaction(transaction)

    if (SorobanRpc.Api.isSimulationError(simulation)) {
      throw new Error(`Simulation error: ${JSON.stringify(simulation)}`)
    }

    // Parsear resultado
    if (!simulation.result || !simulation.result.retval) {
      throw new Error('No result from contract')
    }

    const scVal = simulation.result.retval
    if (scVal.switch() !== xdr.ScValType.scvVec()) {
      throw new Error('Unexpected result type from contract')
    }

    const vec = scVal.vec()
    if (!vec || vec.length < 3) {
      throw new Error('Invalid certificate data from contract')
    }

    // El contrato retorna: [status, owner, tx_hash, ...]
    // status: 0 = pending, 1 = approved, 2 = rejected
    const statusVal = vec[0]
    const ownerVal = vec[1]
    const txHashVal = vec[2]

    let status: 'pending' | 'approved' | 'rejected' = 'pending'
    if (statusVal.switch() === xdr.ScValType.scvU32()) {
      const statusNum = statusVal.u32()
      if (statusNum === 1) status = 'approved'
      else if (statusNum === 2) status = 'rejected'
    }

    // Convertir owner Address
    let owner = ''
    if (ownerVal.switch() === xdr.ScValType.scvAddress()) {
      const addr = StellarAddress.fromScVal(ownerVal)
      owner = addr.toString()
    }

    // Convertir tx_hash Bytes
    let tx_hash = ''
    if (txHashVal.switch() === xdr.ScValType.scvBytes()) {
      tx_hash = Buffer.from(txHashVal.bytes()).toString('hex')
    }

    return {
      file_hash: fileHash,
      owner,
      tx_hash,
      status
    }
  } catch (error: any) {
    console.error('Error reading certificate from contract:', error)
    // Si el certificado no existe en el contrato, retornar pending
    return {
      file_hash: fileHash,
      owner: '',
      tx_hash: '',
      status: 'pending'
    }
  }
}

/**
 * Verificar si certificado está aprobado en el Smart Contract
 * Usa Soroban RPC simulateTransaction para leer del contrato
 */
export async function isCertificateApproved(fileHash: string): Promise<boolean> {
  const contract = new Contract(CONTRACT_ID)
  const rpc = new SorobanRpc.Server(SOROBAN_RPC_URL)
  const server = new Horizon.Server(HORIZON_URL)

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

  try {
    // Usar la cuenta del sistema para la simulación (solo lectura, no se envía)
    const systemKeypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY || '')
    const systemAccount = await server.loadAccount(systemKeypair.publicKey())
    
    // Crear operación de contrato para lectura
    const operation = contract.call(
      'is_approved',
      bufferToScVal(fileHashBytes)
    )

    // Crear transacción de solo lectura (no se envía)
    const transaction = new TransactionBuilder(systemAccount, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(operation)
      .setTimeout(30)
      .build()

    // Simular la transacción para obtener el resultado (no se envía a la blockchain)
    const simulation = await rpc.simulateTransaction(transaction)

    if (SorobanRpc.Api.isSimulationError(simulation)) {
      console.error('Simulation error:', simulation)
      return false
    }

    // Parsear resultado booleano
    if (!simulation.result || !simulation.result.retval) {
      return false
    }

    const scVal = simulation.result.retval
    if (scVal.switch() === xdr.ScValType.scvBool()) {
      return scVal.b()
    }

    return false
  } catch (error: any) {
    console.error('Error checking if certificate is approved:', error)
    // Si hay error, asumir que no está aprobado
    return false
  }
}
