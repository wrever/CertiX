'use client'

import { useWallet } from '@/hooks/useWallet'

export default function WalletConnect() {
  const { address, isConnected, loading, error, connectFreighter, disconnectWallet } = useWallet()

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          <span className="font-mono">
            {address.slice(0, 8)}...{address.slice(-8)}
          </span>
        </div>
        <button
          onClick={disconnectWallet}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition"
        >
          Desconectar
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={connectFreighter}
        disabled={loading}
        className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition disabled:opacity-50"
      >
        {loading ? 'Conectando...' : 'Conectar Freighter'}
      </button>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}

