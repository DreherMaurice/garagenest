import { BrowserRouter } from 'react-router-dom'
import { GlassProvider } from '../components/glass/GlassProvider'

import { AppRoutes } from './AppRoutes'
import { AuthProvider } from './auth/AuthProvider'
import { ThemeProvider } from './theme/ThemeProvider'

export function App() {
  return (
    <ThemeProvider>
      <GlassProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </GlassProvider>
    </ThemeProvider>
  )
}
