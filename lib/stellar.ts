import { 
  Horizon, 
  TransactionBuilder, 
  Networks, 
  Keypair, 
  Operation, 
  Asset, 
  Memo 
} from '@stellar/stellar-sdk'

const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'
const NETWORK_PASSPHRASE = Networks.TESTNET

// Validar wallet address
export function validateStellarAddress(address: string): boolean {
  return address.startsWith('G') && address.length === 56 && /^G[A-Z0-9]{55}$/.test(address)
}

// Crear transacción con hash en memo
export async function createCertificateTransaction(
  hash: string,
  destinationWallet: string
): Promise<{ txXdr: string; txHash: string }> {
  if (!validateStellarAddress(destinationWallet)) {
    throw new Error('Invalid Stellar wallet address')
  }

  const server = new Horizon.Server(HORIZON_URL)
  
  const sourceKeypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY!)
  const sourceAccount = await server.loadAccount(sourceKeypair.publicKey())
  
  // Memo limitado a 28 bytes, usar primeros 28 caracteres del hash
  const memoText = hash.length > 28 ? hash.substring(0, 28) : hash
  
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE
  })
    .addMemo(Memo.text(memoText))
    .addOperation(
      Operation.payment({
        destination: destinationWallet,
        asset: Asset.native(),
        amount: '0.00001'
      })
    )
    .setTimeout(30)
    .build()
  
  transaction.sign(sourceKeypair)
  
  const txXdr = transaction.toXDR()
  const txHash = transaction.hash().toString('hex')
  
  return { txXdr, txHash }
}

// Enviar transacción
export async function sendTransaction(txXdr: string): Promise<string> {
  const server = new Horizon.Server(HORIZON_URL)
  const transaction = TransactionBuilder.fromXDR(txXdr, NETWORK_PASSPHRASE)
  
  const response = await server.submitTransaction(transaction)
  return response.hash
}

// Obtener transacción
export async function getTransaction(txHash: string) {
  const server = new Horizon.Server(HORIZON_URL)
  return await server.transactions().transaction(txHash).call()
}

// Generar URL de Stellar Explorer
export function getStellarExplorerUrl(txHash: string): string {
  const network = process.env.STELLAR_NETWORK === 'MAINNET' ? '' : 'testnet/'
  return `https://stellar.expert/explorer/${network}tx/${txHash}`
}

