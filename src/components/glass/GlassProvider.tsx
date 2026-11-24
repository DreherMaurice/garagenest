import { useLiquidGlass } from '@liquidlens/react'
import { useEffect, type PropsWithChildren } from 'react'

import { useTheme } from '../../app/theme/useTheme'
import { glassAppearance, glassMaterial } from './glass-tokens'

export function GlassProvider({ children }: PropsWithChildren) {
  const { set } = useLiquidGlass(glassMaterial)
  const { resolvedTheme } = useTheme()
  useEffect(() => {
    set(glassAppearance[resolvedTheme])
  }, [resolvedTheme, set])
  return children
}
