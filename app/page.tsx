import Link from 'next/link'

export default function Home() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
              by ArcusX
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 gradient-text leading-tight">
            CertiX
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 mb-4 font-light">
            Certificaciones Verificables en
          </p>
          <p className="text-2xl md:text-3xl text-gray-800 mb-8 font-semibold">
            Stellar Blockchain
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Sistema inmutable y descentralizado para almacenar y verificar certificaciones.
            Cada certificado queda registrado en la blockchain de Stellar de forma permanente.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link
              href="/upload"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">Subir Certificado</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/my-certificates"
              className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200"
            >
              Ver Mis Certificados
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
          <div className="glass rounded-2xl p-8 hover:shadow-xl transition-all duration-300 animate-slide-up">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Seguro e Inmutable</h3>
            <p className="text-gray-600 leading-relaxed">
              Hash guardado en blockchain Stellar, imposible de modificar o falsificar.
              Verificación pública y transparente.
            </p>
          </div>
          
          <div className="glass rounded-2xl p-8 hover:shadow-xl transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Rápido y Eficiente</h3>
            <p className="text-gray-600 leading-relaxed">
              Transacciones confirmadas en 3-5 segundos. Verificación instantánea 
              desde cualquier lugar del mundo.
            </p>
          </div>
          
          <div className="glass rounded-2xl p-8 hover:shadow-xl transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg">
              <span className="text-3xl">🌐</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Público y Descentralizado</h3>
            <p className="text-gray-600 leading-relaxed">
              Cualquiera puede verificar certificados sin necesidad de cuenta.
              Sistema completamente descentralizado.
            </p>
          </div>
        </div>

        {/* Description Card */}
        <div className="max-w-4xl mx-auto glass rounded-3xl p-10 md:p-12 shadow-xl animate-fade-in">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">¿Qué es CertiX?</h2>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            CertiX es un sistema simple y seguro para subir y verificar certificaciones 
            usando la blockchain de Stellar. Cada certificado se guarda de forma inmutable 
            y puede ser verificado públicamente por cualquier persona.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-gray-900">Sube certificados</p>
                <p className="text-sm text-gray-600">PDF, PNG, JPG hasta 10MB</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-gray-900">Hash en Blockchain</p>
                <p className="text-sm text-gray-600">Registrado en Stellar de forma permanente</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-gray-900">Sistema de Validación</p>
                <p className="text-sm text-gray-600">Pendiente/Aprobado/Rechazado</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-gray-900">Verificación Pública</p>
                <p className="text-sm text-gray-600">Inmutable y transparente</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-gray-900">Integrable</p>
                <p className="text-sm text-gray-600">API para cualquier plataforma</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-gray-900">Wallet como ID</p>
                <p className="text-sm text-gray-600">Sin login tradicional</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
