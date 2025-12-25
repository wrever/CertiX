# 🔐 Cómo Aprobar Certificados como Admin

## 📋 Sistema de Admin

CertiX usa un **Smart Contract en Stellar** para gestionar la aprobación de certificados. Solo **UNA wallet específica** puede aprobar o rechazar certificados.

## 🔑 Wallet Admin Actual

**Public Key (Address):**
```
GALR6D6JTE2C554HD2OOW5CDMUYBYZ43S4VLWPDAMJFLSF2GQW5GLCT3
```

**Secret Key (para importar en Freighter):**
```
SC3FVXSBS5OJCGQNO6FWIMGIILKTV6Q26SYQHN5ZHZRSMIEUSXMJAMNY
```

⚠️ **IMPORTANTE:** Importa esta Secret Key en Freighter para poder aprobar/rechazar certificados.

⚠️ **IMPORTANTE:** Guarda esta secret key de forma segura. Es la única que puede aprobar/rechazar certificados.

## 🚀 Cómo Aprobar Certificados

### Paso 1: Conectar Wallet Admin

1. Abre CertiX en tu navegador
2. Ve a `/validator/dashboard`
3. Conecta tu wallet Freighter con la **wallet admin**:
   - Abre Freighter
   - **Importa la cuenta** usando la Secret Key: `SC3FVXSBS5OJCGQNO6FWIMGIILKTV6Q26SYQHN5ZHZRSMIEUSXMJAMNY`
   - O si ya la tienes, selecciona la cuenta con public key: `GALR6D6JTE2C554HD2OOW5CDMUYBYZ43S4VLWPDAMJFLSF2GQW5GLCT3`

### Paso 2: Ver Certificados Pendientes

Una vez conectado con la wallet admin, verás:
- ✅ Un banner azul confirmando que eres admin
- 📋 Lista de todos los certificados pendientes
- 🔘 Botones para aprobar o rechazar cada certificado

### Paso 3: Aprobar o Rechazar

**Para Aprobar:**
1. Haz clic en el botón **"✅ Aprobar"** en el certificado
2. Confirma la transacción en Freighter
3. El certificado se actualizará en:
   - ✅ Redis (base de datos)
   - ✅ Smart Contract de Stellar (blockchain)

**Para Rechazar:**
1. Haz clic en el botón **"❌ Rechazar"**
2. Escribe una razón para el rechazo
3. Confirma la transacción en Freighter
4. El certificado se actualizará en ambos lugares

## 🔄 Flujo Completo

```
1. Usuario sube certificado
   ↓
2. Usuario firma transacción Stellar (prueba de autenticidad)
   ↓
3. Certificado se registra en Smart Contract (estado: Pending)
   ↓
4. Admin ve certificado en /validator/dashboard
   ↓
5. Admin aprueba/rechaza → Firma transacción
   ↓
6. Smart Contract actualiza estado (Approved/Rejected)
   ↓
7. Backend sincroniza Redis con el contrato
```

## 🎯 Características del Sistema

### ✅ Ventajas

- **Inmutable**: Una vez aprobado en el contrato, no se puede cambiar
- **Transparente**: Todos pueden ver el estado en blockchain
- **Descentralizado**: No depende de un servidor central
- **Auditable**: Historial completo en Stellar

### 🔒 Seguridad

- Solo la wallet admin puede aprobar/rechazar
- Cada acción requiere firma con Freighter
- El estado se guarda en blockchain (inmutable)
- Redis se sincroniza con el contrato

## 📍 URLs Importantes

- **Dashboard Admin**: `/validator/dashboard`
- **Ver Certificado**: `/verify/[id]`
- **Stellar Explorer (Contrato)**: `https://stellar.expert/explorer/testnet/contract/CAK5PGHHLVOR5EAMNHQMX3HA3MXZDYYI7WHGJCHHB6CWJFBTDOHDLCFG`

## 📖 Guía Detallada

Para una guía paso a paso completa, ve a: `docs/COMO_USAR_WALLET_ADMIN.md`

## ⚙️ Configuración

Las variables de entorno están en `.env.local`:

```env
ADMIN_PUBLIC_KEY=GALR6D6JTE2C554HD2OOW5CDMUYBYZ43S4VLWPDAMJFLSF2GQW5GLCT3
ADMIN_SECRET_KEY=SC3FVXSBS5OJCGQNO6FWIMGIILKTV6Q26SYQHN5ZHZRSMIEUSXMJAMNY
SOROBAN_CONTRACT_ID=CAK5PGHHLVOR5EAMNHQMX3HA3MXZDYYI7WHGJCHHB6CWJFBTDOHDLCFG
```

## 🆘 Troubleshooting

**Problema:** No puedo acceder al dashboard
- **Solución:** Verifica que estés conectado con la wallet admin correcta

**Problema:** Los botones no aparecen
- **Solución:** Asegúrate de que el certificado esté en estado "pending"

**Problema:** Error al aprobar
- **Solución:** Verifica que la wallet tenga fondos (XLM) para pagar fees

## 📝 Notas

- El admin se configuró al inicializar el contrato
- Para cambiar el admin, necesitarías desplegar un nuevo contrato
- Cada aprobación/rechazo crea una transacción en Stellar
- Las fees son mínimas (~0.00001 XLM por transacción)

