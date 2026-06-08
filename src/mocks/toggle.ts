import { setScenario, getCurrentScenario } from './scenarios/index'
import type { ScenarioName } from './scenarios/types'
import { logger } from '../lib/logger'

export function setupMockToggle() {
  if (typeof window === 'undefined') return

  const originalDescriptor = Object.getOwnPropertyDescriptor(window, '__MSW_SCENARIO')

  let _value: string = getCurrentScenario()

  Object.defineProperty(window, '__MSW_SCENARIO', {
    get() {
      return _value
    },
    set(value: string) {
      _value = value
      setScenario(value as ScenarioName)
      logger.info('MSW', `Cenário alterado: "${value}"`)
    },
    configurable: true,
    enumerable: true,
  })

  if (originalDescriptor?.value) {
    _value = String(originalDescriptor.value)
    setScenario(_value as ScenarioName)
  }

  logger.info('MSW', 'Cenários: default, empty_store, kitchen_congested, payment_declined, courier_offline, tenant_expired, merchant_blocked')
  logger.info('MSW', 'Uso: window.__MSW_SCENARIO = "kitchen_congested"')
}
