import { ChartNoAxesColumnIncreasing } from 'lucide-react'

import { PlaceholderPage } from '../../components/ui/PlaceholderPage'

export function StatisticsPage() {
  return (
    <PlaceholderPage
      title="Statistiken"
      description="Der vorbereitete Bereich für zukünftige Auswertungen."
      emptyTitle="Noch keine Statistiken"
      emptyDescription="Diagramme und Kennzahlen werden ergänzt, sobald fachliche Fahrzeugdaten vorhanden sind."
      icon={ChartNoAxesColumnIncreasing}
    />
  )
}
