import { Check, ChevronRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ListRowContentProps {
  title: string
  description: string
  icon: LucideIcon
}

type ListRowProps = ListRowContentProps & (
  | { to: string; onClick?: never; selected?: never }
  | { to?: never; onClick: () => void; selected: boolean }
)

export function ListRow({ title, description, icon: Icon, to, onClick, selected }: ListRowProps) {
  const isLink = to !== undefined
  const className = [
    'group flex min-h-[4.25rem] w-full items-center gap-3.5 px-4 text-left transition-colors duration-150 hover:bg-fill focus-visible:relative focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-accent',
    selected ? 'bg-accent-muted' : '',
  ].join(' ')

  const content = (
    <>
      <span
        className={[
          'grid size-8 shrink-0 place-items-center rounded-[8px]',
          isLink ? 'bg-accent text-white' : 'bg-fill text-label-secondary',
        ].join(' ')}
      >
        <Icon className="size-[1.125rem]" strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="list-row-content flex min-w-0 flex-1 items-center self-stretch">
        <span className="min-w-0 flex-1 py-2.5">
          <span className="block text-[16px] font-medium leading-5 text-label">{title}</span>
          <span className="mt-0.5 block text-[13px] leading-5 text-label-secondary">
            {description}
          </span>
        </span>
        {isLink ? (
          <ChevronRight
            className="size-4 shrink-0 text-label-tertiary transition-transform duration-150 group-hover:translate-x-0.5"
            strokeWidth={2}
            aria-hidden="true"
          />
        ) : selected ? (
          <Check className="size-5 shrink-0 text-accent" strokeWidth={2.25} aria-hidden="true" />
        ) : null}
      </span>
    </>
  )

  return (
    <li className="list-row">
      {isLink ? (
        <Link className={className} to={to}>
          {content}
        </Link>
      ) : (
        <button className={className} type="button" onClick={onClick} aria-pressed={selected}>
          {content}
        </button>
      )}
    </li>
  )
}
