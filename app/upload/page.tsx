'use client'

import { useWallet } from '@/hooks/useWallet'
import WalletConnect from '@/components/WalletConnect'
import UploadForm from '@/components/UploadForm'
import ScrollReveal from '@/components/ScrollReveal'

export default function UploadPage() {
  const { address, isConnected } = useWallet()

  if (!isConnected) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <ScrollReveal direction="up" delay={0}>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black mb-4 gradient-text-animated text-glow">
                Subir Certificación
              </h1>
              <p className="text-lg text-cyan-200/70 max-w-2xl mx-auto">
                Conecta tu wallet Freighter para comenzar a subir tus certificados
              </p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={100}>
            <div className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                  <span className="text-4xl">🔗</span>
                </div>
                <h2 className="text-2xl font-bold mb-3 text-white">Wallet Requerida</h2>
                <p className="text-cyan-200/70 mb-8">
                  Para subir certificados necesitas conectar tu wallet Freighter.
                  Tu wallet será tu identificador único en el sistema.
                </p>
              </div>
              <div className="flex justify-center">
                <WalletConnect />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 gradient-text-animated text-glow">
              Subir Certificación
            </h1>
            <p className="text-lg text-cyan-200/70 max-w-2xl mx-auto">
              Registra tu certificado en la blockchain de Stellar de forma permanente e inmutable
            </p>
          </div>
        </ScrollReveal>
        
        <ScrollReveal direction="up" delay={100}>
          <div className="mb-6 flex items-center justify-center">
            <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-lg glass-card border border-cyan-500/30">
              <div className="w-2 h-2 rounded-full bg-[#28c0f0] animate-pulse shadow-glow-arcusx"></div>
              <span className="text-sm font-medium text-cyan-200">
                Wallet conectada: <span className="font-mono text-[#28c0f0]">{address?.slice(0, 8)}...{address?.slice(-8)}</span>
              </span>
            </div>
          </div>
        </ScrollReveal>
        
        <ScrollReveal direction="up" delay={200}>
          <UploadForm walletAddress={address!} />
        </ScrollReveal>
      </div>
    </div>
  )
}
