interface VerifyBadgeProps {
  isValid: boolean
  verifying?: boolean
}

export default function VerifyBadge({ isValid, verifying = false }: VerifyBadgeProps) {
  if (verifying) {
    return (
      <div className="inline-flex items-center px-3 py-1 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-sm">
        <span className="mr-1">⏳</span>
        Verificando...
      </div>
    )
  }

  if (isValid) {
    return (
      <div className="inline-flex items-center px-3 py-1 bg-green-100 border border-green-400 text-green-800 rounded text-sm">
        <span className="mr-1">✅</span>
        Verificado en Blockchain
      </div>
    )
  }

  return (
    <div className="inline-flex items-center px-3 py-1 bg-red-100 border border-red-400 text-red-800 rounded text-sm">
      <span className="mr-1">❌</span>
      No Verificado
    </div>
  )
}

