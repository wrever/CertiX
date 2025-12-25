# 📋 Transacción Stellar Actual - CertiX

## ¿Qué se está firmando?

**Tipo:** Transacción simple de pago (Payment Operation)
**NO es un Smart Contract** (Soroban)

## Estructura de la Transacción

```typescript
Transaction {
  sourceAccount: walletAddress (usuario)
  fee: '100' (0.00001 XLM)
  memo: hash.substring(0, 28) // Hash del certificado
  operations: [
    Payment {
      destination: walletAddress (pagar a sí mismo)
      asset: XLM (nativo)
      amount: '0.00001'
    }
  ]
}
```

## Flujo Completo

1. **Creación** (`lib/stellar.ts:20-57`)
   - Backend crea transacción sin firmar
   - Incluye hash en memo
   - Devuelve XDR

2. **Firma** (`components/UploadForm.tsx:79`)
   - Usuario firma con Freighter
   - Obtiene XDR firmado

3. **Envío** (`app/api/certificate/upload/sign/route.ts:27`)
   - Backend envía a Stellar
   - Guarda txHash final

## ¿Por qué transacción simple y no Smart Contract?

✅ **Ventajas:**
- Más simple para hackathon
- Menos fees
- Más rápido de implementar
- Funciona para demostrar concepto

❌ **Desventajas:**
- No hay lógica programable
- Solo guarda hash en memo
- Menos robusto que Smart Contract

## Comparación con ArcusX

| Aspecto | CertiX (Actual) | ArcusX |
|---------|----------------|--------|
| Tipo | Transacción simple | Smart Contract (Soroban) |
| Complejidad | Baja | Alta |
| Fees | ~0.00001 XLM | Variable |
| Lógica | Solo memo | Programable |
| Uso | Hackathon/MVP | Producción |

## ¿Quieres migrar a Smart Contract?

Si quieres usar Smart Contracts como ArcusX, necesitaríamos:
1. Escribir contrato en Rust (Soroban)
2. Compilar y desplegar
3. Invocar desde frontend
4. Manejar fees más altos

**Recomendación:** Para hackathon, mantener transacción simple. Para producción futura, considerar Smart Contract.

---

# 🚀 Smart Contract Soroban - CertiX Validator

## 📋 Diseño del Contrato - CertiX

### 🎯 Objetivo Simple

**Lógica del Contrato:**
1. **Si firmaste la transacción** → Tu certificado es real (la firma es la prueba)
2. **Los admin revisan** → Aprueban o rechazan el contrato
3. **Si el contrato está aprobado** → El certificado está aprobado

### 💡 Concepto Clave

**La firma de la transacción = Prueba de autenticidad**
- El usuario firma una transacción con el hash del certificado
- Esta firma prueba que el usuario tiene el certificado
- El contrato almacena esta prueba
- Los admin solo verifican y aprueban

### Estructura del Contrato (Rust/Soroban) - SIMPLIFICADO

```rust
// certix-contract/src/lib.rs

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum CertificateStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Certificate {
    pub file_hash: BytesN<32>,        // Hash SHA256 del archivo (prueba de contenido)
    pub owner: Address,                // Wallet del dueño (quien firmó)
    pub tx_hash: BytesN<32>,           // Hash de la transacción firmada (prueba de autenticidad)
    pub status: CertificateStatus,     // Estado: Pending, Approved, Rejected
    pub admin: Option<Address>,        // Admin que aprobó/rechazó
    pub validated_at: Option<u64>,     // Timestamp de validación
    pub rejection_reason: Option<String>, // Razón de rechazo (si aplica)
}

#[contract]
pub struct CertixContract;

#[contractimpl]
impl CertixContract {
    /// Inicializar contrato (solo una vez, al deploy)
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        // Guardar admin en storage persistente
        env.storage().instance().set(&b"admin", &admin);
    }

    /// Registrar certificado en el contrato
    /// Solo puede llamarlo el owner después de haber firmado la transacción
    /// 
    /// Parámetros:
    /// - owner: Wallet del dueño (debe firmar esta llamada)
    /// - file_hash: Hash SHA256 del archivo del certificado
    /// - tx_hash: Hash de la transacción Stellar que el usuario firmó (prueba de autenticidad)
    pub fn register_certificate(
        env: Env,
        owner: Address,
        file_hash: BytesN<32>,
        tx_hash: BytesN<32>
    ) {
        // El owner debe firmar esta llamada (prueba de que tiene la wallet)
        owner.require_auth();
        
        // Crear certificado con estado Pending
        let cert = Certificate {
            file_hash: file_hash.clone(),
            owner: owner.clone(),
            tx_hash: tx_hash.clone(),
            status: CertificateStatus::Pending,
            admin: None,
            validated_at: None,
            rejection_reason: None,
        };
        
        // Guardar usando file_hash como key (único por certificado)
        env.storage().persistent().set(&file_hash, &cert);
    }

    /// Aprobar certificado (solo admin)
    /// Si el contrato está aprobado, el certificado está aprobado
    pub fn approve_certificate(env: Env, admin: Address, file_hash: BytesN<32>) {
        admin.require_auth();
        
        // Verificar que es admin
        let stored_admin: Address = env.storage()
            .instance()
            .get(&b"admin")
            .expect("Contract not initialized");
        assert!(admin == stored_admin, "Unauthorized: Only admin can approve");
        
        // Obtener certificado
        let mut cert: Certificate = env.storage()
            .persistent()
            .get(&file_hash)
            .expect("Certificate not found");
        
        // Verificar que está pendiente
        assert!(
            cert.status == CertificateStatus::Pending,
            "Certificate already processed"
        );
        
        // Aprobar: actualizar estado
        cert.status = CertificateStatus::Approved;
        cert.admin = Some(admin.clone());
        cert.validated_at = Some(env.ledger().timestamp());
        
        // Guardar actualizado
        env.storage().persistent().set(&file_hash, &cert);
    }

    /// Rechazar certificado (solo admin)
    pub fn reject_certificate(
        env: Env,
        admin: Address,
        file_hash: BytesN<32>,
        reason: String
    ) {
        admin.require_auth();
        
        // Verificar que es admin
        let stored_admin: Address = env.storage()
            .instance()
            .get(&b"admin")
            .expect("Contract not initialized");
        assert!(admin == stored_admin, "Unauthorized: Only admin can reject");
        
        // Obtener certificado
        let mut cert: Certificate = env.storage()
            .persistent()
            .get(&file_hash)
            .expect("Certificate not found");
        
        // Verificar que está pendiente
        assert!(
            cert.status == CertificateStatus::Pending,
            "Certificate already processed"
        );
        
        // Rechazar: actualizar estado
        cert.status = CertificateStatus::Rejected;
        cert.admin = Some(admin.clone());
        cert.validated_at = Some(env.ledger().timestamp());
        cert.rejection_reason = Some(reason);
        
        // Guardar actualizado
        env.storage().persistent().set(&file_hash, &cert);
    }

    /// Obtener certificado por hash
    pub fn get_certificate(env: Env, file_hash: BytesN<32>) -> Certificate {
        env.storage()
            .persistent()
            .get(&file_hash)
            .expect("Certificate not found")
    }

    /// Verificar si un certificado está aprobado
    pub fn is_approved(env: Env, file_hash: BytesN<32>) -> bool {
        let cert: Certificate = env.storage()
            .persistent()
            .get(&file_hash)
            .expect("Certificate not found");
        cert.status == CertificateStatus::Approved
    }
}
```

## 🔄 Integración con Flujo Actual

### Flujo Completo Simplificado

```
1. Usuario sube certificado
   ↓
2. Backend genera hash SHA256 del archivo
   ↓
3. Backend crea transacción con hash en memo (sin firmar)
   ↓
4. Usuario FIRMA la transacción con Freighter ✅ PRUEBA DE AUTENTICIDAD
   ↓
5. Backend envía transacción firmada a Stellar
   ↓
6. Backend registra certificado en Smart Contract:
   - file_hash: Hash del archivo
   - owner: Wallet del usuario
   - tx_hash: Hash de la transacción firmada (prueba)
   - status: Pending
   ↓
7. Admin revisa el certificado
   ↓
8. Admin aprueba/rechaza vía Smart Contract
   ↓
9. Si contrato aprobado → Certificado aprobado ✅
```

### 🔐 Prueba de Autenticidad

**La firma de la transacción es la prueba:**
- Usuario tiene el archivo → Genera hash
- Usuario firma transacción con su wallet → Prueba que es el dueño
- Transacción en blockchain → Inmutable, verificable
- Contrato almacena tx_hash → Prueba permanente

### Cambios Necesarios en el Código

#### 1. Nuevo archivo: `lib/soroban.ts`

```typescript
import { 
  Contract, 
  Networks, 
  xdr, 
  Horizon, 
  TransactionBuilder,
  Keypair,
  Address as StellarAddress
} from '@stellar/stellar-sdk'
import { Address } from '@stellar/stellar-sdk'

const CONTRACT_ID = process.env.SOROBAN_CONTRACT_ID || ''
const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'
const NETWORK_PASSPHRASE = Networks.TESTNET

/**
 * Registrar certificado en Smart Contract
 * Se llama DESPUÉS de que el usuario firmó la transacción Stellar
 * 
 * @param fileHash - Hash SHA256 del archivo (32 bytes)
 * @param txHash - Hash de la transacción Stellar firmada (prueba de autenticidad)
 * @param ownerAddress - Wallet del dueño (debe firmar esta llamada)
 * @param ownerKeypair - Keypair del owner para firmar
 */
export async function registerCertificateOnContract(
  fileHash: string,
  txHash: string,
  ownerAddress: string,
  ownerKeypair: Keypair
): Promise<string> {
  const contract = new Contract(CONTRACT_ID)
  const server = new Horizon.Server(HORIZON_URL)
  
  // Convertir hashes a BytesN<32>
  const fileHashBytes = Buffer.from(fileHash, 'hex')
  const txHashBytes = Buffer.from(txHash, 'hex')
  
  // Crear operación para invocar el contrato
  const operation = contract.call(
    'register_certificate',
    xdr.ScVal.scvAddress(StellarAddress.fromString(ownerAddress)),
    xdr.ScVal.scvBytes(fileHashBytes),
    xdr.ScVal.scvBytes(txHashBytes)
  )
  
  // Cargar cuenta del owner
  const sourceAccount = await server.loadAccount(ownerKeypair.publicKey())
  
  // Crear transacción
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE
  })
    .addOperation(operation)
    .setTimeout(30)
    .build()
  
  // Firmar con keypair del owner
  transaction.sign(ownerKeypair)
  
  // Enviar a Stellar
  const response = await server.submitTransaction(transaction)
  return response.hash
}

/**
 * Aprobar certificado (solo admin)
 * Si el contrato está aprobado, el certificado está aprobado
 */
export async function approveCertificateOnContract(
  fileHash: string,
  adminKeypair: Keypair
): Promise<string> {
  const contract = new Contract(CONTRACT_ID)
  const server = new Horizon.Server(HORIZON_URL)
  
  const fileHashBytes = Buffer.from(fileHash, 'hex')
  
  const operation = contract.call(
    'approve_certificate',
    xdr.ScVal.scvAddress(StellarAddress.fromString(adminKeypair.publicKey())),
    xdr.ScVal.scvBytes(fileHashBytes)
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
  
  const fileHashBytes = Buffer.from(fileHash, 'hex')
  
  const operation = contract.call(
    'reject_certificate',
    xdr.ScVal.scvAddress(StellarAddress.fromString(adminKeypair.publicKey())),
    xdr.ScVal.scvBytes(fileHashBytes),
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
 * Obtener certificado desde Smart Contract (lectura, no requiere transacción)
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
  const server = new Horizon.Server(HORIZON_URL)
  
  const fileHashBytes = Buffer.from(fileHash, 'hex')
  
  // Invocar función de lectura (simulate, no requiere transacción)
  const result = await server.simulateTransaction(
    new TransactionBuilder(await server.loadAccount(CONTRACT_ID), {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(contract.call('get_certificate', xdr.ScVal.scvBytes(fileHashBytes)))
      .setTimeout(30)
      .build()
  )
  
  // Parsear resultado...
  // (Implementar parsing según respuesta del contrato)
  return result as any
}

/**
 * Verificar si certificado está aprobado
 */
export async function isCertificateApproved(fileHash: string): Promise<boolean> {
  const contract = new Contract(CONTRACT_ID)
  const server = new Horizon.Server(HORIZON_URL)
  
  const fileHashBytes = Buffer.from(fileHash, 'hex')
  
  // Similar a getCertificateFromContract pero llama a is_approved
  // ...
  return false // Placeholder
}
```

#### 2. Modificar `app/api/certificate/upload/sign/route.ts`

```typescript
import { registerCertificateOnContract } from '@/lib/soroban'
import { Keypair } from '@stellar/stellar-sdk'

// Después de enviar transacción simple firmada
const finalTxHash = await sendTransaction(signedTxXdr)

// NUEVO: Registrar en Smart Contract
// El usuario debe firmar esta llamada también (o usar su keypair)
const ownerKeypair = Keypair.fromSecret(/* obtener de alguna forma segura */)

await registerCertificateOnContract(
  certificate.hash,        // Hash del archivo
  finalTxHash,            // Hash de la transacción firmada (prueba)
  certificate.walletAddress,
  ownerKeypair            // Keypair del owner para firmar
)

// Actualizar certificado
certificate.txHash = finalTxHash
certificate.contractId = CONTRACT_ID
certificate.status = 'pending' // Pendiente de aprobación admin
await saveCertificate(certificate)
```

**Nota:** El usuario ya firmó la transacción Stellar, ahora necesita firmar la llamada al contrato también.

#### 3. Modificar `app/api/certificate/[id]/status/route.ts`

```typescript
import { approveCertificateOnContract, rejectCertificateOnContract } from '@/lib/soroban'
import { Keypair } from '@stellar/stellar-sdk'

// Obtener certificado
const certificate = await getCertificate(id)

// Verificar que quien llama es admin
const adminKeypair = Keypair.fromSecret(process.env.ADMIN_SECRET_KEY!)

// NUEVO: Actualizar en Smart Contract primero
if (status === 'approved') {
  await approveCertificateOnContract(
    certificate.hash,  // Usar hash del archivo como ID en el contrato
    adminKeypair
  )
} else {
  await rejectCertificateOnContract(
    certificate.hash,
    reason || 'Rejected by admin',
    adminKeypair
  )
}

// Luego actualizar en Redis (para queries rápidas y cache)
await updateCertificateStatus(id, status, validatorWallet, reason)

// Si el contrato está aprobado → el certificado está aprobado ✅
```

## 📦 Estructura del Proyecto Soroban

```
certix/
├── contract/                    # Nuevo: Contrato Soroban
│   ├── Cargo.toml
│   ├── src/
│   │   └── lib.rs              # Contrato principal
│   └── tests/
│       └── test.rs
├── lib/
│   ├── soroban.ts              # Nuevo: Utilidades Soroban
│   └── stellar.ts              # Existente
└── ...
```

## 🛠️ Pasos de Implementación

### Fase 1: Setup Soroban

```bash
# 1. Instalar Soroban CLI
curl -sSL https://soroban.stellar.org | sh

# 2. Crear proyecto contrato
cd certix
soroban contract new contract --name certix-contract

# 3. Escribir contrato (lib.rs)
# 4. Compilar
cd contract
soroban contract build

# 5. Desplegar en testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/certix_contract.wasm \
  --source-account <ADMIN_SECRET> \
  --network testnet
```

### Fase 2: Integración Backend

1. Crear `lib/soroban.ts` con funciones de interacción
2. Modificar endpoints para usar Smart Contract
3. Mantener Redis como cache (opcional, para queries rápidas)

### Fase 3: Frontend

1. Mostrar estado desde Smart Contract
2. Permitir validadores aprobar/rechazar vía contrato

## ⚙️ Variables de Entorno

```env
# Smart Contract Soroban
SOROBAN_CONTRACT_ID=CA7QYNF7SOWQB3H7M3UGM3CSZIPXFMIQSVJONNA7AEHQOAXQ2XX2H3SE
SOROBAN_NETWORK=testnet
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

## 🎯 Ventajas del Smart Contract

✅ **Inmutabilidad**: Estado en blockchain, no se puede modificar
✅ **Transparencia**: Todos pueden ver validaciones
✅ **Descentralización**: No depende de servidor central
✅ **Auditable**: Historial completo en blockchain
✅ **Confianza**: Validadores verificables on-chain

## ⚠️ Consideraciones

- **Fees**: Smart Contracts tienen fees más altos que transacciones simples
- **Complejidad**: Requiere conocimiento de Rust y Soroban
- **Tiempo**: Más tiempo de desarrollo que solución actual
- **Testing**: Necesita testing exhaustivo antes de producción

## 🚀 Recomendación

**Para Hackathon:**
- Mantener flujo actual (transacción simple + Redis)
- Documentar plan de Smart Contract para futuro

**Para Producción:**
- Implementar Smart Contract como fuente de verdad
- Usar Redis como cache para performance
- Migrar gradualmente

---

## 📝 Notas de Implementación

1. **Simplicidad**: El contrato es simple, solo maneja estados básicos
2. **Escalabilidad**: Se puede extender con más funcionalidades después
3. **Compatibilidad**: Funciona con el flujo actual, solo agrega capa blockchain
4. **Testing**: Probar en testnet antes de mainnet

