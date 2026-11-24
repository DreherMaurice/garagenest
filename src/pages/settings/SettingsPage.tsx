import { Laptop, Moon, Sun, CarFront, type LucideIcon } from 'lucide-react'

import type { ThemePreference } from '../../app/theme/theme-context'
import { useTheme } from '../../app/theme/useTheme'
import { ListRow } from '../../components/ui/ListRow'
import { ListSection } from '../../components/ui/ListSection'
import { PageHeader } from '../../components/ui/PageHeader'
import { AccountSection } from './AccountSection'

const appearanceOptions: Array<{
  value: ThemePreference
  label: string
  description: string
  icon: LucideIcon
}> = [
  {
    value: 'system',
    label: 'System',
    description: 'Geräteeinstellung verwenden',
    icon: Laptop,
  },
  { value: 'light', label: 'Hell', description: 'Helle Darstellung', icon: Sun },
  { value: 'dark', label: 'Dunkel', description: 'Dunkle Darstellung', icon: Moon },
]

export function SettingsPage() {
  const { preference, setPreference } = useTheme()

  return (
    <div className="animate-page-in">
      <PageHeader
        title="Einstellungen"
        description="Passe die grundlegende Darstellung der App an."
      />

      <AccountSection />

      <div className="mb-8">
        <ListSection title="Garage">
          <ListRow title="Fahrzeugarten" description="Standardarten und individuelle Felder" icon={CarFront} to="/settings/vehicle-types" />
        </ListSection>
      </div>

      <ListSection
        title="Erscheinungsbild"
        footer="Deine Auswahl wird nur auf diesem Gerät gespeichert."
      >
        {appearanceOptions.map(({ value, label, description, icon }) => (
          <ListRow
            key={value}
            title={label}
            description={description}
            icon={icon}
            selected={preference === value}
            onClick={() => setPreference(value)}
          />
        ))}
      </ListSection>
    </div>
  )
}
