'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative z-10 border-t border-cyan-500/20 bg-gradient-to-b from-[#07233c] to-[#0a2d4a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-black gradient-text-animated mb-4">CertiX</h3>
            <p className="text-cyan-200/80 mb-6 leading-relaxed max-w-md">
              Sistema inmutable y descentralizado para certificaciones verificables en Stellar Blockchain.
              Cada certificado queda registrado de forma permanente e inmutable.
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-cyan-300/60 text-sm">Powered by</span>
              <span className="text-cyan-300 font-bold text-lg">ArcusX</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/upload" className="text-cyan-200/70 hover:text-[#28c0f0] transition-colors duration-300">
                  Subir Certificado
                </Link>
              </li>
              <li>
                <Link href="/my-certificates" className="text-cyan-200/70 hover:text-[#28c0f0] transition-colors duration-300">
                  Mis Certificados
                </Link>
              </li>
              
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Recursos</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://stellar.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-200/70 hover:text-[#28c0f0] transition-colors duration-300"
                >
                  Stellar Network
                </a>
              </li>
              <li>
                <a 
                  href="https://stellar.expert" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-200/70 hover:text-[#28c0f0] transition-colors duration-300"
                >
                  Stellar Expert
                </a>
              </li>
              <li>
                <a 
                  href="https://freighter.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-200/70 hover:text-[#28c0f0] transition-colors duration-300"
                >
                  Freighter Wallet
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cyan-500/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-cyan-200/60 text-sm mb-4 md:mb-0">
            © {currentYear} CertiX by ArcusX. Todos los derechos reservados.
          </p>
          <div className="flex items-center space-x-6">
            <span className="text-cyan-200/60 text-sm">Construido con</span>
            <div className="flex items-center space-x-2">
              <span className="text-cyan-300 font-semibold">Next.js</span>
              <span className="text-cyan-200/40">•</span>
              <span className="text-cyan-300 font-semibold">Stellar</span>
              <span className="text-cyan-200/40">•</span>
              <span className="text-cyan-300 font-semibold">Soroban</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

