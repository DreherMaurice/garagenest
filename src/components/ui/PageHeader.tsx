interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8 sm:mb-10">
      <h1 className="text-[2.125rem] font-bold leading-[1.08] tracking-[-0.035em] text-label sm:text-[2.5rem]">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-[15px] leading-6 text-label-secondary sm:text-base">
          {description}
        </p>
      ) : null}
    </header>
  )
}
