'use client'

import { useState } from 'react'
import { Certificate } from '@/types/certificate'

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
  const [loading, setLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async () => {
    if (certificate.status !== 'pending') return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/certificate/${certificate.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          validatorWallet,
        }),
      })

      const data = await res.json()

      if (data.success) {
        onStatusChange()
      } else {
        setError(data.error || 'Error al aprobar certificado')
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Debes proporcionar una razón para rechazar')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/certificate/${certificate.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          validatorWallet,
          reason: rejectionReason.trim(),
        }),
      })

      const data = await res.json()

      if (data.success) {
        setShowRejectModal(false)
        setRejectionReason('')
        onStatusChange()
      } else {
        setError(data.error || 'Error al rechazar certificado')
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  if (certificate.status !== 'pending') {
    return null
  }

  return (
    <div className="mt-4 space-y-2">
      {error && (
        <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Procesando...' : '✅ Aprobar'}
        </button>
        <button
          onClick={() => setShowRejectModal(true)}
          disabled={loading}
          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ❌ Rechazar
        </button>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Rechazar Certificado</h3>
            <p className="text-sm text-gray-600 mb-4">
              Por favor, proporciona una razón para rechazar este certificado:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ej: El certificado no cumple con los requisitos..."
              className="w-full px-4 py-2 border rounded-lg mb-4"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                  setError(null)
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim()}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

