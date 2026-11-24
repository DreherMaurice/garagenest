import { useId, type InputHTMLAttributes } from 'react'

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function AuthField({ label, ...inputProps }: AuthFieldProps) {
  const id = useId()
  return (
    <div className="border-b border-separator px-4 py-3 last:border-b-0">
      <label className="block text-[13px] text-label-secondary" htmlFor={id}>{label}</label>
      <input
        {...inputProps}
        id={id}
        className="mt-1 min-h-8 w-full min-w-0 rounded-sm bg-transparent text-base text-label outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
      />
    </div>
  )
}
