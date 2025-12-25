import { NextRequest, NextResponse } from 'next/server'
import { getCertificate } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const certificate = await getCertificate(id)
    if (!certificate) {
      return NextResponse.json(
        { success: false, error: 'Certificate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      certificate
    })
  } catch (error: any) {
    console.error('Error getting certificate:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error getting certificate' },
      { status: 500 }
    )
  }
}

