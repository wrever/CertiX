# 🔐 Cómo Usar la Wallet Admin para Aprobar/Rechazar Certificados

## 🔑 Wallet Admin

**Public Key (Address):**
```
GALR6D6JTE2C554HD2OOW5CDMUYBYZ43S4VLWPDAMJFLSF2GQW5GLCT3
```

**Secret Key (para importar en Freighter):**
```
SC3FVXSBS5OJCGQNO6FWIMGIILKTV6Q26SYQHN5ZHZRSMIEUSXMJAMNY
```

⚠️ **IMPORTANTE:** Esta es la única wallet que puede aprobar/rechazar certificados en el Smart Contract.

---

## 📋 Paso 1: Importar Wallet en Freighter

### Opción A: Si ya tienes Freighter instalado

1. **Abre Freighter** (extensión del navegador)
2. **Haz clic en "Add Account"** o el botón "+"
3. **Selecciona "Import Secret Key"** o "Importar Clave Secreta"
4. **Pega la Secret Key:**
   ```
   SC3FVXSBS5OJCGQNO6FWIMGIILKTV6Q26SYQHN5ZHZRSMIEUSXMJAMNY
   ```
5. **Confirma** y dale un nombre (ej: "CertiX Admin")
6. **Listo!** Ya tienes la wallet admin en Freighter

### Opción B: Si no tienes Freighter

1. **Instala Freighter:**
   - Chrome: https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkabnjmoohgakhjdn
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/freighter/
2. **Crea cuenta** o importa usando la Secret Key de arriba

---

## 📋 Paso 2: Verificar que Tienes Fondos

La wallet necesita XLM para pagar fees de transacciones:

1. **Abre Freighter**
2. **Selecciona la wallet admin** (`GALR6D6...`)
3. **Verifica el balance** (debe tener al menos 1 XLM)
4. **Si no tiene fondos:**
   - Usa el Stellar Testnet Friendbot: https://www.stellar.org/laboratory/#account-creator
   - O envía XLM desde otra cuenta testnet

---

## 📋 Paso 3: Conectar en CertiX

1. **Abre CertiX** en tu navegador:
   ```
   http://localhost:3000
   ```

2. **Ve al Dashboard de Admin:**
   ```
   http://localhost:3000/validator/dashboard
   ```

3. **Conecta Freighter:**
   - Haz clic en "Connect Wallet" o el botón de conexión
   - Selecciona Freighter
   - **IMPORTANTE:** Asegúrate de seleccionar la wallet admin:
     `GALR6D6JTE2C554HD2OOW5CDMUYBYZ43S4VLWPDAMJFLSF2GQW5GLCT3`
   - Confirma la conexión

4. **Verifica que eres Admin:**
   - Deberías ver un **banner azul** que dice:
     ```
     🔐 Admin del Smart Contract
     Wallet Admin: GALR6D6...GLCT3
     ```

---

## 📋 Paso 4: Aprobar o Rechazar Certificados

Una vez conectado como admin, verás:

### Lista de Certificados Pendientes

- Todos los certificados con estado "pending" aparecerán automáticamente
- Cada certificado muestra:
  - Título
  - Wallet del dueño
  - Fecha de subida
  - Botones de acción

### Para Aprobar un Certificado:

1. **Haz clic en "✅ Aprobar"**
2. **Freighter se abrirá automáticamente** pidiendo confirmación
3. **Revisa la transacción:**
   - Verás que se llama a `approve_certificate` en el Smart Contract
   - El fee será mínimo (~0.00001 XLM)
4. **Confirma en Freighter**
5. **Espera unos segundos** mientras se procesa
6. **¡Listo!** El certificado ahora está "approved"

### Para Rechazar un Certificado:

1. **Haz clic en "❌ Rechazar"**
2. **Aparecerá un modal** pidiendo una razón
3. **Escribe la razón** (ej: "Certificado no válido", "Información incorrecta")
4. **Confirma el rechazo**
5. **Freighter se abrirá** pidiendo confirmación
6. **Confirma en Freighter**
7. **¡Listo!** El certificado ahora está "rejected"

---

## 🔄 Flujo Completo Visual

```
┌─────────────────────────────────────────┐
│  1. Usuario sube certificado           │
│     → Estado: Pending                   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. Admin conecta wallet en dashboard   │
│     → Ve lista de pendientes            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. Admin hace clic en "Aprobar"       │
│     → Freighter pide confirmación       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  4. Admin confirma en Freighter         │
│     → Transacción se envía a Stellar    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  5. Smart Contract actualiza estado    │
│     → Estado: Approved                  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  6. Backend sincroniza Redis            │
│     → Certificado visible como aprobado │
└─────────────────────────────────────────┘
```

---

## ✅ Verificación

### ¿Cómo saber que funciona?

1. **Banner Azul:** Si ves el banner azul en el dashboard, eres admin ✅
2. **Botones Visibles:** Si ves botones "Aprobar/Rechazar", eres admin ✅
3. **Sin Errores:** Si no ves "Acceso Denegado", eres admin ✅

### Si NO eres admin verás:

```
⛔ Acceso Denegado
Tu wallet (...) no es el admin del Smart Contract.
Solo el admin configurado en el contrato puede aprobar/rechazar certificados.
```

---

## 🆘 Troubleshooting

### Problema: "No puedo conectar Freighter"
- **Solución:** Asegúrate de que Freighter esté instalado y activo
- Verifica que el sitio tenga permisos para conectar

### Problema: "Acceso Denegado"
- **Solución:** Verifica que estés conectado con la wallet correcta:
  `GALR6D6JTE2C554HD2OOW5CDMUYBYZ43S4VLWPDAMJFLSF2GQW5GLCT3`

### Problema: "Error al aprobar - Insufficient balance"
- **Solución:** La wallet necesita XLM para fees
- Obtén XLM desde Friendbot: https://www.stellar.org/laboratory/#account-creator

### Problema: "No aparecen certificados pendientes"
- **Solución:** Verifica que haya certificados con estado "pending"
- Puedes subir uno de prueba desde `/upload`

---

## 📍 URLs Importantes

- **Dashboard Admin:** http://localhost:3000/validator/dashboard
- **Subir Certificado:** http://localhost:3000/upload
- **Ver Certificados:** http://localhost:3000/my-certificates
- **Stellar Explorer (Contrato):** https://stellar.expert/explorer/testnet/contract/CAK5PGHHLVOR5EAMNHQMX3HA3MXZDYYI7WHGJCHHB6CWJFBTDOHDLCFG

---

## 🔒 Seguridad

⚠️ **IMPORTANTE:**
- La Secret Key es **MUY SENSIBLE** - no la compartas
- Solo úsala en Freighter (nunca la pegues en sitios web)
- Considera usar un gestor de contraseñas para guardarla
- En producción, usa variables de entorno del servidor

---

## 🎯 Resumen Rápido

1. ✅ Importa `SC3FVXSBS5OJCGQNO6FWIMGIILKTV6Q26SYQHN5ZHZRSMIEUSXMJAMNY` en Freighter
2. ✅ Conecta esa wallet en `/validator/dashboard`
3. ✅ Verás el banner azul de admin
4. ✅ Haz clic en "Aprobar" o "Rechazar" en los certificados pendientes
5. ✅ Confirma en Freighter
6. ✅ ¡Listo!

