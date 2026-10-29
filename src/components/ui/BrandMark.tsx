import { Warehouse } from 'lucide-react'

export function BrandMark() {
  return (
    <span
      className="grid size-9 place-items-center rounded-[10px] bg-accent text-white"
      aria-hidden="true"
    >
      <Warehouse className="size-5" strokeWidth={2} />
    </span>
  )
}
