import { NextRequest, NextResponse } from 'next/server'
import { isValidator } from '@/lib/validators'
import { validateStellarAddress } from '@/lib/stellar'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params

    if (!validateStellarAddress(wallet)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Stellar wallet address' },
        { status: 400 }
      )
    }

    const isVal = await isValidator(wallet)

    return NextResponse.json({
      success: true,
      isValidator: isVal,
      wallet
    })
  } catch (error: any) {
    console.error('Error checking validator:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error checking validator' },
      { status: 500 }
    )
  }
}

