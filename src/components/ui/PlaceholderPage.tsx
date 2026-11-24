import type { LucideIcon } from 'lucide-react'

import { PageHeader } from './PageHeader'

interface PlaceholderPageProps {
  title: string
  description: string
  emptyTitle: string
  emptyDescription: string
  icon: LucideIcon
}

export function PlaceholderPage({
  title,
  description,
  emptyTitle,
  emptyDescription,
  icon: Icon,
}: PlaceholderPageProps) {
  return (
    <div className="animate-page-in">
      <PageHeader title={title} description={description} />

      <section className="grid min-h-80 place-items-center border-y border-separator py-14 text-center">
        <div className="max-w-sm px-5">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-fill text-label-secondary">
            <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-lg font-semibold tracking-[-0.015em] text-label">
            {emptyTitle}
          </h2>
          <p className="mt-2 text-[15px] leading-6 text-label-secondary">
            {emptyDescription}
          </p>
        </div>
      </section>
    </div>
  )
}
