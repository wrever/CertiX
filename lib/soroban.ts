import { 
  Contract, 
  Networks, 
  xdr, 
  Horizon, 
  TransactionBuilder,
  Keypair,
  Address as StellarAddress,
  rpc
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
  // Validar variables de entorno críticas
  if (!process.env.STELLAR_SECRET_KEY || process.env.STELLAR_SECRET_KEY === 'SD...' || process.env.STELLAR_SECRET_KEY.trim().length === 0) {
    const errorMsg = 'STELLAR_SECRET_KEY environment variable is not set or is a placeholder. Please configure it in Vercel environment variables.'
    console.error('❌ [SOROBAN]', errorMsg)
    throw new Error(errorMsg)
  }
  
  if (!CONTRACT_ID || CONTRACT_ID.length === 0) {
    const errorMsg = 'SOROBAN_CONTRACT_ID environment variable is not set'
    console.error('❌ [SOROBAN]', errorMsg)
    throw new Error(errorMsg)
  }
  
  // Validar parámetros de entrada
  if (!fileHash || !txHash || !ownerAddress) {
    const errorMsg = 'Missing required parameters: fileHash, txHash, and ownerAddress are required'
    console.error('❌ [SOROBAN]', errorMsg, { fileHash: !!fileHash, txHash: !!txHash, ownerAddress: !!ownerAddress })
    throw new Error(errorMsg)
  }
  
  // Validar formato de ownerAddress (debe ser una dirección Stellar válida)
  if (!ownerAddress.startsWith('G') || ownerAddress.length !== 56) {
    const errorMsg = `Invalid owner address format: ${ownerAddress} (expected G... with 56 chars)`
    console.error('❌ [SOROBAN]', errorMsg)
    throw new Error(errorMsg)
  }
  
  // Log de configuración (sin exponer secretos)
  console.log('🔍 [SOROBAN] Configuración:', {
    hasSecretKey: !!process.env.STELLAR_SECRET_KEY,
    contractId: CONTRACT_ID.substring(0, 8) + '...',
    horizonUrl: HORIZON_URL,
    sorobanRpcUrl: SOROBAN_RPC_URL,
    ownerAddress: ownerAddress.substring(0, 8) + '...'
  })

  // Registrando certificado en contrato
  const contract = new Contract(CONTRACT_ID)
  const server = new Horizon.Server(HORIZON_URL)
  
  // En SDK 14.x, usar rpc.Server directamente
  const rpcServer = new rpc.Server(SOROBAN_RPC_URL)
  
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
  
  // Crear operación para invocar el contrato
  let operation
  try {
    // Según DeepWiki: El SDK 11.2.2 requiere ScVal explícitamente, no convierte tipos nativos automáticamente
    // El contrato espera: register_certificate(owner: Address, file_hash: BytesN<32>, tx_hash: BytesN<32>)
    
    // Crear los ScVal para los parámetros
    // IMPORTANTE: Usar addressToScVal() que usa Address.toScVal() internamente
    // NO usar xdr.ScVal.scvAddress() directamente porque espera xdr.ScAddress, no Address
    const ownerAddressScVal = addressToScVal(ownerAddress)
    const fileHashScVal = bufferToScVal(fileHashBytes)
    const txHashScVal = bufferToScVal(txHashBytes)
    
    // Verificar que los ScVal están correctamente formateados
    console.log('🔍 [SOROBAN] Creando operación con parámetros:', {
      ownerType: ownerAddressScVal.switch().name,
      ownerValue: ownerAddress,
      fileHashType: fileHashScVal.switch().name,
      fileHashHex: fileHashBytes.toString('hex').substring(0, 16) + '...',
      txHashType: txHashScVal.switch().name,
      txHashHex: txHashBytes.toString('hex').substring(0, 16) + '...',
      fileHashLength: fileHashBytes.length,
      txHashLength: txHashBytes.length
    })
    
    // Crear operación de llamada al contrato
    operation = contract.call(
      'register_certificate',
      ownerAddressScVal,
      fileHashScVal,
      txHashScVal
    )
    
    console.log('✅ [SOROBAN] Operación creada correctamente')
  } catch (e: any) {
    console.error('❌ Error creating contract call:', e)
    console.error('Error stack:', e.stack)
    console.error('Error details:', {
      message: e.message,
      name: e.name,
      ownerAddress,
      fileHashLength: fileHashBytes?.length,
      txHashLength: txHashBytes?.length
    })
    throw new Error(`Error creating contract call: ${e.message}`)
  }
  
  // Cargar cuenta del owner
  let sourceAccount
  try {
    const publicKey = ownerKeypair.publicKey()
    console.log('🔍 [SOROBAN] Cargando cuenta:', publicKey.substring(0, 8) + '...')
    sourceAccount = await server.loadAccount(publicKey)
    console.log('✅ [SOROBAN] Cuenta cargada correctamente')
  } catch (e: any) {
    console.error('❌ Error loading source account:', e)
    console.error('❌ Error details:', {
      message: e.message,
      name: e.name,
      publicKey: ownerKeypair.publicKey(),
      hasSecretKey: !!process.env.STELLAR_SECRET_KEY
    })
    throw new Error(`Error loading account: ${e.message}. Make sure STELLAR_SECRET_KEY is correctly configured in Vercel.`)
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
    // Intentar simular primero para verificar errores del contrato
    let simulation
    let simulationSucceeded = false
    
    try {
      simulation = await rpcServer.simulateTransaction(transaction)
      simulationSucceeded = true
      
      // En SDK 14.x, usar rpc.Api.isSimulationError para verificar errores
      if (rpc.Api.isSimulationError(simulation)) {
        const errorStr = JSON.stringify(simulation)
        if (errorStr.includes('already registered') || errorStr.includes('Certificate already')) {
          throw new Error('Certificate already registered in the Smart Contract')
        }
        throw new Error(`Transaction simulation failed: ${errorStr.substring(0, 200)}`)
      }
    } catch (simError: any) {
      console.error('❌ [SOROBAN] Error en simulateTransaction:', simError)
      console.error('❌ [SOROBAN] Error message:', simError.message)
      
      // Si el error es "Bad union switch" - problema de serialización XDR en el SDK
      // En SDK 14.x, prepareTransaction puede manejar esto mejor
      if (simError.message && simError.message.includes('Bad union switch')) {
        console.log('⚠️ [SOROBAN] Bad union switch detectado, intentando prepareTransaction directamente...')
        try {
          // Intentar preparar directamente - prepareTransaction puede manejar la serialización mejor
          transaction = await rpcServer.prepareTransaction(transaction)
          console.log('✅ [SOROBAN] prepareTransaction exitoso sin simulación previa')
          // Continuar con el flujo normal
        } catch (prepareError: any) {
          console.error('❌ [SOROBAN] Error también en prepareTransaction:', prepareError)
          throw new Error(
            'Error al procesar la transacción de Soroban. ' +
            'El SDK no puede serializar correctamente la transacción. ' +
            'Esto puede deberse a un problema de compatibilidad entre la versión del SDK (14.4.3) y el RPC. ' +
            `Error técnico: ${prepareError.message || simError.message}`
          )
        }
      } else {
        // Si el error es "encoded argument must be of type String"
        if (simError.message && simError.message.includes('encoded argument must be of type String')) {
          throw new Error(
            'Error al codificar los argumentos del contrato. ' +
            'El SDK espera un formato específico para los argumentos. ' +
            'Verifica que los hashes sean hexadecimales válidos de 64 caracteres y que el owner address sea válido. ' +
            `Error técnico: ${simError.message}`
          )
        }
        
        // Re-lanzar otros errores
        throw simError
      }
    }
    
    // Si la simulación fue exitosa, preparar la transacción con el fee correcto
    if (simulationSucceeded) {
      transaction = await rpcServer.prepareTransaction(transaction)
    }
    
    // Firmar la transacción preparada
    transaction.sign(ownerKeypair)
    
    // Enviar transacción firmada
    const response = await rpcServer.sendTransaction(transaction)
    
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
  const rpcServer = new rpc.Server(SOROBAN_RPC_URL)
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
    const simulation = await rpcServer.simulateTransaction(transaction)

    if (rpc.Api.isSimulationError(simulation)) {
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
  const rpcServer = new rpc.Server(SOROBAN_RPC_URL)
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
    const simulation = await rpcServer.simulateTransaction(transaction)

    if (rpc.Api.isSimulationError(simulation)) {
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
