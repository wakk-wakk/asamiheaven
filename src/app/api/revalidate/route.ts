import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    const path = searchParams.get('path')

    // Check for secret token
    if (secret !== process.env.REVALIDATE_SECRET) {
      return Response.json(
        { revalidated: false, message: 'Invalid secret token' },
        { status: 401 }
      )
    }

    if (!path) {
      return Response.json(
        { revalidated: false, message: 'Path parameter is required' },
        { status: 400 }
      )
    }

    revalidatePath(path)

    return Response.json({
      revalidated: true,
      path,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return Response.json(
      { revalidated: false, message: 'Error revalidating' },
      { status: 500 }
    )
  }
}
