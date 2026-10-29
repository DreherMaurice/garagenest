import { Outlet } from 'react-router-dom'

import { BottomTabBar } from '../navigation/BottomTabBar'
import { SidebarNavigation } from '../navigation/SidebarNavigation'

export function AppShell() {
  return (
    <div className="min-h-dvh bg-app text-label md:grid md:grid-cols-[16.5rem_minmax(0,1fr)]">
      <SidebarNavigation />

      <div className="min-w-0">
        <main className="mx-auto w-full max-w-[58rem] px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6 md:px-10 md:py-12 lg:px-12">
          <Outlet />
        </main>
      </div>

      <BottomTabBar />
    </div>
  )
}
