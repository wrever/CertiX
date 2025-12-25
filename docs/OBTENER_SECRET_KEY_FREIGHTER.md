# 🔑 Cómo Obtener Secret Key desde Freighter

## 📋 Método 1: Exportar desde Freighter (Recomendado)

### Pasos:

1. **Abre Freighter en tu navegador**
   - Haz clic en el ícono de Freighter en la barra de extensiones

2. **Selecciona la cuenta que quieres exportar**
   - Asegúrate de que sea la cuenta: `GDIN7HCR4PKKWS6MO57N7NF7VLGPO27GUQDR64TIK3CYRMPBCKUQDCT5`

3. **Ve a Configuración de la Cuenta**
   - Haz clic en el menú (tres puntos) junto al nombre de la cuenta
   - O busca "Account Settings" / "Configuración de Cuenta"

4. **Exportar Secret Key**
   - Busca la opción "Export Secret Key" o "Exportar Clave Secreta"
   - Puede estar en "Advanced" o "Avanzado"
   - Freighter te pedirá tu contraseña para confirmar

5. **Copia la Secret Key**
   - Se mostrará como: `S...` (empieza con S y tiene 56 caracteres)
   - **⚠️ NUNCA compartas esta clave con nadie**
   - Guárdala en un lugar seguro

## 📋 Método 2: Usar Stellar Laboratory (Si tienes acceso)

Si Freighter no te permite exportar directamente:

1. Ve a: https://www.stellar.org/laboratory/#account-creator
2. Si tienes la cuenta ya creada, puedes usar herramientas de desarrollo
3. **Nota:** Esto solo funciona si tienes acceso a la cuenta original

## 📋 Método 3: Verificar en Freighter

Si la cuenta fue importada con Secret Key:

1. Abre Freighter
2. Ve a la cuenta: `GDIN7HCR4PKKWS6MO57N7NF7VLGPO27GUQDR64TIK3CYRMPBCKUQDCT5`
3. Busca en "Account Details" o "Detalles de Cuenta"
4. Algunas versiones de Freighter muestran opción de "View Secret Key" (requiere contraseña)

## 🔒 Seguridad

⚠️ **IMPORTANTE:**
- La Secret Key es como la contraseña de tu wallet
- Quien tenga la Secret Key puede controlar completamente la cuenta
- **NUNCA** la compartas públicamente
- Guárdala en un gestor de contraseñas seguro
- Considera usar un password manager como 1Password, LastPass, etc.

## 📝 Para CertiX

Una vez que tengas la Secret Key:

1. **NO la pongas en `.env.local`** si vas a hacer commit a Git
2. En producción, úsala solo en variables de entorno del servidor
3. Para desarrollo local, puedes usarla en `.env.local` (que está en `.gitignore`)

## 🆘 Si no puedes exportarla

Si Freighter no te permite exportar la Secret Key:

1. **Opción A:** Crea una nueva wallet y actualiza el contrato
2. **Opción B:** Usa la wallet actual si tienes acceso desde otro lugar
3. **Opción C:** Contacta con el soporte de Freighter

## ✅ Verificación

Una vez que tengas la Secret Key, puedes verificar que es correcta:

```bash
# En terminal (si tienes Node.js)
node -e "const { Keypair } = require('@stellar/stellar-sdk'); const kp = Keypair.fromSecret('TU_SECRET_KEY_AQUI'); console.log('Public Key:', kp.publicKey());"
```

Debería mostrar: `GDIN7HCR4PKKWS6MO57N7NF7VLGPO27GUQDR64TIK3CYRMPBCKUQDCT5`

