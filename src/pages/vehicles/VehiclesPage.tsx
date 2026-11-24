import { SquareParking } from 'lucide-react'

import { PlaceholderPage } from '../../components/ui/PlaceholderPage'

export function VehiclesPage() {
  return (
    <PlaceholderPage
      title="Fahrzeuge"
      description="Der vorbereitete Bereich für deine spätere Fahrzeugübersicht."
      emptyTitle="Noch keine Fahrzeugansicht"
      emptyDescription="Fahrzeugdaten und Verwaltungsfunktionen werden bewusst erst in einem späteren Schritt ergänzt."
      icon={SquareParking}
    />
  )
}
