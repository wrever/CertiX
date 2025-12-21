# 📋 PLAN COMPLETO - CertiX

**Proyecto:** CertiX - Sistema de Certificaciones Verificables en Stellar  
**by ArcusX**  
**Versión:** 1.0  
**Estado:** Plan oficial - Listo para implementación

---

## 🎯 Objetivo General

Crear un sistema completo y funcional para subir y verificar certificaciones usando Stellar blockchain, deployado en Vercel e integrable con ArcusX.

**Características principales:**
- ✅ Wallet como identificador único (sin login tradicional)
- ✅ Sistema de estados: Pendiente, Aprobado, Rechazado
- ✅ Sistema de validadores (wallets autorizadas)
- ✅ Visualización de certificados filtrados por estado
- ✅ Verificación blockchain inmutable

---

## 📊 Fases del Proyecto

### **FASE 0: Preparación y Configuración** (2-3 horas)
### **FASE 1: Backend Core** (5-7 horas)
### **FASE 2: Frontend Core** (6-8 horas)
### **FASE 3: Integración y Testing** (2-3 horas)
### **FASE 4: Deploy y Documentación** (1-2 horas)

**Tiempo Total Estimado:** 16-23 horas (2-3 días)

---

## 🔧 Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Styling:** Tailwind CSS
- **Blockchain:** Stellar SDK
- **Wallet:** Freighter (via Stellar Wallets Kit)
- **Storage:** Vercel Blob
- **Database:** Vercel KV

---

## 📁 Estructura del Proyecto

```
certix/
├── app/
│   ├── api/
│   │   ├── certificate/
│   │   │   ├── upload/route.ts              # POST - Subir certificado
│   │   │   ├── verify/[id]/route.ts          # GET - Verificar certificado
│   │   │   ├── user/[wallet]/route.ts        # GET - Listar certificados de wallet
│   │   │   ├── [id]/status/route.ts          # PUT - Cambiar estado (aprobado/rechazado)
│   │   │   └── [id]/route.ts                # GET - Obtener certificado por ID
│   │   └── validators/
│   │       ├── list/route.ts                 # GET - Listar validadores
│   │       └── check/[wallet]/route.ts       # GET - Verificar si wallet es validador
│   ├── page.tsx                              # Homepage
│   ├── upload/page.tsx                        # Página subir certificado
│   ├── verify/[id]/page.tsx                  # Página verificar certificado
│   ├── my-certificates/page.tsx               # Mis certificados (con filtros por estado)
│   ├── user/[wallet]/page.tsx                # Certificados públicos de wallet
│   ├── validator/
│   │   └── dashboard/page.tsx                # Dashboard de validador (pendientes)
│   ├── layout.tsx                             # Layout principal
│   └── not-found.tsx                          # Página 404
├── components/
│   ├── WalletConnect.tsx                     # Conectar wallet
│   ├── Navbar.tsx                            # Navegación
│   ├── UploadForm.tsx                        # Formulario upload
│   ├── CertificateCard.tsx                   # Card de certificado
│   ├── CertificateList.tsx                   # Lista de certificados
│   ├── CertificateStatusBadge.tsx            # Badge de estado (pending/approved/rejected)
│   ├── VerifyBadge.tsx                       # Badge de verificación blockchain
│   ├── StatusFilter.tsx                      # Filtros por estado
│   ├── ValidatorActions.tsx                  # Botones aprobar/rechazar (solo validadores)
│   └── LoadingSpinner.tsx                    # Spinner de carga
├── hooks/
│   └── useWallet.ts                          # Hook para wallet
├── lib/
│   ├── stellar.ts                            # Utilidades Stellar
│   ├── hash.ts                               # Generación de hash
│   ├── storage.ts                            # Upload de archivos
│   ├── db.ts                                 # Operaciones DB
│   └── validators.ts                         # Gestión de validadores
├── types/
│   └── certificate.ts                        # Tipos TypeScript
└── package.json
```

---

## 🔌 Endpoints API

### 1. POST `/api/certificate/upload`
**Descripción:** Sube certificado, genera hash, guarda en Stellar. Estado inicial: `pending`

**Request:**
```typescript
FormData {
  file: File
  walletAddress: string (OBLIGATORIO - debe ser válida)
  title: string
  issuer?: string (opcional)
}
```

**Response:**
```typescript
{
  success: true
  certificateId: string
  txHash: string
  hash: string
  stellarExplorerUrl: string
  status: 'pending'
}
```

### 2. GET `/api/certificate/verify/[id]`
**Descripción:** Verifica certificado comparando hash con blockchain

**Response:**
```typescript
{
  success: true
  isValid: boolean
  certificate: Certificate
  stellarExplorerUrl: string
}
```

### 3. GET `/api/certificate/user/[wallet]`
**Descripción:** Lista todos los certificados de una wallet. Puede filtrar por estado.

**Query Params (opcionales):**
- `status`: 'pending' | 'approved' | 'rejected' | 'all'

**Response:**
```typescript
{
  success: true
  certificates: Certificate[]
  stats: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
}
```

### 4. GET `/api/certificate/[id]`
**Descripción:** Obtiene un certificado específico por ID

**Response:**
```typescript
{
  success: true
  certificate: Certificate
}
```

### 5. PUT `/api/certificate/[id]/status`
**Descripción:** Cambia el estado de un certificado (solo validadores)

**Request:**
```typescript
{
  status: 'approved' | 'rejected'
  validatorWallet: string (OBLIGATORIO - debe ser validador)
  reason?: string (opcional - motivo de rechazo)
}
```

**Response:**
```typescript
{
  success: true
  certificate: Certificate
  message: string
}
```

### 6. GET `/api/validators/list`
**Descripción:** Lista todas las wallets validadoras

**Response:**
```typescript
{
  success: true
  validators: string[] // Array de wallet addresses
}
```

### 7. GET `/api/validators/check/[wallet]`
**Descripción:** Verifica si una wallet es validadora

**Response:**
```typescript
{
  success: true
  isValidator: boolean
  wallet: string
}
```

---

## 📊 Modelo de Datos

### Tipo Certificate
```typescript
export interface Certificate {
  id: string
  walletAddress: string          // Wallet del usuario (identificador principal)
  title: string
  hash: string                   // SHA256 del archivo
  txHash: string                 // Hash de transacción Stellar
  fileUrl: string                // URL del archivo en Vercel Blob
  issuer?: string                // Emisor del certificado (opcional)
  status: 'pending' | 'approved' | 'rejected'  // Estado de validación
  isValid: boolean               // Verificación blockchain
  uploadedAt: string            // Fecha de subida
  verifiedAt?: string           // Fecha de verificación blockchain
  validatedAt?: string          // Fecha de validación (aprobado/rechazado)
  validatorWallet?: string      // Wallet del validador que aprobó/rechazó
  rejectionReason?: string      // Razón de rechazo (si aplica)
}
```

### Sistema de Validadores
- Lista de wallets autorizadas almacenada en KV
- Key: `validators:list` → Array de wallet addresses
- Validadores pueden aprobar/rechazar certificados
- Solo validadores pueden cambiar estados

### Almacenamiento en KV
```
cert:{id} → Certificate object
user:{wallet}:certs → Lista de IDs de certificados
user:{wallet}:status:{status} → Lista de IDs por estado
validators:list → Array de wallet addresses
```

---

## 🔵 FASE 0: Preparación y Configuración

**Objetivo:** Tener todo listo para empezar a desarrollar  
**Tiempo:** 2-3 horas  
**Estado:** ⏳ Pendiente

### Tarea 0.1: Setup del Proyecto
- [ ] **0.1.1** Verificar que `package.json` tiene todas las dependencias
- [ ] **0.1.2** Ejecutar `npm install` y verificar que no hay errores
- [ ] **0.1.3** Verificar que TypeScript compila sin errores (`npm run build`)
- [ ] **0.1.4** Verificar que Tailwind CSS está configurado correctamente

### Tarea 0.2: Crear Cuenta Stellar del Sistema ⚠️ CRÍTICO
- [ ] **0.2.1** Ir a https://laboratory.stellar.org/#account-creator?network=test
- [ ] **0.2.2** Click en "Generate keypair"
- [ ] **0.2.3** Copiar Public Key (empieza con `G...`)
- [ ] **0.2.4** Copiar Secret Key (empieza con `SD...`) - ⚠️ GUARDAR SEGURO
- [ ] **0.2.5** Fondear cuenta:
  - Opción A: Click "Fund Account" en la página
  - Opción B: Ir a https://friendbot.stellar.org/?addr=TU_PUBLIC_KEY
- [ ] **0.2.6** Verificar balance en Stellar Expert:
  - Ir a: https://stellar.expert/explorer/testnet/account/TU_PUBLIC_KEY
  - Debe mostrar ~10,000 XLM
- [ ] **0.2.7** Guardar Secret Key de forma segura (no commitear)

### Tarea 0.3: Configurar Vercel Blob Storage
- [ ] **0.3.1** Ir a Vercel Dashboard (https://vercel.com/dashboard)
- [ ] **0.3.2** Seleccionar proyecto o crear nuevo
- [ ] **0.3.3** Ir a Storage → Blob
- [ ] **0.3.4** Click "Create Database" o "Add"
- [ ] **0.3.5** Nombrar: `certix-blob` (o similar)
- [ ] **0.3.6** Copiar `BLOB_READ_WRITE_TOKEN`
- [ ] **0.3.7** Guardar token para usar en `.env.local`

### Tarea 0.4: Configurar Vercel KV (Database)
- [ ] **0.4.1** En Vercel Dashboard → Storage → KV
- [ ] **0.4.2** Click "Create Database" o "Add"
- [ ] **0.4.3** Nombrar: `certix-kv` (o similar)
- [ ] **0.4.4** Copiar `KV_REST_API_URL`
- [ ] **0.4.5** Copiar `KV_REST_API_TOKEN`
- [ ] **0.4.6** Guardar ambos valores para usar en `.env.local`

### Tarea 0.5: Crear Archivo de Variables de Entorno
- [ ] **0.5.1** Crear archivo `.env.local` en raíz del proyecto
- [ ] **0.5.2** Agregar `STELLAR_SECRET_KEY=SD...` (del paso 0.2.4)
- [ ] **0.5.3** Agregar `STELLAR_NETWORK=TESTNET`
- [ ] **0.5.4** Agregar `HORIZON_URL=https://horizon-testnet.stellar.org`
- [ ] **0.5.5** Agregar `BLOB_READ_WRITE_TOKEN=...` (del paso 0.3.6)
- [ ] **0.5.6** Agregar `KV_REST_API_URL=...` (del paso 0.4.4)
- [ ] **0.5.7** Agregar `KV_REST_API_TOKEN=...` (del paso 0.4.5)
- [ ] **0.5.8** Verificar que `.env.local` está en `.gitignore`
- [ ] **0.5.9** Verificar que todas las variables están correctas

### Tarea 0.6: Verificar Instalación de Freighter
- [ ] **0.6.1** Verificar que Freighter está instalado en navegador
- [ ] **0.6.2** Si no está instalado: https://www.freighter.app/
- [ ] **0.6.3** Crear cuenta testnet en Freighter (opcional, para testing)
- [ ] **0.6.4** Verificar que Freighter se conecta correctamente

### Checklist Fase 0
- [ ] Proyecto instalado sin errores
- [ ] Cuenta Stellar creada y fondada
- [ ] Vercel Blob configurado
- [ ] Vercel KV configurado
- [ ] `.env.local` creado con todas las variables
- [ ] Freighter instalado y funcionando

---

## 🟢 FASE 1: Backend Core

**Objetivo:** Implementar toda la lógica backend (API + Utilidades)  
**Tiempo:** 4-6 horas  
**Estado:** ⏳ Pendiente

### Tarea 1.1: Implementar Utilidades Stellar (`lib/stellar.ts`)
- [ ] **1.1.1** Verificar que `validateStellarAddress()` funciona
  - Probar con dirección válida: `GBXBJSGUDCUXED5FTRO63XIVYYWY4QVEIK6R2UGZ4SFGCJGUJA6HWE5H`
  - Probar con dirección inválida: `G123` (debe fallar)
- [ ] **1.1.2** Implementar `createCertificateTransaction()`
  - Verificar que crea transacción correctamente
  - Verificar que memo contiene hash (primeros 28 caracteres)
  - Verificar que destino es la wallet del usuario
- [ ] **1.1.3** Implementar `sendTransaction()`
  - Verificar que envía transacción a Stellar
  - Verificar que retorna hash de transacción
- [ ] **1.1.4** Implementar `getTransaction()`
  - Probar obtener transacción existente
  - Verificar que retorna datos correctos
- [ ] **1.1.5** Implementar `getStellarExplorerUrl()`
  - Verificar que genera URL correcta para testnet
  - Probar con un hash de ejemplo

### Tarea 1.2: Implementar Utilidades Hash (`lib/hash.ts`)
- [ ] **1.2.1** Implementar `generateHash()`
  - Probar con buffer de ejemplo
  - Verificar que retorna hash SHA256 (64 caracteres)
- [ ] **1.2.2** Implementar `generateShortHash()`
  - Verificar que retorna primeros 28 caracteres
  - Verificar que coincide con primeros 28 de hash completo

### Tarea 1.3: Implementar Utilidades Storage (`lib/storage.ts`)
- [ ] **1.3.1** Implementar `validateFile()`
  - Probar con PDF válido (debe pasar)
  - Probar con PNG válido (debe pasar)
  - Probar con JPG válido (debe pasar)
  - Probar con archivo > 10MB (debe fallar)
  - Probar con tipo inválido (debe fallar)
- [ ] **1.3.2** Implementar `uploadFile()`
  - Probar subir archivo de prueba
  - Verificar que retorna URL pública
  - Verificar que archivo es accesible desde URL

### Tarea 1.4: Implementar Utilidades DB (`lib/db.ts`)
- [ ] **1.4.1** Implementar `saveCertificate()`
  - Crear certificado de prueba
  - Estado inicial: 'pending'
  - Verificar que se guarda en KV
  - Verificar que se agrega a lista de usuario
  - Verificar que se agrega a lista por estado
- [ ] **1.4.2** Implementar `getCertificate()`
  - Obtener certificado guardado
  - Verificar que retorna datos correctos incluyendo estado
- [ ] **1.4.3** Implementar `getUserCertificates()`
  - Guardar múltiples certificados de prueba
  - Verificar que retorna todos los certificados del usuario
  - Verificar que retorna array vacío si no hay certificados
  - Implementar filtro por estado (opcional)
- [ ] **1.4.4** Implementar `updateCertificateStatus()`
  - Actualizar estado de certificado
  - Guardar validador que cambió el estado
  - Guardar fecha de cambio
  - Guardar razón (si es rechazado)
  - Actualizar listas por estado
- [ ] **1.4.5** Implementar `getCertificatesByStatus()`
  - Obtener certificados pendientes (para validadores)
  - Obtener certificados aprobados
  - Obtener certificados rechazados
- [ ] **1.4.6** Implementar `getCertificateStats()`
  - Contar total de certificados
  - Contar por estado (pending, approved, rejected)
  - Retornar estadísticas

### Tarea 1.5: Implementar Endpoint Upload (`app/api/certificate/upload/route.ts`)
- [ ] **1.5.1** Crear estructura básica del endpoint
  - Verificar que acepta POST
  - Verificar que retorna error si no es POST
- [ ] **1.5.2** Implementar validación de FormData
  - Verificar que file existe
  - Verificar que walletAddress existe
  - Verificar que title existe
- [ ] **1.5.3** Implementar validación de wallet address
  - Llamar a `validateStellarAddress()`
  - Retornar error 400 si es inválida
- [ ] **1.5.4** Implementar validación de archivo
  - Llamar a `validateFile()`
  - Retornar error 400 si es inválido
- [ ] **1.5.5** Implementar generación de hash
  - Convertir file a Buffer
  - Llamar a `generateHash()`
  - Verificar que hash se genera correctamente
- [ ] **1.5.6** Implementar upload de archivo
  - Llamar a `uploadFile()`
  - Verificar que retorna URL
  - Manejar errores de upload
- [ ] **1.5.7** Implementar creación de transacción Stellar
  - Llamar a `createCertificateTransaction()`
  - Llamar a `sendTransaction()`
  - Verificar que txHash se obtiene
- [ ] **1.5.8** Implementar guardado en DB
  - Generar UUID para certificateId
  - Estado inicial: 'pending'
  - Llamar a `saveCertificate()`
  - Verificar que se guarda correctamente
- [ ] **1.5.9** Implementar respuesta exitosa
  - Retornar JSON con success, certificateId, txHash, hash, stellarExplorerUrl, status
  - Verificar formato de respuesta
- [ ] **1.5.10** Implementar manejo de errores
  - Try-catch completo
  - Logging de errores
  - Respuesta de error clara

### Tarea 1.6: Implementar Endpoint Verify (`app/api/certificate/verify/[id]/route.ts`)
- [ ] **1.6.1** Crear estructura básica del endpoint
  - Verificar que acepta GET
  - Obtener `id` de params
- [ ] **1.6.2** Implementar obtención de certificado
  - Llamar a `getCertificate(id)`
  - Retornar 404 si no existe
- [ ] **1.6.3** Implementar obtención de transacción Stellar
  - Llamar a `getTransaction(certificate.txHash)`
  - Manejar errores si transacción no existe
- [ ] **1.6.4** Implementar comparación de hash
  - Extraer memo de transacción
  - Comparar memo con hash del certificado (primeros 28 chars)
  - Determinar si es válido
- [ ] **1.6.5** Implementar respuesta
  - Retornar JSON con success, isValid, certificate, stellarExplorerUrl
  - Verificar formato de respuesta
- [ ] **1.6.6** Implementar manejo de errores
  - Try-catch completo
  - Logging de errores
  - Respuesta de error clara

### Tarea 1.7: Implementar Utilidades Validadores (`lib/validators.ts`)
- [ ] **1.7.1** Implementar `isValidator()`
  - Verificar si wallet está en lista de validadores
  - Retornar boolean
- [ ] **1.7.2** Implementar `getValidators()`
  - Obtener lista de validadores de KV
  - Retornar array de wallets
- [ ] **1.7.3** Implementar `addValidator()`
  - Agregar wallet a lista de validadores
  - Guardar en KV
- [ ] **1.7.4** Implementar inicialización de validadores
  - Crear lista inicial de validadores (puede ser vacía)
  - Guardar en KV al iniciar

### Tarea 1.8: Implementar Endpoint List (`app/api/certificate/user/[wallet]/route.ts`)
- [ ] **1.8.1** Crear estructura básica del endpoint
  - Verificar que acepta GET
  - Obtener `wallet` de params
  - Obtener `status` de query params (opcional)
- [ ] **1.8.2** Implementar validación de wallet
  - Llamar a `validateStellarAddress()`
  - Retornar error 400 si es inválida
- [ ] **1.8.3** Implementar obtención de certificados
  - Llamar a `getUserCertificates(wallet, status)`
  - Manejar caso de array vacío
- [ ] **1.8.4** Implementar obtención de estadísticas
  - Llamar a `getCertificateStats(wallet)`
  - Incluir en respuesta
- [ ] **1.8.5** Implementar respuesta
  - Retornar JSON con success, certificates array y stats
  - Verificar formato de respuesta
- [ ] **1.8.6** Implementar manejo de errores
  - Try-catch completo
  - Logging de errores
  - Respuesta de error clara

### Tarea 1.9: Implementar Endpoint Get Certificate (`app/api/certificate/[id]/route.ts`)
- [ ] **1.9.1** Crear estructura básica del endpoint
  - Verificar que acepta GET
  - Obtener `id` de params
- [ ] **1.9.2** Implementar obtención de certificado
  - Llamar a `getCertificate(id)`
  - Retornar 404 si no existe
- [ ] **1.9.3** Implementar respuesta
  - Retornar JSON con success y certificate
  - Verificar formato de respuesta
- [ ] **1.9.4** Implementar manejo de errores
  - Try-catch completo
  - Logging de errores
  - Respuesta de error clara

### Tarea 1.10: Implementar Endpoint Update Status (`app/api/certificate/[id]/status/route.ts`)
- [ ] **1.10.1** Crear estructura básica del endpoint
  - Verificar que acepta PUT
  - Obtener `id` de params
- [ ] **1.10.2** Implementar validación de validador
  - Obtener `validatorWallet` del body
  - Llamar a `isValidator(validatorWallet)`
  - Retornar 403 si no es validador
- [ ] **1.10.3** Implementar validación de estado
  - Verificar que status es 'approved' o 'rejected'
  - Retornar error 400 si es inválido
- [ ] **1.10.4** Implementar obtención de certificado
  - Llamar a `getCertificate(id)`
  - Retornar 404 si no existe
- [ ] **1.10.5** Implementar actualización de estado
  - Llamar a `updateCertificateStatus(id, status, validatorWallet, reason)`
  - Verificar que se actualiza correctamente
- [ ] **1.10.6** Implementar respuesta
  - Retornar JSON con success y certificate actualizado
  - Verificar formato de respuesta
- [ ] **1.10.7** Implementar manejo de errores
  - Try-catch completo
  - Logging de errores
  - Respuesta de error clara

### Tarea 1.11: Implementar Endpoints Validadores
- [ ] **1.11.1** Implementar GET `/api/validators/list`
  - Llamar a `getValidators()`
  - Retornar lista de wallets
- [ ] **1.11.2** Implementar GET `/api/validators/check/[wallet]`
  - Obtener wallet de params
  - Llamar a `isValidator(wallet)`
  - Retornar resultado

### Checklist Fase 1
- [ ] Todas las utilidades funcionando
- [ ] Sistema de validadores implementado
- [ ] Sistema de estados implementado
- [ ] Endpoint upload probado y funcionando
- [ ] Endpoint verify probado y funcionando
- [ ] Endpoint list probado y funcionando (con filtros)
- [ ] Endpoint get certificate probado
- [ ] Endpoint update status probado
- [ ] Endpoints validadores probados
- [ ] Todos los endpoints manejan errores correctamente
- [ ] Todas las validaciones implementadas

---

## 🟡 FASE 2: Frontend Core

**Objetivo:** Implementar todas las páginas y componentes frontend  
**Tiempo:** 4-6 horas  
**Estado:** ⏳ Pendiente

### Tarea 2.1: Implementar Hook useWallet (`hooks/useWallet.ts`)
- [ ] **2.1.1** Verificar inicialización del kit
  - Verificar que kit se crea correctamente
  - Verificar que no hay errores en consola
- [ ] **2.1.2** Implementar `connectFreighter()`
  - Verificar que conecta con Freighter
  - Verificar que obtiene address
  - Verificar que guarda en localStorage
- [ ] **2.1.3** Implementar `disconnectWallet()`
  - Verificar que limpia estado
  - Verificar que limpia localStorage
- [ ] **2.1.4** Implementar carga de wallet guardada
  - Verificar que carga wallet de localStorage al iniciar
  - Verificar que actualiza estado correctamente
- [ ] **2.1.5** Probar hook en componente de prueba
  - Crear componente simple que use el hook
  - Verificar que funciona correctamente

### Tarea 2.2: Implementar Componente WalletConnect (`components/WalletConnect.tsx`)
- [ ] **2.2.1** Implementar estado cuando NO está conectada
  - Mostrar botón "Conectar Freighter"
  - Botón debe llamar a `connectFreighter()`
- [ ] **2.2.2** Implementar estado cuando SÍ está conectada
  - Mostrar wallet address truncada
  - Mostrar botón "Desconectar"
- [ ] **2.2.3** Implementar estado de loading
  - Mostrar "Conectando..." mientras carga
  - Deshabilitar botón durante loading
- [ ] **2.2.4** Implementar manejo de errores
  - Mostrar mensaje de error si falla
  - Estilo visual para errores
- [ ] **2.2.5** Probar componente
  - Verificar que conecta correctamente
  - Verificar que desconecta correctamente
  - Verificar que muestra errores

### Tarea 2.3: Implementar Componente Navbar (`components/Navbar.tsx`)
- [ ] **2.3.1** Implementar estructura básica
  - Logo/Título "CertiX"
  - Links de navegación
- [ ] **2.3.2** Integrar WalletConnect
  - Agregar componente WalletConnect
  - Verificar que se muestra correctamente
- [ ] **2.3.3** Implementar links de navegación
  - Link a Home (`/`)
  - Link a Upload (`/upload`)
  - Link a Mis Certificados (solo si wallet conectada)
  - Link a Dashboard Validador (solo si es validador)
- [ ] **2.3.4** Implementar verificación de validador
  - Llamar a API para verificar si wallet es validador
  - Mostrar link solo si es validador
- [ ] **2.3.5** Aplicar estilos con Tailwind
  - Hover effects en links
  - Responsive design básico
- [ ] **2.3.6** Probar navbar
  - Probar sin wallet conectada
  - Probar con wallet normal
  - Probar con wallet validadora
  - Verificar que links funcionan
  - Verificar que es responsive

### Tarea 2.4: Implementar Homepage (`app/page.tsx`)
- [ ] **2.4.1** Implementar Hero Section
  - Título "CertiX"
  - Subtítulo descriptivo
  - "by ArcusX"
- [ ] **2.4.2** Implementar sección de descripción
  - Explicar qué es CertiX
  - Lista de características
- [ ] **2.4.3** Implementar CTA buttons
  - Botón "Subir Certificado" → `/upload`
  - Botón "Mis Certificados" → `/my-certificates`
- [ ] **2.4.4** Implementar sección de features
  - 3 cards con características principales
  - Iconos o emojis
- [ ] **2.4.5** Aplicar estilos con Tailwind
  - Layout responsive
  - Colores y espaciado
- [ ] **2.4.6** Probar homepage
  - Verificar que se ve bien
  - Verificar que links funcionan

### Tarea 2.5: Implementar Página Upload (`app/upload/page.tsx`)
- [ ] **2.5.1** Implementar verificación de wallet
  - Si NO está conectada: mostrar mensaje + WalletConnect
  - Si SÍ está conectada: mostrar formulario
- [ ] **2.5.2** Integrar componente UploadForm
  - Pasar walletAddress como prop
  - Verificar que recibe prop correctamente
- [ ] **2.5.3** Mostrar wallet conectada
  - Mostrar address truncada
  - Estilo visual claro
- [ ] **2.5.4** Aplicar estilos
  - Layout centrado
  - Espaciado adecuado
- [ ] **2.5.5** Probar página
  - Probar sin wallet conectada
  - Probar con wallet conectada
  - Verificar que formulario funciona

### Tarea 2.6: Implementar Componente UploadForm (`components/UploadForm.tsx`)
- [ ] **2.6.1** Implementar estados
  - `file`, `title`, `issuer`
  - `loading`, `result`, `error`
- [ ] **2.6.2** Implementar input de archivo
  - Input type="file"
  - Accept: PDF, PNG, JPG
  - Validación visual
- [ ] **2.6.3** Implementar input de título
  - Input type="text"
  - Required
  - MaxLength 255
- [ ] **2.6.4** Implementar input de issuer (opcional)
  - Input type="text"
  - Opcional
  - MaxLength 255
- [ ] **2.6.5** Implementar botón submit
  - Deshabilitado si no hay file o title
  - Muestra "Subiendo..." durante loading
- [ ] **2.6.6** Implementar handleSubmit
  - Crear FormData
  - Agregar file, walletAddress, title, issuer
  - Llamar a `/api/certificate/upload`
  - Manejar respuesta exitosa
  - Manejar errores
- [ ] **2.6.7** Implementar mensaje de éxito
  - Mostrar certificateId
  - Mostrar txHash
  - Link a Stellar Explorer
  - Resetear formulario después de éxito
- [ ] **2.6.8** Implementar mensaje de error
  - Mostrar error en rojo
  - Estilo visual claro
- [ ] **2.6.9** Aplicar estilos con Tailwind
  - Formulario centrado
  - Inputs con bordes y padding
  - Botón con hover effects
- [ ] **2.6.10** Probar componente
  - Probar subir certificado exitoso
  - Probar validaciones (archivo inválido, etc.)
  - Probar manejo de errores

### Tarea 2.7: Implementar Página Verify (`app/verify/[id]/page.tsx`)
- [ ] **2.7.1** Obtener ID de params
  - Usar `useParams()` de Next.js
  - Extraer `id`
- [ ] **2.7.2** Implementar estado y efectos
  - Estados: `data`, `loading`, `error`
  - useEffect para llamar a API al montar
- [ ] **2.7.3** Implementar llamada a API
  - Llamar a `/api/certificate/verify/${id}`
  - Manejar respuesta exitosa
  - Manejar errores
- [ ] **2.7.4** Implementar estado de loading
  - Mostrar LoadingSpinner
  - Mensaje "Verificando..."
- [ ] **2.7.5** Implementar estado de error
  - Mostrar mensaje de error
  - Estilo visual claro
- [ ] **2.7.6** Implementar visualización de certificado
  - Mostrar VerifyBadge
  - Mostrar título
  - Mostrar issuer (si existe)
  - Mostrar wallet address
  - Mostrar hash
  - Mostrar txHash
  - Mostrar fecha de subida
  - Link a Stellar Explorer
- [ ] **2.7.7** Aplicar estilos
  - Layout centrado
  - Card con sombra
  - Espaciado adecuado
- [ ] **2.7.8** Probar página
  - Probar con ID válido
  - Probar con ID inválido
  - Verificar que muestra datos correctos

### Tarea 2.8: Implementar Componente CertificateStatusBadge (`components/CertificateStatusBadge.tsx`)
- [ ] **2.8.1** Implementar estado "Pendiente" (amarillo)
  - Badge amarillo con ⏳
  - Texto "En Revisión"
- [ ] **2.8.2** Implementar estado "Aprobado" (verde)
  - Badge verde con ✅
  - Texto "Aprobado"
- [ ] **2.8.3** Implementar estado "Rechazado" (rojo)
  - Badge rojo con ❌
  - Texto "Rechazado"
- [ ] **2.8.4** Aplicar estilos con Tailwind
  - Colores según estado
  - Bordes y padding
- [ ] **2.8.5** Probar componente
  - Probar con status='pending'
  - Probar con status='approved'
  - Probar con status='rejected'

### Tarea 2.9: Implementar Componente VerifyBadge (`components/VerifyBadge.tsx`)
- [ ] **2.9.1** Implementar estado "Verificado" (verde)
  - Badge verde con ✅
  - Texto "Verificado en Blockchain"
- [ ] **2.9.2** Implementar estado "Verificando" (amarillo)
  - Badge amarillo con ⏳
  - Texto "Verificando..."
- [ ] **2.9.3** Implementar estado "Inválido" (rojo)
  - Badge rojo con ❌
  - Texto "No Verificado"
- [ ] **2.9.4** Aplicar estilos con Tailwind
  - Colores según estado
  - Bordes y padding
- [ ] **2.9.5** Probar componente
  - Probar con isValid=true
  - Probar con isValid=false
  - Probar con verifying=true

### Tarea 2.10: Implementar Componente StatusFilter (`components/StatusFilter.tsx`)
- [ ] **2.10.1** Implementar botones de filtro
  - Botón "Todos"
  - Botón "Pendientes"
  - Botón "Aprobados"
  - Botón "Rechazados"
- [ ] **2.10.2** Implementar estado activo
  - Resaltar filtro seleccionado
  - Cambiar color cuando está activo
- [ ] **2.10.3** Implementar callback onFilterChange
  - Llamar callback cuando cambia filtro
  - Pasar status seleccionado
- [ ] **2.10.4** Aplicar estilos con Tailwind
  - Botones con hover effects
  - Estado activo destacado
- [ ] **2.10.5** Probar componente
  - Probar cambio de filtros
  - Verificar que callback funciona

### Tarea 2.11: Implementar Componente ValidatorActions (`components/ValidatorActions.tsx`)
- [ ] **2.11.1** Implementar botón "Aprobar"
  - Botón verde
  - Solo visible si es validador
- [ ] **2.11.2** Implementar botón "Rechazar"
  - Botón rojo
  - Solo visible si es validador
- [ ] **2.11.3** Implementar modal de rechazo
  - Input para razón de rechazo
  - Botón confirmar
- [ ] **2.11.4** Implementar handleApprove
  - Llamar a API PUT /api/certificate/[id]/status
  - Actualizar estado local
  - Mostrar mensaje de éxito
- [ ] **2.11.5** Implementar handleReject
  - Abrir modal
  - Llamar a API con razón
  - Actualizar estado local
  - Mostrar mensaje de éxito
- [ ] **2.11.6** Aplicar estilos con Tailwind
  - Botones con estilos claros
  - Modal centrado
- [ ] **2.11.7** Probar componente
  - Probar aprobar certificado
  - Probar rechazar certificado
  - Verificar que solo validadores ven botones

### Tarea 2.12: Implementar Página My Certificates (`app/my-certificates/page.tsx`)
- [ ] **2.12.1** Implementar verificación de wallet
  - Si NO está conectada: mostrar mensaje + WalletConnect
  - Si SÍ está conectada: mostrar lista
- [ ] **2.12.2** Implementar estados
  - `certificates`, `stats`, `loading`, `error`, `filterStatus`
- [ ] **2.12.3** Implementar useEffect para cargar certificados
  - Llamar a API cuando wallet está conectada
  - Actualizar estado con resultados y estadísticas
- [ ] **2.12.4** Implementar llamada a API
  - Llamar a `/api/certificate/user/${address}?status=${filterStatus}`
  - Manejar respuesta exitosa con stats
  - Manejar errores
- [ ] **2.12.5** Integrar StatusFilter
  - Pasar filterStatus y onFilterChange
  - Actualizar filtro cuando cambia
- [ ] **2.12.6** Mostrar estadísticas
  - Mostrar total, pending, approved, rejected
  - Cards con números destacados
- [ ] **2.12.7** Integrar CertificateList
  - Pasar certificates filtrados como prop
  - showWallet=false
- [ ] **2.12.8** Implementar estados de loading y error
  - LoadingSpinner durante carga
  - Mensaje de error si falla
- [ ] **2.12.9** Aplicar estilos
  - Layout centrado
  - Espaciado adecuado
  - Cards de estadísticas
- [ ] **2.12.10** Probar página
  - Probar sin wallet conectada
  - Probar con wallet conectada sin certificados
  - Probar con wallet conectada con certificados
  - Probar filtros por estado
  - Verificar estadísticas

### Tarea 2.13: Implementar Página Validator Dashboard (`app/validator/dashboard/page.tsx`)
- [ ] **2.13.1** Implementar verificación de wallet
  - Si NO está conectada: mostrar mensaje + WalletConnect
  - Si SÍ está conectada: verificar si es validador
- [ ] **2.13.2** Implementar verificación de validador
  - Llamar a `/api/validators/check/${address}`
  - Si NO es validador: mostrar mensaje de acceso denegado
  - Si SÍ es validador: mostrar dashboard
- [ ] **2.13.3** Implementar estados
  - `certificates`, `loading`, `error`
- [ ] **2.13.4** Implementar carga de certificados pendientes
  - Llamar a API para obtener todos los pendientes
  - Actualizar estado con resultados
- [ ] **2.13.5** Integrar CertificateList
  - Pasar certificates como prop
  - Mostrar ValidatorActions en cada card
- [ ] **2.13.6** Implementar estados de loading y error
  - LoadingSpinner durante carga
  - Mensaje de error si falla
- [ ] **2.13.7** Aplicar estilos
  - Layout centrado
  - Título "Dashboard de Validador"
  - Espaciado adecuado
- [ ] **2.13.8** Probar página
  - Probar sin wallet conectada
  - Probar con wallet no validadora
  - Probar con wallet validadora
  - Verificar que muestra certificados pendientes

### Tarea 2.14: Implementar Página User Certificates (`app/user/[wallet]/page.tsx`)
- [ ] **2.10.1** Obtener wallet de params
  - Usar `useParams()` de Next.js
  - Extraer `wallet`
- [ ] **2.10.2** Implementar validación de wallet
  - Validar formato Stellar
  - Mostrar error si es inválida
- [ ] **2.10.3** Implementar estados
  - `certificates`, `loading`, `error`
- [ ] **2.10.4** Implementar useEffect para cargar certificados
  - Llamar a API cuando wallet es válida
  - Actualizar estado con resultados
- [ ] **2.10.5** Implementar llamada a API
  - Llamar a `/api/certificate/user/${wallet}`
  - Manejar respuesta exitosa
  - Manejar errores
- [ ] **2.10.6** Integrar CertificateList
  - Pasar certificates como prop
  - showWallet=false
- [ ] **2.10.7** Implementar estados de loading y error
  - LoadingSpinner durante carga
  - Mensaje de error si falla
- [ ] **2.10.8** Aplicar estilos
  - Layout centrado
  - Mostrar wallet address
- [ ] **2.10.9** Probar página
  - Probar con wallet válida
  - Probar con wallet inválida
  - Verificar que muestra certificados

### Tarea 2.15: Implementar Componente CertificateCard (`components/CertificateCard.tsx`)
- [ ] **2.15.1** Implementar estructura básica
  - Recibir certificate como prop
  - Recibir showValidatorActions (opcional)
  - Mostrar título
- [ ] **2.15.2** Integrar CertificateStatusBadge
  - Mostrar badge según status (pending/approved/rejected)
  - Posición destacada
- [ ] **2.15.3** Integrar VerifyBadge
  - Mostrar badge según isValid (verificación blockchain)
  - Posición adecuada
- [ ] **2.15.4** Mostrar información del certificado
  - Título
  - Issuer (si existe)
  - Wallet address (si showWallet=true)
  - Fecha de subida
  - Estado actual
  - Validador (si está aprobado/rechazado)
  - Razón de rechazo (si está rechazado)
- [ ] **2.15.5** Integrar ValidatorActions (condicional)
  - Mostrar solo si showValidatorActions=true
  - Solo si status='pending'
- [ ] **2.15.6** Implementar links
  - Link a `/verify/${id}`
  - Link a Stellar Explorer
- [ ] **2.15.7** Aplicar estilos con Tailwind
  - Card con sombra
  - Hover effects
  - Espaciado adecuado
  - Diferentes colores según estado
- [ ] **2.15.8** Probar componente
  - Probar con certificado pending
  - Probar con certificado approved
  - Probar con certificado rejected
  - Verificar que links funcionan
  - Verificar ValidatorActions aparece solo cuando corresponde

### Tarea 2.16: Implementar Componente CertificateList (`components/CertificateList.tsx`)
- [ ] **2.12.1** Implementar lista de certificados
  - Mapear certificates array
  - Renderizar CertificateCard para cada uno
- [ ] **2.12.2** Implementar estado vacío
  - Mostrar mensaje si array está vacío
  - Estilo visual claro
- [ ] **2.12.3** Pasar props a CertificateCard
  - certificate
  - showWallet
- [ ] **2.12.4** Aplicar estilos
  - Espaciado entre cards
  - Layout responsive
- [ ] **2.12.5** Probar componente
  - Probar con certificados
  - Probar sin certificados
  - Verificar que se ve bien

### Tarea 2.17: Implementar Componente LoadingSpinner (`components/LoadingSpinner.tsx`)
- [ ] **2.13.1** Implementar spinner simple
  - Div con animación de rotación
  - Usar Tailwind animate-spin
- [ ] **2.13.2** Aplicar estilos
  - Tamaño adecuado
  - Color primary
  - Centrado
- [ ] **2.13.3** Probar componente
  - Verificar que anima correctamente
  - Verificar que se ve bien

### Tarea 2.18: Implementar Layout Principal (`app/layout.tsx`)
- [ ] **2.14.1** Verificar estructura básica
  - RootLayout con children
  - Metadata configurada
- [ ] **2.14.2** Integrar Navbar
  - Agregar componente Navbar
  - Verificar que se muestra en todas las páginas
- [ ] **2.14.3** Aplicar estilos globales
  - Background gradient
  - Font configurada
- [ ] **2.14.4** Probar layout
  - Verificar que Navbar aparece
  - Verificar que estilos se aplican

### Tarea 2.19: Implementar Página 404 (`app/not-found.tsx`)
- [ ] **2.15.1** Implementar estructura básica
  - Título "404"
  - Mensaje "Página no encontrada"
- [ ] **2.15.2** Agregar link a home
  - Botón "Volver al inicio"
  - Link a `/`
- [ ] **2.15.3** Aplicar estilos
  - Centrado
  - Estilo visual claro
- [ ] **2.15.4** Probar página
  - Ir a URL inválida
  - Verificar que muestra 404

### Checklist Fase 2
- [ ] Hook useWallet funcionando
- [ ] Todos los componentes creados (incluyendo nuevos)
- [ ] Todas las páginas creadas (incluyendo validator dashboard)
- [ ] Sistema de filtros por estado funcionando
- [ ] Sistema de validadores funcionando
- [ ] Navegación funcionando
- [ ] Formularios funcionando
- [ ] Estados de loading y error implementados
- [ ] Estilos aplicados con Tailwind

---

## 🟠 FASE 3: Integración y Testing

**Objetivo:** Probar todo el sistema end-to-end y corregir errores  
**Tiempo:** 2-3 horas  
**Estado:** ⏳ Pendiente

### Tarea 3.1: Testing End-to-End - Flujo Completo
- [ ] **3.1.1** Probar flujo completo de subir certificado
  - Conectar wallet
  - Ir a /upload
  - Subir certificado de prueba
  - Verificar que aparece en /my-certificates
  - Verificar que tiene link a Stellar Explorer
- [ ] **3.1.2** Probar verificación de certificado
  - Ir a /verify/[id] con ID válido
  - Verificar que muestra certificado
  - Verificar que badge muestra estado correcto
  - Verificar que link a Stellar Explorer funciona
- [ ] **3.1.3** Probar listado de certificados
  - Ir a /my-certificates
  - Verificar que muestra todos los certificados
  - Verificar que cada uno tiene links funcionando
- [ ] **3.1.4** Probar página pública de certificados
  - Ir a /user/[wallet] con wallet válida
  - Verificar que muestra certificados públicos
  - Verificar que no requiere wallet conectada

### Tarea 3.2: Testing de Validaciones
- [ ] **3.2.1** Probar validaciones de upload
  - Subir sin archivo (debe fallar)
  - Subir sin título (debe fallar)
  - Subir archivo > 10MB (debe fallar)
  - Subir tipo de archivo inválido (debe fallar)
  - Subir con wallet inválida (debe fallar)
- [ ] **3.2.2** Probar validaciones de wallet
  - Conectar wallet inválida (debe fallar)
  - Usar wallet con formato incorrecto (debe fallar)
- [ ] **3.2.3** Probar casos edge
  - Verificar certificado que no existe (debe mostrar 404)
  - Verificar certificado con wallet sin certificados (debe mostrar vacío)

### Tarea 3.3: Testing de Errores
- [ ] **3.3.1** Probar errores de Stellar
  - Simular error de conexión a Horizon
  - Verificar que muestra mensaje de error claro
- [ ] **3.3.2** Probar errores de Storage
  - Simular error de upload a Vercel Blob
  - Verificar que muestra mensaje de error claro
- [ ] **3.3.3** Probar errores de DB
  - Simular error de KV
  - Verificar que muestra mensaje de error claro

### Tarea 3.4: Testing de UI/UX
- [ ] **3.4.1** Probar responsive design
  - Probar en móvil (ancho pequeño)
  - Probar en tablet (ancho medio)
  - Probar en desktop (ancho grande)
  - Verificar que todo se ve bien
- [ ] **3.4.2** Probar navegación
  - Verificar que todos los links funcionan
  - Verificar que botones funcionan
  - Verificar que formularios funcionan
- [ ] **3.4.3** Probar estados visuales
  - Verificar que loading states se muestran
  - Verificar que error states se muestran
  - Verificar que success states se muestran

### Tarea 3.5: Corrección de Errores
- [ ] **3.5.1** Identificar todos los errores encontrados
  - Listar errores de consola
  - Listar errores de funcionalidad
  - Listar errores de UI
- [ ] **3.5.2** Corregir errores críticos
  - Errores que impiden funcionalidad básica
  - Errores de validación
  - Errores de API
- [ ] **3.5.3** Corregir errores menores
  - Errores de UI
  - Errores de estilo
  - Warnings de consola
- [ ] **3.5.4** Re-testear después de correcciones
  - Probar flujo completo nuevamente
  - Verificar que errores están corregidos

### Checklist Fase 3
- [ ] Flujo completo probado y funcionando
- [ ] Todas las validaciones probadas
- [ ] Manejo de errores probado
- [ ] UI/UX probado y corregido
- [ ] No hay errores críticos
- [ ] Sistema listo para deploy

---

## 🔴 FASE 4: Deploy y Documentación

**Objetivo:** Deployar a Vercel y documentar el proyecto  
**Tiempo:** 1-2 horas  
**Estado:** ⏳ Pendiente

### Tarea 4.1: Preparar para Deploy
- [ ] **4.1.1** Verificar que no hay errores de build
  - Ejecutar `npm run build`
  - Verificar que compila sin errores
  - Corregir errores si los hay
- [ ] **4.1.2** Verificar variables de entorno
  - Listar todas las variables necesarias
  - Verificar que están documentadas
- [ ] **4.1.3** Verificar que `.env.local` NO está en git
  - Verificar `.gitignore`
  - Verificar que no se commiteará

### Tarea 4.2: Deploy a Vercel
- [ ] **4.2.1** Crear proyecto en Vercel
  - Ir a Vercel Dashboard
  - Click "Add New Project"
  - Conectar repositorio (si aplica)
- [ ] **4.2.2** Configurar variables de entorno en Vercel
  - Agregar `STELLAR_SECRET_KEY`
  - Agregar `STELLAR_NETWORK`
  - Agregar `HORIZON_URL`
  - Agregar `BLOB_READ_WRITE_TOKEN`
  - Agregar `KV_REST_API_URL`
  - Agregar `KV_REST_API_TOKEN`
- [ ] **4.2.3** Configurar build settings
  - Framework: Next.js
  - Build command: `npm run build`
  - Output directory: `.next`
- [ ] **4.2.4** Hacer deploy
  - Click "Deploy"
  - Esperar a que termine
  - Verificar que no hay errores
- [ ] **4.2.5** Verificar deploy
  - Abrir URL de producción
  - Probar que homepage carga
  - Probar que todas las páginas cargan

### Tarea 4.3: Testing en Producción
- [ ] **4.3.1** Probar flujo completo en producción
  - Conectar wallet
  - Subir certificado
  - Verificar certificado
  - Listar certificados
- [ ] **4.3.2** Verificar que Stellar funciona
  - Verificar que transacciones se crean
  - Verificar que links a Stellar Explorer funcionan
- [ ] **4.3.3** Verificar que Storage funciona
  - Verificar que archivos se suben
  - Verificar que URLs son accesibles
- [ ] **4.3.4** Verificar que DB funciona
  - Verificar que certificados se guardan
  - Verificar que se pueden obtener

### Tarea 4.4: Documentación
- [ ] **4.4.1** Actualizar README.md
  - Agregar descripción completa
  - Agregar instrucciones de instalación
  - Agregar instrucciones de deploy
  - Agregar ejemplos de uso
- [ ] **4.4.2** Documentar API endpoints
  - Documentar cada endpoint
  - Agregar ejemplos de request/response
  - Agregar códigos de error
- [ ] **4.4.3** Crear guía de integración con ArcusX
  - Documentar cómo integrar
  - Agregar ejemplos de código
  - Agregar endpoints públicos

### Checklist Fase 4
- [ ] Proyecto deployado en Vercel
- [ ] Todas las variables de entorno configuradas
- [ ] Sistema funcionando en producción
- [ ] Documentación completa
- [ ] README actualizado

---

## 📊 Resumen de Fases

| Fase | Tareas | Subtareas | Tiempo | Estado |
|------|--------|-----------|--------|--------|
| **Fase 0** | 6 | 35 | 2-3h | ⏳ |
| **Fase 1** | 11 | 65 | 5-7h | ⏳ |
| **Fase 2** | 19 | 110 | 6-8h | ⏳ |
| **Fase 3** | 5 | 25 | 2-3h | ⏳ |
| **Fase 4** | 4 | 20 | 1-2h | ⏳ |
| **TOTAL** | **45** | **255** | **16-23h** | ⏳ |

---

## ✅ Checklist Final del Proyecto

### Funcionalidad Core
- [ ] Usuario puede conectar wallet Freighter
- [ ] Usuario puede subir certificado (estado inicial: pending)
- [ ] Certificado se guarda en Stellar
- [ ] Usuario puede verificar certificado en blockchain
- [ ] Usuario puede listar sus certificados con filtros por estado
- [ ] Usuario puede ver estadísticas de sus certificados
- [ ] Validador puede ver certificados pendientes
- [ ] Validador puede aprobar certificados
- [ ] Validador puede rechazar certificados (con razón)
- [ ] Cualquiera puede ver certificados públicos
- [ ] Sistema de estados funcionando (pending/approved/rejected)

### Calidad
- [ ] No hay errores en consola
- [ ] No hay errores de TypeScript
- [ ] Todas las validaciones funcionan
- [ ] Manejo de errores completo
- [ ] UI responsive

### Deploy
- [ ] Deployado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Funcionando en producción
- [ ] Documentación completa

---

---

## 🔑 Sistema de Validadores

### Configuración Inicial
- Los validadores se configuran manualmente en KV
- Key: `validators:list` → Array de wallet addresses
- Ejemplo: `["GABC...", "GDEF..."]`

### Agregar Validadores
1. Ir a Vercel KV Dashboard
2. Agregar key `validators:list`
3. Valor: JSON array de wallet addresses
4. O usar endpoint futuro para agregar (requiere autenticación admin)

### Funcionalidad
- Solo wallets en la lista pueden aprobar/rechazar
- Validadores ven dashboard con certificados pendientes
- Validadores pueden ver razón de rechazo en historial

---

**Última actualización:** Enero 2025  
**Versión:** 2.0 (Actualizado con sistema de estados y validadores)  
**Estado:** Plan oficial completo - Listo para implementación

