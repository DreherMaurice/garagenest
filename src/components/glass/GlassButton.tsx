import { useGlassRef } from '@liquidlens/react'
import type { ButtonHTMLAttributes, CSSProperties } from 'react'

import { glassGeometry } from './glass-tokens'
import { GlassLegibility } from './GlassLegibility'

export function GlassButton({ children, className = '', type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useGlassRef<HTMLButtonElement>(glassGeometry.button)
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      data-glass=""
      data-lg-refraction={glassGeometry.button.refraction}
      data-lg-bezel={glassGeometry.button.bezel}
      className={`lg-glass lg-press glass-surface glass-button ${className}`}
      style={{ '--lg-radius': `${glassGeometry.button.radius}px`, ...props.style } as CSSProperties}
    >
      <GlassLegibility />
      <span>{children}</span>
    </button>
  )
}
