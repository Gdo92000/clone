import type { ScenarioName } from './types'
import { logger } from '../../lib/logger'

let currentScenario: ScenarioName = 'default'

export function getCurrentScenario(): ScenarioName {
  return currentScenario
}

export function setScenario(name: ScenarioName) {
  currentScenario = name
  logger.info('MSW', `Cenário alterado para: "${name}"`)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('msw:scenario', { detail: { scenario: name } }))
  }
}

export function isScenario(name: ScenarioName): boolean {
  return currentScenario === name
}

export function applyScenarioOverrides<T>(defaultData: T, overrides: Partial<Record<ScenarioName, Partial<T>>>): T {
  const override = overrides[currentScenario]
  if (!override) return defaultData
  return { ...defaultData, ...override }
}
