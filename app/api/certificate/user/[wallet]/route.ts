import { NextRequest, NextResponse } from 'next/server'
import { getUserCertificates, getCertificateStats } from '@/lib/db'
import { validateStellarAddress } from '@/lib/stellar'
import { CertificateStatus } from '@/types/certificate'

export async function GET(
  request: NextRequest,
  { params }: { params: { wallet: string } }
) {
  try {
    const { wallet } = params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as CertificateStatus | null

    if (!validateStellarAddress(wallet)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Stellar wallet address' },
        { status: 400 }
      )
    }

    const certificates = await getUserCertificates(wallet, status || undefined)
    const stats = await getCertificateStats(wallet)

    return NextResponse.json({
      success: true,
      certificates,
      stats
    })
  } catch (error: any) {
    console.error('Error getting user certificates:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error getting certificates' },
      { status: 500 }
    )
  }
}

