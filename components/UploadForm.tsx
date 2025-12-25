'use client'

import { useState } from 'react'
import { CertificateUploadResponse } from '@/types/certificate'
import { useWallet } from '@/hooks/useWallet'

interface UploadFormProps {
  walletAddress: string
}

export default function UploadForm({ walletAddress }: UploadFormProps) {
  const { kit } = useWallet()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [issuer, setIssuer] = useState('')
  const [loading, setLoading] = useState(false)
  const [signing, setSigning] = useState(false)
  const [result, setResult] = useState<CertificateUploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingTxXdr, setPendingTxXdr] = useState<string | null>(null)
  const [pendingCertificateId, setPendingCertificateId] = useState<string | null>(null)
  const [pendingCertificateData, setPendingCertificateData] = useState<{ hash: string; fileUrl: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) return

    // Si ya hay una transacción pendiente, firmar y enviar
    if (pendingTxXdr && pendingCertificateId && pendingCertificateData) {
      await handleSignTransaction(pendingTxXdr, pendingCertificateId, pendingCertificateData)
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('walletAddress', walletAddress)
    formData.append('title', title)
    if (issuer) formData.append('issuer', issuer)

    try {
      const res = await fetch('/api/certificate/upload', {
        method: 'POST',
        body: formData,
      })
      const data: CertificateUploadResponse = await res.json()
      
      if (data.success && data.needsSignature && data.txXdr) {
        // Guardar datos pendientes
        setPendingTxXdr(data.txXdr)
        setPendingCertificateId(data.certificateId)
        const certData = {
          hash: data.hash,
          fileUrl: data.fileUrl || ''
        }
        setPendingCertificateData(certData)
        setLoading(false)
        // Firmar automáticamente pasando los valores directamente (incluyendo certData)
        await handleSignTransaction(data.txXdr, data.certificateId, certData)
      } else if (data.success) {
        setResult(data)
        // Reset form
        setFile(null)
        setTitle('')
        setIssuer('')
        setLoading(false)
      } else {
        setError(data.error || 'Error al subir certificado')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
      setLoading(false)
    }
  }

  const handleSignTransaction = async (
    txXdr?: string, 
    certId?: string, 
    certData?: { hash: string; fileUrl: string }
  ) => {
    // Usar parámetros si están disponibles, sino usar estado
    const txXdrToSign = txXdr || pendingTxXdr
    const certIdToUse = certId || pendingCertificateId
    const certDataToUse = certData || pendingCertificateData

    if (!txXdrToSign || !certIdToUse || !kit) {
      setError('No hay transacción pendiente o wallet no conectada')
      return
    }

    // Verificar que tenemos los datos del certificado
    if (!certDataToUse) {
      setError('Datos del certificado no disponibles')
      return
    }

    // Verificar que tenemos todos los datos necesarios
    if (!certDataToUse.hash || !certDataToUse.fileUrl || !title) {
      setError('Faltan datos del certificado. Por favor, intenta subir el certificado nuevamente.')
      return
    }

    setSigning(true)
    setError(null)

    try {
      // Firmar transacción con Freighter
      kit.setWallet('freighter')
      const result = await kit.signTransaction(txXdrToSign, {
        address: walletAddress,
        networkPassphrase: 'Test SDF Network ; September 2015'
      })
      
      const signedTxXdr = result.signedTxXdr || result

      const requestBody = {
        certificateId: certIdToUse,
        signedTxXdr: typeof signedTxXdr === 'string' ? signedTxXdr : String(signedTxXdr),
        walletAddress: walletAddress,
        hash: certDataToUse.hash,
        fileUrl: certDataToUse.fileUrl,
        title: title,
        issuer: issuer || undefined
      }

      console.log('📤 Sending sign request with:', {
        certificateId: !!requestBody.certificateId,
        signedTxXdr: !!requestBody.signedTxXdr,
        walletAddress: !!requestBody.walletAddress,
        hash: !!requestBody.hash,
        fileUrl: !!requestBody.fileUrl,
        title: !!requestBody.title
      })

      const res = await fetch('/api/certificate/upload/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await res.json()

      if (data.success) {
        setResult({
          success: true,
          certificateId: certIdToUse,
          txHash: data.txHash,
          hash: '',
          stellarExplorerUrl: data.stellarExplorerUrl,
          status: 'pending'
        })
        // Reset form y datos pendientes
        setFile(null)
        setTitle('')
        setIssuer('')
        setPendingTxXdr(null)
        setPendingCertificateId(null)
        setPendingCertificateData(null)
      } else {
        setError(data.error || 'Error al firmar transacción')
      }
    } catch (err: any) {
      setError(err.message || 'Error al firmar con Freighter')
    } finally {
      setSigning(false)
    }
  }

  return (
    <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">Subir Nueva Certificación</h2>
        <p className="text-gray-600">Completa el formulario para registrar tu certificado en la blockchain</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block mb-3 font-semibold text-gray-900">
            Archivo del Certificado *
          </label>
          <div className="relative">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              disabled={!!pendingTxXdr}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">Formatos: PDF, PNG, JPG (Máx. 10MB)</p>
        </div>
        
        {/* Title */}
        <div>
          <label className="block mb-3 font-semibold text-gray-900">Título del Certificado *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Master en Python Avanzado"
            required
            maxLength={255}
            disabled={!!pendingTxXdr}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 placeholder:text-gray-400"
          />
        </div>
        
        {/* Issuer */}
        <div>
          <label className="block mb-3 font-semibold text-gray-900">
            Emisor <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="Ej: Universidad XYZ, Plataforma ABC"
            maxLength={255}
            disabled={!!pendingTxXdr}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 placeholder:text-gray-400"
          />
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={(loading || signing || !file || !title) && !pendingTxXdr}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Subiendo...</span>
            </span>
          ) : signing ? (
            <span className="flex items-center justify-center space-x-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Firmando transacción...</span>
            </span>
          ) : pendingTxXdr ? (
            <span className="flex items-center justify-center space-x-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Firmando...</span>
            </span>
          ) : (
            '📤 Subir Certificación'
          )}
        </button>
        
        {/* Pending Signature Alert */}
        {pendingTxXdr && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl animate-scale-in">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-amber-900 mb-1">Firma requerida</p>
                <p className="text-sm text-amber-700">Freighter se abrirá para que firmes la transacción y registre tu certificado en la blockchain.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl animate-scale-in">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-semibold text-red-900 mb-1">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {result && result.success && (
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl animate-scale-in">
            <div className="flex items-start space-x-3 mb-4">
              <span className="text-3xl">✅</span>
              <div className="flex-1">
                <p className="font-bold text-green-900 mb-2 text-lg">¡Certificado subido exitosamente!</p>
                <p className="text-sm text-green-700 mb-1">
                  <span className="font-semibold">Estado:</span> <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs font-semibold">En Revisión</span>
                </p>
                <p className="text-xs text-green-600 mb-1 font-mono break-all">
                  <span className="font-semibold">ID:</span> {result.certificateId}
                </p>
                {result.txHash && (
                  <p className="text-xs text-green-600 mb-4 font-mono break-all">
                    <span className="font-semibold">TX Hash:</span> {result.txHash}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={`/verify/${result.certificateId}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Ver Certificado →
              </a>
              {result.stellarExplorerUrl && (
                <a
                  href={result.stellarExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Stellar Explorer →
                </a>
              )}
              <a
                href="/my-certificates"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Mis Certificados →
              </a>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
