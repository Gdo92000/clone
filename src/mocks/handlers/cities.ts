import { http, HttpResponse } from 'msw'
import { mockRestaurants } from '../fixtures/restaurants'
import { logMock } from '../logger'
import { normalizeStateBR } from '../../utils/states'

const activeRestaurants = mockRestaurants.filter((r) => r.is_active === true && r.city && r.state)

function deriveActiveCities() {
  const map = new Map<string, { city: string; state: string; restaurant_count: number }>()
  for (const r of activeRestaurants) {
    const city = r.city as string
    const state = r.state as string
    const key = `${city}|${state}`
    const entry = map.get(key)
    if (entry) {
      entry.restaurant_count++
    } else {
      map.set(key, { city, state, restaurant_count: 1 })
    }
  }
  return Array.from(map.values())
}

function deriveActiveNeighborhoods(city: string, state: string) {
  const map = new Map<string, string>()
  for (const r of activeRestaurants) {
    if (r.city === city && r.state === state && r.neighborhood) {
      map.set(r.neighborhood, r.neighborhood)
    }
  }
  return Array.from(map.values()).map((neighborhood) => ({ city, state, neighborhood }))
}

export const cityCoverageHandlers = [
  http.get('*/cities/active', () => {
    const cities = deriveActiveCities()
    logMock('GET', '/cities/active', 200, `${cities.length} cities`)
    return HttpResponse.json(cities, { status: 200 })
  }),

  http.get('*/neighborhoods/active', ({ request }) => {
    const url = new URL(request.url)
    const city = url.searchParams.get('city') ?? ''
    const state = url.searchParams.get('state') ?? ''
    const neighborhoods = deriveActiveNeighborhoods(city, state)
    logMock('GET', '/neighborhoods/active', 200, `${neighborhoods.length} neighborhoods`)
    return HttpResponse.json(neighborhoods, { status: 200 })
  }),

  http.get('*/cities/has-coverage', ({ request }) => {
    const url = new URL(request.url)
    const city = url.searchParams.get('city') ?? ''
    const state = normalizeStateBR(url.searchParams.get('state') ?? '')
    const cities = deriveActiveCities()
    const covered = cities.some((c) => c.city.toLowerCase() === city.toLowerCase() && c.state === state)
    logMock('GET', '/cities/has-coverage', 200, String(covered))
    return HttpResponse.json({ city, state, covered }, { status: 200 })
  }),

  http.get('*/neighborhoods/has-coverage', ({ request }) => {
    const url = new URL(request.url)
    const city = url.searchParams.get('city') ?? ''
    const state = normalizeStateBR(url.searchParams.get('state') ?? '')
    const neighborhood = url.searchParams.get('neighborhood') ?? ''
    const neighborhoods = deriveActiveNeighborhoods(city, state)
    const covered = neighborhoods.some((n) => n.neighborhood.toLowerCase() === neighborhood.toLowerCase())
    logMock('GET', '/neighborhoods/has-coverage', 200, String(covered))
    return HttpResponse.json({ city, state, neighborhood, covered }, { status: 200 })
  }),
]