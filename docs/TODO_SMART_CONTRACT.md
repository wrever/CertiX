# 📋 TODO List - Implementación Smart Contract Soroban

## Resumen de Fases

### ✅ Fase 1: Setup Soroban (4 tareas)
- Instalar Soroban CLI
- Verificar instalación
- Crear proyecto contrato
- Verificar estructura

### ✅ Fase 2: Escribir Contrato Rust (8 tareas)
- Crear enum CertificateStatus
- Crear struct Certificate
- Implementar initialize()
- Implementar register_certificate()
- Implementar approve_certificate()
- Implementar reject_certificate()
- Implementar get_certificate()
- Implementar is_approved()

### ✅ Fase 3: Compilar y Desplegar (7 tareas)
- Compilar contrato
- Verificar .wasm generado
- Crear cuenta admin
- Fondear cuenta admin
- Desplegar contrato
- Guardar CONTRACT_ID
- Inicializar contrato

### ✅ Fase 4: Crear Utilidades TypeScript (7 tareas)
- Crear lib/soroban.ts
- Implementar registerCertificateOnContract()
- Implementar approveCertificateOnContract()
- Implementar rejectCertificateOnContract()
- Implementar getCertificateFromContract()
- Implementar isCertificateApproved()
- Agregar manejo de errores

### ✅ Fase 5: Integrar con Backend (6 tareas)
- Agregar ADMIN_SECRET_KEY a .env
- Modificar upload/sign/route.ts
- Actualizar types/certificate.ts
- Modificar [id]/status/route.ts
- Actualizar lib/db.ts
- Crear endpoint contract/route.ts

### ✅ Fase 6: Actualizar Frontend (3 tareas)
- Actualizar CertificateCard.tsx
- Actualizar verify/[id]/page.tsx
- Actualizar validator/dashboard/page.tsx

### ✅ Fase 7: Testing (6 tareas)
- Probar registro
- Probar aprobación
- Probar rechazo
- Probar lectura
- Verificar sincronización
- Probar edge cases

---

## 📊 Estadísticas

- **Total de Fases:** 7
- **Total de Tareas:** 41
- **Tiempo Estimado:** 2-3 días (dependiendo de experiencia con Soroban)

---

## 🎯 Prioridades

### Alta Prioridad (MVP)
1. Fase 1: Setup Soroban
2. Fase 2: Escribir Contrato Rust
3. Fase 3: Compilar y Desplegar
4. Fase 4: Crear Utilidades TypeScript
5. Fase 5: Integrar con Backend (básico)

### Media Prioridad (Funcionalidad Completa)
6. Fase 6: Actualizar Frontend
7. Fase 7: Testing completo

---

## 📝 Notas Importantes

1. **Variables de Entorno Necesarias:**
   ```env
   SOROBAN_CONTRACT_ID=<id_del_contrato>
   ADMIN_SECRET_KEY=<secret_key_del_admin>
   SOROBAN_NETWORK=testnet
   SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
   ```

2. **Dependencias Adicionales:**
   - Soroban CLI instalado
   - Rust toolchain (para compilar contrato)
   - Cuenta Stellar testnet con fondos

3. **Flujo de Trabajo:**
   - Primero: Setup y escribir contrato
   - Segundo: Compilar y desplegar
   - Tercero: Crear utilidades TypeScript
   - Cuarto: Integrar con backend
   - Quinto: Actualizar frontend
   - Sexto: Testing completo

---

## 🔗 Referencias

- Documento principal: `docs/TRANSACCION_ACTUAL.md`
- Contrato Rust: `contract/src/lib.rs` (a crear)
- Utilidades: `lib/soroban.ts` (a crear)

