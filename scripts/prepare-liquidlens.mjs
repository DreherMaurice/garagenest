import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const checkout = fileURLToPath(new URL('../vendor/LiquidLens', import.meta.url))
const patch = fileURLToPath(new URL('../vendor/liquidlens.patch', import.meta.url))
const revision = '0dc4b52d7ce7339aa00c9397e831267d68c0fb19'

function git(args) {
  return spawnSync('git', ['-c', `safe.directory=${checkout.replaceAll('\\', '/')}`, '-C', checkout, ...args], { encoding: 'utf8' })
}

const head = git(['rev-parse', 'HEAD'])
const diff = git([
  'diff', '--no-ext-diff', '--no-textconv', '--no-color', '--abbrev=7',
  '--src-prefix=a/', '--dst-prefix=b/', revision, '--',
])
if (head.status !== 0 || diff.status !== 0) {
  throw new Error(`LiquidLens fehlt oder hat einen anderen Stand. Submodul auf ${revision} initialisieren; siehe docs/liquidlens.md.`)
}

const normalize = (value) => value.replaceAll('\r\n', '\n').trimEnd()
const expectedDiff = readFileSync(patch, 'utf8')
if (normalize(diff.stdout) === normalize(expectedDiff)) {
  console.log('LiquidLens: geprüfte Patches bereits vorhanden.')
} else {
  if (head.stdout.trim() !== revision || diff.stdout || git(['apply', '--check', patch]).status !== 0) {
    throw new Error('LiquidLens enthält unerwartete Änderungen. Es wurde nichts überschrieben; siehe docs/liquidlens.md.')
  }
  const result = git(['apply', patch])
  if (result.status !== 0) throw new Error('LiquidLens-Patches konnten nicht angewandt werden.')
  console.log('LiquidLens: geprüfte Integrationspatches angewandt.')
}
