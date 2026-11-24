// CLI-only headless tests with isolated profiles. Never use the user's browser session.
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { createServer } from 'node:http'
import assert from 'node:assert/strict'

const output = resolve('node_modules/.cache/glass-browser')
mkdirSync(output, { recursive: true })
const mode = process.argv[2] || 'brave'
const executable = {
  brave: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
  edge: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  firefox: 'C:/Program Files/Mozilla Firefox/firefox.exe',
}[mode]
if (!executable || !existsSync(executable)) throw new Error(`Browser nicht installiert: ${mode}`)

let received = null
const collector = createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5178')
  if (request.url !== '/report' || request.method !== 'POST') { response.writeHead(404).end(); return }
  let body = ''
  request.on('data', (chunk) => { body += chunk; if (body.length > 16000) request.destroy() })
  request.on('end', () => { received = JSON.parse(body); response.writeHead(204).end() })
})
await new Promise((done) => collector.listen(4189, '127.0.0.1', done))
try {
  for (const [theme, width, height] of [['light', 1280, 900], ['dark', 390, 844]]) {
    received = null
    const profile = mkdtempSync(join(output, `${mode}-profile-`))
    const screenshot = join(output, `${mode}-${theme}.png`)
    const url = `http://127.0.0.1:5178/tests/glass-fixture.html?theme=${theme}&report=1`
    const args = mode === 'firefox'
      ? ['--headless', '--no-remote', '--profile', profile, '--window-size', `${width},${height}`, '--screenshot', screenshot, url]
      : ['--headless', '--disable-gpu', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', `--window-size=${width},${height}`, '--virtual-time-budget=3000', `--screenshot=${screenshot}`, '--dump-dom', url]
    const child = spawn(executable, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
    let html = ''
    let diagnostics = ''
    child.stdout.on('data', (chunk) => { html += chunk })
    child.stderr.on('data', (chunk) => { diagnostics += chunk })
    const exitCode = await new Promise((done, reject) => {
      const timer = setTimeout(() => { child.kill(); reject(new Error(`${mode}: Browser-Test nach 30 Sekunden abgebrochen`)) }, 30000)
      child.on('error', (error) => { clearTimeout(timer); reject(error) })
      child.on('exit', (code) => { clearTimeout(timer); done(code) })
    })
    const encoded = html.match(/<pre id="glass-test-result"[^>]*>([\s\S]*?)<\/pre>/)?.[1]
    const report = received || (encoded ? JSON.parse(encoded.replaceAll('&quot;', '"').replaceAll('&amp;', '&')) : null)
    assert.equal(exitCode, 0, `browser exit: ${diagnostics.slice(-1800)}`)
    assert.ok(report, 'browser supplied results')
    assert.equal(report.error, undefined)
    assert.equal(report.modalOpen, true)
    assert.equal(report.focusInsideModal, true)
    assert.equal(report.formSubmitted, true)
    assert.equal(report.disabledPreserved, true)
    assert.equal(report.mobileNavPosition, 'fixed')
    assert.equal(report.nestedGlass, 0)
    assert.equal(report.horizontalOverflow, false)
    if (mode === 'firefox') {
      assert.equal(report.initialFilters, 0)
      assert.ok(!report.initialFilter.includes('url('))
    } else {
      assert.ok(report.initialFilters > 0)
      assert.ok(report.initialFilter.includes('url('))
    }
    writeFileSync(join(output, `${mode}-${theme}.json`), JSON.stringify(report, null, 2))
    console.log(`${mode} / ${theme}: refraction or fallback, modal, focus, form, disabled and layout checks passed.`)
  }
} finally {
  collector.close()
}
