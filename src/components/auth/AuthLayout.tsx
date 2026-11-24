import { Outlet } from 'react-router-dom'

import { BrandMark } from '../ui/BrandMark'
import { AuthBoundary } from './AuthBoundary'

export function AuthLayout() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))] sm:pt-20">
      <div className="mb-8 flex items-center gap-3 font-semibold"><BrandMark />Meine Garage</div>
      <AuthBoundary><Outlet /></AuthBoundary>
    </main>
  )
}
