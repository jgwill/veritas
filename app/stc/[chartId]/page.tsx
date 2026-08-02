import { StcMmotView } from '@/components/StcMmotView'

export const dynamic = 'force-dynamic'

export default async function StcChartPage({
  params,
}: {
  params: Promise<{ chartId: string }>
}) {
  const { chartId } = await params
  return <StcMmotView chartId={chartId} />
}
