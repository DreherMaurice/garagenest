import { NavLink } from 'react-router-dom'
import { LiquidGlass } from '@liquidlens/react'

import { navigationItems } from '../../app/navigation'
import { glassGeometry } from '../glass/glass-tokens'
import { GlassLegibility } from '../glass/GlassLegibility'

export function BottomTabBar() {
  return (
    <LiquidGlass
      as="nav"
      {...glassGeometry.navigation}
      className="mobile-tab-bar glass-surface fixed z-50 overflow-hidden md:hidden"
      aria-label="Hauptnavigation"
    >
      <GlassLegibility />
      <div className="grid h-16 grid-cols-5 p-1">
        {navigationItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            className={({ isActive }) =>
              [
                'glass-control-hover flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-[1.15rem] px-0.5 text-[10px] font-medium leading-tight transition-[color,background-color,transform] duration-200 ease-out focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent active:scale-[0.96]',
                isActive ? 'glass-control-active text-accent' : 'text-label-secondary',
              ].join(' ')
            }
            end={end}
            key={to}
            to={to}
          >
            <Icon className="size-[1.35rem]" strokeWidth={2} aria-hidden="true" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </LiquidGlass>
  )
}
