import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'node:url'

import { getSupabaseConfig } from './src/services/supabase-config.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_SUPABASE_')
  const url = env.VITE_SUPABASE_URL
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY
  if ((url || key) && !getSupabaseConfig(url, key)) {
    throw new Error('Ungültige Supabase-Konfiguration: Projekt-URL und öffentlicher sb_publishable_ Key erforderlich. Keine Secret- oder Service-Role-Keys verwenden.')
  }

  return {
    resolve: {
      alias: {
        '@liquidlens/react': fileURLToPath(new URL('./vendor/LiquidLens/packages/react/index.ts', import.meta.url)),
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'Meine Garage',
          short_name: 'Garage',
          description: 'Moderne Fahrzeugverwaltung als Progressive Web App',
          theme_color: '#f2f2f7',
          background_color: '#f2f2f7',
          display: 'standalone',
          start_url: '/',
          lang: 'de',
          icons: [
            {
              src: '/favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    ],
  }
})
