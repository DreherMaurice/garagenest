import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '../components/layout/AppShell'
import { AuthLayout } from '../components/auth/AuthLayout'
import { AddVehiclePage } from '../pages/add-vehicle/AddVehiclePage'
import { AuthCallbackPage } from '../pages/auth/AuthCallbackPage'
import { CredentialsPage } from '../pages/auth/CredentialsPage'
import { UpdatePasswordPage } from '../pages/auth/UpdatePasswordPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { SettingsPage } from '../pages/settings/SettingsPage'
import { StatisticsPage } from '../pages/statistics/StatisticsPage'
import { VehiclesPage } from '../pages/vehicles/VehiclesPage'
import { RequireAuth } from './auth/RequireAuth'

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
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
