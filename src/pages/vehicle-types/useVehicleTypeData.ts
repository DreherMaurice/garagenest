import { useEffect, useState } from 'react'

import { vehicleTypeError } from '../../services/vehicle-types'

export function useVehicleTypeData<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({ data: null, loading: true, error: null })
  const [generation, setGeneration] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal).then((data) => {
      if (!controller.signal.aborted) setState({ data, loading: false, error: null })
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setState({ data: null, loading: false, error: vehicleTypeError(error) })
    })
    return () => controller.abort()
  }, [load, generation])

  function reload() {
    setState({ data: null, loading: true, error: null })
    setGeneration((value) => value + 1)
  }

  return { ...state, reload }
}
