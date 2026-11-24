// Dev-only fixture: actual shared components, no authentication or database writes.
import { getEngine } from '@liquidlens/react'
import { StrictMode, useState } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'

import { ConfirmDialog } from '../src/components/glass/ConfirmDialog'
import { GlassButton } from '../src/components/glass/GlassButton'
import { GlassProvider } from '../src/components/glass/GlassProvider'
import { BottomTabBar } from '../src/components/navigation/BottomTabBar'
import { SidebarNavigation } from '../src/components/navigation/SidebarNavigation'
import { ThemeProvider } from '../src/app/theme/ThemeProvider'
import '../src/styles/index.css'

const query = new URLSearchParams(location.search)
document.documentElement.dataset.theme = query.get('theme') === 'dark' ? 'dark' : 'light'
localStorage.setItem('garage-theme', document.documentElement.dataset.theme)

export function Fixture() {
  const [open, setOpen] = useState(false)
  return (
    <ThemeProvider><GlassProvider>
      <MemoryRouter>
        <div className="min-h-dvh md:grid md:grid-cols-[16.5rem_1fr]">
          <SidebarNavigation />
          <main className="space-y-5 p-6 pb-32">
            <h1 className="text-3xl font-bold">LiquidLens Browser-Prüfung</h1>
            <p>Originalkomponenten über einem kontrastreichen Inhalt.</p>
            <GlassButton id="open-confirm" onClick={() => setOpen(true)}>Bestätigung öffnen</GlassButton>
            <form onSubmit={(event) => { event.preventDefault(); document.body.dataset.submitted = 'true' }}>
              <GlassButton type="submit" id="test-submit">Formular senden</GlassButton>
            </form>
            <GlassButton id="test-disabled" disabled>Deaktiviert</GlassButton>
            {Array.from({ length: 30 }, (_, index) => (
              <p key={index} className={index % 2 ? 'bg-label p-2 text-app' : 'bg-surface p-2 text-label'}>
                Kante {index + 1} · AAA BBB CCC · 1234567890 · Fahrzeugarten
              </p>
            ))}
          </main>
          <BottomTabBar />
          {open ? <ConfirmDialog name="Testfeld" pending={false} onCancel={() => setOpen(false)} onConfirm={() => setOpen(false)} /> : null}
        </div>
      </MemoryRouter>
    </GlassProvider></ThemeProvider>
  )
}

try {
  flushSync(() => createRoot(document.getElementById('root')!).render(<StrictMode><Fixture /></StrictMode>))
  getEngine()?.applyAll()
  const button = document.getElementById('open-confirm') as HTMLButtonElement
  const initialFilters = document.querySelectorAll('feDisplacementMap').length
  const initialFilter = getComputedStyle(button).backdropFilter
  flushSync(() => (document.getElementById('test-submit') as HTMLButtonElement).click())
  flushSync(() => (document.getElementById('test-disabled') as HTMLButtonElement).click())
  button.focus()
  flushSync(() => button.click())
  const dialog = document.querySelector('dialog')!
  getEngine()?.refresh(dialog)
  const report = {
    userAgent: navigator.userAgent,
    theme: document.documentElement.dataset.theme,
    viewport: { width: innerWidth, height: innerHeight },
    initialFilters,
    initialFilter,
    modalOpen: dialog.open && dialog.matches(':modal'),
    focusInsideModal: dialog.contains(document.activeElement),
    formSubmitted: document.body.dataset.submitted === 'true',
    disabledPreserved: (document.getElementById('test-disabled') as HTMLButtonElement).disabled,
    mobileNavPosition: getComputedStyle(document.querySelector('.mobile-tab-bar')!).position,
    nestedGlass: document.querySelectorAll('[data-glass] [data-glass]').length,
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    dialogFilter: getComputedStyle(dialog).backdropFilter,
  }
  const result = document.createElement('pre')
  result.id = 'glass-test-result'
  result.hidden = true
  result.textContent = JSON.stringify(report)
  document.body.appendChild(result)
  // When running the Firefox CLI screenshot test, report results to the local collector.
  if (query.get('report') === '1') {
    void fetch('http://127.0.0.1:4189/report', { method: 'POST', body: JSON.stringify(report) })
  }
} catch (error) {
  const result = document.createElement('pre')
  result.id = 'glass-test-result'
  result.textContent = JSON.stringify({ error: error instanceof Error ? error.message : 'fixture failed' })
  document.body.appendChild(result)
}
