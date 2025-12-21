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
    <div className="flex gap-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            currentStatus === filter.value
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

