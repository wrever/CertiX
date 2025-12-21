'use client'

import { useWallet } from '@/hooks/useWallet'
import WalletConnect from '@/components/WalletConnect'
import UploadForm from '@/components/UploadForm'

export default function UploadPage() {
  const { address, isConnected } = useWallet()

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Subir Certificación</h1>
        <div className="bg-yellow-100 border border-yellow-400 p-4 rounded mb-4">
          <p className="text-yellow-800">
            Debes conectar tu wallet Freighter para subir certificados
          </p>
        </div>
        <WalletConnect />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Subir Certificación</h1>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Wallet conectada: <span className="font-mono">{address?.slice(0, 8)}...{address?.slice(-8)}</span>
        </p>
      </div>
      <UploadForm walletAddress={address!} />
    </div>
  )
}

