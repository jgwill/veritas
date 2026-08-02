import { NextResponse } from 'next/server'
import { parseChartStore } from '@/lib/stc/parse-chart-store'

// Read-only view over the seat's coaia-narrative chart store (VERITAS_STC_STORE).
// Deliberately unauthenticated: it reads a local file the operator chose to
// mount, on a localhost/tailnet deployment. It never touches the Neon models.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chartId: string }> },
) {
  try {
    const { chartId } = await params
    const chart = await parseChartStore(chartId)
    if (!chart) {
      return NextResponse.json(
        { error: `Chart ${chartId} not found in the configured store` },
        { status: 404 },
      )
    }
    return NextResponse.json({ chart })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read chart store' },
      { status: 500 },
    )
  }
}
