import { Motorbike, Caravan, CarFront, CircleEllipsis, Container, Truck, BusFront } from 'lucide-react'

import type { VehicleTypeIcon } from './vehicle-type-model'

export const vehicleTypeIcons = {
  car: { label: 'Auto', icon: CarFront },
  motorcycle: { label: 'Motorrad', icon: Motorbike },
  trailer: { label: 'Anhänger', icon: Container },
  caravan: { label: 'Wohnwagen', icon: Caravan },
  motorhome: { label: 'Wohnmobil', icon: BusFront },
  van: { label: 'Transporter', icon: Truck },
  other: { label: 'Sonstiges', icon: CircleEllipsis },
} satisfies Record<VehicleTypeIcon, { label: string; icon: typeof CarFront }>
