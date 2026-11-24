import { Link } from 'react-router-dom'

import { ListRow } from '../../components/ui/ListRow'
import { ListSection } from '../../components/ui/ListSection'
import { PageHeader } from '../../components/ui/PageHeader'
import { GlassLink } from '../../components/glass/GlassLink'
import { loadVehicleTypes } from '../../services/vehicle-types'
import { EditorStatus } from './EditorControls'
import { useVehicleTypeData } from './useVehicleTypeData'
import { vehicleTypeIcons } from './vehicle-type-icons'

export function VehicleTypesPage() {
  const state = useVehicleTypeData(loadVehicleTypes)
  return (
    <div className="animate-page-in space-y-6">
      <Link className="form-secondary" to="/settings">Zurück zu Einstellungen</Link>
      <PageHeader title="Fahrzeugarten" description="Standardarten ansehen, eigene Arten erstellen und persönliche Felder ergänzen." />
      <div className="sticky top-[max(0.75rem,env(safe-area-inset-top))] z-10 w-fit">
        <GlassLink to="/settings/vehicle-types/new">Neue Fahrzeugart</GlassLink>
      </div>
      <EditorStatus pending={state.loading} error={state.error} />
      {state.error ? <button className="form-secondary" onClick={state.reload}>Erneut laden</button> : null}
      {state.data ? (
        <>
          <ListSection title="Standardarten" footer="Standardarten und ihre Felder sind schreibgeschützt. Persönliche Zusatzfelder sind nur für dich sichtbar.">
            {state.data.filter((type) => !type.owner_id).map((type) => (
              <ListRow key={type.id} title={type.name} description="Standardfelder und persönliche Erweiterungen" icon={vehicleTypeIcons[type.icon].icon} to={`/settings/vehicle-types/${type.id}`} />
            ))}
          </ListSection>
          <ListSection title="Eigene Fahrzeugarten">
            {state.data.filter((type) => type.owner_id).map((type) => (
              <ListRow key={type.id} title={type.name} description="Name, Icon und Felder bearbeiten" icon={vehicleTypeIcons[type.icon].icon} to={`/settings/vehicle-types/${type.id}`} />
            ))}
            {!state.data.some((type) => type.owner_id) ? <li className="px-4 py-5 text-sm text-label-secondary">Noch keine eigenen Fahrzeugarten.</li> : null}
          </ListSection>
        </>
      ) : null}
    </div>
  )
}
