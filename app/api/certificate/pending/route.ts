import { NextRequest, NextResponse } from 'next/server'
import { getCertificatesByStatus } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const certificates = await getCertificatesByStatus('pending')

    return NextResponse.json({
      success: true,
      certificates
    })
  } catch (error: any) {
    console.error('Error getting pending certificates:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error getting pending certificates' },
      { status: 500 }
    )
  }
}

