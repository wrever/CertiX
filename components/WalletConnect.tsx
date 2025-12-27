'use client'

import { useWallet } from '@/hooks/useWallet'

export default function WalletConnect() {
  const { address, isConnected, loading, error, connectFreighter, disconnectWallet } = useWallet()

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg glass-card border border-cyan-500/30">
          <div className="w-2 h-2 rounded-full bg-[#28c0f0] animate-pulse shadow-glow-arcusx"></div>
          <span className="text-sm font-medium text-cyan-200 font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 rounded-lg text-sm font-medium glass-card text-cyan-200 hover:text-white hover:bg-cyan-500/20 transition-all duration-200 shadow-sm hover:shadow border border-cyan-500/30"
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
        className="px-6 py-2.5 rounded-lg text-sm font-semibold gradient-button text-white transition-all duration-200 shadow-glow-arcusx hover:shadow-glow-strong disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
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
        <p className="text-red-400 text-xs mt-2 px-2 py-1 glass-card border border-red-500/30 rounded">{error}</p>
      )}
    </div>
  )
}
