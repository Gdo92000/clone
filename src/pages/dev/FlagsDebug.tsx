import { useEffect, useState } from 'react'

const FLAGS = [
  { key: '__USE_MOCK__', value: __USE_MOCK__ },
  { key: '__DB_PROVIDER__', value: __DB_PROVIDER__ },
] as const

export default function FlagsDebug() {
  const [swCount, setSwCount] = useState<number | null>(null)
  const [swExists, setSwExists] = useState<string | null>(null)

  useEffect(() => {
    navigator.serviceWorker
      .getRegistrations()
      .then((r) => { setSwCount(r.length); })
      .catch(() => { setSwCount(-1); })

    fetch('/mockServiceWorker.js')
      .then((r) => { setSwExists(r.ok ? 'EXISTS' : 'NOT FOUND'); })
      .catch((e: unknown) => { setSwExists(`ERROR: ${e instanceof Error ? e.message : String(e)}`); })
  }, [])

  useEffect(() => {
    console.warn('=== Flags Debug ===')
    for (const flag of FLAGS) {
      console.warn(`${flag.key}:`, flag.value, `(${typeof flag.value})`)
    }
    console.warn('serviceWorkers:', swCount)
    console.warn('mockServiceWorker:', swExists)
  }, [swCount, swExists])

  return (
    <div className="min-h-screen bg-surface-background p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">MSW / Flags Status</h1>
      <pre className="bg-surface-card p-4 rounded-lg border border-border-default text-sm font-mono">
        {JSON.stringify(
          {
            ...Object.fromEntries(FLAGS.map((f) => [f.key, f.value])),
            serviceWorkers: swCount,
            mockServiceWorker: swExists,
          },
          null,
          2,
        )}
      </pre>
    </div>
  )
}
