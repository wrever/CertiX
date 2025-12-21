import { NextRequest, NextResponse } from 'next/server'
import { getValidators } from '@/lib/validators'

export async function GET(request: NextRequest) {
  try {
    const validators = await getValidators()

    return NextResponse.json({
      success: true,
      validators
    })
  } catch (error: any) {
    console.error('Error getting validators:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error getting validators' },
      { status: 500 }
    )
  }
}

