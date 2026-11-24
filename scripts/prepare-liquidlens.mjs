import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const checkout = fileURLToPath(new URL('../vendor/LiquidLens', import.meta.url))
const patch = fileURLToPath(new URL('../vendor/liquidlens.patch', import.meta.url))
const revision = '0dc4b52d7ce7339aa00c9397e831267d68c0fb19'

function git(args) {
  return spawnSync('git', ['-c', `safe.directory=${checkout.replaceAll('\\', '/')}`, '-C', checkout, ...args], { encoding: 'utf8' })
}

const head = git(['rev-parse', 'HEAD'])
if (head.status !== 0 || head.stdout.trim() !== revision) {
  throw new Error(`LiquidLens fehlt oder hat einen anderen Stand. Submodul auf ${revision} initialisieren; siehe docs/liquidlens.md.`)
}

if (git(['apply', '--reverse', '--check', patch]).status === 0) {
  console.log('LiquidLens: geprüfte Patches bereits vorhanden.')
} else {
  if (git(['apply', '--check', patch]).status !== 0) {
    throw new Error('LiquidLens enthält unerwartete Änderungen. Es wurde nichts überschrieben; siehe docs/liquidlens.md.')
  }
  const result = git(['apply', patch])
  if (result.status !== 0) throw new Error('LiquidLens-Patches konnten nicht angewandt werden.')
  console.log('LiquidLens: geprüfte Integrationspatches angewandt.')
}
