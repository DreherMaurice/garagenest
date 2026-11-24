import {
  ChartNoAxesColumnIncreasing,
  Settings,
  SquareParking,
} from 'lucide-react'

import { ListRow } from '../../components/ui/ListRow'
import { ListSection } from '../../components/ui/ListSection'
import { PageHeader } from '../../components/ui/PageHeader'

const dashboardLinks = [
  {
    title: 'Fahrzeuge',
    description: 'Deine Garage im Überblick',
    to: '/vehicles',
    icon: SquareParking,
  },
  {
    title: 'Statistiken',
    description: 'Auswertungen und Entwicklungen',
    to: '/statistics',
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    title: 'Einstellungen',
    description: 'Darstellung und App-Optionen',
    to: '/settings',
    icon: Settings,
  },
]

export function DashboardPage() {
  return (
    <div className="animate-page-in">
      <PageHeader
        title="Meine Garage"
        description="Alle Bereiche deiner Fahrzeugverwaltung an einem ruhigen, übersichtlichen Ort."
      />

      <ListSection
        title="Übersicht"
        footer="Dies ist die vorbereitete App-Struktur. Fachliche Funktionen folgen in späteren Schritten."
      >
        {dashboardLinks.map((item) => (
          <ListRow key={item.to} {...item} />
        ))}
      </ListSection>
    </div>
  )
}
