import { CirclePlus } from 'lucide-react'

import { PlaceholderPage } from '../../components/ui/PlaceholderPage'

export function AddVehiclePage() {
  return (
    <PlaceholderPage
      title="Hinzufügen"
      description="Hier entsteht später der geführte Ablauf zum Anlegen eines Fahrzeugs."
      emptyTitle="Eingabe noch nicht verfügbar"
      emptyDescription="Das Formular und die dazugehörige Fahrzeuglogik sind nicht Teil dieses Ausbauschritts."
      icon={CirclePlus}
    />
  )
}
