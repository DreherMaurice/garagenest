import { useAsyncAction } from '../../app/useAsyncAction'
import { vehicleTypeError } from '../../services/vehicle-types'

export function useVehicleTypeAction() {
  return useAsyncAction(vehicleTypeError)
}
