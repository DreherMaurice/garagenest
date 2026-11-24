import { Link, useNavigate } from 'react-router-dom'

import { PageHeader } from '../../components/ui/PageHeader'
import { VehicleTypeForm } from './VehicleTypeForm'

export function NewVehicleTypePage() {
  const navigate = useNavigate()
  return (
    <div className="animate-page-in space-y-6">
      <Link className="form-secondary" to="/settings/vehicle-types">Zurück zu Fahrzeugarten</Link>
      <PageHeader title="Neue Fahrzeugart" description="Lege Name und Icon fest. Danach kannst du eigene Felder hinzufügen." />
      <VehicleTypeForm onSaved={(type) => navigate(`/settings/vehicle-types/${type.id}`, { replace: true })} />
    </div>
  )
}
