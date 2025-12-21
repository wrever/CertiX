# CertiX - Sistema de Certificaciones Verificables en Stellar

**by ArcusX**

Sistema completo para subir, validar y verificar certificaciones usando Stellar blockchain.

## ✨ Características

- ✅ **Wallet como identificador único** - Sin login tradicional
- ✅ **Sistema de estados** - Pendiente/Aprobado/Rechazado
- ✅ **Sistema de validadores** - Wallets autorizadas para validar
- ✅ **Verificación blockchain** - Hash inmutable en Stellar
- ✅ **Filtros y estadísticas** - Visualización completa
- ✅ **Dashboard de validadores** - Gestión de certificados pendientes

## 🚀 Inicio Rápido

### 1. Instalar Dependencias
```bash
cd certix
npm install
```

### 2. Configurar Variables de Entorno

Crear archivo `.env.local`:
```env
STELLAR_SECRET_KEY=SD... (cuenta del sistema)
STELLAR_NETWORK=TESTNET
HORIZON_URL=https://horizon-testnet.stellar.org
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx
KV_REST_API_URL=https://xxx.kv.vercel.app
KV_REST_API_TOKEN=xxx
```

### 3. Crear Cuenta Stellar del Sistema
1. Ir a https://laboratory.stellar.org/#account-creator?network=test
2. Generar keypair
3. Fondear con friendbot
4. Copiar Secret Key a `.env.local`

### 4. Configurar Vercel
1. Crear Vercel Blob Storage → Obtener `BLOB_READ_WRITE_TOKEN`
2. Crear Vercel KV → Obtener `KV_REST_API_URL` y `KV_REST_API_TOKEN`
3. Agregar variables en Vercel Dashboard

### 5. Inicializar Validadores
En Vercel KV, crear key `validators:list` con array de wallet addresses:
```json
["GABC...", "GDEF..."]
```

### 6. Ejecutar en Desarrollo
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
certix/
├── app/
│   ├── api/                    # 9 Endpoints API
│   ├── page.tsx                 # Homepage
│   ├── upload/                  # Subir certificado
│   ├── verify/[id]/            # Verificar certificado
│   ├── my-certificates/         # Mis certificados (con filtros)
│   ├── user/[wallet]/           # Certificados públicos
│   └── validator/dashboard/    # Dashboard validadores
├── components/                   # 10 Componentes
├── hooks/                       # useWallet
├── lib/                         # 5 Utilidades
└── types/                       # TypeScript types
```

## 🔌 Endpoints API

- `POST /api/certificate/upload` - Subir certificado
- `GET /api/certificate/verify/[id]` - Verificar certificado
- `GET /api/certificate/user/[wallet]` - Listar certificados (con filtros)
- `GET /api/certificate/[id]` - Obtener certificado
- `PUT /api/certificate/[id]/status` - Cambiar estado (validadores)
- `GET /api/certificate/pending` - Certificados pendientes
- `GET /api/validators/list` - Listar validadores
- `GET /api/validators/check/[wallet]` - Verificar validador
- `GET /api/health` - Health check

## 🔧 Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Styling:** Tailwind CSS
- **Blockchain:** Stellar SDK
- **Wallet:** Freighter (via Stellar Wallets Kit)
- **Storage:** Vercel Blob
- **Database:** Vercel KV

## 📚 Documentación

- **`PLAN_CERTIX.md`** - Plan completo de implementación
- **`ESTADO_PROYECTO.md`** - Estado actual del proyecto
- **`PROGRESO_IMPLEMENTACION.md`** - Progreso detallado

## 🚀 Deploy

```bash
vercel --prod
```

No olvides configurar todas las variables de entorno en Vercel Dashboard.

## 📝 Licencia

MIT

---

**Estado:** ✅ Código 100% Completo - Listo para Configuración y Testing

