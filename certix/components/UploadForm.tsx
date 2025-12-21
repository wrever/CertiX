'use client'

import { useState } from 'react'
import { CertificateUploadResponse } from '@/types/certificate'

interface UploadFormProps {
  walletAddress: string
}

export default function UploadForm({ walletAddress }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [issuer, setIssuer] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CertificateUploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) return

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
      const data = await res.json()
      
      if (data.success) {
        setResult(data)
        // Reset form
        setFile(null)
        setTitle('')
        setIssuer('')
      } else {
        setError(data.error || 'Error al subir certificado')
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold">
            Archivo (PDF, PNG, JPG - Max 10MB) *
          </label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block mb-2 font-semibold">Título *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Master Python"
            required
            maxLength={255}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block mb-2 font-semibold">Emisor (opcional)</label>
          <input
            type="text"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="Universidad XYZ"
            maxLength={255}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !file || !title}
          className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Subiendo...' : 'Subir Certificación'}
        </button>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            ⚠️ {error}
          </div>
        )}

        {result && result.success && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p className="font-bold mb-2">✅ Certificado subido exitosamente</p>
            <p className="text-sm mb-1">Estado: <span className="font-semibold">En Revisión</span></p>
            <p className="text-sm mb-1">ID: <span className="font-mono">{result.certificateId}</span></p>
            <p className="text-sm mb-3">TX Hash: <span className="font-mono text-xs">{result.txHash}</span></p>
            <div className="flex gap-2 flex-wrap">
              <a
                href={`/verify/${result.certificateId}`}
                className="text-primary-600 underline text-sm font-semibold"
              >
                Ver Certificado →
              </a>
              <a
                href={result.stellarExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 underline text-sm"
              >
                Stellar Explorer →
              </a>
              <a
                href="/my-certificates"
                className="text-primary-600 underline text-sm"
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

