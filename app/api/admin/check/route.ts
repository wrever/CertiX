import { NextRequest, NextResponse } from 'next/server'
import { validateStellarAddress } from '@/lib/stellar'

// Admin address del Smart Contract (configurado en initialize)
const ADMIN_ADDRESS = process.env.ADMIN_PUBLIC_KEY || 'GALR6D6JTE2C554HD2OOW5CDMUYBYZ43S4VLWPDAMJFLSF2GQW5GLCT3'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet') || searchParams.get('address')

    if (!wallet || !validateStellarAddress(wallet)) {
      return NextResponse.json(
        { success: false, error: 'Valid Stellar wallet address is required' },
        { status: 400 }
      )
    }

    // Verificar si la wallet es admin
    const isAdmin = wallet === ADMIN_ADDRESS

    return NextResponse.json({
      success: true,
      isAdmin,
      adminAddress: ADMIN_ADDRESS,
      wallet
    })
  } catch (error: any) {
    console.error('Error checking admin:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error checking admin status' },
      { status: 500 }
    )
  }
}

