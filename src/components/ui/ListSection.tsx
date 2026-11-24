import { useId, type PropsWithChildren } from 'react'

interface ListSectionProps extends PropsWithChildren {
  title: string
  footer?: string
}

export function ListSection({ title, footer, children }: ListSectionProps) {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId}>
      <h2 className="mb-2 px-4 text-[13px] font-medium text-label-secondary" id={titleId}>
        {title}
      </h2>
      <ul className="overflow-hidden rounded-[18px] border border-separator bg-surface">
        {children}
      </ul>
      {footer ? (
        <p className="mt-2 px-4 text-[13px] leading-5 text-label-secondary">{footer}</p>
      ) : null}
    </section>
  )
}
