import { useGlassRef } from '@liquidlens/react'
import type { ComponentProps, CSSProperties } from 'react'
import { Link } from 'react-router-dom'

import { glassGeometry } from './glass-tokens'
import { GlassLegibility } from './GlassLegibility'

export function GlassLink({ children, className = '', ...props }: Omit<ComponentProps<typeof Link>, 'ref'>) {
  const ref = useGlassRef<HTMLAnchorElement>(glassGeometry.button)
  return (
    <Link
      {...props}
      ref={ref}
      data-glass=""
      data-lg-refraction={glassGeometry.button.refraction}
      data-lg-bezel={glassGeometry.button.bezel}
      className={`lg-glass lg-press glass-surface glass-button ${className}`}
      style={{ '--lg-radius': `${glassGeometry.button.radius}px`, ...props.style } as CSSProperties}
    >
      <GlassLegibility />
      <span>{children}</span>
    </Link>
  )
}
