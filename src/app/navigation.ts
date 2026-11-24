import {
  ChartNoAxesColumnIncreasing,
  CirclePlus,
  Gauge,
  Settings,
  SquareParking,
  type LucideIcon,
} from 'lucide-react'

export interface NavigationItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

export const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', to: '/', icon: Gauge, end: true },
  { label: 'Fahrzeuge', to: '/vehicles', icon: SquareParking },
  { label: 'Hinzufügen', to: '/add', icon: CirclePlus },
  { label: 'Statistiken', to: '/statistics', icon: ChartNoAxesColumnIncreasing },
  { label: 'Einstellungen', to: '/settings', icon: Settings },
]
