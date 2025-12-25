'use client'

import { useWallet } from '@/hooks/useWallet'

export default function WalletConnect() {
  const { address, isConnected, loading, error, connectFreighter, disconnectWallet } = useWallet()

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700 font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow"
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
        className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
      >
        {loading ? (
          <span className="flex items-center space-x-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Conectando...</span>
          </span>
        ) : (
          '🔗 Conectar Freighter'
        )}
      </button>
      {error && (
        <p className="text-red-500 text-xs mt-2 px-2 py-1 bg-red-50 rounded">{error}</p>
      )}
    </div>
  )
}
