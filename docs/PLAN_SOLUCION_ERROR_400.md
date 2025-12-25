# 🔧 Plan de Solución: Error 400 al Registrar Certificado en Smart Contract

## 📋 Análisis del Problema

**Error actual:** `Request failed with status code 400` al intentar registrar certificado en Soroban Contract

**Causas posibles:**
1. ❌ Transacciones Soroban requieren preparación especial (no se pueden enviar directamente con Horizon)
2. ❌ Formato incorrecto de parámetros (BytesN<32> vs Buffer)
3. ❌ El contrato necesita ser invocado a través del RPC de Soroban, no Horizon
4. ❌ La transacción no está siendo construida correctamente para Soroban

---

## 🎯 Plan de Acción - TODO List

### **FASE 1: Investigación y Diagnóstico** ⏱️ 15 min

#### 1.1 Verificar configuración del contrato
- [ ] Verificar que el contrato esté inicializado correctamente
- [ ] Verificar que el CONTRACT_ID sea correcto
- [ ] Probar invocación manual del contrato con Soroban CLI

#### 1.2 Revisar documentación de Soroban SDK
- [ ] Buscar documentación oficial de cómo invocar contratos Soroban desde TypeScript
- [ ] Verificar si necesitamos usar Soroban RPC en lugar de Horizon
- [ ] Revisar ejemplos de código de Stellar SDK para Soroban

#### 1.3 Agregar logging detallado
- [ ] Agregar logs antes de crear la transacción
- [ ] Loggear los parámetros que se envían al contrato
- [ ] Loggear el error completo de Stellar (response.data)

---

### **FASE 2: Corrección del Código** ⏱️ 30 min

#### 2.1 Revisar formato de parámetros
- [ ] Verificar que `BytesN<32>` se esté creando correctamente
- [ ] Verificar que `Address` se esté convirtiendo correctamente a ScVal
- [ ] Comparar con ejemplos oficiales de Stellar SDK

#### 2.2 Corregir invocación del contrato
- [ ] Usar `server.prepareTransaction()` para transacciones Soroban (si está disponible)
- [ ] O usar Soroban RPC directamente en lugar de Horizon
- [ ] Verificar que la transacción se construya correctamente

#### 2.3 Manejo de errores mejorado
- [ ] Capturar y mostrar el error completo de Stellar
- [ ] Mostrar los `result_codes` de la transacción
- [ ] Mostrar los `extras` del error para debugging

---

### **FASE 3: Testing y Validación** ⏱️ 15 min

#### 3.1 Probar registro manual
- [ ] Probar invocar el contrato manualmente con Soroban CLI
- [ ] Verificar que los parámetros sean correctos
- [ ] Confirmar que el contrato funciona correctamente

#### 3.2 Probar desde el código
- [ ] Probar registro de certificado desde el frontend
- [ ] Verificar logs detallados
- [ ] Confirmar que el certificado se registra correctamente

#### 3.3 Validar flujo completo
- [ ] Subir certificado → Registrar en contrato → Aprobar
- [ ] Verificar que todo el flujo funcione sin errores

---

## 🔍 Tareas Subdivididas Detalladas

### **Tarea 1.1: Verificar inicialización del contrato**
```bash
# Verificar que el contrato esté inicializado
soroban contract invoke --id CBAEDSXVAUIT3M7JOW3ASF6POMVNMYXDWBJ45JUWXN6GGNHVLLM52VJP \
  --network testnet \
  -- get_admin
```

### **Tarea 1.2: Probar invocación manual**
```bash
# Probar registrar un certificado manualmente
soroban contract invoke --id CBAEDSXVAUIT3M7JOW3ASF6POMVNMYXDWBJ45JUWXN6GGNHVLLM52VJP \
  --source-account SC3FVXSBS5OJCGQNO6FWIMGIILKTV6Q26SYQHN5ZHZRSMIEUSXMJAMNY \
  --network testnet \
  -- register_certificate \
  --owner GALR6D6JTE2C554HD2OOW5CDMUYBYZ43S4VLWPDAMJFLSF2GQW5GLCT3 \
  --file_hash [hash_64_chars] \
  --tx_hash [tx_hash_64_chars]
```

### **Tarea 2.1: Revisar formato BytesN<32>**
- Verificar que `xdr.ScVal.scvBytes()` crea el formato correcto
- Comparar con documentación de Stellar SDK
- Verificar que el Buffer de 32 bytes se convierta correctamente

### **Tarea 2.2: Usar Soroban RPC si es necesario**
- Investigar si necesitamos `@stellar/soroban-rpc` package
- O si podemos usar `server.prepareTransaction()` antes de enviar
- Verificar si hay métodos especiales para contratos Soroban

---

## 🚀 Comenzar Implementación

Voy a empezar con la Fase 1: Investigación y Diagnóstico, agregando logging detallado y luego corrigiendo el código basado en los errores específicos que encontremos.

