# 🧹 Cómo Limpiar Todos los Datos de CertiX

Este documento explica dónde se guardan los datos y cómo eliminarlos completamente.

---

## 📍 Dónde se Guardan los Datos

### 1. **Redis** (Base de Datos)
- **Ubicación**: Redis Cloud (configurado con `REDIS_URL`)
- **Qué guarda**:
  - Certificados individuales: `cert:{id}`
  - Listas de certificados por usuario: `user:{wallet}:certs`
  - Listas por estado: `status:{status}` (pending, approved, rejected)
  - Listas por usuario y estado: `user:{wallet}:status:{status}`

### 2. **Vercel Blob Storage** (Archivos)
- **Ubicación**: Vercel Blob Storage
- **Qué guarda**:
  - Archivos de certificados (PDF, PNG, JPG)
  - Configurado con `BLOB_READ_WRITE_TOKEN`

### 3. **Stellar Blockchain** (Inmutable)
- **Ubicación**: Stellar Testnet/Mainnet
- **Qué guarda**:
  - Hash del certificado en transacciones
  - Estado del certificado en Smart Contract
  - ⚠️ **NO SE PUEDE ELIMINAR** - Es inmutable en la blockchain

---

## 🗑️ Cómo Limpiar los Datos

### Opción 1: Script Automático (Recomendado)

```bash
cd certix
npx tsx scripts/clean-all-data.ts
```

Este script elimina:
- ✅ Todos los certificados de Redis
- ✅ Todos los archivos de Vercel Blob Storage

### Opción 2: Limpieza Manual de Redis

Si solo quieres limpiar Redis:

```bash
# Conectar a Redis CLI
redis-cli -u $REDIS_URL

# Ver todas las claves
KEYS *

# Eliminar todas las claves
FLUSHDB

# O eliminar solo las relacionadas con certificados
KEYS cert:*
KEYS user:*
KEYS status:*
# Luego eliminar cada grupo
DEL cert:* user:* status:*
```

### Opción 3: Limpieza Manual de Blob Storage

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Storage** → **Blob**
4. Elimina los archivos manualmente

---

## ⚠️ Advertencias Importantes

1. **Operación Irreversible**: Una vez eliminados, los datos NO se pueden recuperar
2. **Blockchain Inmutable**: Los datos en Stellar blockchain NO se pueden eliminar
3. **Backup**: Si necesitas los datos después, haz un backup antes de limpiar

---

## 📝 Notas

- El script `clean-all-data.ts` requiere:
  - `REDIS_URL` en `.env.local`
  - `BLOB_READ_WRITE_TOKEN` en `.env.local`
- Los datos en la blockchain permanecerán, pero la aplicación no los mostrará si se eliminan de Redis
- Para un demo limpio, solo necesitas limpiar Redis y Blob Storage

---

## 🚀 Después de Limpiar

Una vez limpiado, puedes:
1. Subir nuevos certificados
2. Grabar un demo desde cero
3. Los datos nuevos se guardarán normalmente

