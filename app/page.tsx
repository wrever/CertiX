import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          CertiX
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Certificaciones Verificables en Stellar Blockchain
        </p>
        <p className="text-sm text-gray-500">
          by ArcusX
        </p>
      </div>

      {/* Description */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">¿Qué es CertiX?</h2>
          <p className="text-gray-700 mb-4">
            CertiX es un sistema simple y seguro para subir y verificar certificaciones 
            usando la blockchain de Stellar. Cada certificado se guarda de forma inmutable 
            y puede ser verificado públicamente.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>✅ Sube certificados (PDF, PNG, JPG)</li>
            <li>✅ Hash guardado en Stellar blockchain</li>
            <li>✅ Sistema de validación (Pendiente/Aprobado/Rechazado)</li>
            <li>✅ Verificación pública e inmutable</li>
            <li>✅ Integrable con cualquier plataforma</li>
            <li>✅ Wallet como identificador único (sin login tradicional)</li>
          </ul>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex justify-center gap-4 mb-12">
        <Link
          href="/upload"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
        >
          Subir Certificado
        </Link>
        <Link
          href="/my-certificates"
          className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
        >
          Mis Certificados
        </Link>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-2">🔒 Seguro</h3>
          <p className="text-gray-600">
            Hash guardado en blockchain Stellar, inmutable y verificable
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-2">⚡ Rápido</h3>
          <p className="text-gray-600">
            Transacciones en 3-5 segundos, verificación instantánea
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-2">🌐 Público</h3>
          <p className="text-gray-600">
            Cualquiera puede verificar certificados sin necesidad de cuenta
          </p>
        </div>
      </div>
    </div>
  )
}

