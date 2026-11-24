import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { AppShell } from '../components/layout/AppShell'
import { AuthLayout } from '../components/auth/AuthLayout'
import { AddVehiclePage } from '../pages/add-vehicle/AddVehiclePage'
import { AuthCallbackPage } from '../pages/auth/AuthCallbackPage'
import { CredentialsPage } from '../pages/auth/CredentialsPage'
import { UpdatePasswordPage } from '../pages/auth/UpdatePasswordPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { StatisticsPage } from '../pages/statistics/StatisticsPage'
import { VehiclesPage } from '../pages/vehicles/VehiclesPage'
import { RequireAuth } from './auth/RequireAuth'

const VehicleTypesPage = lazy(() => import('../pages/vehicle-types/VehicleTypesPage')
  .then((module) => ({ default: module.VehicleTypesPage })))
const VehicleTypeDetailPage = lazy(() => import('../pages/vehicle-types/VehicleTypeDetailPage')
  .then((module) => ({ default: module.VehicleTypeDetailPage })))
const NewVehicleTypePage = lazy(() => import('../pages/vehicle-types/NewVehicleTypePage')
  .then((module) => ({ default: module.NewVehicleTypePage })))
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage')
  .then((module) => ({ default: module.SettingsPage })))

const pageLoading = <p role="status" className="py-8 text-sm text-label-secondary">Seite wird geladen …</p>

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<CredentialsPage key="login" mode="login" />} />
        <Route path="register" element={<CredentialsPage key="register" mode="register" />} />
        <Route path="forgot-password" element={<CredentialsPage key="reset" mode="reset" />} />
        <Route path="auth/callback" element={<AuthCallbackPage />} />
        <Route path="auth/update-password" element={<UpdatePasswordPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="add" element={<AddVehiclePage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="settings" element={<Suspense fallback={pageLoading}><SettingsPage /></Suspense>} />
          <Route path="settings/vehicle-types" element={
            <Suspense fallback={pageLoading}>
              <Outlet />
            </Suspense>
          }>
            <Route index element={<VehicleTypesPage />} />
            <Route path="new" element={<NewVehicleTypePage />} />
            <Route path=":typeId" element={<VehicleTypeDetailPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
