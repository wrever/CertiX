# CertiX

<div align="center">

![CertiX Logo](https://img.shields.io/badge/CertiX-Certifications-blue?style=for-the-badge)
![Stellar](https://img.shields.io/badge/Stellar-Blockchain-7D00FF?style=for-the-badge&logo=stellar)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)

**Sistema de Certificaciones Verificables en Blockchain Stellar**

*Certificaciones inmutables, transparentes y descentralizadas*

[Características](#-características) • [Instalación](#-instalación) • [Documentación](#-documentación) • [API](#-api) • [Deploy](#-deploy)

</div>

---

## 📋 Descripción

**CertiX** es una plataforma descentralizada para la emisión, validación y verificación de certificaciones digitales utilizando la blockchain de Stellar y **Smart Contracts Soroban**. Cada certificado queda registrado de forma **inmutable** y puede ser verificado públicamente por cualquier persona sin necesidad de permisos especiales.

### 🎯 Problema que Resuelve

- **Falsificación de certificados**: Los certificados tradicionales pueden ser falsificados fácilmente
- **Verificación centralizada**: Dependencia de autoridades centrales para validar autenticidad
- **Falta de transparencia**: No hay forma pública de verificar la validez de un certificado
- **Almacenamiento vulnerable**: Los certificados digitales pueden ser modificados o perdidos

### ✅ Solución de CertiX

- **Smart Contracts Soroban**: El corazón del sistema - gestión inmutable de estados en blockchain
- **Inmutabilidad blockchain**: Hash SHA256 registrado permanentemente en Stellar
- **Verificación pública**: Cualquiera puede verificar la autenticidad sin permisos
- **Descentralización**: No depende de un servidor central único

---

## 📜 Smart Contract Soroban - El Corazón de CertiX

### ⭐ ¿Por qué el Smart Contract es lo más importante?

El **Smart Contract Soroban** es el componente central de CertiX. Es donde se almacenan de forma **inmutable** todos los estados de los certificados (Pending, Approved, Rejected) directamente en la blockchain de Stellar. Esto garantiza que:

- ✅ **Inmutabilidad total**: Los estados no pueden ser modificados una vez registrados
- ✅ **Transparencia**: Cualquiera puede verificar el estado de un certificado consultando el contrato
- ✅ **Descentralización**: No depende de servidores centrales ni bases de datos tradicionales
- ✅ **Confianza**: La lógica del contrato es pública y verificable

### 🔗 Contrato Desplegado

**Testnet:**
```
ID: CBAEDSXVAUIT3M7JOW3ASF6POMVNMYXDWBJ45JUWXN6GGNHVLLM52VJP
```

**Explorador:**
- [Ver en Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBAEDSXVAUIT3M7JOW3ASF6POMVNMYXDWBJ45JUWXN6GGNHVLLM52VJP)

### 🔧 Funciones del Smart Contract

El contrato implementa las siguientes funciones principales:

#### 1. `register_certificate(file_hash, tx_hash, owner)`
Registra un nuevo certificado en el contrato con estado inicial `Pending`.

**Parámetros:**
- `file_hash`: Hash SHA256 del archivo (32 bytes)
- `tx_hash`: Hash de la transacción Stellar firmada (prueba de autenticidad)
- `owner`: Dirección de la wallet del propietario

**Estado inicial:** `Pending`

#### 2. `approve_certificate(file_hash, admin)`
Aprueba un certificado pendiente. Solo puede ser llamado por el admin del contrato.

**Parámetros:**
- `file_hash`: Hash del certificado a aprobar
- `admin`: Dirección de la wallet admin (debe ser el admin configurado)

**Resultado:** Estado cambia a `Approved`

#### 3. `reject_certificate(file_hash, admin, reason)`
Rechaza un certificado pendiente. Solo puede ser llamado por el admin del contrato.

**Parámetros:**
- `file_hash`: Hash del certificado a rechazar
- `admin`: Dirección de la wallet admin
- `reason`: Razón del rechazo (opcional)

**Resultado:** Estado cambia a `Rejected`

#### 4. `get_certificate(file_hash)`
Obtiene todos los datos de un certificado desde el contrato.

**Retorna:**
- Estado actual (Pending/Approved/Rejected)
- Wallet del propietario
- Hash de la transacción
- Admin que validó (si aplica)
- Fecha de validación (si aplica)
- Razón de rechazo (si aplica)

#### 5. `is_approved(file_hash)`
Verifica rápidamente si un certificado está aprobado.

**Retorna:** `true` si está aprobado, `false` en caso contrario

### 🔄 Flujo Completo con Smart Contract

```
1. Usuario sube certificado
   ↓
2. Backend genera hash SHA256 del archivo
   ↓
3. Usuario firma transacción Stellar con hash (prueba de autenticidad)
   ↓
4. Backend registra en Smart Contract:
   - register_certificate(file_hash, tx_hash, owner)
   - Estado: Pending
   ↓
5. Admin revisa certificado en /validator/dashboard
   ↓
6. Admin aprueba/rechaza:
   - approve_certificate(file_hash, admin) O
   - reject_certificate(file_hash, admin, reason)
   ↓
7. Estado actualizado en Smart Contract (inmutable)
   ↓
8. Cualquiera puede verificar consultando el contrato
```

### 📍 Ubicación del Código del Contrato

El código fuente del Smart Contract está en:
```
contract/contracts/certix-contract/src/lib.rs
```

**Lenguaje:** Rust (Soroban SDK)

### 🔐 Configuración del Admin

El admin del Smart Contract se configura al inicializar el contrato. Solo esta wallet puede:
- Aprobar certificados
- Rechazar certificados

La wallet admin se verifica en cada operación de aprobación/rechazo.

### 📚 Documentación Adicional

- [Flujo Completo del Smart Contract](docs/FLUJO_COMPLETO_SMART_CONTRACT.md)
- [Cómo ser Admin](docs/COMO_SER_ADMIN.md)
- [Cómo usar Wallet Admin](docs/COMO_USAR_WALLET_ADMIN.md)

---

## ✨ Características

### 🔐 Seguridad y Autenticidad

- **Smart Contract Soroban**: Estados de validación gestionados de forma inmutable en blockchain
- **Hash SHA256 inmutable**: Cada certificado genera un hash único que se registra en blockchain
- **Firma de transacciones**: El usuario firma con su wallet Stellar como prueba de autenticidad
- **Verificación blockchain**: Comparación automática con transacciones en Stellar y consulta al Smart Contract

### 🎨 Experiencia de Usuario

- **Wallet como identificador único**: Sin necesidad de crear cuentas tradicionales
- **Interfaz moderna y responsive**: Diseño profesional con Tailwind CSS
- **Dashboard de administración**: Panel completo para validadores
- **Filtros y estadísticas**: Visualización avanzada de certificados

### ⚡ Funcionalidades Técnicas

- **Sistema de estados**: `pending` → `approved` / `rejected`
- **Validación por administradores**: Solo wallets autorizadas pueden aprobar/rechazar
- **Almacenamiento descentralizado**: Archivos en Vercel Blob, datos en Redis
- **API REST completa**: Endpoints para todas las operaciones

---

## 🏗️ Arquitectura

### Stack Tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, CSS Modules |
| **Blockchain** | Stellar SDK, Soroban Smart Contracts |
| **Wallet** | Freighter (via Stellar Wallets Kit) |
| **Storage** | Vercel Blob (archivos), Redis (datos) |
| **Deployment** | Vercel |

### Flujo de Datos

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Sube Archivo    │────▶  Genera Hash │────▶  Firma TX   │
└─────────────────┘     └──────────────┘     └──────┬──────┘
                                                      │
                                                      ▼
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Smart Contract ◀────│  Registra en ◀────│  Envía TX    │
│    (Soroban)    │     │  Blockchain  │     │  a Stellar  │
└────────┬────────┘     └──────────────┘     └─────────────┘
         │
         ▼
┌─────────────────┐
│ Estado: Pending │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│ Admin Aprueba/  │────▶ Actualiza en │
│   Rechaza       │     │  Smart Cont. │
└─────────────────┘     └──────────────┘
```

### Componentes Principales

```
certix/
├── app/
│   ├── api/                          # API Routes
│   │   ├── certificate/
│   │   │   ├── upload/               # Subir certificado
│   │   │   ├── upload/sign/          # Firmar y registrar
│   │   │   ├── verify/[id]/          # Verificar certificado
│   │   │   ├── [id]/status/          # Cambiar estado (admin)
│   │   │   └── user/[wallet]/        # Listar por wallet
│   │   └── admin/check/              # Verificar admin
│   ├── page.tsx                      # Homepage
│   ├── upload/                       # Página de subida
│   ├── my-certificates/              # Mis certificados
│   ├── verify/[id]/                   # Verificar certificado
│   └── validator/dashboard/          # Dashboard admin
├── components/                        # Componentes React
│   ├── WalletConnect.tsx             # Conexión de wallet
│   ├── UploadForm.tsx                # Formulario de subida
│   ├── CertificateCard.tsx           # Card de certificado
│   ├── ValidatorActions.tsx          # Acciones de admin
│   └── ...
├── lib/                               # Utilidades
│   ├── stellar.ts                    # Funciones Stellar
│   ├── soroban.ts                   # Smart Contract (registro)
│   ├── soroban-admin.ts             # Smart Contract (admin)
│   ├── hash.ts                      # Generación de hash
│   ├── storage.ts                   # Upload de archivos
│   └── db.ts                        # Operaciones Redis
├── hooks/
│   └── useWallet.ts                 # Hook de wallet
└── types/
    └── certificate.ts               # Tipos TypeScript
```

---

## 🚀 Instalación

### Prerrequisitos

- **Node.js** 18+ y npm
- **Cuenta Stellar Testnet** (para desarrollo)
- **Freighter Wallet** instalada en el navegador
- **Cuenta Vercel** (para Blob Storage y Redis)

### Paso 1: Clonar e Instalar

```bash
# Clonar el repositorio
git clone <repository-url>
cd certix

# Instalar dependencias
npm install
```

### Paso 2: Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
# Stellar Configuration
STELLAR_SECRET_KEY=SD...                    # Secret key de cuenta del sistema
STELLAR_NETWORK=TESTNET                      # TESTNET o MAINNET
HORIZON_URL=https://horizon-testnet.stellar.org
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# Smart Contract
SOROBAN_CONTRACT_ID=CAK5PGHHLVOR5EAMNHQMX3HA3MXZDYYI7WHGJCHHB6CWJFBTDOHDLCFG
ADMIN_PUBLIC_KEY=GALR6D6JTE2C554HD2OOW5CDMUYBYZ43S4VLWPDAMJFLSF2GQW5GLCT3
ADMIN_SECRET_KEY=SC3FVXSBS5OJCGQNO6FWIMGIILKTV6Q26SYQHN5ZHZRSMIEUSXMJAMNY

# Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx        # Token de Vercel Blob
REDIS_URL=redis://...                        # URL de Redis
```

### Paso 3: Crear Cuenta Stellar del Sistema

1. Ir a [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
2. Generar un nuevo keypair
3. Fondear la cuenta con Friendbot
4. Copiar la **Secret Key** a `.env.local` como `STELLAR_SECRET_KEY`

### Paso 4: Configurar Vercel Blob Storage

1. Ir a [Vercel Dashboard](https://vercel.com/dashboard)
2. Crear un nuevo **Blob Store**
3. Copiar el `BLOB_READ_WRITE_TOKEN` a `.env.local`

### Paso 5: Configurar Redis

**Opción A: Redis Cloud (Recomendado)**
1. Crear cuenta en [Redis Cloud](https://redis.com/try-free/)
2. Crear base de datos
3. Copiar la URL de conexión a `.env.local` como `REDIS_URL`

**Opción B: Vercel KV**
1. En Vercel Dashboard, crear **KV Database**
2. Copiar `KV_REST_API_URL` y `KV_REST_API_TOKEN` a `.env.local`

### Paso 6: Ejecutar en Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## 📖 Uso

### Para Usuarios

#### 1. Conectar Wallet

1. Abre CertiX en tu navegador
2. Haz clic en **"Conectar Freighter"**
3. Autoriza la conexión en Freighter
4. Tu wallet será tu identificador único

#### 2. Subir Certificado

1. Ve a `/upload`
2. Selecciona un archivo (PDF, PNG, JPG - máx. 10MB)
3. Completa el título y emisor (opcional)
4. Haz clic en **"Subir Certificado"**
5. **Firma la transacción** con Freighter cuando se solicite
6. El certificado quedará registrado con estado `pending`

#### 3. Ver Mis Certificados

1. Ve a `/my-certificates`
2. Filtra por estado: Todos, Pendientes, Aprobados, Rechazados
3. Ver estadísticas de tus certificados
4. Accede a detalles y verificación de cada uno

#### 4. Verificar Certificado

1. Comparte el link `/verify/[id]` o busca por ID
2. El sistema verificará automáticamente contra la blockchain
3. Verás el estado de validación y links a Stellar Explorer

### Para Administradores

#### 1. Acceder al Dashboard

1. Conecta la **wallet admin** configurada en el Smart Contract
2. Ve a `/validator/dashboard`
3. Verás un banner confirmando que eres admin

#### 2. Aprobar/Rechazar Certificados

1. Revisa los certificados pendientes
2. Haz clic en **"Aprobar"** o **"Rechazar"**
3. Si rechazas, proporciona una razón
4. **Firma la transacción** con Freighter
5. El estado se actualizará en el Smart Contract y Redis

> 📚 **Documentación detallada**: Ver `docs/COMO_USAR_WALLET_ADMIN.md`

---

## 🔌 API

### Endpoints Principales

#### Subir Certificado

```http
POST /api/certificate/upload
Content-Type: multipart/form-data

{
  "file": File,
  "walletAddress": "G...",
  "title": "Certificado de Python",
  "issuer": "Universidad XYZ" (opcional)
}
```

**Response:**
```json
{
  "success": true,
  "certificateId": "uuid",
  "txXdr": "base64...",
  "hash": "sha256...",
  "fileUrl": "https://...",
  "needsSignature": true
}
```

#### Firmar y Registrar

```http
POST /api/certificate/upload/sign
Content-Type: application/json

{
  "certificateId": "uuid",
  "signedTxXdr": "base64...",
  "walletAddress": "G...",
  "hash": "sha256...",
  "fileUrl": "https://...",
  "title": "Certificado de Python"
}
```

#### Verificar Certificado

```http
GET /api/certificate/verify/[id]
```

**Response:**
```json
{
  "success": true,
  "isValid": true,
  "certificate": { ... },
  "stellarExplorerUrl": "https://..."
}
```

#### Listar Certificados por Wallet

```http
GET /api/certificate/user/[wallet]?status=pending
```

**Response:**
```json
{
  "success": true,
  "certificates": [ ... ],
  "stats": {
    "total": 10,
    "pending": 3,
    "approved": 6,
    "rejected": 1
  }
}
```

#### Preparar Transacción de Aprobación/Rechazo

```http
POST /api/certificate/[id]/status/prepare
Content-Type: application/json

{
  "status": "approved" | "rejected",
  "adminWallet": "G...",
  "reason": "Razón de rechazo" (opcional)
}
```

#### Enviar Transacción Firmada

```http
POST /api/certificate/[id]/status/submit
Content-Type: application/json

{
  "signedTxXdr": "base64...",
  "adminWallet": "G...",
  "status": "approved",
  "reason": "..." (opcional)
}
```

#### Verificar Admin

```http
GET /api/admin/check?wallet=G...
```

**Response:**
```json
{
  "success": true,
  "isAdmin": true,
  "adminAddress": "G...",
  "wallet": "G..."
}
```

---

> 💡 **Nota**: Para más detalles sobre el Smart Contract, consulta la sección [Smart Contract Soroban - El Corazón de CertiX](#-smart-contract-soroban---el-corazón-de-certix) al inicio del README.

---

## 🚀 Deploy

### Deploy a Vercel

1. **Conectar repositorio** a Vercel
2. **Configurar variables de entorno** en Vercel Dashboard:
   - Todas las variables de `.env.local`
3. **Deploy automático** en cada push a `main`

```bash
# O deploy manual
vercel --prod
```

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables en Vercel Dashboard:

- `STELLAR_SECRET_KEY`
- `STELLAR_NETWORK` (MAINNET para producción)
- `HORIZON_URL`
- `SOROBAN_RPC_URL`
- `SOROBAN_CONTRACT_ID`
- `ADMIN_PUBLIC_KEY`
- `ADMIN_SECRET_KEY`
- `BLOB_READ_WRITE_TOKEN`
- `REDIS_URL`

### Post-Deploy

1. Verificar que el Smart Contract esté desplegado
2. Inicializar el contrato con la wallet admin
3. Probar subida y verificación de certificados
4. Configurar monitoreo y logs

---

## 🧪 Testing

### Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm run start

# Linting
npm run lint

# Limpiar todos los datos (desarrollo)
npm run clean
```

### Testing Manual

1. **Subir certificado**: Verificar que se genera hash y se crea transacción
2. **Firmar transacción**: Verificar que Freighter solicita firma
3. **Registro en contrato**: Verificar en Stellar Explorer
4. **Aprobación admin**: Verificar que el estado se actualiza
5. **Verificación pública**: Verificar que cualquiera puede verificar

---

## 📚 Documentación Adicional

- [`docs/COMO_USAR_WALLET_ADMIN.md`](docs/COMO_USAR_WALLET_ADMIN.md) - Guía para administradores
- [`docs/FLUJO_COMPLETO_SMART_CONTRACT.md`](docs/FLUJO_COMPLETO_SMART_CONTRACT.md) - Flujo con Smart Contracts
- [`docs/COMO_LIMPIAR_DATOS.md`](docs/COMO_LIMPIAR_DATOS.md) - Limpieza de datos
- [`PLAN_CERTIX.md`](PLAN_CERTIX.md) - Plan de implementación
- [`ESTADO_PROYECTO.md`](ESTADO_PROYECTO.md) - Estado actual

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Sigue las convenciones de código existentes
- Añade tests para nuevas funcionalidades
- Actualiza la documentación según sea necesario
- Asegúrate de que el build pase sin errores

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## 🆘 Soporte

- **Issues**: Abre un issue en GitHub para reportar bugs o solicitar features
- **Documentación**: Consulta la carpeta `docs/` para guías detalladas
- **Stellar**: [Documentación oficial de Stellar](https://developers.stellar.org/)
- **Soroban**: [Documentación de Soroban](https://soroban.stellar.org/docs)

---

## 🎯 Roadmap

- [ ] Soporte para múltiples administradores
- [ ] Sistema de notificaciones
- [ ] API pública para integraciones
- [ ] Exportación de certificados en PDF
- [ ] Integración con más wallets Stellar
- [ ] Dashboard de analytics avanzado
- [ ] Sistema de badges y credenciales

---

<div align="center">

**CertiX** - Certificaciones Verificables en Blockchain

Construido con ❤️ usando Stellar y Soroban

[⭐ Star en GitHub](https://github.com) • [📖 Documentación](./docs) • [🐛 Reportar Bug](https://github.com)

</div>
