'use client'

import { useState } from 'react'
import { Certificate } from '@/types/certificate'
import { useWallet } from '@/hooks/useWallet'

interface ValidatorActionsProps {
  certificate: Certificate
  validatorWallet: string
  onStatusChange: () => void
}

export default function ValidatorActions({ 
  certificate, 
  validatorWallet,
  onStatusChange 
}: ValidatorActionsProps) {
  const { kit } = useWallet()
  const [loading, setLoading] = useState(false)
  const [signing, setSigning] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingTxXdr, setPendingTxXdr] = useState<string | null>(null)
  const [pendingStatus, setPendingStatus] = useState<'approved' | 'rejected' | null>(null)

  const handleApprove = async () => {
    if (certificate.status !== 'pending') return

    // Si ya hay una transacción pendiente, firmar y enviar
    if (pendingTxXdr && pendingStatus === 'approved') {
      await handleSignAndSubmit()
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Paso 1: Preparar transacción (sin firmar)
      const res = await fetch(`/api/certificate/${certificate.id}/status/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          adminWallet: validatorWallet,
        }),
      })

      const data = await res.json()

      if (data.success && data.needsSignature && data.txXdr) {
        // Guardar datos pendientes
        setPendingTxXdr(data.txXdr)
        setPendingStatus('approved')
        setLoading(false)
        // Firmar automáticamente pasando los valores directamente
        await handleSignAndSubmit(data.txXdr, 'approved')
      } else {
        setError(data.error || 'Error al preparar transacción')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
      setLoading(false)
    }
  }

  const handleSignAndSubmit = async (txXdr?: string, status?: 'approved' | 'rejected') => {
    // Usar parámetros si están disponibles, sino usar estado
    const txXdrToSign = txXdr || pendingTxXdr
    const statusToUse = status || pendingStatus

    if (!txXdrToSign || !statusToUse || !kit) {
      setError('No hay transacción pendiente o wallet no conectada')
      return
    }

    setSigning(true)
    setError(null)

    try {
      // Paso 2: Firmar transacción con Freighter
      kit.setWallet('freighter')
      
      const result = await kit.signTransaction(txXdrToSign, {
        address: validatorWallet,
        networkPassphrase: 'Test SDF Network ; September 2015'
      })
      
      // Freighter puede devolver el XDR de diferentes formas
      let signedTxXdr: string
      if (typeof result === 'string') {
        signedTxXdr = result
      } else if (result && typeof result === 'object') {
        const resultObj = result as any
        if ('signedTxXdr' in resultObj && typeof resultObj.signedTxXdr === 'string') {
          signedTxXdr = resultObj.signedTxXdr
        } else if ('xdr' in resultObj && typeof resultObj.xdr === 'string') {
          signedTxXdr = resultObj.xdr
        } else {
          console.error('❌ Unexpected result format:', result)
          setError('Error: Formato de transacción firmada no reconocido')
          setSigning(false)
          return
        }
      } else {
        console.error('❌ Unexpected result format:', result)
        setError('Error: Formato de transacción firmada no reconocido')
        setSigning(false)
        return
      }

      if (!signedTxXdr || typeof signedTxXdr !== 'string' || signedTxXdr.length < 100) {
        console.error('❌ Invalid signed XDR:', { length: signedTxXdr?.length, type: typeof signedTxXdr })
        setError('Error: La transacción firmada no es válida')
        setSigning(false)
        return
      }

      // Enviar transacción firmada al backend
      const res = await fetch(`/api/certificate/${certificate.id}/status/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signedTxXdr: signedTxXdr,
          adminWallet: validatorWallet,
          status: statusToUse,
          reason: statusToUse === 'rejected' ? rejectionReason : undefined
        })
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('❌ Backend error:', data)
        setError(data.error || `Error del servidor: ${res.status}`)
        setSigning(false)
        return
      }

      if (data.success) {
        setPendingTxXdr(null)
        setPendingStatus(null)
        if (statusToUse === 'rejected') {
          setShowRejectModal(false)
          setRejectionReason('')
        }
        onStatusChange()
      } else {
        console.error('❌ Backend returned error:', data)
        setError(data.error || 'Error al enviar transacción')
      }
    } catch (err: any) {
      console.error('❌ Error in handleSignAndSubmit:', err)
      setError(err.message || 'Error al firmar con Freighter')
    } finally {
      setSigning(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Debes proporcionar una razón para rechazar')
      return
    }

    // Si ya hay una transacción pendiente, firmar y enviar
    if (pendingTxXdr && pendingStatus === 'rejected') {
      await handleSignAndSubmit()
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Paso 1: Preparar transacción (sin firmar)
      const res = await fetch(`/api/certificate/${certificate.id}/status/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          adminWallet: validatorWallet,
          reason: rejectionReason.trim(),
        }),
      })

      const data = await res.json()

      if (data.success && data.needsSignature && data.txXdr) {
        // Guardar datos pendientes
        setPendingTxXdr(data.txXdr)
        setPendingStatus('rejected')
        setLoading(false)
        // Firmar automáticamente pasando los valores directamente
        await handleSignAndSubmit(data.txXdr, 'rejected')
      } else {
        setError(data.error || 'Error al preparar transacción')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
      setLoading(false)
    }
  }

  if (certificate.status !== 'pending') {
    return null
  }

  return (
    <>
      {error && (
        <div className="mb-3 p-3 glass-card border-2 border-red-500/50 rounded-xl animate-scale-in bg-red-500/10">
          <div className="flex items-start space-x-2">
            <span className="text-lg">❌</span>
            <p className="text-xs text-red-300 font-medium">{error}</p>
          </div>
        </div>
      )}
      
      {/* Botones de acción integrados directamente en el card */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleApprove}
          disabled={loading || signing}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Preparando...</span>
            </span>
          ) : signing ? (
            <span className="flex items-center justify-center space-x-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Firmando...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <span>✅</span>
              <span>Aprobar</span>
            </span>
          )}
        </button>
        <button
          onClick={() => setShowRejectModal(true)}
          disabled={loading || signing}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="flex items-center justify-center space-x-2">
            <span>❌</span>
            <span>Rechazar</span>
          </span>
        </button>
      </div>

      {/* Modal fullscreen para rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in">
          <div className="glass-card rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in border border-cyan-500/30">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg">
                <span className="text-2xl">❌</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Rechazar Certificado</h3>
                <p className="text-sm text-cyan-200/70">Proporciona una razón para el rechazo</p>
              </div>
            </div>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ej: El certificado no cumple con los requisitos establecidos, información incompleta, etc."
              className="w-full px-4 py-3 glass-card border-2 border-cyan-500/30 rounded-xl mb-6 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-all duration-200 resize-none text-white placeholder:text-cyan-200/40 bg-[#0a2d4a]/50"
              rows={4}
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                  setError(null)
                }}
                className="flex-1 px-6 py-3 glass-card border border-cyan-500/30 text-cyan-200 rounded-xl font-semibold hover:bg-cyan-500/20 transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={loading || signing || !rejectionReason.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Preparando...</span>
                  </span>
                ) : signing ? (
                  <span className="flex items-center justify-center space-x-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Firmando...</span>
                  </span>
                ) : (
                  'Confirmar Rechazo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
