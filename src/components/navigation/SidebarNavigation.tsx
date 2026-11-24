import { NavLink } from 'react-router-dom'
import { LiquidGlass } from '@liquidlens/react'

import { navigationItems } from '../../app/navigation'
import { BrandMark } from '../ui/BrandMark'
import { glassGeometry } from '../glass/glass-tokens'
import { GlassLegibility } from '../glass/GlassLegibility'

export function SidebarNavigation() {
  return (
    <aside className="sticky top-0 hidden h-dvh p-3 md:block">
      <LiquidGlass {...glassGeometry.navigation} className="glass-surface flex h-full flex-col overflow-hidden p-3">
        <GlassLegibility />
        <div className="flex items-center gap-3 px-2 pb-7 pt-1">
          <BrandMark />
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-label">
            Meine Garage
          </span>
        </div>

        <nav className="space-y-1" aria-label="Hauptnavigation">
          {navigationItems.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              className={({ isActive }) =>
                [
                  'glass-control-hover flex min-h-11 items-center gap-3 rounded-[12px] px-3 text-[15px] font-medium transition-[color,background-color,transform] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.985]',
                  isActive
                    ? 'glass-control-active text-accent'
                    : 'text-label-secondary hover:text-label',
                ].join(' ')
              }
              end={end}
              key={to}
              to={to}
            >
              <Icon className="size-5 shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </LiquidGlass>
    </aside>
  )
}
