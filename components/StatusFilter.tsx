'use client'

import { CertificateStatus } from '@/types/certificate'

interface StatusFilterProps {
  currentStatus: CertificateStatus | 'all'
  onFilterChange: (status: CertificateStatus | 'all') => void
}

export default function StatusFilter({ currentStatus, onFilterChange }: StatusFilterProps) {
  const filters: { label: string; value: CertificateStatus | 'all' }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Pendientes', value: 'pending' },
    { label: 'Aprobados', value: 'approved' },
    { label: 'Rechazados', value: 'rejected' },
  ]

  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 ${
            currentStatus === filter.value
              ? 'gradient-button text-white shadow-glow-arcusx'
              : 'glass-card border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/20'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
