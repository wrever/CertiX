'use client'

import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'
import FloatingElement from '@/components/FloatingElement'
import ParticlesBackground from '@/components/ParticlesBackground'

export default function Home() {
  return (
    <div className="relative pt-20 overflow-hidden min-h-screen">
      <ParticlesBackground />
      
      {/* Hero Section - Tema Oscuro ArcusX */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48">
        <div className="text-center">
          <ScrollReveal direction="fade" delay={0} distance={30}>
            <h1 className="text-7xl md:text-9xl font-black mb-6 gradient-text-animated leading-tight tracking-tight text-glow">
              CertiX
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={50} distance={50}>
            <p className="text-3xl md:text-5xl text-cyan-100 mb-4 font-light">
              Certificaciones Verificables en
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={100} distance={50}>
            <p className="text-3xl md:text-5xl text-white mb-6 font-bold">
              Stellar Blockchain
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={150} distance={40}>
            <div className="mb-12">
              <span className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 text-cyan-300 text-sm font-bold shadow-lg border border-cyan-500/30 backdrop-blur-sm">
                ✨ by ArcusX
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200} distance={50}>
            <p className="text-xl md:text-2xl text-cyan-200/80 max-w-3xl mx-auto mb-16 leading-relaxed font-light">
              Sistema inmutable y descentralizado para almacenar y verificar certificaciones.
              <br />
              <span className="font-semibold text-white">Cada certificado queda registrado de forma permanente.</span>
            </p>
          </ScrollReveal>
          
          {/* CTA Buttons - Tema Oscuro */}
          <ScrollReveal direction="up" delay={250} distance={50}>
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-24">
              <Link
                href="/upload"
                className="group relative px-10 py-5 gradient-button text-white rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-110 transform overflow-hidden hover-shine"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>🚀</span>
                  <span>Subir Certificado</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#1180b3] to-[#28c0f0] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                href="/my-certificates"
                className="group px-10 py-5 glass-card text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 transform border-2 border-cyan-500/30 hover:border-cyan-400/50"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>📜</span>
                  <span>Ver Mis Certificados</span>
                </span>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Grid - Tema Oscuro */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mb-32">
        <ScrollReveal direction="up" delay={0} distance={80}>
          <h2 className="text-5xl md:text-6xl font-black text-center mb-20 gradient-text-animated text-glow">
            Características Premium
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <ScrollReveal direction="up" delay={100} distance={80}>
            <FloatingElement delay={0}>
              <div className="glass-card rounded-3xl p-10 hover-lift hover-glow transition-all duration-300 group cursor-pointer">
                <div className="w-20 h-20 rounded-2xl gradient-button flex items-center justify-center mb-8 shadow-glow-arcusx group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <span className="text-4xl">🔒</span>
                </div>
                <h3 className="text-2xl font-black mb-4 text-white group-hover:gradient-text transition-all">Seguro e Inmutable</h3>
                <p className="text-cyan-200/70 leading-relaxed text-lg">
                  Hash guardado en blockchain Stellar, <strong className="text-white">imposible de modificar o falsificar</strong>.
                  Verificación pública y transparente en tiempo real.
                </p>
              </div>
            </FloatingElement>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={200} distance={80}>
            <FloatingElement delay={0.2}>
              <div className="glass-card rounded-3xl p-10 hover-lift hover-glow transition-all duration-300 group cursor-pointer">
                <div className="w-20 h-20 rounded-2xl gradient-button flex items-center justify-center mb-8 shadow-glow-arcusx group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <span className="text-4xl">⚡</span>
                </div>
                <h3 className="text-2xl font-black mb-4 text-white group-hover:gradient-text transition-all">Rápido y Eficiente</h3>
                <p className="text-cyan-200/70 leading-relaxed text-lg">
                  Transacciones confirmadas en <strong className="text-white">3-5 segundos</strong>. Verificación instantánea 
                  desde cualquier lugar del mundo, sin esperas.
                </p>
              </div>
            </FloatingElement>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={300} distance={80}>
            <FloatingElement delay={0.4}>
              <div className="glass-card rounded-3xl p-10 hover-lift hover-glow transition-all duration-300 group cursor-pointer">
                <div className="w-20 h-20 rounded-2xl gradient-button flex items-center justify-center mb-8 shadow-glow-arcusx group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <span className="text-4xl">🌐</span>
                </div>
                <h3 className="text-2xl font-black mb-4 text-white group-hover:gradient-text transition-all">Público y Descentralizado</h3>
                <p className="text-cyan-200/70 leading-relaxed text-lg">
                  <strong className="text-white">Cualquiera puede verificar</strong> certificados sin necesidad de cuenta.
                  Sistema completamente descentralizado y transparente.
                </p>
              </div>
            </FloatingElement>
          </ScrollReveal>
        </div>
      </section>

      {/* Description Card - Tema Oscuro */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
        <ScrollReveal direction="up" delay={0} distance={100}>
          <div className="glass-card rounded-3xl p-12 md:p-16 shadow-2xl hover:shadow-3xl transition-all duration-300 hover-lift">
            <ScrollReveal direction="left" delay={100} distance={50}>
              <h2 className="text-4xl md:text-5xl font-black mb-8 gradient-text-animated text-glow">¿Qué es CertiX?</h2>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={200} distance={50}>
              <p className="text-xl md:text-2xl text-cyan-200/80 mb-10 leading-relaxed font-light">
                CertiX es un sistema <strong className="font-bold text-white">simple y seguro</strong> para subir y verificar certificaciones 
                usando la blockchain de Stellar. Cada certificado se guarda de forma <strong className="font-bold text-white">inmutable</strong> 
                y puede ser verificado públicamente por cualquier persona.
              </p>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: '✅', title: 'Sube certificados', desc: 'PDF, PNG, JPG hasta 10MB' },
                { icon: '✅', title: 'Hash en Blockchain', desc: 'Registrado en Stellar de forma permanente' },
                { icon: '✅', title: 'Sistema de Validación', desc: 'Pendiente/Aprobado/Rechazado' },
                { icon: '✅', title: 'Verificación Pública', desc: 'Inmutable y transparente' },
                { icon: '✅', title: 'Integrable', desc: 'API para cualquier plataforma' },
                { icon: '✅', title: 'Wallet como ID', desc: 'Sin login tradicional' }
              ].map((feature, index) => (
                <ScrollReveal key={index} direction="left" delay={300 + (index * 100)} distance={60}>
                  <div className="flex items-start space-x-4 p-5 rounded-xl hover:bg-cyan-500/10 transition-all duration-200 hover:scale-105 cursor-pointer border border-cyan-500/10 hover:border-cyan-500/30">
                    <span className="text-3xl">{feature.icon}</span>
                    <div>
                      <p className="font-bold text-white text-lg">{feature.title}</p>
                      <p className="text-cyan-200/60">{feature.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Stats Section - Tema Oscuro */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mb-32">
        <ScrollReveal direction="up" delay={0} distance={80}>
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6 gradient-text-animated text-glow">
              Confiado por Miles
            </h2>
            <p className="text-xl text-cyan-200/70">La plataforma más segura para certificaciones blockchain</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            { number: '100%', label: 'Inmutable' },
            { number: '3-5s', label: 'Velocidad' },
            { number: '∞', label: 'Verificaciones' },
            { number: '0', label: 'Falsificaciones' }
          ].map((stat, index) => (
            <ScrollReveal key={index} direction="up" delay={100 + (index * 150)} distance={80}>
              <div className="text-center glass-card rounded-2xl p-8 hover-lift hover-glow transition-all duration-200 cursor-pointer">
                <div className="text-5xl md:text-6xl font-black gradient-text-animated mb-4 text-glow">
                  {stat.number}
                </div>
                <div className="text-cyan-200/70 font-semibold text-lg">
                  {stat.label}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Proceso Section - Tema Oscuro */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mb-32">
        <ScrollReveal direction="up" delay={0} distance={80}>
          <h2 className="text-5xl md:text-6xl font-black text-center mb-20 gradient-text-animated text-glow">
            ¿Cómo Funciona?
          </h2>
        </ScrollReveal>

        <div className="max-w-5xl mx-auto space-y-12">
          {[
            { step: '1', title: 'Sube tu Certificado', desc: 'Carga tu certificado (PDF, PNG, JPG) y completa la información básica', icon: '📤' },
            { step: '2', title: 'Firma con tu Wallet', desc: 'Conecta Freighter y firma la transacción para registrar el hash en blockchain', icon: '✍️' },
            { step: '3', title: 'Validación Admin', desc: 'Un administrador revisa y aprueba tu certificado en el Smart Contract', icon: '🛡️' },
            { step: '4', title: 'Verificación Pública', desc: 'Cualquiera puede verificar la autenticidad de tu certificado en cualquier momento', icon: '✅' }
          ].map((item, index) => (
            <ScrollReveal key={index} direction={index % 2 === 0 ? 'right' : 'left'} delay={index * 200} distance={100}>
              <div className="glass-card rounded-3xl p-8 hover-lift transition-all duration-300 flex items-center gap-8 cursor-pointer group border border-cyan-500/20 hover:border-cyan-500/40">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-2xl gradient-button flex items-center justify-center text-4xl shadow-glow-arcusx group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    {item.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-3xl font-black gradient-text-animated">Paso {item.step}</span>
                    <h3 className="text-2xl font-black text-white group-hover:gradient-text transition-all">{item.title}</h3>
                  </div>
                  <p className="text-lg text-cyan-200/70">{item.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  )
}
