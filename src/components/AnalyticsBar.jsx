import SiteStatsShowcase from './SiteStatsShowcase'
import { useSiteStats } from '../hooks/useSiteStats'

export default function AnalyticsBar() {
  const { items, loading } = useSiteStats()

  return <SiteStatsShowcase items={items} loading={loading} variant="homepage" />
}
