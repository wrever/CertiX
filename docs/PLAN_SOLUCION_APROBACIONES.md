# 🔧 Plan Completo: Solución para Aprobaciones/Rechazos en Blockchain

## 📋 Problema Actual

- ✅ **Subida de certificados**: Funciona correctamente, se registra en el contrato
- ❌ **Aprobaciones/Rechazos**: Se actualizan en la DB pero NO se registran en el contrato blockchain
- ⚠️ **Conflicto**: Cualquier cambio en el código de aprobación afecta la subida

---

## 🎯 Solución: Separación Completa de Flujos

### **Estrategia Principal**
Crear funciones **completamente separadas** para aprobación/rechazo que NO compartan código con la subida.

---

## 📝 Plan de Implementación

### **FASE 1: Crear Funciones Separadas para Aprobación/Rechazo** ⏱️ 20 min

#### 1.1 Crear nuevo archivo `lib/soroban-admin.ts`
- [ ] Crear archivo nuevo específico para operaciones de admin
- [ ] NO reutilizar código de `lib/soroban.ts` (evitar conflictos)
- [ ] Implementar funciones independientes:
  - `prepareApproveTransaction()` - Preparar transacción de aprobación
  - `prepareRejectTransaction()` - Preparar transacción de rechazo
  - `submitAdminTransaction()` - Enviar transacción de admin al contrato

#### 1.2 Implementar `prepareApproveTransaction()`
- [ ] Crear transacción sin firmar
- [ ] Simular con Soroban RPC
- [ ] Preparar con Soroban RPC
- [ ] Retornar XDR preparado (sin firmar)

#### 1.3 Implementar `prepareRejectTransaction()`
- [ ] Crear transacción sin firmar
- [ ] Simular con Soroban RPC
- [ ] Preparar con Soroban RPC
- [ ] Retornar XDR preparado (sin firmar)

#### 1.4 Implementar `submitAdminTransaction()`
- [ ] Recibir XDR firmado por el admin
- [ ] Enviar directamente al RPC de Soroban
- [ ] NO preparar de nuevo (ya está preparado)
- [ ] Retornar hash de la transacción

---

### **FASE 2: Actualizar Endpoints de Aprobación/Rechazo** ⏱️ 15 min

#### 2.1 Actualizar `status/prepare/route.ts`
- [ ] Importar funciones de `lib/soroban-admin.ts`
- [ ] Usar `prepareApproveTransaction()` o `prepareRejectTransaction()`
- [ ] NO modificar código de subida
- [ ] Retornar XDR preparado para que el admin firme

#### 2.2 Actualizar `status/submit/route.ts`
- [ ] Importar `submitAdminTransaction()` de `lib/soroban-admin.ts`
- [ ] Usar función separada para enviar
- [ ] NO modificar código de subida
- [ ] Actualizar DB solo después de confirmar que se envió al contrato

---

### **FASE 3: Testing y Validación** ⏱️ 10 min

#### 3.1 Probar subida de certificados
- [ ] Verificar que la subida sigue funcionando
- [ ] Confirmar que se registra en el contrato
- [ ] Verificar que NO se ve afectada por los cambios

#### 3.2 Probar aprobación
- [ ] Preparar transacción de aprobación
- [ ] Firmar con Freighter
- [ ] Enviar al contrato
- [ ] Verificar en Stellar Expert que se registró

#### 3.3 Probar rechazo
- [ ] Preparar transacción de rechazo
- [ ] Firmar con Freighter
- [ ] Enviar al contrato
- [ ] Verificar en Stellar Expert que se registró

---

## 🔍 Detalles Técnicos

### **Archivo: `lib/soroban-admin.ts`**

```typescript
// Funciones completamente independientes para admin
// NO reutilizar código de lib/soroban.ts

export async function prepareApproveTransaction(
  fileHash: string,
  adminWallet: string
): Promise<{ txXdr: string; txHash: string }>

export async function prepareRejectTransaction(
  fileHash: string,
  adminWallet: string,
  reason: string
): Promise<{ txXdr: string; txHash: string }>

export async function submitAdminTransaction(
  signedTxXdr: string
): Promise<string> // Retorna hash de la transacción
```

### **Flujo de Aprobación/Rechazo**

1. **Frontend** → Llama a `/api/certificate/[id]/status/prepare`
2. **Backend** → Usa `prepareApproveTransaction()` o `prepareRejectTransaction()`
3. **Backend** → Retorna XDR preparado (sin firmar)
4. **Frontend** → Usuario firma con Freighter
5. **Frontend** → Llama a `/api/certificate/[id]/status/submit` con XDR firmado
6. **Backend** → Usa `submitAdminTransaction()` para enviar al contrato
7. **Backend** → Actualiza DB solo después de confirmar éxito en blockchain

---

## ✅ Ventajas de Esta Solución

1. **Separación completa**: Código de aprobación/rechazo NO afecta la subida
2. **Mantenibilidad**: Cada flujo tiene su propio código
3. **Debugging**: Más fácil identificar problemas en cada flujo
4. **Escalabilidad**: Fácil agregar más funciones de admin sin afectar otros flujos

---

## 🚀 Comenzar Implementación

Voy a crear el archivo `lib/soroban-admin.ts` con las funciones separadas y luego actualizar los endpoints.

