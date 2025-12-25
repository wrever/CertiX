interface VerifyBadgeProps {
  isValid: boolean
  verifying?: boolean
}

export default function VerifyBadge({ isValid, verifying = false }: VerifyBadgeProps) {
  if (verifying) {
    return (
      <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-400 text-white rounded-lg text-xs font-bold shadow-md">
        <span className="mr-1.5 animate-spin">⏳</span>
        Verificando...
      </div>
    )
  }

  if (isValid) {
    return (
      <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-bold shadow-md">
        <span className="mr-1.5">✅</span>
        Verificado
      </div>
    )
  }

  return (
    <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg text-xs font-bold shadow-md">
      <span className="mr-1.5">❌</span>
      No Verificado
    </div>
  )
}
