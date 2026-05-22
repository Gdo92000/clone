import { useCallback, useEffect, useRef } from 'react'

export interface TelemetryEvent {
  domain: string
  action: string
  label?: string
  value?: number
  metadata?: Record<string, unknown>
}

const CLIENT_SESSION = crypto.randomUUID().slice(0, 8)

function sendTelemetry(event: TelemetryEvent): void {
  const { domain, action, label, value, metadata } = event
  if (import.meta.env.DEV) {
    console.warn(`[TELEMETRY] [${domain}] ${action}${label ? ` (${label})` : ''}`, { value, ...metadata })
  }
}

export function useTelemetry(domain: string) {
  const domainRef = useRef(domain)

  useEffect(() => {
    domainRef.current = domain
  }, [domain])

  const track = useCallback((action: string, label?: string, value?: number, metadata?: Record<string, unknown>) => {
    sendTelemetry({ domain: domainRef.current, action, ...(label !== undefined ? { label } : {}), ...(value !== undefined ? { value } : {}), ...(metadata !== undefined ? { metadata } : {}) })
  }, [])

  return { track, sessionId: CLIENT_SESSION }
}
