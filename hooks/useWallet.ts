'use client'

import { useState, useEffect } from 'react'
import {
  StellarWalletsKit,
  WalletNetwork,
  FreighterModule
} from '@creit.tech/stellar-wallets-kit'

interface WalletState {
  isConnected: boolean
  address: string | null
  walletId: string | null
  loading: boolean
  error: string | null
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    walletId: null,
    loading: false,
    error: null
  })

  const [kit, setKit] = useState<StellarWalletsKit | null>(null)

  // Inicializar kit
  useEffect(() => {
    const initializeKit = async () => {
      try {
        const stellarKit = new StellarWalletsKit({
          network: WalletNetwork.TESTNET,
          selectedWalletId: 'freighter',
          modules: [new FreighterModule()],
        })
        setKit(stellarKit)
      } catch (error) {
        setWalletState(prev => ({
          ...prev,
          error: 'Error al inicializar el kit de wallets'
        }))
      }
    }

    initializeKit()
  }, [])

  // Verificar wallet guardada
  useEffect(() => {
    const savedWallet = localStorage.getItem('certix_wallet')
    if (savedWallet) {
      try {
        const walletData = JSON.parse(savedWallet)
        if (walletData.connected && walletData.address) {
          setWalletState(prev => ({
            ...prev,
            isConnected: true,
            address: walletData.address,
            walletId: walletData.walletId
          }))
        }
      } catch (error) {
        localStorage.removeItem('certix_wallet')
      }
    }
  }, [])

  const connectFreighter = async () => {
    if (!kit) {
      setWalletState(prev => ({
        ...prev,
        error: 'Kit de wallets no inicializado'
      }))
      return
    }

    setWalletState(prev => ({ ...prev, loading: true, error: null }))

    try {
      kit.setWallet('freighter')
      const { address } = await kit.getAddress()
      
      setWalletState(prev => ({
        ...prev,
        isConnected: true,
        address,
        walletId: 'freighter',
        loading: false,
        error: null
      }))

      // Guardar en localStorage
      localStorage.setItem('certix_wallet', JSON.stringify({
        address,
        walletId: 'freighter',
        connected: true
      }))

      // Recargar la página para actualizar los datos
      window.location.reload()
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al conectar Freighter'
      }))
    }
  }

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      walletId: null,
      loading: false,
      error: null
    })
    localStorage.removeItem('certix_wallet')
  }

  return {
    ...walletState,
    connectFreighter,
    disconnectWallet,
    kit
  }
}

