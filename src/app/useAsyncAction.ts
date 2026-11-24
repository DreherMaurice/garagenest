import { useRef, useState } from 'react'

export function useAsyncAction(getErrorMessage: (error: unknown) => string) {
  const running = useRef(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function run(action: () => Promise<void>) {
    if (running.current) return
    running.current = true
    setPending(true)
    setError(null)
    setMessage(null)
    try {
      await action()
    } catch (error) {
      setError(getErrorMessage(error))
    } finally {
      running.current = false
      setPending(false)
    }
  }

  return { pending, error, message, setMessage, run }
}
