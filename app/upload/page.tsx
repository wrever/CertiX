'use client'

import { useWallet } from '@/hooks/useWallet'
import WalletConnect from '@/components/WalletConnect'
import UploadForm from '@/components/UploadForm'

export default function UploadPage() {
  const { address, isConnected } = useWallet()

  if (!isConnected) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Subir Certificación
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Conecta tu wallet Freighter para comenzar a subir tus certificados
            </p>
          </div>
          
          <div className="glass rounded-3xl p-8 md:p-12 shadow-2xl animate-slide-up">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center">
                <span className="text-4xl">🔗</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Wallet Requerida</h2>
              <p className="text-gray-600 mb-8">
                Para subir certificados necesitas conectar tu wallet Freighter.
                Tu wallet será tu identificador único en el sistema.
              </p>
            </div>
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Subir Certificación
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Registra tu certificado en la blockchain de Stellar de forma permanente e inmutable
          </p>
        </div>
        
        <div className="mb-6 flex items-center justify-center">
          <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Wallet conectada: <span className="font-mono text-blue-600">{address?.slice(0, 8)}...{address?.slice(-8)}</span>
            </span>
          </div>
        </div>
        
        <UploadForm walletAddress={address!} />
      </div>
    </div>
  )
}
